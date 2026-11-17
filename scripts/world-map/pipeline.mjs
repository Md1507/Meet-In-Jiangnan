import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildLayer, buildDisplay, resolveMaterials, portHalo, bridgeCell, dualGridConfig } from './dual-grid.mjs';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPT_DIR = path.dirname(SCRIPT_PATH);
export const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
export const DEFAULT_PATHS = Object.freeze({
  maps: 'docs/game-dev/campus-network-v1/maps.json',
  ascii: 'docs/game-dev/campus-network-v1/ascii-maps.md',
  config: 'scripts/world-map/config.json',
  snapshot: 'docs/game-dev/world-map-pipeline/snapshot.json'
});

const ASCII_SYMBOLS = new Set(['.', ':', '#', '~', 'N', 'E', 'S', 'W', '=']);
const TILE_FOR_SYMBOL = Object.freeze({ '.': 0, ':': 1, '=': 1, '#': 2, '~': 3, N: 9, E: 9, S: 9, W: 9 });
const DIRECTIONS = new Set(['north', 'south', 'east', 'west']);
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const readUtf8 = (root, relativePath) => fs.readFileSync(path.resolve(root, relativePath), 'utf8');
const hashFile = (root, relativePath) => sha256(readUtf8(root, relativePath));

function fail(message) {
  throw new Error(`world-map: ${message}`);
}

export function parseAsciiSections(markdown, width, height) {
  const sections = new Map();
  const heading = /^##\s+.+?\(`([^`]+)`\)\s*$/gm;
  let match;
  while ((match = heading.exec(markdown))) {
    const nextHeading = /^##\s+/gm;
    nextHeading.lastIndex = heading.lastIndex;
    const next = nextHeading.exec(markdown);
    const chunk = markdown.slice(heading.lastIndex, next ? next.index : markdown.length);
    const fenced = chunk.match(/```text\s*\r?\n([\s\S]*?)\r?\n```/);
    if (!fenced) fail(`missing ASCII grid for ${match[1]}`);
    const rows = fenced[1].split(/\r?\n/)
      .filter(line => /^\s*\d{2}\s+/.test(line))
      .map(line => line.replace(/^\s*\d{2}\s+/, ''));
    if (rows.length !== height || rows.some(row => row.length !== width)) {
      fail(`ASCII ${match[1]} must be ${width}x${height}`);
    }
    sections.set(match[1], rows);
    heading.lastIndex = next ? next.index : markdown.length;
  }
  return sections;
}

function annotationFromAscii(rows, mapName) {
  const annotations = [];
  const knownSymbols = new Set([...ASCII_SYMBOLS, ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz']);
  for (let y = 0; y < rows.length; y += 1) {
    for (let x = 0; x < rows[y].length; x += 1) {
      const symbol = rows[y][x];
      if (!knownSymbols.has(symbol)) fail(`unknown ASCII symbol ${JSON.stringify(symbol)} in ${mapName}`);
      if (/^[A-Zs]$/.test(symbol) && !'NESW'.includes(symbol)) {
        annotations.push({ id: symbol, x, y, kind: symbol === 's' ? 'sign' : 'landmark', asset: null, status: 'pending' });
      }
    }
  }
  return annotations;
}

export function gridFromAscii(rows, mapName) {
  return rows.map((row, y) => [...row].map((symbol, x) => {
    if (Object.hasOwn(TILE_FOR_SYMBOL, symbol)) return TILE_FOR_SYMBOL[symbol];
    if (/^[A-Zs]$/.test(symbol)) return 2;
    fail(`unknown ASCII symbol ${JSON.stringify(symbol)} at ${mapName}(${x},${y})`);
  }));
}

function bridgeRecords(rows, mapName, layout) {
  const cells = new Set();
  for (let y = 0; y < rows.length; y += 1) {
    for (let x = 0; x < rows[y].length; x += 1) {
      if (rows[y][x] === '=') {
        if (layout[y][x] !== 1) fail(`bridge ${mapName}(${x},${y}) is not road tile 1`);
        cells.add(`${x},${y}`);
      }
    }
  }
  const bridges = [];
  while (cells.size) {
    const start = cells.values().next().value;
    const queue = [start];
    cells.delete(start);
    const bridgeCells = [];
    while (queue.length) {
      const current = queue.shift();
      const [x, y] = current.split(',').map(Number);
      bridgeCells.push({ x, y });
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        const key = `${nx},${ny}`;
        if (cells.delete(key)) queue.push(key);
      }
    }
    bridgeCells.sort((a, b) => a.y - b.y || a.x - b.x);
    bridges.push({ id: `${mapName}-bridge-${bridges.length + 1}`, material: 'bridge', cells: bridgeCells, asset: null, status: 'pending' });
  }
  return bridges;
}

function validateLayout(layout, mapName, config) {
  const { width, height } = config.grid;
  if (!Array.isArray(layout) || layout.length !== height || layout.some(row => !Array.isArray(row) || row.length !== width)) {
    fail(`${mapName} layout must be ${width}x${height}`);
  }
  const allowed = new Set([...config.walkableTileIds, ...config.blockedTileIds]);
  for (const row of layout) for (const tile of row) if (!allowed.has(tile)) fail(`${mapName} has unknown tile ${tile}`);
}

export function validateWarps(maps, config, rowsByMap) {
  const names = new Set(maps.map(map => map.map_name));
  const warps = [];
  for (const map of maps) {
    for (const warp of map.warps) {
      const { from_x: x, from_y: y, to_map: toMap, to_x: toX, to_y: toY, facing_direction: facing } = warp;
      if (!names.has(toMap)) fail(`${map.map_name} warp targets unknown map ${toMap}`);
      if (!DIRECTIONS.has(facing)) fail(`${map.map_name} warp has invalid facing ${facing}`);
      if (x < 0 || x >= config.grid.width || y < 0 || y >= config.grid.height || map.layout[y][x] !== 9) fail(`${map.map_name} warp source must be edge tile 9 at (${x},${y})`);
      const edge = { north: y === 0, east: x === config.grid.width - 1, south: y === config.grid.height - 1, west: x === 0 };
      const marker = { north: 'N', east: 'E', south: 'S', west: 'W' }[facing];
      if (!edge[facing] || rowsByMap?.get(map.map_name)?.[y]?.[x] !== marker) fail(`${map.map_name} warp source edge/marker does not match facing ${facing}`);
      if (toX < 0 || toX >= config.grid.width || toY < 0 || toY >= config.grid.height) fail(`${map.map_name} arrival is outside target map`);
      const target = maps.find(candidate => candidate.map_name === toMap);
      if (target.layout[toY][toX] !== 1) fail(`${map.map_name} arrival ${toMap}(${toX},${toY}) must be road tile 1`);
      const edgeArrival = (facing === 'east' && toX === 1) || (facing === 'west' && toX === config.grid.width - 2) || (facing === 'north' && toY === config.grid.height - 2) || (facing === 'south' && toY === 1);
      if (!edgeArrival) fail(`${map.map_name} arrival ${toMap}(${toX},${toY}) is not one tile inside its port`);
      warps.push({ fromMap: map.map_name, from: { x, y }, toMap, to: { x: toX, y: toY }, facing });
    }
  }
  return warps;
}

function directedEdges(warps) {
  const grouped = new Map();
  for (const warp of warps) {
    const key = `${warp.fromMap}->${warp.toMap}`;
    if (!grouped.has(key)) grouped.set(key, { fromMap: warp.fromMap, toMap: warp.toMap, direction: warp.facing, ports: [] });
    grouped.get(key).ports.push({ from: warp.from, to: warp.to });
  }
  return [...grouped.values()].sort((a, b) => a.fromMap.localeCompare(b.fromMap) || a.toMap.localeCompare(b.toMap));
}

function masks(layout, config) {
  const { width, height, macroExpansion } = config.grid;
  const walkable = layout.map(row => row.map(tile => config.walkableTileIds.includes(tile)));
  const blocked = walkable.map(row => row.map(value => !value));
  const macroWidth = Math.ceil(width / macroExpansion);
  const macroHeight = Math.ceil(height / macroExpansion);
  const macro = [];
  for (let my = 0; my < macroHeight; my += 1) {
    const row = [];
    for (let mx = 0; mx < macroWidth; mx += 1) {
      const cells = [];
      for (let y = my * macroExpansion; y < Math.min(height, (my + 1) * macroExpansion); y += 1) {
        for (let x = mx * macroExpansion; x < Math.min(width, (mx + 1) * macroExpansion); x += 1) cells.push(walkable[y][x]);
      }
      row.push({ walkable: cells.every(Boolean), blocked: cells.some(value => !value) });
    }
    macro.push(row);
  }
  const adjacency = layout.map((row, y) => row.map((_, x) => ({
    cardinal: [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].filter(([nx, ny]) => nx >= 0 && nx < width && ny >= 0 && ny < height && walkable[ny][nx]).length,
    diagonal: [[x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1]].filter(([nx, ny]) => nx >= 0 && nx < width && ny >= 0 && ny < height && walkable[ny][nx]).length
  })));
  return { detail: { width, height, walkable, blocked }, macro: { width: macroWidth, height: macroHeight, expansion: macroExpansion, ...(() => ({ walkable: macro.map(row => row.map(cell => cell.walkable)), blocked: macro.map(row => row.map(cell => cell.blocked)) }))() }, adjacency };
}

function buildMap(map, rows, config) {
  validateLayout(map.layout, map.map_name, config);
  const asciiLayout = gridFromAscii(rows, map.map_name);
  if (JSON.stringify(asciiLayout) !== JSON.stringify(map.layout)) fail(`${map.map_name} ASCII layout does not match maps.json`);
  const landmarks = annotationFromAscii(rows, map.map_name);
  const bridgeRecordsForMap = bridgeRecords(rows, map.map_name, map.layout);
  const terrain = map.layout.map(row => row.map(tile => ({ tile, material: config.terrainMaterials[String(tile)], asset: null, status: 'pending' })));
  return {
    id: map.map_name,
    width: config.grid.width,
    height: config.grid.height,
    layout: map.layout,
    terrain16px: { tileSizePx: config.grid.tileSizePx, widthPx: config.grid.width * config.grid.tileSizePx, heightPx: config.grid.height * config.grid.tileSizePx, cells: terrain },
    masks: masks(map.layout, config),
    dualGrid: Object.fromEntries([...new Set(terrain.flat().map(cell => cell.material))].sort().map(material => [material, buildLayer(terrain.map(row => row.map(cell => cell.material)), material)])),
    landmarks,
    warps: map.warps,
    bridges: bridgeRecordsForMap,
    assets: { status: 'pending', id: null, reason: config.assetMetadata.reason }
  };
}

export function buildSnapshot({ root = REPO_ROOT, paths = DEFAULT_PATHS, materialConfig = dualGridConfig } = {}) {
  const mapsText = readUtf8(root, paths.maps);
  const asciiText = readUtf8(root, paths.ascii);
  const configText = readUtf8(root, paths.config);
  const config = JSON.parse(configText);
  const maps = JSON.parse(mapsText);
  const rowsByMap = parseAsciiSections(asciiText, config.grid.width, config.grid.height);
  if (maps.length !== 6) fail(`expected 6 maps, got ${maps.length}`);
  const mapNames = maps.map(map => map.map_name);
  if (new Set(mapNames).size !== maps.length || [...rowsByMap.keys()].some(name => !mapNames.includes(name))) fail('ASCII/map names differ');
  const parsedMaps = maps.map(map => buildMap(map, rowsByMap.get(map.map_name), config));
  const warps = validateWarps(maps, config, rowsByMap);
  const materialGrid = map => map.layout.map(row => row.map(tile => ({0:'grass',1:'road',2:'obstacle_macro',3:'water',9:'road'})[tile]));
  for (const map of maps) {
    const grid = materialGrid(map);
    const halo = Object.assign({}, ...[...new Set(map.warps.map(w => w.to_map))].map(name => {
      const target = maps.find(candidate => candidate.map_name === name);
      return portHalo(map, target, grid, materialGrid(target));
    }));
    // Validate every display cell, including interior and halo-only materials.
    for (let v = 0; v <= grid.length; v++) for (let u = 0; u <= grid[0].length; u++) {
      resolveMaterials(grid, u, v, materialConfig, halo);
    }
    const layers = Object.fromEntries(materialConfig.materials.layers.map(material => [material, buildDisplay(grid, material, {halo, config: materialConfig})]));
    const seamStrips = map.warps.map(warp => {
      const horizontal = warp.facing_direction === 'north' || warp.facing_direction === 'south';
      const coordinates = horizontal ? [[warp.from_x, warp.facing_direction === 'north' ? 0 : grid.length], [warp.from_x+1, warp.facing_direction === 'north' ? 0 : grid.length]] : [[warp.facing_direction === 'west' ? 0 : grid[0].length, warp.from_y], [warp.facing_direction === 'west' ? 0 : grid[0].length, warp.from_y+1]];
      return {port:{x:warp.from_x,y:warp.from_y}, toMap:warp.to_map, facing:warp.facing_direction, cells:coordinates.map(([u,v]) => resolveMaterials(grid,u,v,materialConfig,halo))};
    });
    const output = parsedMaps.find(candidate => candidate.id === map.map_name);
    output.dualGridC3 = {status:'logical', halo, layers, seamStrips, bridges:output.bridges.map(record => ({id:record.id, cells:record.cells.map(({x,y}) => bridgeCell(grid,record,x,y,materialConfig))}))};
  }
  const edges = directedEdges(warps);
  const bridges = parsedMaps.flatMap(map => map.bridges.map(bridge => ({ map: map.id, ...bridge })));
  const landmarks = parsedMaps.flatMap(map => map.landmarks.map(landmark => ({ map: map.id, ...landmark })));
  const snapshot = {
    schemaVersion: 1,
    generatedBy: 'scripts/world-map/pipeline.mjs',
    sources: {
      maps: { path: paths.maps, sha256: sha256(mapsText) },
      ascii: { path: paths.ascii, sha256: sha256(asciiText) }
    },
    config: { path: paths.config, sha256: sha256(configText) },
    generator: { path: 'scripts/world-map/pipeline.mjs', sha256: hashFile(root, 'scripts/world-map/pipeline.mjs') },
    dualGridSources: { code: hashFile(root, 'scripts/world-map/dual-grid.mjs'), config: hashFile(root, 'scripts/world-map/dual-grid-config.json') },
    grid: config.grid,
    counts: { maps: parsedMaps.length, cells: parsedMaps.reduce((sum, map) => sum + map.width * map.height, 0), landmarks: landmarks.length, directedEdges: edges.length, warps: warps.length, bridges: bridges.length },
    graph: { directedEdges: edges, warps },
    bridges,
    maps: parsedMaps,
    assets: { status: 'pending', reason: config.assetMetadata.reason, productionSprites: null, renderer: null }
  };
  return snapshot;
}

export function writeSnapshot({ root = REPO_ROOT, paths = DEFAULT_PATHS } = {}) {
  const snapshot = buildSnapshot({ root, paths });
  const target = path.resolve(root, paths.snapshot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(snapshot, null, 2)}\n`);
  return snapshot;
}

export function checkSnapshot({ root = REPO_ROOT, paths = DEFAULT_PATHS } = {}) {
  const expected = buildSnapshot({ root, paths });
  const target = path.resolve(root, paths.snapshot);
  if (!fs.existsSync(target)) fail(`snapshot missing: ${paths.snapshot}`);
  const actual = JSON.parse(fs.readFileSync(target, 'utf8'));
  if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(`snapshot is stale: ${paths.snapshot}`);
  return actual;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  try {
    if (process.argv.includes('--check')) {
      const snapshot = checkSnapshot();
      console.log(`world-map snapshot OK (${snapshot.counts.maps} maps, ${snapshot.counts.cells} cells)`);
    } else {
      const snapshot = writeSnapshot();
      console.log(`world-map snapshot written (${snapshot.counts.maps} maps, ${snapshot.counts.cells} cells)`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
