import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { resolveCell, buildLayer, updateCell } from '../scripts/world-map/dual-grid.mjs';
import { buildSnapshot } from '../scripts/world-map/pipeline.mjs';

// Literal NW NE / SW SE samples and expected atlas index, independent of resolver config.
const cases = [
  ['....',0], ['X...',1], ['.X..',2], ['XX..',3], ['...X',4], ['X..X',5], ['.X.X',6], ['XX.X',7],
  ['..X.',8], ['X.X.',9], ['.XX.',10], ['XXX.',11], ['..XX',12], ['X.XX',13], ['.XXX',14], ['XXXX',15]
];
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('all independent corner patterns resolve to the declared atlas slots', () => {
  for (const [pattern, expected] of cases) {
    const cell = resolveCell([[pattern[0],pattern[1]],[pattern[2],pattern[3]]], 'X', 1, 1);
    assert.equal(cell.mask, expected); assert.equal(cell.atlas, expected);
    assert.deepEqual([cell.x,cell.y], [8,8]);
    if (expected === 5) assert.deepEqual(cell.components, [['NW'],['SE']]);
    if (expected === 10) assert.deepEqual(cell.components, [['NE'],['SW']]);
  }
  assert.deepEqual([resolveCell([['X']], 'X', 0, 0).x, resolveCell([['X']], 'X', 0, 0).y], [-8,-8]);
});

test('dirty replacement updates four cells per material and equals a full rebuild', () => {
  const original = [['a','b','a'],['b','a','b'],['a','b','a']];
  for (let y=0; y<3; y++) for (let x=0; x<3; x++) {
    const world = structuredClone(original);
    const layers = new Map(['a','b'].map(m => [m,buildLayer(world,m)]));
    const replacement = world[y][x] === 'a' ? 'b' : 'a';
    const dirty = updateCell(world,layers,x,y,replacement);
    assert.equal(dirty.length, 8);
    for (const m of ['a','b']) {
      assert.deepEqual(dirty.filter(d => d.material === m).map(({u,v}) => [u,v]), [[x,y],[x+1,y],[x,y+1],[x+1,y+1]]);
      assert.deepEqual(layers.get(m),buildLayer(world,m));
    }
  }
});

test('six source layouts and collision masks retain C1 hashes', () => {
  const expected = JSON.parse(fs.readFileSync(new URL('./fixtures/world-map-dual-grid/c1-hashes.json', import.meta.url)));
  const snapshot = buildSnapshot();
  assert.equal(snapshot.maps.length, 6);
  for (const map of snapshot.maps) {
    assert.deepEqual([map.width,map.height], [20,15]);
    assert.deepEqual([map.masks.macro.width,map.masks.macro.height,map.masks.macro.expansion], [10,8,2]);
    assert.deepEqual({layout:hash(map.layout),walkable:hash(map.masks.detail.walkable),blocked:hash(map.masks.detail.blocked),candidate:hash(map.masks.macro)},expected[map.id]);
  }
});
test('successive seeded material edits preserve full-layer parity', () => {
  const world = Array.from({length: 5}, (_, y) => Array.from({length: 6}, (_, x) => ['a','b','c'][(x+y)%3]));
  const materials = ['a','b','c'];
  const layers = new Map(materials.map(m => [m,buildLayer(world,m)]));
  let seed = 0x12345678;
  const next = () => { seed = (Math.imul(seed,1664525)+1013904223) >>> 0; return seed; };
  for (let i=0; i<100; i++) {
    const x=next()%6, y=next()%5, material=materials[next()%3];
    updateCell(world,layers,x,y,material);
    for (const m of materials) assert.deepEqual(layers.get(m),buildLayer(world,m));
  }
});

test('display crops thin grids and accepts only explicit edge halo', async () => {
  const {buildDisplay} = await import('../scripts/world-map/dual-grid.mjs');
  for (const [w,h] of [[1,1],[1,5],[5,1]]) {
    const grid = Array.from({length:h}, () => Array(w).fill('road'));
    const result = buildDisplay(grid,'road');
    assert.deepEqual([result.width,result.height],[w+1,h+1]);
    assert.deepEqual(result.crop,{x:0,y:0,width:w*16,height:h*16});
    assert.equal(result.cells[0][0].mask,4);
    assert.throws(() => buildDisplay(grid,'road',{halo:{'-2,0':'road'}}),/halo/);
  }
  assert.equal(buildDisplay([['road']],'road',{halo:{'-1,0':'road'}}).cells[0][0].mask,12);
});

test('reciprocal campus ports supply halo from boundary cells in both directions', async () => {
  const {buildDisplay,portHalo,resolveMaterials} = await import('../scripts/world-map/dual-grid.mjs');
  const maps = JSON.parse(fs.readFileSync(new URL('../docs/game-dev/campus-network-v1/maps.json', import.meta.url)));
  const snapshot = buildSnapshot();
  let directed = 0;
  for (const source of maps) for (const name of new Set(source.warps.map(w => w.to_map))) {
    const target = maps.find(m => m.map_name === name);
    const material = tile => ({0:'grass',1:'road',2:'obstacle_macro',3:'water',9:'road'})[tile];
    const a = source.layout.map(row => row.map(material));
    const b = target.layout.map(row => row.map(material));
    const halo = portHalo(source,target,a,b);
    assert.ok(Object.keys(halo).length >= 2);
    const display = buildDisplay(a,'road',{halo});
    assert.deepEqual([display.width,display.height],[21,16]);
    assert.deepEqual(display.crop,{x:0,y:0,width:320,height:240});
    const reverse = portHalo(target,source,b,a);
    for (const warp of source.warps.filter(w => w.to_map === name)) {
      const offsets = {north:[0,-1],south:[0,1],east:[1,0],west:[-1,0]};
      const [dx,dy] = offsets[warp.facing_direction];
      assert.equal(source.layout[warp.from_y][warp.from_x],9);
      assert.equal(source.layout[warp.from_y-dy][warp.from_x-dx],1);
      assert.equal(a[warp.from_y-dy][warp.from_x-dx], 'road');
      const peer = target.warps.find(w => w.to_map === source.map_name && w.to_x === warp.from_x-dx && w.to_y === warp.from_y-dy);
      assert.ok(peer);
      assert.equal(halo[`${warp.from_x+dx},${warp.from_y+dy}`], b[peer.from_y][peer.from_x]);
      assert.equal(reverse[`${peer.from_x-dx},${peer.from_y-dy}`], a[warp.from_y][warp.from_x]);
      const horizontal = dx === 0;
      for (let i=0; i<2; i++) {
        const u = horizontal ? warp.from_x+i : (dx < 0 ? 0 : 20);
        const v = horizontal ? (dy < 0 ? 0 : 15) : warp.from_y+i;
        const pu = horizontal ? peer.from_x+i : (dx < 0 ? 20 : 0);
        const pv = horizontal ? (dy < 0 ? 15 : 0) : peer.from_y+i;
        // Both maps use the same x/y axes. Translate outside samples to the
        // peer edge in that shared frame; do not reflect the reciprocal mask.
        const sample = (x,y) => x >= 0 && x < 20 && y >= 0 && y < 15
          ? a[y][x]
          : b[peer.from_y + y - (warp.from_y+dy)]?.[peer.from_x + x - (warp.from_x+dx)];
        const reference = [[sample(u-1,v-1),sample(u,v-1)],[sample(u-1,v),sample(u,v)]];
        assert.ok(reference.flat().every(value => value !== undefined));
        const materials = resolveMaterials(a,u,v,undefined,halo);
        assert.deepEqual(materials.corners,[reference[0][0],reference[0][1],reference[1][1],reference[1][0]]);
        assert.deepEqual(materials.corners,resolveMaterials(b,pu,pv,undefined,reverse).corners);
        const strip = snapshot.maps.find(m => m.id === source.map_name).dualGridC3.seamStrips.find(s => s.port.x === warp.from_x && s.port.y === warp.from_y && s.toMap === name);
        assert.deepEqual(strip.cells[i],materials);
        const peerStrip = snapshot.maps.find(m => m.id === target.map_name).dualGridC3.seamStrips.find(s => s.port.x === peer.from_x && s.port.y === peer.from_y && s.toMap === source.map_name);
        assert.deepEqual(peerStrip.cells[i].corners,materials.corners);
        for (const layer of ['road','grass','water','obstacle_macro']) {
          const left = buildDisplay(a,layer,{halo}).cells[v][u].mask;
          const right = buildDisplay(b,layer,{halo:reverse}).cells[pv][pu].mask;
          const expected = (reference[0][0] === layer ? 1 : 0) | (reference[0][1] === layer ? 2 : 0) |
            (reference[1][1] === layer ? 4 : 0) | (reference[1][0] === layer ? 8 : 0);
          assert.equal(left,expected);
          assert.equal(right,expected);
        }
        const key = `${warp.from_x+dx},${warp.from_y+dy}`;
        const missing = {...halo}; delete missing[key];
        assert.notEqual(buildDisplay(a,'road',{halo:missing}).cells[v][u].mask, display.cells[v][u].mask);
        assert.notEqual(buildDisplay(a,'road',{halo:{...halo,[key]:'water'}}).cells[v][u].mask, display.cells[v][u].mask);
      }
    }
    directed++;
  }
  assert.equal(directed,20);
});

test('material junction and bridge require declared contracts', async () => {
  const {resolveMaterials,bridgeCell,dualGridConfig} = await import('../scripts/world-map/dual-grid.mjs');
  const result = resolveMaterials([['grass','road'],['water','grass']],1,1);
  assert.deepEqual(result.corners,['grass','road','grass','water']);
  assert.equal(result.junction,'per-corner');
  assert.equal(result.layers.length,3);
  const grid = [['grass','water','water','grass'],['road','road','road','road'],['grass','water','water','grass']];
  const record = {cells:[{x:1,y:1},{x:2,y:1}]};
  assert.equal(bridgeCell(grid,record,1,1).banks[0].material,'road');
  const noBank = structuredClone(grid); noBank[1][0] = 'grass';
  assert.equal(bridgeCell(noBank,record,1,1).status,'pending');
  assert.throws(() => bridgeCell(grid,record,0,0),/record/);
  const edge = resolveMaterials([['grass']],0,0,dualGridConfig,{'-1,0':'water'});
  assert.equal(edge.layers.find(layer => layer.material === 'water').mask,8);
  assert.throws(() => resolveMaterials([['grass']],0,0,dualGridConfig,{'-1,0':'unknown'}),/missing material layer/);
  assert.throws(() => resolveMaterials([['unknown']],0,0),/missing material layer/);
  const missing = structuredClone(dualGridConfig); missing.materials.pairs = [];
  assert.throws(() => resolveMaterials([['grass','water']],1,0,missing),/missing material pair/);
});

test('garden bridges resolve complete rectangular decks, banks and outer rails', async () => {
  const {bridgeCell,dualGridConfig} = await import('../scripts/world-map/dual-grid.mjs');
  const map = JSON.parse(fs.readFileSync(new URL('../docs/game-dev/campus-network-v1/maps.json', import.meta.url))).find(m => m.map_name === 'garden');
  const material = tile => ({0:'grass',1:'road',2:'obstacle_macro',3:'water',9:'road'})[tile];
  const grid = map.layout.map(row => row.map(material));
  const garden = buildSnapshot().maps.find(m => m.id === 'garden');
  const bridges = garden.bridges;
  assert.equal(bridges.length,2);
  assert.deepEqual(bridges.map(b => b.cells.map(c => [c.x,c.y])), [[[5,3],[6,3],[5,4],[6,4]],[[5,7],[6,7],[5,8],[6,8]]]);
  for (const record of bridges) {
    const minY = record.cells[0].y;
    for (const {x,y} of record.cells) {
      const cell = bridgeCell(grid,record,x,y);
      assert.equal(cell.status,'logical'); assert.equal(cell.axis,'horizontal');
      assert.equal(cell.underlay,'water'); assert.equal(cell.overlay,'bridge');
      assert.deepEqual(cell.rails,[y === minY ? 'north' : 'south']);
      assert.deepEqual(cell.banks,[{x:x === 5 ? 4 : 7,y,material:'road'}]);
    }
    const incomplete = {...record,cells:record.cells.slice(0,3)};
    assert.equal(bridgeCell(grid,incomplete,5,minY).status,'pending');
    const missingRow = {...record,cells:record.cells.slice(0,2)};
    assert.equal(bridgeCell(grid,missingRow,5,minY).status,'pending');
    const missingDeck = structuredClone(grid); missingDeck[minY][6] = 'water';
    assert.equal(bridgeCell(missingDeck,record,5,minY).status,'pending');
    const missingBank = structuredClone(grid); missingBank[minY][4] = 'grass';
    assert.equal(bridgeCell(missingBank,record,5,minY).status,'pending');
    const missingWater = structuredClone(grid); missingWater[minY-1][5] = 'grass';
    assert.equal(bridgeCell(missingWater,record,5,minY).status,'pending');
    const missingLayer = structuredClone(dualGridConfig); missingLayer.materials.layers = missingLayer.materials.layers.filter(m => m !== 'water');
    assert.throws(() => bridgeCell(grid,record,5,minY,missingLayer),/missing bridge material contract/);
  }
  assert.ok(garden.dualGridC3.bridges.every(bridge => bridge.cells.every(cell => cell.status === 'logical' && cell.axis === 'horizontal')));
  const verticalWorld = [['grass','road','road','grass'],['water','road','road','water'],['water','road','road','water'],['grass','road','road','grass']];
  const vertical = {cells:[{x:1,y:1},{x:2,y:1},{x:1,y:2},{x:2,y:2}]};
  assert.deepEqual(bridgeCell(verticalWorld,vertical,1,1).rails,['west']);
  assert.equal(bridgeCell(verticalWorld,vertical,2,2).axis,'vertical');
});

test('snapshot rejects missing interior material contracts', async () => {
  const {dualGridConfig} = await import('../scripts/world-map/dual-grid.mjs');
  const noWater = structuredClone(dualGridConfig);
  noWater.materials.layers = noWater.materials.layers.filter(layer => layer !== 'water');
  noWater.materials.bridge.underlay = 'grass'; // Exercise actual water cells, not only the bridge declaration.
  assert.throws(() => buildSnapshot({materialConfig:noWater}), /missing material layer: water/);
  for (const pair of [['grass','water'], ['road','water']]) {
    const config = structuredClone(dualGridConfig);
    config.materials.pairs = config.materials.pairs.filter(item => !pair.every(material => item.includes(material)));
    assert.throws(() => buildSnapshot({materialConfig:config}), /missing material pair/);
  }
  const noUnderlay = structuredClone(dualGridConfig);
  noUnderlay.materials.underlay = 'undeclared';
  assert.throws(() => buildSnapshot({materialConfig:noUnderlay}), /missing material layer: undeclared/);
});
