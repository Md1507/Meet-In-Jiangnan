import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { MAPS, validateManifest, c6Gate } from '../scripts/world-map/asset-schema.mjs';

const manifest = JSON.parse(readFileSync('docs/game-dev/world-map-pipeline/contracts/asset-requirements.json'));
const digest = b => createHash('sha256').update(b).digest('hex');
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]); let crc = 0xffffffff;
  for (const byte of body) { crc ^= byte; for (let i=0;i<8;i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
  const length = Buffer.alloc(4), checksum = Buffer.alloc(4); length.writeUInt32BE(data.length); checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, body, checksum]);
}
function pngFixture(colorType = 6, extra = []) {
  const header=Buffer.alloc(13); header.writeUInt32BE(1,0); header.writeUInt32BE(1,4); header[8]=8; header[9]=colorType;
  const pixels = colorType === 3 ? [0,1] : [0,255,0,0,255];
  return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),...extra,chunk('IDAT',deflateSync(Buffer.from(pixels))),chunk('IEND',Buffer.alloc(0))]);
}
test('six-map requirements are pending and traceable', () => {
  const result = validateManifest(manifest);
  assert.deepEqual(result.errors, []); assert.equal(result.ready, false); assert.ok(result.pending.length);
  for (const map of MAPS) for (const category of ['terrain', 'architecture', 'vegetation', 'props'])
    assert.ok(manifest.assets.some(a => a.maps.includes(map) && a.category === category), `${map} ${category}`);
  assert.ok(manifest.assets.every(a => a.path === null && a.bytes === null && a.sha256 === null));
  const sources = [['shared_asset_manifest.json','c11c66be849e1843997b57e325acf3862041f2bfe46271ff9a1f1b965fb3b359','asset_id'],['street-asset-manifest.json','b6dde97fb14c09ab977aa9ff0f5e82db2dd43ead9dbc279f4588beb71b612bad','id']];
  const sourceIds = [];
  for (const [file,hash,key] of sources) {
    const bytes=readFileSync(`docs/game-dev/world-map-pipeline/contracts/C7inputs/${file}`); assert.equal(digest(bytes),hash);
    for (const asset of JSON.parse(bytes).assets) {
      sourceIds.push(asset[key]); const found=manifest.assets.find(a=>a.id===asset[key]);
      assert.ok(found,asset[key]); assert.deepEqual(found.maps,manifest.sourceWhereUsed[asset[key]]);
    }
  }
  assert.equal(sourceIds.length,22); assert.equal(new Set(sourceIds).size,22);
  const maps = JSON.parse(readFileSync('docs/game-dev/campus-network-v1/maps.json'));
  for (const name of ['maps.json', 'ascii-maps.md']) assert.equal(digest(readFileSync(`docs/game-dev/campus-network-v1/${name}`)),manifest.sourceInputs[name]);
  for (const m of maps) {
    const pairs = new Set();
    m.layout.forEach((row,y) => row.forEach((v,x) => { for (const [nx,ny] of [[x+1,y],[x,y+1]]) {
      const n=m.layout[ny]?.[nx]; if (n !== undefined && n !== v && n !== 9 && v !== 9) pairs.add([n,v].sort((a,b)=>a-b).join('-'));
    }}));
    assert.deepEqual(manifest.terrainPairs[m.map_name], [...pairs].sort());
  }
});

test('production rejects missing data, duplicates, invalid PNG and stale C6', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'c7-'));
  try {
    mkdirSync(path.join(dir,'public/art'), {recursive:true});
    const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==', 'base64');
    writeFileSync(path.join(dir,'public/art/a.png'),png);
    const sourceInputs = { 'maps.json': 'a'.repeat(64), 'ascii-maps.md': 'b'.repeat(64) };
    const contract=Buffer.from(JSON.stringify({sourceInputs, ...Object.fromEntries(['scale','layout','camera','clearance'].map(k=>[k,{status:'approved',evidence:'review record',sourceInputs}]))}));
    writeFileSync(path.join(dir,'c6.json'),contract);
    const c6={path:'c6.json',sha256:digest(contract),expectedSha256:digest(contract)};
    const asset={id:'asset-a',path:'public/art/a.png',sha256:digest(png),status:'production',category:'props',maps:['street'],nativeDimensions:{width:1,height:1},gridFootprint:{width:1,height:1},anchor:{x:0,y:1},collision:{kind:'none'},layer:'ground',renderOrder:0,interaction:{kind:'none'},variants:[],source:'source record',license:'license record',bytes:png.length,placement:'street',sourceStatus:'available',runtimeStatus:'pending',previewStatus:'pending'};
    assert.equal(validateManifest({assets:[asset],c6,sourceInputs},{root:dir,production:true}).ready,true);
    for (const id of manifest.sourceInventory.map(a=>a.id)) assert.equal(validateManifest({assets:[{...asset,id}],c6,sourceInputs},{root:dir,production:true}).ready,true,id);
    for (const location of ['top','scale','layout','camera','clearance']) for (const invalid of [[],true,'bad',null,{}, {'maps.json':[],'ascii-maps.md':sourceInputs['ascii-maps.md']}]) {
      const copy=JSON.parse(contract.toString()); if (location==='top') copy.sourceInputs=invalid; else copy[location].sourceInputs=invalid;
      const bytes=Buffer.from(JSON.stringify(copy)); writeFileSync(path.join(dir,'c6-invalid.json'),bytes);
      assert.equal(c6Gate({path:'c6-invalid.json',sha256:digest(bytes),expectedSha256:digest(bytes)},dir,sourceInputs),'pending',`${location}: ${JSON.stringify(invalid)}`);
    }
    for (const key of ['path','sha256','nativeDimensions','gridFootprint','anchor','collision','layer','renderOrder','interaction','variants','source','license','bytes','placement']) {
      const copy={...asset,[key]:null};
      const result=validateManifest({assets:[copy],c6,sourceInputs},{root:dir,production:true});
      assert.equal(result.gate,'approved',key);
      assert.ok(result.errors.includes(`assets[0].${key}: invalid or missing`),`${key}: ${result.errors}`);
      assert.equal(result.ready,false,key);
    }
    const duplicates=validateManifest({assets:[asset,{...asset}],c6,sourceInputs},{root:dir,production:true});
    assert.equal(duplicates.gate,'approved'); assert.equal(duplicates.ready,false);
    for (const key of ['id','path','sha256']) assert.ok(duplicates.errors.includes(`assets[1].${key}: duplicate`));
    for (const [change,error] of [[{path:'public/art/a.svg'},'assets[0].path: invalid or missing'],[{bytes:1},'assets[0]: bytes mismatch'],[{sha256:'a'.repeat(64)},'assets[0]: hash mismatch'],[{nativeDimensions:{width:2,height:1}},'assets[0]: dimensions mismatch'],[{layer:[]},'assets[0].layer: invalid or missing'],[{anchor:{}},'assets[0].anchor: invalid or missing'],[{gridFootprint:{width:0,height:1}},'assets[0].gridFootprint: invalid or missing']]) {
      const result=validateManifest({assets:[{...asset,...change}],c6,sourceInputs},{root:dir,production:true});
      assert.equal(result.gate,'approved'); assert.equal(result.ready,false); assert.ok(result.errors.includes(error),`${error}: ${result.errors}`);
    }
    assert.equal(c6Gate(null,dir),'pending'); assert.equal(c6Gate({...c6,expectedSha256:'a'.repeat(64)},dir),'stale');
    assert.equal(validateManifest({assets:[asset]}, {root:dir,production:true}).ready,false);
    assert.equal(validateManifest({assets:[asset],c6,sourceInputs:{...sourceInputs,'maps.json':'c'.repeat(64)}}, {root:dir,production:true}).gate,'stale');
    const nestedMismatch = {...c6};
    const nestedContract = JSON.parse(contract.toString());
    nestedContract.camera.sourceInputs = {...sourceInputs, 'ascii-maps.md':'d'.repeat(64)};
    const nestedBytes = Buffer.from(JSON.stringify(nestedContract));
    writeFileSync(path.join(dir,'c6-nested.json'), nestedBytes);
    nestedMismatch.path = 'c6-nested.json'; nestedMismatch.sha256 = digest(nestedBytes); nestedMismatch.expectedSha256 = nestedMismatch.sha256;
    assert.equal(validateManifest({assets:[asset],c6:nestedMismatch,sourceInputs}, {root:dir,production:true}).gate,'stale');
    writeFileSync(path.join(dir,'c6.json'),'{}'); assert.equal(c6Gate(c6,dir),'stale');
    writeFileSync(path.join(dir,'c6.json'),contract);
    const truncated = png.subarray(0, 24);
    writeFileSync(path.join(dir,'public/art/a.png'), truncated);
    const broken = {...asset, bytes: truncated.length, sha256: digest(truncated)};
    const brokenResult = validateManifest({assets:[broken],c6,sourceInputs}, {root:dir,production:true});
    assert.ok(brokenResult.errors.some(error => error.includes('invalid PNG')));
    assert.equal(brokenResult.ready,false);
    for (const malformed of [pngFixture(6,[chunk('ABCD',Buffer.alloc(0))]),pngFixture(3,[chunk('PLTE',Buffer.from([0,0,0]))])]) {
      writeFileSync(path.join(dir,'public/art/a.png'),malformed);
      const result=validateManifest({assets:[{...asset,bytes:malformed.length,sha256:digest(malformed)}],c6,sourceInputs},{root:dir,production:true});
      assert.ok(result.errors.some(e=>e.includes('invalid PNG'))); assert.equal(result.ready,false);
    }
    const valid=pngFixture(); writeFileSync(path.join(dir,'public/art/a.png'),valid);
    assert.equal(validateManifest({assets:[{...asset,bytes:valid.length,sha256:digest(valid)}],c6,sourceInputs},{root:dir,production:true}).ready,true);
    for (const type of ['IDAT','IEND']) {
      // Keep the original CRC: ASCII decoding used to mask this high bit and accept it.
      const malformed=Buffer.from(valid); const index=malformed.indexOf(Buffer.from(type));
      assert.ok(index > 0); malformed[index] |= 0x80;
      writeFileSync(path.join(dir,'public/art/a.png'),malformed);
      const result=validateManifest({assets:[{...asset,bytes:malformed.length,sha256:digest(malformed)}],c6,sourceInputs},{root:dir,production:true});
      assert.equal(result.gate,'approved'); assert.ok(result.errors.includes('assets[0]: invalid PNG'),type); assert.equal(result.ready,false,type);
    }
  } finally { rmSync(dir,{recursive:true,force:true}); }
});
