import assert from 'node:assert/strict';
import { createWorkerTracker } from '../scripts/device-evidence-protocol.mjs';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';

const message = (extra = {}) => ({id:'request',session:1,...extra});
let track = createWorkerTracker('request',1);
assert.equal(track(message({phase:'progress',file:'x',loaded:1,total:2})).event,'progress');
assert.equal(track(message({phase:'progress',file:'x',loaded:2,total:2})).event,'asset-read-complete');
assert.equal(track(message({phase:'backend',backend:'webgpu'})).event,'backend');
assert.equal(track(message({phase:'running',backend:'webgpu'})).event,'inference-start');
assert.deepEqual(track(message({text:'{"intent":"order_water"}'})),{event:'result',output:'{"intent":"order_water"}'});
assert.equal(track(message({text:'late'})),null);
for (const invalid of [message({text:'premature'}),message({phase:'backend'}),message({phase:'unknown'}),message({text:undefined}),message({text:''}),message({id:'stale',text:'x'}),message({session:2,text:'x'})]) {
  track = createWorkerTracker('request',1);
  assert.equal(track(invalid).event,'error');
}
track=createWorkerTracker('request',1);
assert.equal(track(message({phase:'backend',backend:'wasm'})).event,'backend');
assert.equal(track(message({error:'initialization failed'})).event,'error');

// Execute the production worker with a complete-length response whose digest is wrong.
// Its last progress message precedes the SHA check; no inference may follow failure.
const source = (await readFile(new URL('../src/ai/model.worker.ts', import.meta.url), 'utf8'))
  .replace(/^import .*;\r?\n/gm, '');
const workerCode = stripTypeScriptTypes(source);
const events = [];
track = createWorkerTracker('request', 1);
let pipelineCalls = 0;
const self = { location: { origin: 'http://localhost' }, postMessage: data => events.push(track(data)) };
const context = vm.createContext({
  self, crypto: webcrypto, TextEncoder, Uint8Array, ArrayBuffer, URL, Response, Blob,
  performance, navigator: {}, caches: { open: async () => ({ match: async () => undefined }) },
  fetch: async () => new Response(new Uint8Array([1, 2, 3])),
  env: { backends: { onnx: { wasm: {} } } },
  pipeline: async () => { pipelineCalls++; throw new Error('Unexpected inference'); },
  manifest: { models: [], runtime: { files: [{ path: 'test.mjs', bytes: 3, sha256: '0'.repeat(64) }] }, inference: {} }
});
vm.runInContext(workerCode, context);
await self.onmessage({ data: { id: 'request', session: 1, kind: 'transcribe', input: [] } });
assert.deepEqual(events.map(event => event.event), ['asset-read-complete', 'error']);
assert.match(events.at(-1).error, /SHA-256/);
assert.equal(pipelineCalls, 0);
assert.ok(!events.some(event => ['asset-verified', 'inference-start', 'result'].includes(event.event)));
console.log('Device evidence worker protocol regressions PASS');
