import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { run } from '../scripts/game-dev-spawn.mjs';
import { loadAssets } from '../scripts/world-map/asset-loader.mjs';
const hash = b => createHash('sha256').update(b).digest('hex');
function chunk(type,data) { const b=Buffer.concat([Buffer.from(type),data]); let c=0xffffffff; for(const x of b){c^=x;for(let i=0;i<8;i++)c=(c>>>1)^(0xedb88320&-(c&1));} const n=Buffer.alloc(4), crc=Buffer.alloc(4); n.writeUInt32BE(data.length);crc.writeUInt32BE((c^0xffffffff)>>>0);return Buffer.concat([n,b,crc]); }
function png(alpha=255,filter=0) { const h=Buffer.alloc(13); h.writeUInt32BE(1);h.writeUInt32BE(1,4);h[8]=8;h[9]=6;return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',h),chunk('IDAT',deflateSync(Buffer.from([filter,10,20,30,alpha]))),chunk('IEND',Buffer.alloc(0))]); }
function fixture() {
 const root=mkdtempSync(path.join(tmpdir(),'e1 asset ')); mkdirSync(path.join(root,'public/art'),{recursive:true});
 const bytes=png(128);writeFileSync(path.join(root,'public/art/a.png'),bytes);
 const inputs={};for(const name of ['maps.json','ascii-maps.md']) { const b=Buffer.from(name === 'maps.json' ? JSON.stringify(['street','garden'].map(map_name=>({map_name,layout:Array.from({length:10},()=>Array(10).fill(0))}))) : name);writeFileSync(path.join(root,name),b);inputs[name]={path:name,sha256:hash(b)}; }
 const sourceInputs=Object.fromEntries(Object.entries(inputs).map(([k,v])=>[k,v.sha256]));
 const contract={sourceInputs,...Object.fromEntries(['scale','layout','camera','clearance'].map(k=>[k,{status:'approved',evidence:'fixture',sourceInputs}]))}; const cb=Buffer.from(JSON.stringify(contract));writeFileSync(path.join(root,'c6.json'),cb);
 const a={id:'asset_a.one',path:'public/art/a.png',sha256:hash(bytes),status:'production',category:'props',maps:['street','garden'],nativeDimensions:{width:1,height:1},gridFootprint:{width:1,height:1},anchor:{x:0,y:1},collision:{kind:'none'},layer:'ground',renderOrder:0,interaction:{kind:'none'},variants:[],source:'fixture source',license:'fixture license',bytes:bytes.length,placement:'fixture placement',sourceStatus:'available',runtimeStatus:'pending',previewStatus:'pending'};
 const manifest={assets:[a],sourceInputs,c6:{path:'c6.json',sha256:hash(cb),expectedSha256:hash(cb)}};
 const fields=['path','sha256','nativeDimensions','gridFootprint','anchor','layer','renderOrder','collision','interaction','variants','source','license','maps','placement'];const binding=Object.fromEntries(fields.map(k=>[k,a[k]]));binding.alpha='transparent';
 const placement={id:a.id,map:'street',x:1,y:1,unit:'tile',...Object.fromEntries(['path','anchor','layer','renderOrder','gridFootprint','collision','interaction','variants'].map(k=>[k,a[k]]))};
 const reference={provenance:'fixture only',inputs,unit:'tile',maps:{street:{width:10,height:10},garden:{width:10,height:10}},assets:{[a.id]:binding},placements:[placement,{...placement,map:'garden'}]};return {root,manifest,reference};
}
test('fixture resolve, PNG pixels, metadata and gates',()=>{ const f=fixture();try {
 const go=()=>loadAssets(f); assert.equal(go().status,'ready'); assert.equal(go().entries['asset_a.one'].transparent,true);
 f.reference.assets['asset_a.one'].alpha='opaque'; assert.ok(go().errors.some(e=>e.code==='alpha')); f.reference.assets['asset_a.one'].alpha='transparent';
 f.reference.placements[0].x=10;assert.ok(go().errors.some(e=>e.code==='placement-bounds'));f.reference.placements[0].x=1;
 f.reference.placements[0].layer='wrong';assert.ok(go().errors.some(e=>e.code==='placement-mismatch'));f.reference.placements[0].layer='ground';
 f.manifest.c6=null;f.manifest.assets[0].bytes=1;const both=go();assert.equal(both.status,'error');assert.ok(both.pending.some(e=>e.code==='c6'));assert.ok(both.errors.some(e=>e.detail.includes('bytes mismatch')));
 }finally{rmSync(f.root,{recursive:true,force:true});}});
test('rejects corrupt PNG, invalid paths, duplicates and stale inputs',()=>{const f=fixture();try{
 const go=()=>loadAssets(f), a=f.manifest.assets[0], original=structuredClone(a);
 a.path='../outside.png'; assert.ok(go().errors.some(e=>e.code==='path')); Object.assign(a,original);
 f.manifest.assets.push({...a}); assert.ok(go().errors.some(e=>e.detail.includes('duplicate')));f.manifest.assets.pop();
 const bad=Buffer.from('not a PNG');writeFileSync(path.join(f.root,a.path),bad);a.bytes=bad.length;a.sha256=hash(bad);assert.ok(go().errors.some(e=>e.detail.includes('invalid PNG')));
 Object.assign(a,original);writeFileSync(path.join(f.root,a.path),png(128));writeFileSync(path.join(f.root,'maps.json'),'changed');assert.ok(go().stale.some(e=>e.code==='input'));
 }finally{rmSync(f.root,{recursive:true,force:true});}});
test('CLI rejects pending and supports root with spaces',()=>{const f=fixture();try{f.manifest.c6=null;writeFileSync(path.join(f.root,'manifest.json'),JSON.stringify(f.manifest));writeFileSync(path.join(f.root,'reference.json'),JSON.stringify(f.reference));const cli=path.resolve('scripts/world-map/validate-assets.mjs');assert.notEqual(run(process.execPath,[cli,f.root,'manifest.json','reference.json'],{stdio:'pipe'}).status,0);}finally{rmSync(f.root,{recursive:true,force:true});}});
test('unfilters each PNG scanline and refuses missing policy and misplaced references',()=>{const f=fixture();try{
 const a=f.manifest.assets[0], b=f.reference.assets[a.id];
 for(let filter=0;filter<=4;filter++){const bytes=png(128,filter);writeFileSync(path.join(f.root,a.path),bytes);a.bytes=bytes.length;a.sha256=hash(bytes);b.sha256=a.sha256;assert.equal(loadAssets(f).status,'ready',`filter ${filter}`);}
 delete b.alpha;assert.ok(loadAssets(f).pending.some(e=>e.code==='alpha-policy'));b.alpha='transparent';
 f.reference.placements[0].id='unknown';assert.ok(loadAssets(f).errors.some(e=>e.code==='placement-id'));
 f.reference.placements[0].id=a.id;f.reference.maps.street.width=9;assert.ok(loadAssets(f).errors.some(e=>e.code==='map-bounds'));
 }finally{rmSync(f.root,{recursive:true,force:true});}});

function filteredPng(channels, filter, transparent) {
 const width=3, height=3, rows=[];
 for(let y=0;y<height;y++) { const row=Buffer.alloc(width*channels); for(let x=0;x<width;x++) { const i=x*channels; row[i]=23+x*31+y*11;row[i+1]=48+x*9+y*17;row[i+2]=91+x*7+y*13;if(channels===4)row[i+3]=transparent && x===2 && y===2 ? 100 : 255; } rows.push(row); }
 const scan=[]; for(let y=0;y<height;y++){scan.push(filter);for(let x=0;x<rows[y].length;x++){const l=x>=channels?rows[y][x-channels]:0,u=y?rows[y-1][x]:0,ul=y&&x>=channels?rows[y-1][x-channels]:0,p=l+u-ul,pa=Math.abs(p-l),pb=Math.abs(p-u),pc=Math.abs(p-ul);const pred=filter===0?0:filter===1?l:filter===2?u:filter===3?Math.floor((l+u)/2):pa<=pb&&pa<=pc?l:pb<=pc?u:ul;scan.push((rows[y][x]-pred)&255);}}
 const h=Buffer.alloc(13);h.writeUInt32BE(width);h.writeUInt32BE(height,4);h[8]=8;h[9]=channels===4?6:2;return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',h),chunk('IDAT',deflateSync(Buffer.from(scan))),chunk('IEND',Buffer.alloc(0))]);
}
function setImage(f, bytes, alpha, width=3, height=3) { const a=f.manifest.assets[0], b=f.reference.assets[a.id];writeFileSync(path.join(f.root,a.path),bytes);a.bytes=bytes.length;a.sha256=hash(bytes);a.nativeDimensions={width,height};b.sha256=a.sha256;b.nativeDimensions=a.nativeDimensions;b.alpha=alpha; }
const has=(r,code,detail)=>assert.ok(r.errors.some(e=>e.code===code && (!detail || e.detail.includes(detail))),JSON.stringify(r));
test('multi-row RGB and RGBA filters measure decoded alpha',()=>{const f=fixture();try{for(let filter=0;filter<5;filter++)for(const [channels,transparent] of [[3,false],[4,false],[4,true]]){setImage(f,filteredPng(channels,filter,transparent),transparent?'transparent':'opaque');const r=loadAssets(f);assert.equal(r.status,'ready',JSON.stringify(r));assert.equal(r.entries['asset_a.one'].transparent,transparent);f.reference.assets['asset_a.one'].alpha=transparent?'opaque':'transparent';has(loadAssets(f),'alpha','asset_a.one');}}finally{rmSync(f.root,{recursive:true,force:true});}});
test('specific file and metadata mismatches are errors even with pending C6',()=>{const f=fixture();try{const a=f.manifest.assets[0], original=structuredClone(a); f.manifest.c6=null;
 for(const [key,value,detail] of [['bytes',1,'bytes mismatch'],['sha256','0'.repeat(64),'hash mismatch'],['nativeDimensions',{width:2,height:1},'dimensions mismatch'],['anchor',null,'anchor'],['layer',null,'layer'],['gridFootprint',null,'gridFootprint'],['license',null,'license'],['maps','street','maps']]){Object.assign(a,structuredClone(original));a[key]=value;has(loadAssets(f),'schema',detail);}
 Object.assign(a,original);f.reference.assets[a.id].license='other';has(loadAssets(f),'binding-mismatch','license');f.reference.assets[a.id].license=a.license;a.variants=['missing'];has(loadAssets(f),'variant','missing');
 f.reference.licenses=[null];has(loadAssets(f),'license','invalid license');f.reference.licenses=[{path:'missing',sha256:'0'.repeat(64)}];has(loadAssets(f),'license','missing');
 f.reference.placements[0].map='unknown';has(loadAssets(f),'placement-map');
 }finally{rmSync(f.root,{recursive:true,force:true});}});
test('canonical paths, missing files and duplicates rejected independently',()=>{const f=fixture();try{const a=f.manifest.assets[0], original=structuredClone(a);
 for(const bad of ['../a.png','/public/art/a.png','C:/public/art/a.png','\\\\server\\share\\a.png','public\\art\\a.png','public/art/./a.png','https://host/public/art/a.png']){a.path=bad;has(loadAssets(f),'path');}a.path='public/art/missing.png';has(loadAssets(f),'path-or-missing');Object.assign(a,original);
 for(const key of ['id','path','sha256']){const other={...structuredClone(a),id:'other',path:'public/art/other.png',sha256:'a'.repeat(64)};other[key]=a[key];f.manifest.assets.push(other);has(loadAssets(f),'schema',`${key}: duplicate`);f.manifest.assets.pop();}
 }finally{rmSync(f.root,{recursive:true,force:true});}});
test('extra asset and shared map resolve; parity and license references checked',()=>{const f=fixture();try{const a=f.manifest.assets[0], b=structuredClone(a), bytes=filteredPng(3,0,false);b.id='extra';b.path='public/art/extra.png';b.sha256=hash(bytes);b.bytes=bytes.length;b.nativeDimensions={width:3,height:3};writeFileSync(path.join(f.root,b.path),bytes);f.manifest.assets.push(b);f.reference.assets.extra={...structuredClone(f.reference.assets[a.id]),path:b.path,sha256:b.sha256,nativeDimensions:b.nativeDimensions,alpha:'opaque'};for(const p of f.reference.placements.filter(p=>p.id===a.id))f.reference.placements.push({...structuredClone(p),id:'extra',path:b.path});
 const license=Buffer.from('fixture license');writeFileSync(path.join(f.root,'license.txt'),license);f.reference.licenses=[{path:'license.txt',sha256:hash(license)}];assert.equal(loadAssets(f).status,'ready');f.reference.assets.ghost={};has(loadAssets(f),'manifest-parity','ghost');delete f.reference.assets.ghost;f.reference.licenses[0].sha256='0'.repeat(64);has(loadAssets(f),'license','license.txt');
 }finally{rmSync(f.root,{recursive:true,force:true});}});
test('CLI success and failure from another cwd with spaces',()=>{const f=fixture();try{const cli=path.resolve('scripts/world-map/validate-assets.mjs');writeFileSync(path.join(f.root,'manifest.json'),JSON.stringify(f.manifest));writeFileSync(path.join(f.root,'reference.json'),JSON.stringify(f.reference));const invoke=()=>run(process.execPath,[cli,f.root,'manifest.json','reference.json'],{stdio:'pipe',cwd:f.root});let r=invoke();assert.equal(r.status,0,String(r.stderr));f.manifest.assets[0].bytes=1;writeFileSync(path.join(f.root,'manifest.json'),JSON.stringify(f.manifest));r=invoke();assert.notEqual(r.status,0);has(loadAssets(f),'schema','bytes mismatch');}finally{rmSync(f.root,{recursive:true,force:true});}});

test('junction escape is rejected before schema reads external bytes',()=>{const f=fixture(),outside=mkdtempSync(path.join(tmpdir(),'e1 outside '));try{writeFileSync(path.join(outside,'escape.png'),png(128));symlinkSync(outside,path.join(f.root,'public/art/link'),'junction');f.manifest.assets[0].path='public/art/link/escape.png';has(loadAssets(f),'path-or-missing');}finally{rmSync(f.root,{recursive:true,force:true});rmSync(outside,{recursive:true,force:true});}});

test('independently parsed metadata ignores object key order but preserves values and array order',()=>{const f=fixture();try{
 const a=f.manifest.assets[0];a.collision={kind:'none',offset:{x:1,y:2}};
 for(const target of [f.reference.assets[a.id],...f.reference.placements]){target.collision=structuredClone(a.collision);target.variants=[];}
 const reverseObjects=value=>Array.isArray(value)?value.map(reverseObjects):value && typeof value==='object'?Object.fromEntries(Object.entries(value).reverse().map(([k,v])=>[k,reverseObjects(v)])):value;
 const manifest=JSON.parse(JSON.stringify(f.manifest));
 const reference=JSON.parse(JSON.stringify(reverseObjects(f.reference)));
 const go=()=>loadAssets({root:f.root,manifest,reference});
 assert.equal(go().status,'ready',JSON.stringify(go()));
 reference.assets[a.id].anchor.x=7;has(go(),'binding-mismatch','anchor');reference.assets[a.id].anchor.x=0;
 reference.placements[0].collision.offset.x=7;has(go(),'placement-mismatch','collision');reference.placements[0].collision.offset.x=1;
 reference.assets[a.id].maps.reverse();has(go(),'binding-mismatch','maps');
 }finally{rmSync(f.root,{recursive:true,force:true});}});
