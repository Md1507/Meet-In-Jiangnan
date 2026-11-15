import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ModelManager } from '../src/ai/ModelManager.ts';

class FakeWorker {
  onmessage: ((event: {data: any}) => void) | null = null;
  onerror: (() => void) | null = null;
  request: any;
  terminated = false;
  postMessage(request: unknown) { this.request = request; }
  terminate() { this.terminated = true; }
  reply(data: object) { this.onmessage?.({data: {...this.request, ...data}}); }
}
test('cancel rejects old request and stale replies cannot affect the next one', async () => {
  const workers: FakeWorker[] = [];
  const manager = new ModelManager(() => {const w = new FakeWorker(); workers.push(w); return w as unknown as Worker;});
  const first = manager.evaluate('first');
  const rejected = assert.rejects(first, /hủy/);
  const second = manager.evaluate('second');
  await rejected;
  workers[0].reply({text:'stale'});
  workers[1].reply({session:-1,text:'wrong session'});
  workers[1].reply({phase:'running'});
  workers[1].reply({text:'fresh'});
  assert.equal(await second,'fresh');
  assert.equal(workers[0].terminated,true);
  assert.equal(workers[1].terminated,true);
});
test('worker errors reject and terminate without preventing retry', async () => {
  const workers: FakeWorker[] = [];
  const manager = new ModelManager(() => {const w = new FakeWorker(); workers.push(w); return w as unknown as Worker;});
  const first=manager.evaluate('first'); workers[0].reply({error:'load failed'});
  await assert.rejects(first,/load failed/);
  const second=manager.evaluate('retry'); workers[1].reply({text:'ok'});
  assert.equal(await second,'ok');
});

test('load/inference timeout releases the worker and permits retry', async t => {
  t.mock.timers.enable({apis:['setTimeout']});
  const workers:FakeWorker[]=[];
  const manager=new ModelManager(()=>{const w=new FakeWorker();workers.push(w);return w as unknown as Worker;});
  const load=assert.rejects(manager.evaluate('load timeout'),/thời gian tải/);
  t.mock.timers.tick(120001);await load;
  assert.equal(workers[0].terminated,true);
  const inference=assert.rejects(manager.evaluate('inference timeout'),/thời gian suy luận/);
  workers[1].reply({phase:'running'});
  t.mock.timers.tick(20001);await inference;
  assert.equal(workers[1].terminated,true);
  const retry=manager.evaluate('retry');workers[2].reply({text:'ok'});
  assert.equal(await retry,'ok');
});

test('stale progress cannot replace progress of the active request', async () => {
  const workers:FakeWorker[]=[];const events:string[]=[];
  const manager=new ModelManager(()=>{const w=new FakeWorker();workers.push(w);return w as unknown as Worker;});
  manager.onProgress=file=>events.push(file);
  const first=assert.rejects(manager.evaluate('old'),/hủy/);
  const current=manager.evaluate('current');await first;
  workers[0].reply({phase:'progress',file:'old',loaded:1,total:2});
  workers[1].reply({phase:'progress',file:'fresh',loaded:1,total:2});
  workers[1].reply({text:'done'});await current;
  assert.deepEqual(events,['fresh']);
});
