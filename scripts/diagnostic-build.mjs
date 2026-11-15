import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {build} from 'vite';
import {mvpRevision,isBuiltAiFile} from './mvp-evidence.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
// build-offline records the product files before diagnostic helpers are built.
// Verify their bytes rather than charging the helper's duplicate WASM to play.
export function productBundles(root=process.cwd()) {
  const manifestBytes=readFileSync(path.join(root,'dist/offline-assets.json'));
  const offline=JSON.parse(manifestBytes),base=path.resolve(root,'dist');
  let playBytes=manifestBytes.length;
  for(const asset of offline.files){
    if(typeof asset.url!=='string'||!asset.url.startsWith('/')||/[?#]/.test(asset.url))throw Error('Invalid offline asset URL');
    const dest=path.resolve(base,'.'+asset.url),relative=path.relative(base,dest);
    if(!relative||relative.startsWith('..')||path.isAbsolute(relative))throw Error('Offline asset outside dist');
    const bytes=readFileSync(dest);
    if(bytes.length!==asset.bytes||sha(bytes)!==asset.sha256)throw Error('Offline asset changed: '+asset.url);
    playBytes+=bytes.length;
  }
  const manifest=JSON.parse(readFileSync(path.join(root,'src/ai/model-manifest.json')));
  const aiBytes=[...manifest.models.flatMap(m=>m.files),...manifest.runtime.files].reduce((n,a)=>n+a.bytes,0)+readdirSync(path.join(base,'assets')).map(name=>'dist/assets/'+name).filter(isBuiltAiFile).reduce((n,name)=>n+statSync(path.join(root,name)).size,0);
  const playLimitBytes=30*1024*1024,aiLimitBytes=800*1024*1024;
  return {playBytes,aiBytes,playLimitBytes,aiLimitBytes,withinLimits:playBytes<=playLimitBytes&&aiBytes<=aiLimitBytes,offlineManifestSha256:sha(manifestBytes),method:'Product offline manifest with verified files plus manifest bytes; pinned AI assets and production worker/WASM. Diagnostic helper assets excluded; limits unchanged.'};
}
function inputHashes(){
  const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(/^(models|runtime)$/.test(e.name)&&dir==='public'?[]:walk(dir+'/'+e.name)):[dir+'/'+e.name]);
  const names=[...readdirSync('.').filter(n=>/^(package(-lock)?\.json|index\.html|(?:vite|tsconfig).*\.(?:json|[cm]?[jt]s))$/.test(n)),...['src','scripts','public'].flatMap(walk)].sort();
  return Object.fromEntries(names.map(n=>[n,sha(readFileSync(n))]));
}
export function pinnedAssets(manifest,root='.') {
  const files=[];
  for(const model of manifest.models)for(const a of model.files)files.push({...a,relative:`models/${model.name}/${a.path}`});
  for(const a of manifest.runtime.files)files.push({...a,relative:`runtime/${a.path}`});
  return files.flatMap(a=>['public','dist'].map(directory=>{
    const name=`${directory}/${a.relative}`,bytes=readFileSync(path.resolve(root,name)),actualSha256=sha(bytes);
    if(actualSha256!==a.sha256||bytes.length!==a.bytes)throw Error('Pinned asset mismatch: '+name);
    return {path:name,sha256:a.sha256,bytes:a.bytes,actualSha256};
  }));
}
export async function buildDiagnostic({legacySpike=false}={}) {
  const sourceHashes=inputHashes();
  const commands=[['node_modules/vite/bin/vite.js','build'],['scripts/build-offline.mjs']];
  for(const args of commands){const r=spawnSync(process.execPath,args,{encoding:'utf8'});if(r.status!==0)throw Error('Build failed: '+(r.error??r.stderr));}
  const bundles=productBundles();
  // Transparent 1px ICO: a local diagnostic fixture for the browser's implicit
  // /favicon.ico request. Keep it in the snapshot and capture; never filter it.
  writeFileSync('dist/favicon.ico',Buffer.from('AAABAAEAAQEAAAEAIAAwAAAAFgAAACgAAAABAAAAAgAAAAEAIAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAA==','base64'));
  // Helper lives outside the product entry; production worker is built by the same Vite toolchain.
  await build({configFile:false,publicDir:false,logLevel:'error',build:{outDir:'dist/diagnostic',emptyOutDir:true,rollupOptions:{input:'scripts/browser-ai-entry.mjs',output:{entryFileNames:'entry.js'}}}});
  writeFileSync('dist/diagnostic/index.html','<!doctype html><meta charset="utf-8"><title>Local diagnostic harness</title><script type="module" src="/diagnostic/entry.js"></script>');
  if(legacySpike){
    // Spike is DEV-only in main.ts. Build it separately and label it explicitly;
    // never change the production chapter define or patch its emitted bytes.
    const entry='virtual:legacy-spike',virtual='\0'+entry;
    await build({configFile:false,publicDir:false,logLevel:'error',define:{'import.meta.env.DEV':'true'},plugins:[{name:'legacy-spike-diagnostic',resolveId:id=>id===entry?virtual:null,load:id=>id===virtual?"import 'pixi.js/unsafe-eval'; import '/src/main.ts';":null}],build:{outDir:'dist/legacy-spike',emptyOutDir:true,rollupOptions:{input:entry,output:{entryFileNames:'entry.js'}}}});
    const css=readdirSync('dist/legacy-spike/assets').filter(n=>n.endsWith('.css')).map(n=>`<link rel="stylesheet" href="/legacy-spike/assets/${n}">`).join('');
    writeFileSync('dist/legacy-spike/index.html','<!doctype html><meta charset="utf-8"><title>Legacy DEV spike diagnostic</title>'+css+'<div id="app"></div><script type="module" src="/legacy-spike/entry.js"></script>');
  }
  const manifest=JSON.parse(readFileSync('src/ai/model-manifest.json'));
  const assets=pinnedAssets(manifest);
  const worker=readdirSync('dist/assets').find(x=>/^model\.worker-.*\.js$/.test(x));
  if(JSON.stringify(sourceHashes)!==JSON.stringify(inputHashes()))throw Error('Build inputs changed during build');
  const snapshot={revision:mvpRevision(process.cwd()),sourceHashes,head:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),commands,productBundles:bundles,legacySpike:legacySpike?{kind:'isolated-DEV-diagnostic-not-production-chapter',define:{'import.meta.env.DEV':true},path:'dist/legacy-spike/index.html'}:null,helperBuild:'Vite JS API; dist/diagnostic from scripts/browser-ai-entry.mjs; production worker from dist/assets; local diagnostic favicon fixture',exitCode:0,manifestSha256:sha(readFileSync('src/ai/model-manifest.json')),worker:{path:'dist/assets/'+worker,sha256:sha(readFileSync('dist/assets/'+worker))},assets};
  return snapshot;
}
export function finishSnapshot(snapshot,{root=process.cwd(),revision=mvpRevision}={}) {
  let finalRevision=null;const errors=[];
  try{finalRevision=revision(root);}catch(e){errors.push(String(e));}
  const changedAssets=snapshot.assets.filter(a=>{
    try{const bytes=readFileSync(path.resolve(root,a.path));return sha(bytes)!==a.actualSha256||(a.bytes!==undefined&&bytes.length!==a.bytes);}
    catch(e){errors.push(a.path+': '+String(e));return true;}
  }).map(a=>a.path);
  return {finalRevision,changedAssets,errors,stable:finalRevision===snapshot.revision&&!changedAssets.length&&!errors.length};
}
