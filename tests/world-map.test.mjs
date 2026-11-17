import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildSnapshot, checkSnapshot, parseAsciiSections, gridFromAscii, validateWarps, REPO_ROOT } from '../scripts/world-map/pipeline.mjs';

const config = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'scripts/world-map/config.json'), 'utf8'));
const ascii = fs.readFileSync(path.join(REPO_ROOT, 'docs/game-dev/campus-network-v1/ascii-maps.md'), 'utf8');
const maps = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'docs/game-dev/campus-network-v1/maps.json'), 'utf8'));

test('C1 snapshot covers the six source maps and provenance counts', () => {
  const snapshot = buildSnapshot();
  assert.deepEqual(snapshot.counts, { maps: 6, cells: 1800, landmarks: 18, directedEdges: 20, warps: 40, bridges: 2 });
  assert.equal(snapshot.sources.maps.path, 'docs/game-dev/campus-network-v1/maps.json');
  assert.match(snapshot.sources.maps.sha256, /^[a-f0-9]{64}$/);
  assert.match(snapshot.sources.ascii.sha256, /^[a-f0-9]{64}$/);
  assert.match(snapshot.config.sha256, /^[a-f0-9]{64}$/);
  assert.match(snapshot.generator.sha256, /^[a-f0-9]{64}$/);
});

test('each map has reproducible 16px terrain and macro/detail masks', () => {
  const snapshot = buildSnapshot();
  for (const map of snapshot.maps) {
    assert.deepEqual([map.width, map.height], [20, 15]);
    assert.equal(map.terrain16px.tileSizePx, 16);
    assert.deepEqual([map.terrain16px.widthPx, map.terrain16px.heightPx], [320, 240]);
    assert.deepEqual([map.masks.detail.width, map.masks.detail.height], [20, 15]);
    assert.deepEqual([map.masks.macro.width, map.masks.macro.height], [10, 8]);
    assert.equal(map.masks.detail.walkable.flat().length, 300);
    assert.equal(map.terrain16px.cells.flat().every(cell => cell.asset === null && cell.status === 'pending'), true);
    assert.equal(map.assets.status, 'pending');
  }
  const garden = snapshot.maps.find(map => map.id === 'garden');
  assert.equal(garden.bridges.length, 2);
  assert.ok(garden.bridges.every(bridge => bridge.cells.length === 4));
});

test('warps validate edge ports and inward road arrivals', () => {
  const snapshot = buildSnapshot();
  const rawWarps = maps.flatMap(map => map.warps);
  assert.equal(snapshot.graph.warps.length, 40);
  assert.equal(validateWarps(maps, config, parseAsciiSections(ascii, 20, 15)).length, 40);
  const invalid = structuredClone(maps);
  invalid[0].warps[0].to_x = 0;
  assert.throws(() => validateWarps(invalid, config, parseAsciiSections(ascii, 20, 15)), /arrival/);
  assert.equal(rawWarps.filter(warp => warp.from_x === 19 || warp.from_x === 0 || warp.from_y === 0 || warp.from_y === 14).length, 40);
});

test('ASCII parser preserves annotations without turning them into tile IDs', () => {
  const sections = parseAsciiSections(ascii, 20, 15);
  assert.equal(sections.size, 6);
  const dormRows = sections.get('dorm');
  const dorm = gridFromAscii(dormRows, 'dorm');
  assert.equal(dorm[3][4], 2);
  assert.equal(dorm[7][19], 9);
  assert.equal(dorm[0][9], 9);
  const broken = dormRows.map(row => row);
  broken[0] = `${broken[0].slice(0, 19)}0`;
  assert.throws(() => gridFromAscii(broken, 'broken'), /unknown ASCII symbol/);
});

test('snapshot check is byte-stable against current inputs', () => {
  const snapshot = checkSnapshot();
  assert.equal(snapshot.counts.warps, 40);
});


test('warp source must be the marked edge in its facing direction', () => {
  const rows = parseAsciiSections(ascii, 20, 15);
  const interior = structuredClone(maps);
  const warp = interior[0].warps[0];
  warp.from_x = 5; warp.from_y = 5; interior[0].layout[5][5] = 9;
  assert.throws(() => validateWarps(interior, config, rows), /edge\/marker/);
  const wrongFacing = structuredClone(maps);
  wrongFacing[0].warps[0].facing_direction = 'north';
  assert.throws(() => validateWarps(wrongFacing, config, rows), /edge\/marker/);
  const wrongMarker = new Map(rows);
  const altered = [...rows.get(maps[0].map_name)];
  const w = maps[0].warps[0];
  altered[w.from_y] = altered[w.from_y].slice(0, w.from_x) + 'N' + altered[w.from_y].slice(w.from_x + 1);
  wrongMarker.set(maps[0].map_name, altered);
  assert.throws(() => validateWarps(maps, config, wrongMarker), /edge\/marker/);
});
