// wav.js — writes a mono 16-bit PCM WAV file by hand (pure: no DOM, no Web Audio).
// Plan step: F1.5 (export the processed signal as a WAV file).
// Source: Microsoft RIFF/WAVE specification (1991), WAVE_FORMAT_PCM, canonical
// 44-byte header. All multi-byte fields are little-endian.

const RIFF_TAG = "RIFF";
const WAVE_TAG = "WAVE";
const FORMAT_CHUNK_TAG = "fmt ";
const DATA_CHUNK_TAG = "data";

const HEADER_BYTES = 44; // canonical header: RIFF chunk header + "WAVE" + fmt chunk + data chunk header
const RIFF_SIZE_FIELD_OVERHEAD_BYTES = 36; // RIFF size = this + data bytes (header without the first 8 bytes)
const FORMAT_CHUNK_SIZE_BYTES = 16; // PCM format chunk, no extension
const WAVE_FORMAT_PCM = 1; // format code, Microsoft RIFF spec 1991
const CHANNEL_COUNT = 1; // mono
const BITS_PER_SAMPLE = 16;
const BYTES_PER_SAMPLE = 2;
const MAX_UINT32 = 0xffffffff; // size fields are unsigned 32-bit

// Scale of the plan: full scale 1.0 maps to 32767, so -1.0 maps to -32767 and
// the code -32768 is never produced (the conversion stays symmetric).
const INT16_SCALE = 32767;
const CLIP_LIMIT = 1;

/**
 * Converts one float sample to a 16-bit integer: NaN → 0, clipped to [−1, 1],
 * scaled by 32767 and rounded to the nearest integer (halves away from zero
 * for positive values, as Math.round).
 * @param {number} sample
 * @returns {number}
 */
export function floatToInt16(sample) {
  if (Number.isNaN(sample)) return 0;
  const clipped = Math.min(CLIP_LIMIT, Math.max(-CLIP_LIMIT, sample));
  // `+ 0` turns −0 into 0, so a tiny negative sample gives the same code as silence.
  return Math.round(clipped * INT16_SCALE) + 0;
}

/**
 * Builds a mono 16-bit PCM WAV file.
 * @param {Float32Array} samples
 * @param {number} sampleRateHz positive integer
 * @returns {ArrayBuffer}
 * @throws {RangeError} if the rate is not a positive integer or the data does not fit in the size fields
 */
export function encodeWavMono16(samples, sampleRateHz) {
  if (!Number.isInteger(sampleRateHz) || sampleRateHz <= 0) {
    throw new RangeError("sampleRateHz must be a positive integer");
  }
  const dataBytes = samples.length * BYTES_PER_SAMPLE;
  if (dataBytes > MAX_UINT32 - RIFF_SIZE_FIELD_OVERHEAD_BYTES) {
    throw new RangeError("the signal is too long for a WAV file");
  }
  const buffer = new ArrayBuffer(HEADER_BYTES + dataBytes);
  const view = new DataView(buffer);
  writeHeader(view, sampleRateHz, dataBytes);
  for (let index = 0; index < samples.length; index++) {
    view.setInt16(HEADER_BYTES + index * BYTES_PER_SAMPLE, floatToInt16(samples[index]), true);
  }
  return buffer;
}

function writeHeader(view, sampleRateHz, dataBytes) {
  const blockAlignBytes = CHANNEL_COUNT * BYTES_PER_SAMPLE;
  writeTag(view, 0, RIFF_TAG);
  view.setUint32(4, RIFF_SIZE_FIELD_OVERHEAD_BYTES + dataBytes, true);
  writeTag(view, 8, WAVE_TAG);
  writeTag(view, 12, FORMAT_CHUNK_TAG);
  view.setUint32(16, FORMAT_CHUNK_SIZE_BYTES, true);
  view.setUint16(20, WAVE_FORMAT_PCM, true);
  view.setUint16(22, CHANNEL_COUNT, true);
  view.setUint32(24, sampleRateHz, true);
  view.setUint32(28, sampleRateHz * blockAlignBytes, true); // byte rate
  view.setUint16(32, blockAlignBytes, true);
  view.setUint16(34, BITS_PER_SAMPLE, true);
  writeTag(view, 36, DATA_CHUNK_TAG);
  view.setUint32(40, dataBytes, true);
}

function writeTag(view, offsetBytes, tag) {
  for (let index = 0; index < tag.length; index++) {
    view.setUint8(offsetBytes + index, tag.charCodeAt(index));
  }
}
