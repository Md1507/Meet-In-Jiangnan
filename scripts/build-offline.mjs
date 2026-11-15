import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {isBuiltAiFile} from './mvp-evidence.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(e.name==='models'||e.name==='runtime'?[]:walk(dir+'/'+e.name)):[dir+'/'+e.name]);}
const files=walk('dist').filter(f=>!f.endsWith('/offline-assets.json')&&!isBuiltAiFile(f)).sort().map(name=>{const data=readFileSync(name);return {url:'/'+name.slice(5),bytes:data.length,sha256:hash(data)};});
const manifest={schemaVersion:1,version:hash(JSON.stringify(files)),files};
writeFileSync('dist/offline-assets.json',JSON.stringify(manifest));
const bytes=files.reduce((n,f)=>n+f.bytes,0);console.log(`Play bundle (including local font/audio/strokes): ${bytes} bytes / ${30*1024*1024}. AI model/runtime excluded, loaded separately.`);
if(bytes>30*1024*1024)process.exitCode=1;
