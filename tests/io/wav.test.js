// Tests for web/io/wav.js (plan step F1.5). Run: node --test
// The reference vectors come from tests/ref/wav_ref.py (soundfile / libsndfile).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { encodeWavMono16, floatToInt16 } from "../../web/io/wav.js";

const vectors = JSON.parse(readFileSync(new URL("../ref/vectors/wav.json", import.meta.url)));

const SILENT_SAMPLE_COUNT = 3;
const SILENT_RATE_HZ = 48000;
const HEADER_BYTES = 44;
const BYTES_PER_SAMPLE = 2;
const HEX_BYTE_RADIX = 16;

for (const referenceCase of vectors.cases) {
  test(`${referenceCase.name}: the file equals the soundfile file byte for byte; the tolerance is zero, because both are integer data`, () => {
    const wav = encodeWavMono16(Float32Array.from(referenceCase.input), referenceCase.sampleRateHz);
    assert.equal(toHex(wav), referenceCase.expectedWavHex);
  });

  test(`${referenceCase.name}: floatToInt16 equals the reference codes; the tolerance is zero, because the rounding rule is exact`, () => {
    const codes = referenceCase.input.map((sample) => floatToInt16(sample));
    assert.deepEqual(codes, referenceCase.expectedInt16);
  });
}

test("header of 3 silent samples at 48 kHz has the canonical fields; the tolerance is zero, because every field is an exact integer or tag", () => {
  const wav = encodeWavMono16(new Float32Array(SILENT_SAMPLE_COUNT), SILENT_RATE_HZ);
  const view = new DataView(wav);
  assert.equal(wav.byteLength, 50);
  assert.equal(readTag(view, 0), "RIFF");
  assert.equal(view.getUint32(4, true), 42);
  assert.equal(readTag(view, 8), "WAVE");
  assert.equal(readTag(view, 12), "fmt ");
  assert.equal(view.getUint32(16, true), 16);
  assert.equal(view.getUint16(20, true), 1);
  assert.equal(view.getUint16(22, true), 1);
  assert.equal(view.getUint32(24, true), 48000);
  assert.equal(view.getUint32(28, true), 96000);
  assert.equal(view.getUint16(32, true), 2);
  assert.equal(view.getUint16(34, true), 16);
  assert.equal(readTag(view, 36), "data");
  assert.equal(view.getUint32(40, true), 6);
  assert.equal(wav.byteLength, HEADER_BYTES + SILENT_SAMPLE_COUNT * BYTES_PER_SAMPLE);
});

test("NaN gives 0; the tolerance is zero, because a NaN must never reach the file as noise", () => {
  assert.equal(floatToInt16(NaN), 0);
});

test("Infinity gives 32767 and −Infinity gives −32767; the tolerance is zero, because they clip to full scale", () => {
  assert.equal(floatToInt16(Infinity), 32767);
  assert.equal(floatToInt16(-Infinity), -32767);
});

test("−1e-9 gives +0 (Object.is); the tolerance is zero, because Math.round alone would return −0", () => {
  assert.ok(Object.is(floatToInt16(-1e-9), 0));
});

test("sample rate 0 throws RangeError, because a WAV file needs a positive rate", () => {
  assert.throws(() => encodeWavMono16(new Float32Array(1), 0), RangeError);
});

test("sample rate 44100.5 throws RangeError, because the header field is an integer", () => {
  assert.throws(() => encodeWavMono16(new Float32Array(1), 44100.5), RangeError);
});

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(HEX_BYTE_RADIX).padStart(2, "0"),
  ).join("");
}

function readTag(view, offsetBytes) {
  const tagLength = 4;
  let tag = "";
  for (let index = 0; index < tagLength; index++) {
    tag += String.fromCharCode(view.getUint8(offsetBytes + index));
  }
  return tag;
}
