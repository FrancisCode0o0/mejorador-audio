// Tests for web/dsp/pipeline.js (plan step F1.4). Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { processSignal } from "../../web/dsp/pipeline.js";

const SAMPLE_RATE_HZ = 48000;

test("with no links the output equals the input, because an empty chain must not change the sound", () => {
  const input = Float32Array.of(0.25, -0.5, 1, 0);
  assert.deepEqual(processSignal(input, SAMPLE_RATE_HZ), input);
});

test("the output is a new object and changing it leaves the input untouched, because the original is needed for A/B listening", () => {
  const input = Float32Array.of(0.25, -0.5);
  const output = processSignal(input, SAMPLE_RATE_HZ);
  assert.notEqual(output, input);
  output[0] = 9;
  assert.equal(input[0], 0.25);
});
