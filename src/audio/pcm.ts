/** Mix channels and resample with a windowed low-pass filter before decimation. */
export function toMono16k(channels: readonly Float32Array[], inputRate: number): Float32Array {
  if (!channels.length || !Number.isFinite(inputRate) || inputRate <= 0) throw new Error('Invalid audio');
  const length = channels[0].length;
  if (channels.some(channel => channel.length !== length)) throw new Error('Channel lengths differ');
  if (!length) return new Float32Array();
  const output = new Float32Array(Math.max(1, Math.round(length * 16000 / inputRate)));
  for (let i = 0; i < output.length; i++) {
    const position = Math.min(i * inputRate / 16000, length - 1);
    const cutoff = Math.min(1, 16000 / inputRate) * 0.9;
    const radius = Math.ceil(24 / cutoff);
    let sample = 0;
    let totalWeight = 0;
    for (let j = Math.ceil(position - radius); j <= Math.floor(position + radius); j++) {
      const distance = j - position;
      const x = Math.PI * cutoff * distance;
      const sinc = x === 0 ? 1 : Math.sin(x) / x;
      const window = 0.5 + 0.5 * Math.cos(Math.PI * distance / radius);
      const weight = cutoff * sinc * window;
      const index = Math.max(0, Math.min(length - 1, j));
      for (const channel of channels) sample += channel[index] * weight / channels.length;
      totalWeight += weight;
    }
    output[i] = sample / totalWeight;
  }
  return output;
}

/** A simple silence gate, not a speech detector or pronunciation score. */
export function hasAudibleSignal(samples: Float32Array, sampleRate = 16000): boolean {
  if (!Number.isFinite(sampleRate) || sampleRate <= 0 || samples.length < sampleRate * 0.25) return false;
  let energy = 0;
  for (const sample of samples) {
    if (!Number.isFinite(sample)) return false;
    energy += sample * sample;
  }
  return Math.sqrt(energy / samples.length) >= 0.01;
}
