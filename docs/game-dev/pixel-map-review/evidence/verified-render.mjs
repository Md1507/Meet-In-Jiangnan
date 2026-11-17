import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire('D:/Project/Game/package.json'); const sharp=require('sharp');
const donor='C:/Users/LENOVO/AppData/Local/bint/state/Game-fd2129962cbf/worktrees/01M7G4A8J4DQ4K797CFQ1MFR3D';
const output='docs/game-dev/pixel-map-review/evidence';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
let records=[];
for (const [name,input] of [['overlay',donor+'/docs/game-dev/street-asset-kit/assembled-preview.svg'],['clean',output+'/street-clean.svg']]) {
 let bytes=fs.readFileSync(input), svg=bytes.toString('utf8'), refs=[];
 svg=svg.replace(/href="([^"]+)"/g,(whole,href)=>{let file=path.resolve(path.dirname(input),href); let data=fs.readFileSync(file); refs.push({href,path:file,sha256:hash(data),bytes:data.length}); return `href="data:image/svg+xml;base64,${data.toString('base64')}"`;});
 if(refs.length!==5) throw Error(`expected 5 refs, got ${refs.length}`);
 for(const scale of [1,4]) {let dest=`${output}/verified-${name}-${scale}x.png`; let b=await sharp(Buffer.from(svg),{density:72*scale}).png().toBuffer(); fs.writeFileSync(dest,b); records.push({name,scale,input,inputSha256:hash(bytes),refs,output:dest,outputSha256:hash(b),dimensions:await sharp(b).metadata()});}
}
fs.writeFileSync(output+'/verified-render.json',JSON.stringify({method:'sharp/libvips SVG rasterizer; resolve each relative href to exact local bytes then embed losslessly as data URI in memory before rendering; no artwork changes',versions:sharp.versions,records},null,2));
