// resample.js — converts mono samples to 48 kHz with the browser's resampler.
// Plan step: F1.2 (mono 48 kHz). Source: Web Audio API, OfflineAudioContext.
// Like decode.js, it has no visible texts: errors carry a `code` for the UI.

export const TARGET_SAMPLE_RATE_HZ = 48000;

export const RESAMPLE_ERROR_CODES = Object.freeze({
  resampleFailed: "resample-failed",
});

const MONO_CHANNEL_COUNT = 1;

/**
 * Resamples mono samples to 48 kHz.
 * @param {Float32Array} samples
 * @param {number} sourceSampleRateHz
 * @returns {Promise<Float32Array>} the same array if already at 48 kHz;
 *   otherwise the resampled one. Rejects with an Error whose `code` is
 *   RESAMPLE_ERROR_CODES.resampleFailed if rendering fails.
 */
export async function resampleTo48k(samples, sourceSampleRateHz) {
  if (sourceSampleRateHz === TARGET_SAMPLE_RATE_HZ) {
    return samples;
  }
  try {
    return await renderAtTargetRate(samples, sourceSampleRateHz);
  } catch (cause) {
    const error = new Error("Resampling failed", { cause });
    error.code = RESAMPLE_ERROR_CODES.resampleFailed;
    throw error;
  }
}

function renderAtTargetRate(samples, sourceSampleRateHz) {
  // Positional constructor: older Safari only has the prefixed class and
  // does not accept an options object.
  const OfflineContextClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const outputLength = Math.ceil((samples.length * TARGET_SAMPLE_RATE_HZ) / sourceSampleRateHz);
  const offlineContext = new OfflineContextClass(
    MONO_CHANNEL_COUNT,
    outputLength,
    TARGET_SAMPLE_RATE_HZ,
  );
  const sourceBuffer = offlineContext.createBuffer(
    MONO_CHANNEL_COUNT,
    samples.length,
    sourceSampleRateHz,
  );
  sourceBuffer.copyToChannel(samples, 0);
  const sourceNode = offlineContext.createBufferSource();
  sourceNode.buffer = sourceBuffer;
  sourceNode.connect(offlineContext.destination);
  sourceNode.start();
  // The oncomplete event works everywhere; the promise form of
  // startRendering() is missing in older Safari.
  return new Promise((resolve, reject) => {
    offlineContext.oncomplete = (event) => resolve(event.renderedBuffer.getChannelData(0));
    try {
      const rendering = offlineContext.startRendering();
      if (rendering) rendering.catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}
