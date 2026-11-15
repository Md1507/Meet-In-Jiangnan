import assert from 'node:assert/strict';
import {mkdtempSync,copyFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {run} from '../scripts/game-dev-spawn.mjs';
const dir=mkdtempSync(path.join(tmpdir(),'game dev node '));
try{const exe=path.join(dir,process.platform==='win32'?'node.exe':'node');copyFileSync(process.execPath,exe);assert.equal(run(exe,['-e','process.exit(0)']).status,0);assert.equal(run(exe,['-e','process.exit(23)']).status,23);assert.notEqual(run(path.join(dir,'missing'),[]).status,0);}finally{rmSync(dir,{recursive:true,force:true});}
console.log('Executable path with spaces and nonzero propagation verified.');
