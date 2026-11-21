import { readFileSync, writeFileSync, realpathSync, unlinkSync, openSync, closeSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadAssets } from './asset-loader.mjs';
import { decodePng, encodePng, render, renderOverlay } from './render.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const codeFiles = [fileURLToPath(import.meta.url),fileURLToPath(new URL('./render.mjs',import.meta.url)),fileURLToPath(new URL('./asset-loader.mjs',import.meta.url)),fileURLToPath(new URL('./asset-schema.mjs',import.meta.url))];
function inside(root, name) {
  if (typeof name !== 'string' || path.isAbsolute(name) || name.split(/[\\/]/).includes('..')) throw Error('input must be relative to root');
  const file=realpathSync(path.resolve(root,name)), relative=path.relative(realpathSync(root),file);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw Error('input outside root');
  return file;
}
// E1 validates physical sheets once; scene.bindings explicitly maps logical IDs to sheet IDs and crops.
export function assemble({root, manifestBytes, referenceBytes, sceneBytes}) {
  const manifest=JSON.parse(manifestBytes), reference=JSON.parse(referenceBytes), scene=JSON.parse(sceneBytes);
  const loaded=loadAssets({root,manifest,reference});
  if(loaded.status !== 'ready') throw Error(`asset gate ${loaded.status}: ${JSON.stringify({errors:loaded.errors,pending:loaded.pending,stale:loaded.stale})}`);
  if (!scene.bindings || !Array.isArray(scene.placements)) throw Error('bindings and placements required');
  const metadata=new Map(manifest.assets.map(a=>[a.id,a]));
  const cache=new Map();
  const sprites=scene.placements.map(p=>{
    const binding=scene.bindings[p.id], asset=metadata.get(binding?.sheet), entry=loaded.entries[binding?.sheet];
    if(!binding || !asset || !entry) throw Error(`missing asset binding: ${p.id}`);
    if(!cache.has(binding.sheet)) cache.set(binding.sheet,decodePng(entry.bytes));
    return {image:cache.get(binding.sheet),crop:binding.crop,layer:p.layer,order:p.order,x:p.x,y:p.y,anchor:p.anchor};
  });
  const image=render({camera:scene.camera,scale:scene.scale,sprites});
  const png=encodePng(image);
  const debug=scene.overlays === undefined ? null : renderOverlay(image,scene.camera,scene.scale,scene.overlays);
  const debugPng=debug ? encodePng(debug.image) : null;
  const dependencies = [manifest.c6, ...Object.values(reference.inputs || {}), ...(reference.licenses || [])];
  const files = Object.fromEntries(dependencies.map(item => [item.path, hash(readFileSync(inside(root,item.path)))]));
  const hashes={validation:{status:'component-only',sceneContract:'pending',reason:'Scene placement, map units, camera and scale are not verified against E1 reference or C6'},inputs:{manifest:hash(manifestBytes),reference:hash(referenceBytes),scene:hash(sceneBytes),files,assets:Object.fromEntries(Object.entries(loaded.entries).map(([id,e])=>[id,e.sha256]))},code:Object.fromEntries(codeFiles.map(f=>[path.basename(f),hash(readFileSync(f))])),output:hash(png),...(debug ? {debug:{sha256:hash(debugPng),labels:debug.labels}} : {})};
  return {png,hashes,debugPng};
}
export function main(args, io={openSync,closeSync,writeFileSync,unlinkSync}) {
  if(args.length!==5) throw Error('usage: node assemble.mjs ROOT MANIFEST REFERENCE SCENE OUTPUT.png');
  const [rootArg,manifestName,referenceName,sceneName,output]=args,root=realpathSync(rootArg);
  const bytes=name=>readFileSync(inside(root,name));
  const result=assemble({root,manifestBytes:bytes(manifestName),referenceBytes:bytes(referenceName),sceneBytes:bytes(sceneName)});
  // Reserve every name first, exclusively. Roll back only files created by this call.
  const outputs=[[output,result.png],[`${output}.debug.png`,result.debugPng],[`${output}.hashes.json`,Buffer.from(JSON.stringify(result.hashes,null,2)+'\n')]];
  const created=[];
  try {
    for(const [name] of outputs) { const fd=io.openSync(name,'wx'); created.push(name); io.closeSync(fd); }
    for(const [name,data] of outputs) if(data) io.writeFileSync(name,data);
    if(!result.debugPng) { io.unlinkSync(`${output}.debug.png`); created.splice(created.indexOf(`${output}.debug.png`),1); }
  } catch(error) {
    const failures=[];
    for(const name of created.reverse()) try { io.unlinkSync(name); } catch(e) { failures.push(`${name}: ${e.message}`); }
    throw Error(`output failed: ${error.message}${failures.length ? `; rollback failed: ${failures.join('; ')}` : ''}`);
  }
  return 0;
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  try { process.exitCode=main(process.argv.slice(2)); } catch(error) { console.error(error.message); process.exitCode=1; }
}
