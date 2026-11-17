import { readFileSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { isDeepStrictEqual } from 'node:util';
import path from 'node:path';
import { validateManifest, c6Gate } from './asset-schema.mjs';

const digest = b => createHash('sha256').update(b).digest('hex');
const canonical = p => typeof p === 'string' && /^public\/art\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.png$/.test(p);
const within = (base, file) => { const rel = path.relative(base, file); return rel !== '' && !rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel); };
const same = (a,b) => isDeepStrictEqual(a,b);

// C7 validates structure, CRC and compressed stream. This pass measures actual alpha.
function pixels(bytes) {
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20), channels = bytes[25] === 6 ? 4 : 3;
  const rowSize = width * channels, expected = (rowSize + 1) * height;
  if (!Number.isSafeInteger(expected) || expected > 256 * 1024 * 1024) throw Error('PNG size limit');
  let offset = 8; const parts = [];
  while (offset < bytes.length) { const size = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8); if (type === 'IDAT') parts.push(bytes.subarray(offset + 8, offset + 8 + size)); offset += size + 12; }
  const raw = inflateSync(Buffer.concat(parts), { maxOutputLength: expected });
  if (raw.length !== expected) throw Error('PNG decoded length');
  let prev = Buffer.alloc(rowSize), pos = 0, transparent = false;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++], row = Buffer.from(raw.subarray(pos, pos + rowSize)); pos += rowSize;
    for (let x = 0; x < rowSize; x++) {
      const l = x >= channels ? row[x - channels] : 0, u = prev[x], ul = x >= channels ? prev[x - channels] : 0;
      const p = l + u - ul, pa = Math.abs(p-l), pb = Math.abs(p-u), pc = Math.abs(p-ul);
      const predictor = filter === 0 ? 0 : filter === 1 ? l : filter === 2 ? u : filter === 3 ? Math.floor((l+u)/2) : pa <= pb && pa <= pc ? l : pb <= pc ? u : ul;
      row[x] = (row[x] + predictor) & 255;
    }
    if (channels === 4) for (let x = 3; x < rowSize; x += 4) if (row[x] !== 255) transparent = true;
    prev = row;
  }
  return { width, height, transparent };
}

// reference is an explicit, versioned consumer input, not inferred from C7 prose.
// {provenance, inputs:{'maps.json':{path,sha256},'ascii-maps.md':{path,sha256}},
//  unit, maps:{id:{width,height}}, assets:{id:{alpha:'opaque'|'transparent', ...metadata}},
//  placements:[{id,map,x,y,unit,...metadata}], licenses?:[{path,sha256}]}
export function loadAssets({ root, manifest, reference, production = true }) {
  const errors = [], pending = [], stale = [], entries = Object.create(null);
  const add = (list, code, detail) => list.push({ code, detail });
  if (!root || !path.isAbsolute(root)) throw Error('root must be an absolute checkout path');
  const rootReal = realpathSync(root);
  let artReal; try { artReal = realpathSync(path.join(rootReal, 'public', 'art')); if (!within(rootReal, artReal)) artReal = null; } catch { artReal = null; }
  const safe = new Map();
  const assets = Array.isArray(manifest?.assets) ? manifest.assets : [];
  for (const [i, a] of assets.entries()) {
    if (!a || !a.path) continue;
    if (!canonical(a.path)) { add(errors, 'path', `assets[${i}].path`); continue; }
    try { const file = realpathSync(path.join(rootReal, a.path)); if (!artReal || !within(artReal, file)) throw Error('containment'); safe.set(i, file); }
    catch { add(errors, 'path-or-missing', `assets[${i}].path`); }
  }
  // Do not let C7 follow an unsafe path before containment has been checked.
  const checked = { ...manifest, assets: assets.map((a,i) => a && a.path && !safe.has(i) ? {...a, path:null} : a) };
  const result = validateManifest(checked, {root:rootReal, production});
  for (const e of result.errors) if (!/^C6 (pending|stale)$/.test(e)) add(errors, 'schema', e);
  for (const p of result.pending) add(pending, 'schema', p);
  const gate = c6Gate(manifest?.c6, rootReal, manifest?.sourceInputs);
  if (gate === 'pending') add(pending, 'c6', gate); else if (gate === 'stale') add(stale, 'c6', gate);
  if (!reference || typeof reference !== 'object' || !reference.provenance) add(pending, 'reference', 'reference provenance missing');
  const ref = reference && typeof reference === 'object' && !Array.isArray(reference) ? reference : {};
  let mapData;
  for (const name of ['maps.json','ascii-maps.md']) {
    const input = ref.inputs?.[name];
    if (!input || typeof input.path !== 'string' || !/^[a-f0-9]{64}$/.test(input.sha256 || '')) { add(pending, 'input', name); continue; }
    try { const file = realpathSync(path.resolve(rootReal, input.path)); if (!within(rootReal,file)) throw Error('outside'); const bytes = readFileSync(file), actual = digest(bytes); if (actual !== input.sha256 || actual !== manifest?.sourceInputs?.[name]) add(stale, 'input', name); if (name === 'maps.json') mapData = JSON.parse(bytes); }
    catch { add(pending, 'input', name); }
  }
  if (ref.licenses != null && !Array.isArray(ref.licenses)) add(errors, 'license', 'licenses must be an array');
  for (const license of (Array.isArray(ref.licenses) ? ref.licenses : [])) {
    if (!license || typeof license.path !== 'string' || !/^[a-f0-9]{64}$/.test(license.sha256 || '')) { add(errors, 'license', 'invalid license reference'); continue; }
    try { const file = realpathSync(path.resolve(rootReal, license.path)); if (!within(rootReal,file) || digest(readFileSync(file)) !== license.sha256) add(errors, 'license', license.path); }
    catch { add(errors, 'license', license.path); }
  }
  if (!ref.assets || !ref.unit || !ref.maps || !Array.isArray(ref.placements)) add(pending, 'binding', 'assets, unit, maps and placements required');
  if (ref.unit === 'tile' && Array.isArray(mapData)) {
    for (const [id, bounds] of Object.entries(ref.maps || {})) {
      const map = mapData.find(m => m?.map_name === id), rows = map?.layout;
      if (!Array.isArray(rows) || !rows.length || !rows.every(row => Array.isArray(row) && row.length === rows[0].length) || bounds?.width !== rows[0].length || bounds?.height !== rows.length) add(errors, 'map-bounds', id);
    }
  } else if (ref.maps) add(pending, 'map-bounds', 'verified tile map dimensions required');
  const fields = ['path','sha256','nativeDimensions','gridFootprint','anchor','layer','renderOrder','collision','interaction','variants','source','license','maps','placement'];
  for (const [i,a] of assets.entries()) {
    if (!a || typeof a !== 'object') continue;
    const binding = ref.assets?.[a.id];
    if (!binding) add(pending, 'binding', String(a.id));
    else {
      for (const key of fields) {
        if (!Object.hasOwn(binding,key)) add(pending, 'binding-field', `${a.id}.${key}`);
        else if (!same(a[key], binding[key])) add(errors, 'binding-mismatch', `${a.id}.${key}`);
      }
      if (!['opaque','transparent'].includes(binding.alpha)) add(pending, 'alpha-policy', String(a.id));
    }
    for (const variant of (Array.isArray(a.variants) ? a.variants : [])) if (!assets.some(x => x?.id === variant)) add(errors, 'variant', `${a.id}:${variant}`);
    if (!safe.has(i) || result.errors.some(e => e.startsWith(`assets[${i}]`))) continue;
    try { const bytes = readFileSync(safe.get(i)), decoded = pixels(bytes);
      if (binding?.alpha === 'opaque' && decoded.transparent || binding?.alpha === 'transparent' && !decoded.transparent) add(errors, 'alpha', a.id);
      entries[a.id] = { ...decoded, bytes, path:a.path, sha256:digest(bytes) };
    } catch { add(errors, 'decode', String(a.id)); }
  }
  for (const id of Object.keys(ref.assets || {})) if (!assets.some(a => a?.id === id)) add(errors, 'manifest-parity', id);
  for (const [i,p] of (Array.isArray(ref.placements) ? ref.placements : []).entries()) {
    if (!p || typeof p !== 'object') { add(errors, 'placement', `placements[${i}]`); continue; }
    const a = assets.find(x => x?.id === p.id), map = ref.maps?.[p.map], label = `placements[${i}]`;
    if (!a) { add(errors, 'placement-id', label); continue; }
    if (!map || !Array.isArray(a.maps) || !a.maps.includes(p.map)) { add(errors, 'placement-map', label); continue; }
    if (p.unit !== ref.unit || ![p.x,p.y,map.width,map.height,a.gridFootprint?.width,a.gridFootprint?.height].every(Number.isFinite) || p.x < 0 || p.y < 0 || p.x + a.gridFootprint.width > map.width || p.y + a.gridFootprint.height > map.height) add(errors, 'placement-bounds', label);
    for (const key of ['path','anchor','layer','renderOrder','gridFootprint','collision','interaction','variants']) if (!Object.hasOwn(p,key) || !same(p[key],a[key])) add(errors, 'placement-mismatch', `${label}.${key}`);
  }
  for (const a of assets) if (a && Array.isArray(a.maps)) for (const map of a.maps) {
    if (Array.isArray(ref.placements) && !ref.placements.some(p => p?.id === a.id && p.map === map)) add(pending, 'placement-coverage', `${a.id}:${map}`);
  }
  const status = errors.length ? 'error' : stale.length ? 'stale' : pending.length ? 'pending' : 'ready';
  return {status, gate, errors, pending, stale, entries: status === 'ready' ? entries : Object.create(null)};
}
