// Tests for web/dsp/peak-normalize.js (plan step F1.6). Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { PEAK_TARGET_LINEAR, normalizePeak } from "../../web/dsp/peak-normalize.js";

// One float32 rounding: one float32 step near 0.89 is 2^-24 ≈ 6e-8, so 1e-7 allows
// exactly one rounding of the product and nothing more.
const FLOAT32_TOLERANCE = 1e-7;

// Compares sample by sample and names the index of the first difference.
function assertSamplesClose(actual, expected, tolerance) {
  assert.equal(actual.length, expected.length, "length");
  for (let index = 0; index < expected.length; index++) {
    const difference = Math.abs(actual[index] - expected[index]);
    assert.ok(
      difference <= tolerance,
      `sample ${index}: got ${actual[index]}, expected ${expected[index]}`,
    );
  }
}

test("20·log10(PEAK_TARGET_LINEAR) is within 0.05 dB of −1, because 0.89 is the plan's rounding of 10^(−1/20)", () => {
  const targetDb = 20 * Math.log10(PEAK_TARGET_LINEAR);
  assert.ok(Math.abs(targetDb - -1) <= 0.05, `target is ${targetDb} dB`);
});

test("[0.5, −0.25, 0.125] becomes [0.89, −0.445, 0.2225] within 1e-7, one float32 rounding", () => {
  const output = normalizePeak(Float32Array.of(0.5, -0.25, 0.125));
  assertSamplesClose(output, [0.89, -0.445, 0.2225], FLOAT32_TOLERANCE);
});

test("a negative peak is scaled to −0.89 within 1e-7, because the sign must be kept", () => {
  const output = normalizePeak(Float32Array.of(0.1, -0.5, 0.25));
  assertSamplesClose(output, [0.178, -0.89, 0.445], FLOAT32_TOLERANCE);
});

test("a signal above full scale ([1.2, −0.6]) becomes [0.89, −0.445] within 1e-7, because loud files must get quieter", () => {
  const output = normalizePeak(Float32Array.of(1.2, -0.6));
  assertSamplesClose(output, [0.89, -0.445], FLOAT32_TOLERANCE);
});

test("silence (4 zeros) stays exactly 4 zeros with tolerance zero, because 0.89 / 0 must not give NaN", () => {
  const output = normalizePeak(new Float32Array(4));
  assert.deepEqual(output, new Float32Array(4));
});

test("an empty input gives an output of length 0, because there is nothing to scale", () => {
  assert.equal(normalizePeak(new Float32Array(0)).length, 0);
});

test("the output is a new object and the input is unchanged for a normal signal, because the original is needed for A/B listening", () => {
  const input = Float32Array.of(0.5, -0.25);
  const output = normalizePeak(input);
  assert.notEqual(output, input);
  assert.deepEqual(input, Float32Array.of(0.5, -0.25));
});

test("the output is a new object and the input is unchanged for silence, because the silent branch copies too", () => {
  const input = new Float32Array(3);
  const output = normalizePeak(input);
  assert.notEqual(output, input);
  output[0] = 9;
  assert.deepEqual(input, new Float32Array(3));
});
