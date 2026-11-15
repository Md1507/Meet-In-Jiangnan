import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { copyFile, mkdir, readFile, rename, rm, stat } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import manifest from '../src/ai/model-manifest.json' with {type:'json'};
import path from 'node:path';
const limit=838860800; let total=0, failed=false;
for (const model of manifest.models) for (const file of model.files) {
  total+=file.bytes;
  const dest=path.join('public/models',model.name,file.path);
  async function check() { try {if((await stat(dest)).size!==file.bytes)return false; const h=createHash('sha256');for await(const chunk of createReadStream(dest))h.update(chunk);return h.digest('hex')===file.sha256;}catch{return false;} }
  if(await check()) continue;
  if(!process.argv.includes('--download')) {console.error(`Missing or corrupt: ${dest}`);failed=true;continue;}
  await mkdir(path.dirname(dest),{recursive:true}); const temp=dest+'.partial';
  try {const response=await fetch(`https://huggingface.co/${model.repo}/resolve/${model.revision}/${file.path}`,{signal:AbortSignal.timeout(300000)});if(!response.ok||!response.body)throw Error(`HTTP ${response.status}`);await pipeline(Readable.fromWeb(response.body),createWriteStream(temp));const h=createHash('sha256');for await(const chunk of createReadStream(temp))h.update(chunk);if((await stat(temp)).size!==file.bytes||h.digest('hex')!==file.sha256)throw Error('size/hash mismatch');await rename(temp,dest);}catch(e){await rm(temp,{force:true});console.error(`${dest}: ${e}`);failed=true;}
}
for (const file of manifest.runtime.files) {
  total += file.bytes;
  const dest = path.join('public/runtime', file.path);
  if (process.argv.includes('--download')) {
    const source = path.join('node_modules/onnxruntime-web/dist', file.path);
    try {
      const pkg = JSON.parse(await readFile('node_modules/onnxruntime-web/package.json', 'utf8'));
      const h = createHash('sha256'); for await (const chunk of createReadStream(source)) h.update(chunk);
      if (pkg.version !== manifest.runtime.version || (await stat(source)).size !== file.bytes || h.digest('hex') !== file.sha256) throw Error('package version or runtime size/hash mismatch');
      await mkdir(path.dirname(dest), {recursive:true});
      await copyFile(source, dest);
    } catch (e) { console.error(`Cannot install verified runtime ${source}: ${e}`); failed = true; }
  }
  try {
    const h = createHash('sha256');
    for await (const chunk of createReadStream(dest)) h.update(chunk);
    if ((await stat(dest)).size !== file.bytes || h.digest('hex') !== file.sha256) throw Error('size/hash mismatch');
  } catch (e) { console.error(`Missing or corrupt runtime: ${dest}: ${e}`); failed = true; }
}
for (const model of manifest.models) {
  const license = model.name === 'whisper-tiny' ? 'public/licenses/models/whisper-MIT.txt' : 'public/licenses/models/qwen-Apache-2.0.txt';
  try { const h=createHash('sha256'); for await (const c of createReadStream(license)) h.update(c); if(h.digest('hex')!==model.licenseSha256) throw Error('license hash mismatch'); }
  catch(e) { console.error(`${license}: ${e}`); failed=true; }
}
console.log(`Model + runtime: ${total} bytes (limit ${limit}); licenses and hashes: src/ai/model-manifest.json`);
if(total>limit||failed)process.exitCode=1;
