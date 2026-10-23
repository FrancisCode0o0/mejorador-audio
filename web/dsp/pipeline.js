// pipeline.js — chains the dsp links, in the order of the plan.
// Plan step: F1.4 (empty chain). F1.6 adds peak normalisation as the first link.
// This is the only file that chains the links (docs/style.md); each link
// lives in its own file in web/dsp/ and knows nothing about the others.
// Pure: no DOM, no Web Audio.

/**
 * Runs the whole chain on mono samples.
 * The input is never modified and the output is always a new array, so the
 * original stays available for A/B listening.
 * @param {Float32Array} samples mono signal
 * @param {number} sampleRateHz sample rate of `samples`
 * @returns {Float32Array} the processed signal, a new array
 */
// eslint-disable-next-line no-unused-vars -- the links added from F1.6 on use it.
export function processSignal(samples, sampleRateHz) {
  // No links yet: a copy. sampleRateHz is already part of the signature
  // because the links added from F1.6 on need it.
  return Float32Array.from(samples);
}
