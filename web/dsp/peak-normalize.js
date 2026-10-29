// peak-normalize.js — scales a signal so that its largest absolute sample is 0.89.
// Plan step: F1.6.
// Temporary: the F3 chain replaces it with two-pass loudness normalisation and the
// true-peak limiter.
// Source: the plan (divide by max|x|, multiply by 0.89 ≈ −1 dBFS).
// Pure: no DOM, no Web Audio.

/**
 * Target peak as a linear amplitude: 20·log10(0.89) ≈ −1.01 dBFS. One decibel
 * of headroom so that the 16-bit export never clips.
 */
export const PEAK_TARGET_LINEAR = 0.89;

/**
 * Scales the signal so that max|x| equals PEAK_TARGET_LINEAR.
 * The input is never modified; the output is always a new array.
 * @param {Float32Array} samples mono signal
 * @returns {Float32Array} the normalised signal, a new array
 */
export function normalizePeak(samples) {
  const peak = findAbsolutePeak(samples);
  if (peak === 0) {
    // Silence has no level to adjust, and 0.89 / 0 would give NaN.
    return Float32Array.from(samples);
  }
  // One gain for every sample: the shape of the signal is kept and only its
  // level changes (quiet files get louder, files with a peak above 1 quieter).
  const gain = PEAK_TARGET_LINEAR / peak;
  return samples.map((sample) => sample * gain);
}

/**
 * @param {Float32Array} samples
 * @returns {number} max|x|, or 0 for an empty signal
 */
function findAbsolutePeak(samples) {
  let peak = 0;
  for (const sample of samples) {
    const magnitude = Math.abs(sample);
    if (magnitude > peak) peak = magnitude;
  }
  return peak;
}
