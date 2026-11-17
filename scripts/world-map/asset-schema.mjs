import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { inflateSync } from 'node:zlib';

export const MAPS = ['dorm', 'gate', 'library', 'canteen', 'street', 'garden'];
const categories = ['terrain', 'architecture', 'vegetation', 'props'];
const text = v => typeof v === 'string' && v.trim() === v && v.length > 0 && !/^(unknown|pending|tbd|none|n\/a)$/i.test(v);
const integer = v => Number.isSafeInteger(v) && v > 0;
const point = v => v && Number.isFinite(v.x) && Number.isFinite(v.y);
const dimensions = v => v && integer(v.width) && integer(v.height);
const sha = v => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const record = v => v !== null && typeof v === 'object' && !Array.isArray(v) && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const pngPath = v => typeof v === 'string' && /^public\/art\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.png$/.test(v);

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Decode the supported PNG subset before an asset can become production-ready.
// This catches files with a valid signature/IHDR but missing IDAT/IEND or pixels.
function decodesPng(bytes) {
  const signature = Buffer.from('89504e470d0a1a0a', 'hex');
  if (!Buffer.isBuffer(bytes) || bytes.length < 33 || !bytes.subarray(0, 8).equals(signature)) return false;
  let offset = 8, width, height, bitDepth, colorType, interlace;
  let hasIHDR = false, hasIEND = false, hasIDAT = false;
  const idat = [];
  try {
    while (offset < bytes.length) {
      if (offset + 12 > bytes.length) return false;
      const length = bytes.readUInt32BE(offset); offset += 4;
      const typeBytes = bytes.subarray(offset, offset + 4); offset += 4;
      if (![...typeBytes].every(b => (b >= 65 && b <= 90) || (b >= 97 && b <= 122))) return false;
      const type = typeBytes.toString('ascii');
      if (!['IHDR', 'IDAT', 'IEND'].includes(type) || hasIEND || (!hasIHDR && type !== 'IHDR')) return false;
      const end = offset + length;
      if (end + 4 > bytes.length) return false;
      const data = bytes.subarray(offset, end); offset = end;
      const expectedCrc = bytes.readUInt32BE(offset); offset += 4;
      const crcInput = Buffer.concat([typeBytes, data]);
      if (crc32(crcInput) !== expectedCrc) return false;
      if (type === 'IHDR') {
        if (hasIHDR || length !== 13) return false;
        width = data.readUInt32BE(0); height = data.readUInt32BE(4);
        bitDepth = data[8]; colorType = data[9];
        if (!width || !height || data[10] !== 0 || data[11] !== 0) return false;
        interlace = data[12];
        if (interlace !== 0) return false;
        if (bitDepth !== 8 || ![2, 6].includes(colorType)) return false;
        hasIHDR = true;
      } else if (type === 'IDAT') {
        if (!hasIHDR) return false;
        hasIDAT = true; idat.push(data);
      } else if (type === 'IEND') {
        if (length !== 0 || hasIEND || !hasIDAT) return false;
        hasIEND = true;
        if (offset !== bytes.length) return false;
      }
    }
    if (!hasIHDR || !hasIDAT || !hasIEND) return false;
    const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
    const rowBytes = Math.ceil(width * channels * bitDepth / 8);
    const expectedLength = height * (rowBytes + 1);
    if (!Number.isSafeInteger(expectedLength) || expectedLength > 256 * 1024 * 1024) return false;
    const compressed = Buffer.concat(idat);
    const decoded = inflateSync(compressed, { info: true, maxOutputLength: expectedLength });
    if (decoded.engine.bytesWritten !== compressed.length) return false;
    const raw = decoded.buffer;
    if (raw.length !== expectedLength) return false;
    const bytesPerPixel = Math.max(1, Math.ceil(channels * bitDepth / 8));
    const rows = [];
    let cursor = 0;
    for (let y = 0; y < height; y += 1) {
      const filter = raw[cursor++];
      if (filter > 4) return false;
      const row = Buffer.from(raw.subarray(cursor, cursor + rowBytes)); cursor += rowBytes;
      const prior = rows[y - 1];
      for (let x = 0; x < row.length; x += 1) {
        const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
        const up = prior ? prior[x] : 0;
        const upLeft = prior && x >= bytesPerPixel ? prior[x - bytesPerPixel] : 0;
        if (filter === 1) row[x] = (row[x] + left) & 255;
        else if (filter === 2) row[x] = (row[x] + up) & 255;
        else if (filter === 3) row[x] = (row[x] + Math.floor((left + up) / 2)) & 255;
        else if (filter === 4) {
          const p = left + up - upLeft;
          const pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - upLeft);
          row[x] = (row[x] + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft)) & 255;
        }
      }
      rows.push(row);
    }
    return true;
  } catch { return false; }
}

function sourceInputRecords(value, records = []) {
  if (!value || typeof value !== 'object') return records;
  if (Object.hasOwn(value, 'sourceInputs')) records.push(value.sourceInputs);
  for (const child of Object.values(value)) sourceInputRecords(child, records);
  return records;
}

// Hash actual files, not a caller-supplied assertion. Missing inputs are pending.
export function c6Gate(c6, root = '.', expectedSourceInputs = null) {
  if (!c6 || !text(c6.path) || !sha(c6.sha256) || !sha(c6.expectedSha256)) return 'pending';
  if (c6.sha256 !== c6.expectedSha256) return 'stale';
  try {
    const rootPath = realpathSync(root), file = realpathSync(path.resolve(root, c6.path));
    if (!file.startsWith(rootPath + path.sep)) return 'stale';
    const bytes = readFileSync(file);
    if (createHash('sha256').update(bytes).digest('hex') !== c6.sha256) return 'stale';
    const contract = JSON.parse(bytes);
    if (!['scale', 'layout', 'camera', 'clearance'].every(k => contract[k]?.status === 'approved' && text(contract[k]?.evidence))) return 'pending';
    if (!record(expectedSourceInputs) || !['maps.json', 'ascii-maps.md'].every(k => sha(expectedSourceInputs[k]))) return 'pending';
    if (![contract.sourceInputs, ...['scale', 'layout', 'camera', 'clearance'].map(k => contract[k]?.sourceInputs)].every(v => record(v) && Object.keys(expectedSourceInputs).every(k => sha(v[k])))) return 'pending';
    const records = sourceInputRecords(contract);
    if (!records.length) return 'pending';
    for (const sourceInputs of records) {
      if (!record(sourceInputs)) return 'pending';
      for (const [name, digest] of Object.entries(expectedSourceInputs)) {
        if (!sha(sourceInputs[name])) return 'pending';
        if (sourceInputs[name] !== digest) return sourceInputs[name] === undefined ? 'pending' : 'stale';
      }
    }
    return 'approved';
  } catch { return 'pending'; }
}

export function validateManifest(manifest, { root = '.', production = false } = {}) {
  const errors = [], pending = [], seen = { id: new Set(), path: new Set(), sha256: new Set() };
  if (!manifest || !Array.isArray(manifest.assets) || !manifest.assets.length) return { errors: ['assets required'], pending, ready: false };
  for (const [i, a] of manifest.assets.entries()) {
    const label = `assets[${i}]`;
    if (!a || typeof a !== 'object' || Array.isArray(a)) { errors.push(`${label}: object required`); continue; }
    const strict = production || a.status === 'production';
    const requireField = (name, valid) => {
      const value = a[name];
      if (value === null && !strict && a.status === 'pending' && !['id', 'category', 'maps', 'placement'].includes(name)) { pending.push(`${label}.${name}`); return; }
      if (!valid(value)) errors.push(`${label}.${name}: invalid or missing`);
    };
    requireField('id', v => typeof v === 'string' && /^[a-z][a-z0-9_-]*(?:\.[a-z0-9][a-z0-9_-]*)*$/.test(v));
    requireField('path', pngPath);
    requireField('sha256', sha);
    for (const k of Object.keys(seen)) if (a[k] != null && typeof a[k] === 'string') {
      if (seen[k].has(a[k])) errors.push(`${label}.${k}: duplicate`); else seen[k].add(a[k]);
    }
    if (!['pending', 'production'].includes(a.status)) errors.push(`${label}.status: invalid`);
    if (production && a.status !== 'production') errors.push(`${label}.status: not production`);
    requireField('category', v => categories.includes(v));
    requireField('maps', v => Array.isArray(v) && v.length > 0 && new Set(v).size === v.length && v.every(m => MAPS.includes(m)));
    for (const k of ['nativeDimensions', 'gridFootprint']) requireField(k, dimensions);
    requireField('anchor', point);
    requireField('collision', v => v && typeof v === 'object' && (v.kind === 'none' || (v.kind === 'rect' && point(v.offset) && dimensions(v))));
    requireField('layer', text);
    requireField('renderOrder', Number.isSafeInteger);
    requireField('interaction', v => v && typeof v === 'object' && ['none', 'reference'].includes(v.kind) && (v.kind !== 'reference' || text(v.ref)));
    requireField('variants', v => Array.isArray(v) && v.every(text) && new Set(v).size === v.length);
    requireField('source', text); requireField('license', text); requireField('bytes', integer);
    requireField('placement', text);
    for (const k of ['sourceStatus', 'runtimeStatus', 'previewStatus']) requireField(k, v => ['pending', 'available', 'integrated'].includes(v));
    if (strict && a.sourceStatus !== 'available') errors.push(`${label}.sourceStatus: source unavailable`);
    if (a.path && pngPath(a.path)) {
      try {
        const rootPath = realpathSync(root), file = realpathSync(path.resolve(root, a.path));
        if (!file.startsWith(rootPath + path.sep)) throw Error('outside root');
        const b = readFileSync(file);
        if (b.length < 24 || !b.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) || b.toString('ascii', 12, 16) !== 'IHDR' || !decodesPng(b)) errors.push(`${label}: invalid PNG`);
        else if (a.nativeDimensions && (b.readUInt32BE(16) !== a.nativeDimensions.width || b.readUInt32BE(20) !== a.nativeDimensions.height)) errors.push(`${label}: dimensions mismatch`);
        if (a.bytes != null && b.length !== a.bytes) errors.push(`${label}: bytes mismatch`);
        if (a.sha256 != null && createHash('sha256').update(b).digest('hex') !== a.sha256) errors.push(`${label}: hash mismatch`);
      } catch { if (production || a.status === 'production') errors.push(`${label}: PNG missing`); else pending.push(`${label}: PNG missing`); }
    }
  }
  const gate = c6Gate(manifest.c6, root, manifest.sourceInputs);
  if (production && gate !== 'approved') errors.push(`C6 ${gate}`);
  return { errors, pending, gate, ready: production && !errors.length && !pending.length && gate === 'approved' };
}
