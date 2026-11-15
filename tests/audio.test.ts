import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { hasAudibleSignal, toMono16k } from '../src/audio/pcm.ts';

test('mixes channels and resamples to 16 kHz', () => {
  const left = new Float32Array(48000).fill(0.75);
  const right = new Float32Array(48000).fill(0.25);
  const result = toMono16k([left, right], 48000);
  assert.equal(result.length, 16000);
  assert.ok(result.every(sample => sample === 0.5));
});

test('handles empty and short audio and rejects invalid channels', () => {
  assert.equal(toMono16k([new Float32Array()], 48000).length, 0);
  assert.equal(toMono16k([new Float32Array([0.5])], 48000)[0], 0.5);
  assert.throws(() => toMono16k([], 48000));
  assert.throws(() => toMono16k([new Float32Array(1), new Float32Array(2)], 48000));
  assert.throws(() => toMono16k([new Float32Array(1)], 0));
});

test('rejects silence, short recordings and invalid samples', () => {
  assert.equal(hasAudibleSignal(new Float32Array(16000)), false);
  assert.equal(hasAudibleSignal(new Float32Array(100).fill(0.5)), false);
  assert.equal(hasAudibleSignal(new Float32Array(16000).fill(NaN)), false);
  assert.equal(hasAudibleSignal(new Float32Array(16000).fill(0.05)), true);
});

test('suppresses frequencies above the output Nyquist frequency', () => {
  const rate = 48000;
  const tone = (frequency: number) => Float32Array.from({ length: rate }, (_, i) => Math.sin(2 * Math.PI * frequency * i / rate));
  const rms = (samples: Float32Array) => Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length);
  assert.ok(rms(toMono16k([tone(1000)], rate)) > 0.68);
  assert.ok(rms(toMono16k([tone(12000)], rate)) < 0.01);
});
