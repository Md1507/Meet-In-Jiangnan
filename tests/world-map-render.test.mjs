import test from 'node:test';
import assert from 'node:assert/strict';
import {decodePng, encodePng, render, renderOverlay} from '../scripts/world-map/render.mjs';
import {assemble, main} from '../scripts/world-map/assemble.mjs';
import * as fs from 'node:fs';
import {deflateSync} from 'node:zlib';
import {readFileSync, writeFileSync, existsSync, cpSync, mkdtempSync, rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {run} from '../scripts/game-dev-spawn.mjs';

const image=(width,height,pixels)=>({width,height,pixels:Buffer.from(pixels)});
const sprite=(image,layer,x,y,anchor={x:0,y:0},order=0)=>({image,layer,x,y,anchor,order});

// Fixed filtered scanlines and independently specified expected pixels, not encodePng output.
test('decodes RGB and RGBA multirow PNG filters 0 through 4',()=>{
 const chunk=(type,data)=>{const body=Buffer.concat([Buffer.from(type),data]); let crc=0xffffffff; for(const byte of body){crc^=byte; for(let i=0;i<8;i++) crc=(crc>>>1)^(0xedb88320 & -(crc&1));} const size=Buffer.alloc(4),sum=Buffer.alloc(4); size.writeUInt32BE(data.length); sum.writeUInt32BE((crc^0xffffffff)>>>0); return Buffer.concat([size,body,sum]);};
 for(const [color,row,sub,average,expected] of [
  [2,[10,20,30,40,50,60],[10,20,30,30,30,30],[5,10,15,15,15,15],[10,20,30,255,40,50,60,255]],
  [6,[10,20,30,40,40,50,60,70],[10,20,30,40,30,30,30,30],[5,10,15,20,15,15,15,15],[10,20,30,40,40,50,60,70]],
 ]) {
  const header=Buffer.alloc(13); header.writeUInt32BE(2); header.writeUInt32BE(5,4); header[8]=8; header[9]=color;
  const zeros=Array(row.length).fill(0);
  const raw=Buffer.from([0,...row,1,...sub,2,...zeros,3,...average,4,...zeros]);
  const png=Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
  const decoded=decodePng(png); assert.equal(decoded.width,2); assert.equal(decoded.height,5);
  assert.deepEqual([...decoded.pixels],Array(5).fill(expected).flat(),`color ${color}`);
 }
});
test('PNG round trip, layer order, alpha, camera, anchor and nearest scaling',()=>{
 const red=image(2,1,[255,0,0,255,255,0,0,255]);
 const blue=image(1,1,[0,0,255,128]);
 const result=render({camera:{x:1,y:0,width:1,height:1},scale:2,sprites:[sprite(blue,'props',2,1,{x:1,y:1}),sprite(red,'terrain',0,0)]});
 assert.deepEqual([...result.pixels],[127,0,128,255,127,0,128,255,127,0,128,255,127,0,128,255]);
 assert.deepEqual(decodePng(encodePng(result)),result);
 assert.deepEqual(encodePng(result),encodePng(result));
});

test('QA overlay preserves clean pixels and labels each category',()=>{
 const clean=image(2,2,Array(16).fill(0));
 const overlays=['world','display','footprint','warp','actor','collision','interaction'].map(type=>({type,label:type,x:0,y:0,width:1,height:1}));
 const debug=renderOverlay(clean,{x:0,y:0},1,overlays);
 assert.deepEqual(debug.labels.map(x=>x.label),overlays.map(x=>x.label));
 assert.deepEqual([...clean.pixels],Array(16).fill(0));
 assert.throws(()=>renderOverlay(clean,{x:0,y:0},1,[{...overlays[0],type:'bad'}]));
});

test('overlay numbers are clipped to camera intersection and clean pixels remain unchanged',()=>{
 const clean=image(12,12,Array(12*12*4).fill(0)), camera={x:0,y:0};
 const box=(x,y,width,height)=>({type:'actor',label:'npc-a',x,y,width,height});
 const visible=debug=>{const pixels=[]; for(let y=0;y<12;y++) pixels.push(...debug.image.pixels.subarray(y*debug.image.width*4,(y*debug.image.width+12)*4)); return pixels;};
 const pixel=(debug,x,y)=>[...debug.image.pixels.subarray((y*debug.image.width+x)*4,(y*debug.image.width+x+1)*4)];
 const outside=renderOverlay(clean,camera,1,[box(-10,-10,1,1)]);
 assert.deepEqual(visible(outside),[...clean.pixels]); assert.equal(outside.labels.length,1);
 const partial=renderOverlay(clean,camera,1,[box(-2,-2,10,10)]);
 assert.deepEqual(pixel(partial,1,0),[255,0,0,255]);
 assert.deepEqual(pixel(partial,8,1),[0,0,0,0]);
 const inside=renderOverlay(clean,camera,1,[box(2,2,7,7)]);
 assert.deepEqual(pixel(inside,3,3),[255,0,0,255]);
 assert.deepEqual([...clean.pixels],Array(12*12*4).fill(0));
});

test('CLI rejects absent input with nonzero exit',()=>{
 const root=path.resolve('tests/fixtures/world-map-render'), temp=mkdtempSync(path.join(tmpdir(),'render cli '));
 try {const result=run(process.execPath,[path.resolve('scripts/world-map/assemble.mjs'),root,'manifest.json','reference.json','absent.json',path.join(temp,'out.png')],{stdio:'pipe'});assert.notEqual(result.status,0);}
 finally {rmSync(temp,{recursive:true,force:true});}
});
test('crop uses explicit sheet coordinates and invalid inputs fail',()=>{
 const sheet=image(2,1,[255,0,0,255,0,255,0,255]);
 const s={...sprite(sheet,'structure',0,0),crop:{x:1,y:0,width:1,height:1}};
 const args={camera:{x:0,y:0,width:1,height:1},scale:1,sprites:[s]};
 assert.deepEqual([...render(args).pixels],[0,255,0,255]);
 assert.throws(()=>render({...args,sprites:[{...s,layer:'unknown'}]}));
 assert.throws(()=>render({...args,sprites:[{...s,crop:{x:2,y:0,width:1,height:1}}]}));
 assert.throws(()=>render({...args,scale:1.5}));
});

test('all layers, stable ordering, clipping and transparent pixels',()=>{
 const one=(r,g,b,a=255)=>image(1,1,[r,g,b,a]);
 const names=['terrain','underlay','decoration','architecture','structure','props','foreground'];
 const sprites=names.map((layer,i)=>sprite(one(i*30,0,0),layer,0,0));
 assert.deepEqual([...render({camera:{x:0,y:0,width:1,height:1},scale:1,sprites:sprites.reverse()}).pixels],[180,0,0,255]);
 for(let i=0;i<names.length-1;i++) for(const reverse of [false,true]) {
  const pair=[sprite(one(255,0,0),names[i],0,0,undefined,100),sprite(one(0,255,0),names[i+1],0,0,undefined,-100)];
  if(reverse) pair.reverse();
  assert.deepEqual([...render({camera:{x:0,y:0,width:1,height:1},scale:1,sprites:pair}).pixels],[0,255,0,255],`${names[i]} before ${names[i+1]}`);
 }
 for(const reverse of [false,true]) {
  const pair=[sprite(one(255,0,0),'props',0,0,undefined,10),sprite(one(0,255,0),'props',0,0,undefined,-2)];
  if(reverse) pair.reverse();
  assert.deepEqual([...render({camera:{x:0,y:0,width:1,height:1},scale:1,sprites:pair}).pixels],[255,0,0,255]);
 }
 const list=[sprite(one(255,0,0),'props',0,0,undefined,1),sprite(one(0,255,0),'props',0,0,undefined,1),sprite(one(0,0,255,0),'foreground',0,0),sprite(one(0,0,255),'foreground',3,0)];
 assert.deepEqual([...render({camera:{x:0,y:0,width:1,height:1},scale:1,sprites:list}).pixels],[0,255,0,255]);
});

test('write failure after PNG write rolls back only this call output',()=>{
 const temp=mkdtempSync(path.join(tmpdir(),'render rollback ')), root=path.resolve('tests/fixtures/world-map-render');
 try {
  const output=path.join(temp,'out.png'), keep=path.join(temp,'existing.bin'), original=Buffer.from([0,1,255,42]);
  writeFileSync(keep,original); let wrotePng=false;
  const io={...fs,writeFileSync(name,data){if(name===output){fs.writeFileSync(name,data); wrotePng=true; return;} if(name===`${output}.hashes.json`){assert.ok(wrotePng); assert.ok(fs.statSync(output).size>0); throw Object.assign(new Error('injected write failure'),{code:'EIO'});} fs.writeFileSync(name,data);}};
  assert.throws(()=>main([root,'manifest.json','reference.json','scene.json',output],io),/injected write failure/);
  assert.ok(wrotePng); for(const name of [output,`${output}.debug.png`,`${output}.hashes.json`]) assert.equal(existsSync(name),false);
  assert.deepEqual(readFileSync(keep),original);
 } finally {rmSync(temp,{recursive:true,force:true});}
});

test('fixture uses validated physical sheet and produces deterministic provenance',()=>{
 const root=path.resolve('tests/fixtures/world-map-render');
 const get=name=>readFileSync(path.join(root,name));
 const args={root,manifestBytes:get('manifest.json'),referenceBytes:get('reference.json'),sceneBytes:get('scene.json')};
 const result=assemble(args), again=assemble(args);
 assert.deepEqual(result,again);
 assert.deepEqual([...decodePng(result.png).pixels], [127,0,128,255,127,0,128,255,127,0,128,255,127,0,128,255]);
 assert.match(result.hashes.output,/^[a-f0-9]{64}$/);
 assert.equal(Object.keys(result.hashes.inputs.assets).length,1);
 assert.equal(result.hashes.validation.status,'component-only');
 assert.match(result.hashes.validation.sceneContract,/pending/);
 const mismatch=JSON.parse(args.sceneBytes); mismatch.scale=3; mismatch.placements[0].anchor.x=1;
 assert.equal(assemble({...args,sceneBytes:Buffer.from(JSON.stringify(mismatch))}).hashes.validation.sceneContract,'pending');
 const scene=JSON.parse(args.sceneBytes); scene.placements[0].id='missing';
 assert.throws(()=>assemble({...args,sceneBytes:Buffer.from(JSON.stringify(scene))}),/binding/);
 scene.placements[0].id='red'; scene.placements[0].layer='invalid';
 assert.throws(()=>assemble({...args,sceneBytes:Buffer.from(JSON.stringify(scene))}),/layer/);
});

test('CLI exports matching hashes and rolls back on existing sidecars',()=>{
 const temp=mkdtempSync(path.join(tmpdir(),'render export ')), root=path.join(temp,'input');
 try {
  cpSync(path.resolve('tests/fixtures/world-map-render'),root,{recursive:true});
  const scene=JSON.parse(readFileSync(path.join(root,'scene.json')));
  scene.overlays=[{type:'footprint',label:'house-a',x:0,y:0,width:1,height:1},{type:'footprint',label:'house-b',x:0,y:0,width:1,height:1},{type:'terrain',label:'tile-7',x:0,y:0,width:1,height:1},{type:'grid',label:'world-grid',x:0,y:0,width:1,height:1}];
  writeFileSync(path.join(root,'debug.json'),JSON.stringify(scene));
  const output=path.join(temp,'out.png'), cli=()=>run(process.execPath,[path.resolve('scripts/world-map/assemble.mjs'),root,'manifest.json','reference.json','debug.json',output],{stdio:'pipe'});
  const side=`${output}.hashes.json`, debug=`${output}.debug.png`;
  for(const blocked of [side,debug]) {
   writeFileSync(blocked,'existing'); assert.notEqual(cli().status,0);
   assert.equal(readFileSync(blocked,'utf8'),'existing'); assert.equal(existsSync(output),false);
   assert.equal(existsSync(blocked===side?debug:side),false); rmSync(blocked);
  }
  assert.equal(cli().status,0);
  const hashes=JSON.parse(readFileSync(side)), digest=b=>createHash('sha256').update(b).digest('hex');
  assert.equal(hashes.output,digest(readFileSync(output))); assert.equal(hashes.debug.sha256,digest(readFileSync(debug)));
  assert.equal(hashes.inputs.scene,digest(readFileSync(path.join(root,'debug.json'))));
  assert.equal(hashes.code['render.mjs'],digest(readFileSync('scripts/world-map/render.mjs')));
  const png=decodePng(readFileSync(debug)), clean=decodePng(readFileSync(output));
  assert.ok(png.height>clean.height); assert.ok(png.pixels.subarray(png.width*clean.height*4).some(x=>x!==0));
  const legendRow=n=>png.pixels.subarray((clean.height+n*7)*png.width*4,(clean.height+(n+1)*7)*png.width*4);
  assert.notDeepEqual(legendRow(0),legendRow(1));
  assert.deepEqual(hashes.debug.labels.map(l=>[l.number,l.label]),[[1,'house-a'],[2,'house-b'],[3,'tile-7'],[4,'world-grid']]);
  assert.notEqual(cli().status,0); assert.equal(hashes.output,digest(readFileSync(output)));
 } finally {rmSync(temp,{recursive:true,force:true});}
});

test('CLI rejects invalid scene fields and missing bindings without output',()=>{
 const temp=mkdtempSync(path.join(tmpdir(),'render bad ')), root=path.join(temp,'input');
 try {
  cpSync(path.resolve('tests/fixtures/world-map-render'),root,{recursive:true});
  const original=JSON.parse(readFileSync(path.join(root,'scene.json'))), output=path.join(temp,'out.png');
  const scenes=[{...original,scale:1.5},{...original,camera:{...original.camera,width:0}},{...original,placements:[{...original.placements[0],id:'absent'}]},{...original,placements:[{...original.placements[0],layer:'bogus'}]},{...original,bindings:{...original.bindings,red:{sheet:'sheet',crop:{x:2,y:0,width:1,height:1}}}}];
  for(const scene of scenes) {
   writeFileSync(path.join(root,'invalid.json'),JSON.stringify(scene));
   const result=run(process.execPath,[path.resolve('scripts/world-map/assemble.mjs'),root,'manifest.json','reference.json','invalid.json',output],{stdio:'pipe'});
   assert.notEqual(result.status,0); assert.equal(existsSync(output),false); assert.equal(existsSync(`${output}.hashes.json`),false);
  }
 } finally {rmSync(temp,{recursive:true,force:true});}
});
