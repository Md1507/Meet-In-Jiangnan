import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildDebug, verifyExport } from '../scripts/world-map/dual-grid-build.mjs';
import { fixtureAtlas, decodePng, encodePng, renderDisplay, readChecked, hash } from '../scripts/world-map/dual-grid-debug-render.mjs';

const root=path.resolve('docs/game-dev/world-map-pipeline/dual-grid');
const display=()=>JSON.parse(fs.readFileSync(path.join(root,'garden.display.json')));
test('atlas corners, empty, full and disconnected saddles are literal pixels',()=>{
 const {png,mapping}=fixtureAtlas(), image=decodePng(png);
 for(let mask=0;mask<16;mask++) for(const [x,y,bit] of [[2,2,1],[13,2,2],[13,13,4],[2,13,8]]) assert.equal(image.pixels[(y*image.width+mapping[mask].x+x)*4+3],mask&bit?255:0);
});
test('renderer consumes atlas bytes and mapping; rejects bad input',()=>{
 const {png,mapping}=fixtureAtlas(), d=display(), first=renderDisplay(d,png,mapping);
 const image=decodePng(png); for(let i=0;i<image.pixels.length;i+=4) image.pixels[i]=128;
 assert.notEqual(hash(first),hash(renderDisplay(d,encodePng(image.width,image.height,image.pixels),mapping)));
 const swapped=mapping.map(m=>({...m})); [swapped[1].x,swapped[2].x]=[swapped[2].x,swapped[1].x]; assert.throws(()=>renderDisplay(d,png,swapped),/missing underlay coverage/);
 assert.throws(()=>renderDisplay(d,Buffer.from('bad'),mapping)); assert.throws(()=>renderDisplay(d,png,mapping.slice(1)));
 assert.throws(()=>renderDisplay({...d,underlay:null},png,mapping)); assert.throws(()=>renderDisplay(d,png,mapping,1.5));
 const bad=structuredClone(d); bad.layers.grass[0][0].x++; assert.throws(()=>renderDisplay(bad,png,mapping));
 assert.throws(()=>readChecked(path.join(root,'fixture-atlas.debug.png'),'0'.repeat(64))); assert.throws(()=>readChecked(path.join(root,'missing.png'),'0'.repeat(64)));
});
test('exports retain source dimensions, graph, overlays and deterministic hashes',()=>{
 const a=fs.mkdtempSync(path.join(os.tmpdir(),'c5-a-')), b=fs.mkdtempSync(path.join(os.tmpdir(),'c5-b-'));
 try {const one=buildDebug(a),two=buildDebug(b); assert.deepEqual(one,two); assert.deepEqual(verifyExport(a),one); const changed=structuredClone(one); changed.atlas.mapping.sha256='0'.repeat(64); fs.writeFileSync(path.join(a,'index.json'),JSON.stringify(changed)); assert.throws(()=>verifyExport(a),/hash mismatch/); assert.deepEqual(one.counts,{maps:6,cells:1800,landmarks:18,directedEdges:20,warps:40,bridges:2});
 for(const m of one.maps){assert.equal(hash(fs.readFileSync(path.join(a,m.png.path))),m.png.sha256); const d=JSON.parse(fs.readFileSync(path.join(a,m.display.path))); assert.deepEqual(d.projection.detail,[40,30]);assert.deepEqual(d.projection.display,[41,31]);assert.deepEqual(d.projection.crop,[0,0,640,480]);assert.equal(d.source.layout.length,15);assert.equal(d.source.layout[0].length,20);assert.equal(d.layers.grass.length,31);assert.equal(d.layers.grass[0].length,41); assert.equal(d.ports.length>0,true); const image=decodePng(fs.readFileSync(path.join(a,m.png.path)));assert.deepEqual([image.width,image.height],[640,480]);}
 } finally {fs.rmSync(a,{recursive:true,force:true});fs.rmSync(b,{recursive:true,force:true});}
});
test('overlay and bridge contracts are visible and require integer coordinates',()=>{
 const {png,mapping}=fixtureAtlas(), d=display(), baseline=renderDisplay(d,png,mapping);
 const moved=structuredClone(d); moved.ports[0].x--; assert.notEqual(hash(baseline),hash(renderDisplay(moved,png,mapping)));
 const outside=structuredClone(d); outside.ports[0].x=20; assert.throws(()=>renderDisplay(outside,png,mapping),/invalid port macro coordinate/);
 const bad=structuredClone(d); bad.ports[0].x+=0.5; assert.throws(()=>renderDisplay(bad,png,mapping));
 const noWater=structuredClone(d); noWater.bridgeContracts[0].cells[0].underlay=null; assert.throws(()=>renderDisplay(noWater,png,mapping),/bridge underlay/);
 const broken=Buffer.from(png); broken[30]^=1; assert.throws(()=>renderDisplay(d,broken,mapping));
});


test('rejects duplicate maps and nested metadata inconsistent with hashed sources',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'c5-invalid-'));
 try {
  const original=buildDebug(dir), indexPath=path.join(dir,'index.json');
  const saveIndex=i=>fs.writeFileSync(indexPath,JSON.stringify(i));
  const duplicate=structuredClone(original); duplicate.maps[1]=structuredClone(duplicate.maps[0]); saveIndex(duplicate);
  fs.unlinkSync(path.join(dir,original.maps[1].display.path)); assert.throws(()=>verifyExport(dir),/map set/);
  buildDebug(dir);
  const entry=original.maps[0], displayPath=path.join(dir,entry.display.path), source=JSON.parse(fs.readFileSync(displayPath));
  for(const mutate of [d=>d.source.maskSha256='0'.repeat(64),d=>d.source.layout[0][0]=99,d=>d.projection.crop=[0,0,320,240]]) {
   const d=structuredClone(source); mutate(d); const bytes=Buffer.from(JSON.stringify(d)); fs.writeFileSync(displayPath,bytes);
   const i=structuredClone(original); i.maps[0].display.sha256=hash(bytes); saveIndex(i); assert.throws(()=>verifyExport(dir),/source or projection mismatch/);
  }
  const i=structuredClone(original); i.settings.seed='wrong'; saveIndex(i); assert.throws(()=>verifyExport(dir),/settings/);
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
test('macro coordinates and continuous bridge deck have independent expected pixels',()=>{
 const {png,mapping}=fixtureAtlas(), d=display();
 for(const key of ['ports','arrivals','bridges']) for(const value of [0.5,-1,20]) {
  const bad=structuredClone(d); bad[key][0].x=value; assert.throws(()=>renderDisplay(bad,png,mapping),/macro coordinate/);
 }
 for(const value of [0.5,-1,20]) {const bad=structuredClone(d); bad.bridgeContracts[0].cells[0].x=value; assert.throws(()=>renderDisplay(bad,png,mapping),/macro coordinate/);}
 const image=decodePng(renderDisplay(d,png,mapping));
 const pixel=(x,y)=>[...image.pixels.subarray((y*image.width+x)*4,(y*image.width+x)*4+4)];
 for(const y of [121,125,129,133]) assert.deepEqual(pixel(170,y),[155,109,68,255]);
 assert.deepEqual(pixel(170,97),[100,65,42,255]);
 assert.deepEqual(pixel(170,158),[100,65,42,255]);
});
