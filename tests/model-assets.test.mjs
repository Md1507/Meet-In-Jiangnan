import { mkdtemp,mkdir,symlink,writeFile,readFile,cp,rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const repository=fileURLToPath(new URL('../',import.meta.url));
const manifest=JSON.parse(await readFile(path.join(repository,'src/ai/model-manifest.json'),'utf8'));
assert.deepEqual(manifest.runtime.files.map(f=>f.path),['ort-wasm-simd-threaded.asyncify.mjs','ort-wasm-simd-threaded.asyncify.wasm']);
assert.match(await readFile(path.join(repository,'public/runtime',manifest.runtime.files[0].path),'utf8'),/webgpuInit/);
const stage=await mkdtemp(path.join(tmpdir(),'jiangnan-integrity-'));
try{
  await mkdir(path.join(stage,'public/runtime'),{recursive:true});
  await symlink(path.join(repository,'public/models'),path.join(stage,'public/models'),process.platform==='win32'?'junction':'dir');
  await cp(path.join(repository,'public/licenses'),path.join(stage,'public/licenses'),{recursive:true});
  for(const name of ['ort-wasm-simd-threaded.asyncify.mjs','ort-wasm-simd-threaded.asyncify.wasm'])await writeFile(path.join(stage,'public/runtime',name),'x');
  const result=spawnSync(process.execPath,[path.join(repository,'scripts/models.mjs')],{cwd:stage,encoding:'utf8'});
  assert.equal(result.status,1,result.stdout+result.stderr);
  assert.match(result.stderr,/Missing or corrupt runtime.*mjs/);
  assert.match(result.stderr,/Missing or corrupt runtime.*wasm/);
  console.log('Corrupt runtime rejected; original model/runtime files unchanged.');
}finally{
  const resolved=path.resolve(stage),parent=path.resolve(tmpdir());
  if(path.dirname(resolved)!==parent||!path.basename(resolved).startsWith('jiangnan-integrity-'))throw Error('Unexpected cleanup target');
  await rm(resolved,{recursive:true,force:true});
}
