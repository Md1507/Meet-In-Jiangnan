import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { LocalRecorder } from '../src/audio/recorder.ts';

test('records locally and releases microphone tracks on stop', async () => {
  let stopped = 0;
  const stream = { getTracks: () => [{ stop: () => stopped++ }] };
  class FakeRecorder extends EventTarget {
    state = 'inactive';
    mimeType = 'audio/webm';
    start() { this.state = 'recording'; }
    stop() {
      this.state = 'inactive';
      const event = new Event('dataavailable');
      Object.defineProperty(event, 'data', { value: new Blob(['audio']) });
      this.dispatchEvent(event);
      this.dispatchEvent(new Event('stop'));
    }
  }
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: { getUserMedia: async () => stream } } });
  Object.defineProperty(globalThis, 'MediaRecorder', { configurable: true, value: FakeRecorder });
  const recorder = new LocalRecorder();
  let result: Blob | undefined;
  recorder.onRecording = blob => { result = blob; };
  await recorder.start();
  await assert.rejects(recorder.start());
  recorder.stop();
  assert.equal(stopped, 1);
  assert.equal(await result?.text(), 'audio');
  assert.equal(result?.type, 'audio/webm');
});

test('cancellation while permission is pending releases a late stream', async () => {
  let resolveStream!: (stream: unknown) => void;
  let stopped = 0;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: {
    getUserMedia: () => new Promise(resolve => { resolveStream = resolve; })
  } } });
  const recorder = new LocalRecorder();
  const started = recorder.start();
  recorder.stop();
  resolveStream({ getTracks: () => [{ stop: () => stopped++ }] });
  await assert.rejects(started, /cancelled/);
  assert.equal(stopped, 1);
});

test('a delayed stop from an old session cannot stop or publish over a new session', async () => {
  const tracks: number[] = [0, 0];
  let next = 0;
  const instances: FakeRecorder[] = [];
  class FakeRecorder extends EventTarget {
    state = 'inactive';
    mimeType = 'audio/webm';
    constructor(_stream: unknown) { super(); instances.push(this); }
    start() { this.state = 'recording'; }
    stop() { this.state = 'inactive'; }
    finish() { this.dispatchEvent(new Event('stop')); }
  }
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: {
    getUserMedia: async () => { const index = next++; return { getTracks: () => [{ stop: () => tracks[index]++ }] }; }
  } } });
  Object.defineProperty(globalThis, 'MediaRecorder', { configurable: true, value: FakeRecorder });
  const recorder = new LocalRecorder();
  let published = 0;
  recorder.onRecording = () => published++;
  await recorder.start();
  recorder.stop();
  await recorder.start();
  instances[0].finish();
  assert.deepEqual(tracks, [1, 0]);
  assert.equal(published, 0);
  recorder.stop();
  instances[1].finish();
  assert.deepEqual(tracks, [1, 1]);
  assert.equal(published, 1);
});

test('a delayed stop keeps the callback captured at recording start', async () => {
  let instance!: FakeRecorder;
  class FakeRecorder extends EventTarget {
    state = 'inactive'; mimeType = 'audio/webm';
    constructor(_stream: unknown) { super(); instance=this; }
    start() { this.state='recording'; }
    stop() { this.state='inactive'; }
    finish() { this.dispatchEvent(new Event('stop')); }
  }
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}}});
  Object.defineProperty(globalThis,'MediaRecorder',{configurable:true,value:FakeRecorder});
  const recorder=new LocalRecorder(); const calls:string[]=[];
  recorder.onRecording=()=>calls.push('old');
  await recorder.start(); recorder.stop();
  recorder.onRecording=()=>calls.push('new');
  instance.finish();
  assert.deepEqual(calls,['old']);
});
