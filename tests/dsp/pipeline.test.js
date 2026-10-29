// Tests for web/dsp/pipeline.js (plan steps F1.4 and F1.6). Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { processSignal } from "../../web/dsp/pipeline.js";
import { normalizePeak } from "../../web/dsp/peak-normalize.js";

const SAMPLE_RATE_HZ = 48000;

test("the output equals normalizePeak(input) with tolerance zero, because peak normalisation is the only link and it is the same computation", () => {
  const input = Float32Array.of(0.25, -0.5, 1, 0);
  assert.deepEqual(processSignal(input, SAMPLE_RATE_HZ), normalizePeak(input));
});

test("the output is a new object and changing it leaves the input untouched, because the original is needed for A/B listening", () => {
  const input = Float32Array.of(0.25, -0.5);
  const output = processSignal(input, SAMPLE_RATE_HZ);
  assert.notEqual(output, input);
  output[0] = 9;
  assert.equal(input[0], 0.25);
});
