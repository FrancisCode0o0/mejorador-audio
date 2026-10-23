// mono.js — mixes several channels down to one.
// Plan step: F1.2 (mono mix, first link of the chain after decode).
// Source: plan, m[i] = (L[i] + R[i]) / 2, generalised to N channels.
// Pure: no DOM, no Web Audio.

/**
 * Averages all channels sample by sample.
 * The average (not the sum) keeps a full-scale signal within [-1, 1].
 * @param {Float32Array[]} channels at least one, all of equal length
 * @returns {Float32Array} a new array; with one channel, a copy of it
 */
export function mixToMono(channels) {
  if (channels.length === 0) {
    throw new RangeError("mixToMono needs at least one channel");
  }
  const sampleCount = channels[0].length;
  if (channels.some((channel) => channel.length !== sampleCount)) {
    throw new RangeError("mixToMono needs channels of equal length");
  }
  const mono = new Float32Array(sampleCount);
  for (const channel of channels) {
    for (let i = 0; i < sampleCount; i++) {
      mono[i] += channel[i];
    }
  }
  // Divide once at the end; for 1 channel this is exact, so the copy is equal.
  for (let i = 0; i < sampleCount; i++) {
    mono[i] /= channels.length;
  }
  return mono;
}
