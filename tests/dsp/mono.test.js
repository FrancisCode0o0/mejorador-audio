// Tests for web/dsp/mono.js (plan step F1.2). Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { mixToMono } from "../../web/dsp/mono.js";

test("stereo is averaged per sample: [1,0,-1] and [0,0,1] give [0.5,0,0]; these values are exact in float32, so the tolerance is zero", () => {
  const left = Float32Array.of(1, 0, -1);
  const right = Float32Array.of(0, 0, 1);
  assert.deepEqual(mixToMono([left, right]), Float32Array.of(0.5, 0, 0));
});

test("one channel returns an equal copy, because dividing by 1 must not change any sample", () => {
  const input = Float32Array.of(0.25, -0.5, 0.125);
  const output = mixToMono([input]);
  assert.deepEqual(output, input);
});

test("one channel returns a new object, so the caller can modify the result without touching the decoded data", () => {
  const input = Float32Array.of(0.25, -0.5);
  const output = mixToMono([input]);
  assert.notEqual(output, input);
  output[0] = 9;
  assert.equal(input[0], 0.25);
});

test("length is preserved (here 5 samples from 3 channels), because later links assume one sample per input sample", () => {
  const channel = new Float32Array(5);
  assert.equal(mixToMono([channel, channel, channel]).length, 5);
});

test("three channels are averaged: [3],[0],[0] give [1]; checks the generalisation to N channels", () => {
  const output = mixToMono([Float32Array.of(3), Float32Array.of(0), Float32Array.of(0)]);
  assert.deepEqual(output, Float32Array.of(1));
});

test("no channels or unequal lengths throw RangeError, because silently mixing them would hide a decoder bug", () => {
  assert.throws(() => mixToMono([]), RangeError);
  assert.throws(() => mixToMono([new Float32Array(2), new Float32Array(3)]), RangeError);
});
