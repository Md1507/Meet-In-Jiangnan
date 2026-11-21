import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSnapshot, REPO_ROOT } from './pipeline.mjs';
import { buildDisplay, resolveMaterials, selectVariant, dualGridConfig } from './dual-grid.mjs';
import { fixtureAtlas, renderDisplay, hash, readChecked } from './dual-grid-debug-render.mjs';

const json = x => Buffer.from(JSON.stringify(x,null,2)+'\n');
const inputs=['docs/game-dev/campus-network-v1/maps.json','docs/game-dev/campus-network-v1/ascii-maps.md','scripts/world-map/config.json','scripts/world-map/pipeline.mjs','scripts/world-map/dual-grid-config.json','scripts/world-map/dual-grid.mjs','scripts/world-map/dual-grid-build.mjs','scripts/world-map/dual-grid-debug-render.mjs'];

function displayFor(map,snapshot) {
    const world=map.layout.flatMap(row=>[row.flatMap(t=>[({0:'grass',1:'road',2:'obstacle_macro',3:'water',9:'road'})[t],({0:'grass',1:'road',2:'obstacle_macro',3:'water',9:'road'})[t]]),row.flatMap(t=>[({0:'grass',1:'road',2:'obstacle_macro',3:'water',9:'road'})[t],({0:'grass',1:'road',2:'obstacle_macro',3:'water',9:'road'})[t]])]);
    const halo={}; for(const [key,value] of Object.entries(map.dualGridC3.halo)){const [x,y]=key.split(',').map(Number); if(x===-1||x===20){halo[`${x===-1?-1:40},${y*2}`]=value;halo[`${x===-1?-1:40},${y*2+1}`]=value;} else {halo[`${x*2},${y===-1?-1:30}`]=value;halo[`${x*2+1},${y===-1?-1:30}`]=value;}}
    const layers={}; for(const material of dualGridConfig.materials.layers) { const grid=buildDisplay(world,material,{halo}); layers[material]=grid.cells.map(row=>row.map(c=>({...c,variant:selectVariant({seed:'C5-debug-v1',map:map.id,layer:material,x:c.u,y:c.v,mask:c.mask,variantSet:'fixture'})}))); }
    for(let v=0;v<=30;v++) for(let u=0;u<=40;u++) resolveMaterials(world,u,v,dualGridConfig,halo);
    return {schemaVersion:1,label:'DEBUG diagnostic fixture; not production or clearance',map:map.id,source:{width:20,height:15,layout:map.layout,maskSha256:hash(json(map.masks)),landmarks:map.landmarks},projection:{detail:[40,30],display:[41,31],tilePx:16,crop:[0,0,640,480],origin:'16u-8,16v-8',candidateWorldUnitsPerMacro:48},underlay:dualGridConfig.materials.underlay,layers,blocked:map.masks.detail.blocked,ports:map.warps.map(w=>({x:w.from_x,y:w.from_y,to:w.to_map})),arrivals:snapshot.graph.warps.filter(w=>w.toMap===map.id).map(w=>w.to),bridges:map.bridges.flatMap(b=>b.cells),bridgeContracts:map.dualGridC3.bridges,halo};
}
export function verifyExport(output) {
  const index=JSON.parse(fs.readFileSync(path.join(output,'index.json'),'utf8'));
  if(index.schemaVersion!==1 || !Array.isArray(index.maps) || index.maps.length!==6) throw Error('invalid debug index');
  for(const input of inputs) readChecked(path.join(REPO_ROOT,input),index.inputs?.[input]);
  const snapshot=buildSnapshot(), expectedIds=['dorm','gate','library','canteen','street','garden'];
  const ids=index.maps.map(e=>e.map), paths=index.maps.flatMap(e=>[e.display?.path,e.png?.path]);
  if(new Set(ids).size!==6 || expectedIds.some(id=>!ids.includes(id)) || snapshot.maps.length!==6 || expectedIds.some(id=>!snapshot.maps.some(m=>m.id===id))) throw Error('invalid map set');
  if(paths.some(p=>typeof p!=='string') || new Set(paths).size!==12 || index.maps.some(e=>e.display.path!==e.map+'.display.json' || e.png.path!==e.map+'.debug.png')) throw Error('invalid or duplicate map path');
  const settings={tilePx:16,zoom:1,seed:'C5-debug-v1',variantHash:dualGridConfig.variants.hashVersion,node:process.versions.node,zlib:process.versions.zlib};
  if(JSON.stringify(index.settings)!==JSON.stringify(settings) || JSON.stringify(index.counts)!==JSON.stringify(snapshot.counts)) throw Error('settings or counts mismatch');
  const atlas=readChecked(path.join(output,index.atlas.path),index.atlas.sha256);
  const mapping=JSON.parse(readChecked(path.join(output,index.atlas.mapping.path),index.atlas.mapping.sha256));
  for(const entry of index.maps) {
    const display=JSON.parse(readChecked(path.join(output,entry.display.path),entry.display.sha256));
    if(JSON.stringify(display)!==JSON.stringify(displayFor(snapshot.maps.find(m=>m.id===entry.map),snapshot))) throw Error(`display source or projection mismatch: ${entry.map}`);
    const png=readChecked(path.join(output,entry.png.path),entry.png.sha256);
    if(hash(renderDisplay(display,atlas,mapping,index.settings.zoom))!==hash(png)) throw Error(`render mismatch: ${entry.map}`);
  }
  return index;
}
export function buildDebug(output=path.join(REPO_ROOT,'docs/game-dev/world-map-pipeline/dual-grid')) {
  fs.mkdirSync(output,{recursive:true}); const snapshot=buildSnapshot(), atlas=fixtureAtlas();
  const write=(name,bytes)=>{fs.writeFileSync(path.join(output,name),bytes);return hash(bytes);};
  const inputHashes=Object.fromEntries(inputs.map(p=>[p,hash(fs.readFileSync(path.join(REPO_ROOT,p)))]));
  const atlasHash=write('fixture-atlas.debug.png',atlas.png), mappingHash=write('fixture-atlas.mapping.json',json(atlas.mapping));
  const verifiedAtlas=readChecked(path.join(output,'fixture-atlas.debug.png'),atlasHash), mapping=JSON.parse(readChecked(path.join(output,'fixture-atlas.mapping.json'),mappingHash));
  const results=[];
  for(const map of snapshot.maps) {
    const display=displayFor(map,snapshot);
    const name=`${map.id}.display.json`, displayHash=write(name,json(display)); const readDisplay=JSON.parse(readChecked(path.join(output,name),displayHash));
    const pngName=`${map.id}.debug.png`, pngHash=write(pngName,renderDisplay(readDisplay,verifiedAtlas,mapping)); results.push({map:map.id,display:{path:name,sha256:displayHash},png:{path:pngName,sha256:pngHash}});
  }
  const index={schemaVersion:1,kind:'DEBUG diagnostic fixture; not production or clearance',serialization:'JSON two-space LF; PNG RGBA8 filter 0 zlib',settings:{tilePx:16,zoom:1,seed:'C5-debug-v1',variantHash:dualGridConfig.variants.hashVersion,node:process.versions.node,zlib:process.versions.zlib},inputs:inputHashes,counts:snapshot.counts,atlas:{path:'fixture-atlas.debug.png',sha256:atlasHash,mapping:{path:'fixture-atlas.mapping.json',sha256:mappingHash}},maps:results};
  write('index.json',json(index)); return index;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) { try { const i=buildDebug(); console.log(`wrote ${i.maps.length} debug maps`); } catch(e){console.error(e.stack); process.exitCode=1;} }



