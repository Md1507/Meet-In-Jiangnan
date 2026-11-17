import fs from 'node:fs';

export const dualGridConfig = JSON.parse(fs.readFileSync(new URL('./dual-grid-config.json', import.meta.url), 'utf8'));

// Display (u,v) samples NW/NE/SE/SW at (u-1,v-1), (u,v-1), (u,v), (u-1,v).
export function resolveCell(world, material, u, v, config = dualGridConfig, halo = {}) {
  const sampleValue = worldSampler(world, halo);
  const sample = (x, y) => sampleValue(x, y) === material;
  const bits = config.cornerBits;
  const mask = (sample(u - 1, v - 1) ? bits.NW : 0) | (sample(u, v - 1) ? bits.NE : 0) |
    (sample(u, v) ? bits.SE : 0) | (sample(u - 1, v) ? bits.SW : 0);
  const atlas = config.atlas[mask];
  if (!atlas || atlas.mask !== mask) throw new Error(`missing atlas mapping for mask ${mask}`);
  return { u, v, x: u * config.tileSizePx - config.tileSizePx / 2, y: v * config.tileSizePx - config.tileSizePx / 2, mask, atlas: atlas.tile, components: atlas.components };
}

export function buildLayer(world, material, config = dualGridConfig) {
  const width = world[0].length;
  if (!width || world.some(row => row.length !== width)) throw new Error('world must be a nonempty rectangular grid');
  return Array.from({ length: world.length + 1 }, (_, v) => Array.from({ length: width + 1 }, (_, u) => resolveCell(world, material, u, v, config)));
}

// Mutates the supplied world and layers. Layers for both materials must already exist.
export function updateCell(world, layers, x, y, material, config = dualGridConfig) {
  if (!Number.isInteger(x) || !Number.isInteger(y) || y < 0 || y >= world.length || x < 0 || x >= world[0].length) throw new RangeError('world cell outside grid');
  const old = world[y][x];
  const materials = [...new Set([old, material])];
  for (const value of materials) if (!layers.has(value)) throw new Error(`missing material layer: ${value}`);
  world[y][x] = material;
  const dirty = [];
  for (const value of materials) for (const [u, v] of [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]]) {
    layers.get(value)[v][u] = resolveCell(world, value, u, v, config);
    dirty.push({ material: value, u, v });
  }
  return dirty;
}

// Halo keys are coordinates immediately outside the source grid; missing samples are empty.
export function worldSampler(world, halo = {}) {
  if (!Array.isArray(world) || !world.length || !Array.isArray(world[0]) || !world[0].length || world.some(row => !Array.isArray(row) || row.length !== world[0].length)) throw new Error('world must be a nonempty rectangular grid');
  const width = world[0].length, height = world.length;
  for (const key of Object.keys(halo)) {
    const match = /^(-?\d+),(-?\d+)$/.exec(key);
    if (!match) throw new Error(`invalid halo coordinate: ${key}`);
    const x = Number(match[1]), y = Number(match[2]);
    if (!((x === -1 || x === width) && y >= 0 && y < height || (y === -1 || y === height) && x >= 0 && x < width)) throw new Error(`halo outside edge: ${key}`);
    if (halo[key] == null) throw new Error(`missing halo material: ${key}`);
  }
  return (x,y) => x >= 0 && x < width && y >= 0 && y < height ? world[y][x] : halo[`${x},${y}`];
}

export function buildDisplay(world, material, { halo = {}, config = dualGridConfig } = {}) {
  worldSampler(world, halo);
  const width = world[0].length, height = world.length, size = config.tileSizePx;
  if (!Number.isFinite(size) || size <= 0) throw new Error('missing tile size');
  const cells = Array.from({length:height+1}, (_,v) => Array.from({length:width+1}, (_,u) => resolveCell(world,material,u,v,config,halo)));
  return {width:width+1,height:height+1,crop:{x:0,y:0,width:width*size,height:height*size},cells};
}

// Port coordinates come from reciprocal source warps, never the interior arrival.
export function portHalo(source, target, sourceMaterials, targetMaterials) {
  const opposite = {north:'south',south:'north',east:'west',west:'east'};
  const offsets = {north:[0,-1],south:[0,1],east:[1,0],west:[-1,0]};
  const halo = {};
  for (const warp of source.warps.filter(w => w.to_map === target.map_name)) {
    const [dx,dy] = offsets[warp.facing_direction] || [];
    if (dx === undefined) throw new Error('invalid port direction');
    const matches = target.warps.filter(w => w.to_map === source.map_name && w.facing_direction === opposite[warp.facing_direction] && w.to_x === warp.from_x-dx && w.to_y === warp.from_y-dy && w.from_x+dx === warp.to_x && w.from_y+dy === warp.to_y);
    if (matches.length !== 1) throw new Error('missing or ambiguous reciprocal port');
    const peer = matches[0];
    const sourceValue = sourceMaterials[warp.from_y]?.[warp.from_x];
    const value = targetMaterials[peer.from_y]?.[peer.from_x];
    if (sourceValue === undefined || value === undefined) throw new Error('missing port material');
    // Include adjacent edge samples needed by both display cells bordering a port.
    for (const delta of [-1,0,1]) {
      const sx = warp.from_x + (dy ? delta : 0), sy = warp.from_y + (dx ? delta : 0);
      const tx = peer.from_x + (dy ? delta : 0), ty = peer.from_y + (dx ? delta : 0);
      if (sourceMaterials[sy]?.[sx] === undefined || targetMaterials[ty]?.[tx] === undefined) continue;
      const key = `${sx+dx},${sy+dy}`, sample = targetMaterials[ty][tx];
      if (Object.hasOwn(halo,key) && halo[key] !== sample) throw new Error('conflicting port halo');
      halo[key] = sample;
    }
  }
  if (!Object.keys(halo).length) throw new Error('missing port');
  return halo;
}

// Each visible corner has an explicit material; no implicit default can hide a gap.
export function resolveMaterials(world, u, v, config = dualGridConfig, halo = {}) {
  const contract = config.materials;
  if (!contract?.underlay || !Array.isArray(contract.layers) || !Array.isArray(contract.pairs) || contract.junction !== 'per-corner' || !contract.bridge?.underlay || !contract.bridge?.overlay || !contract.bridge?.bank) throw new Error('missing material contract');
  for (const material of [contract.underlay, contract.bridge.underlay, contract.bridge.bank]) {
    if (!contract.layers.includes(material)) throw new Error(`missing material layer: ${material}`);
  }
  const sample = worldSampler(world, halo);
  const corners = [[u-1,v-1],[u,v-1],[u,v],[u-1,v]].map(([x,y]) => sample(x,y) ?? null);
  const present = [...new Set(corners.filter(value => value !== null))];
  for (const material of present) if (!contract.layers.includes(material)) throw new Error(`missing material layer: ${material}`);
  const terrain = present.filter(value => value !== 'obstacle_macro');
  for (let i=0; i<terrain.length; i++) for (let j=i+1; j<terrain.length; j++) {
    if (!contract.pairs.some(pair => pair.includes(terrain[i]) && pair.includes(terrain[j]))) throw new Error(`missing material pair: ${terrain[i]}/${terrain[j]}`);
  }
  return {corners, layers:present.map(material => ({material, ...resolveCell(world,material,u,v,config,halo)})), junction:terrain.length >= 3 ? 'per-corner' : null, assets:contract.assets};
}

export function bridgeCell(world, record, x, y, config = dualGridConfig) {
  const contract = config.materials;
  const bridge = contract?.bridge;
  if (!bridge?.underlay || !bridge?.overlay || !bridge?.bank || !contract.layers?.includes(bridge.underlay) || !contract.layers.includes(bridge.bank)) throw new Error('missing bridge material contract');
  worldSampler(world);
  if (!Array.isArray(record?.cells) || !record.cells.some(cell => cell.x === x && cell.y === y)) throw new Error('missing bridge record');
  const cells = record.cells;
  const pending = reason => ({status:'pending', reason, x, y});
  if (cells.some(cell => !Number.isInteger(cell.x) || !Number.isInteger(cell.y) || world[cell.y]?.[cell.x] !== bridge.bank)) return pending('bridge deck missing or not a road tile');
  const keys = new Set(cells.map(cell => `${cell.x},${cell.y}`));
  const minX = Math.min(...cells.map(cell => cell.x)), maxX = Math.max(...cells.map(cell => cell.x));
  const minY = Math.min(...cells.map(cell => cell.y)), maxY = Math.max(...cells.map(cell => cell.y));
  if (keys.size !== cells.length || keys.size !== (maxX-minX+1)*(maxY-minY+1)) return pending('bridge deck is not a complete rectangle');
  const candidates = ['horizontal','vertical'].filter(axis => {
    if (axis === 'horizontal') {
      return Array.from({length:maxY-minY+1}, (_,i) => minY+i).every(row => world[row]?.[minX-1] === bridge.bank && world[row]?.[maxX+1] === bridge.bank) &&
        Array.from({length:maxX-minX+1}, (_,i) => minX+i).every(col => world[minY-1]?.[col] === bridge.underlay && world[maxY+1]?.[col] === bridge.underlay);
    }
    return Array.from({length:maxX-minX+1}, (_,i) => minX+i).every(col => world[minY-1]?.[col] === bridge.bank && world[maxY+1]?.[col] === bridge.bank) &&
      Array.from({length:maxY-minY+1}, (_,i) => minY+i).every(row => world[row]?.[minX-1] === bridge.underlay && world[row]?.[maxX+1] === bridge.underlay);
  });
  if (candidates.length !== 1) return pending('bridge banks or water context missing/ambiguous');
  const horizontal = candidates[0] === 'horizontal';
  const banks = [];
  if (horizontal && x === minX) banks.push({x:x-1,y,material:bridge.bank});
  if (horizontal && x === maxX) banks.push({x:x+1,y,material:bridge.bank});
  if (!horizontal && y === minY) banks.push({x,y:y-1,material:bridge.bank});
  if (!horizontal && y === maxY) banks.push({x,y:y+1,material:bridge.bank});
  const rails = horizontal ? [...(y === minY ? ['north'] : []), ...(y === maxY ? ['south'] : [])] : [...(x === minX ? ['west'] : []), ...(x === maxX ? ['east'] : [])];
  return {status:'logical', x, y, underlay:bridge.underlay, overlay:bridge.overlay, axis:candidates[0], rails, banks, assets:contract.assets};
}
