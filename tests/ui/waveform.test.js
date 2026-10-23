// Tests for computeColumnPeaks in web/ui/waveform.js (plan step F1.3). Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeColumnPeaks } from "../../web/ui/waveform.js";

test("[0,1,-1,0.5] in 2 columns gives min [0,-1] and max [1,0.5]; all values are exact in float32, so the tolerance is zero", () => {
  const { min, max } = computeColumnPeaks(Float32Array.of(0, 1, -1, 0.5), 2);
  assert.deepEqual(min, Float32Array.of(0, -1));
  assert.deepEqual(max, Float32Array.of(1, 0.5));
});

test("more columns than samples does not throw and every sample is covered, because a short file on a wide screen must still draw", () => {
  const samples = Float32Array.of(0.5, -0.25, 0.75);
  const { min, max } = computeColumnPeaks(samples, 10);
  assert.equal(min.length, 10);
  assert.equal(max.length, 10);
  // Each sample is alone in its group, so it appears as the min and max of one column.
  const coveredValues = [];
  for (let column = 0; column < 10; column++) {
    if (min[column] !== 0 || max[column] !== 0) {
      assert.equal(min[column], max[column]);
      coveredValues.push(max[column]);
    }
  }
  assert.deepEqual(coveredValues, [0.5, -0.25, 0.75]);
});

test("a constant signal gives min = max in every column, because a group of equal samples has no spread", () => {
  const { min, max } = computeColumnPeaks(new Float32Array(10).fill(0.5), 3);
  assert.deepEqual(min, Float32Array.of(0.5, 0.5, 0.5));
  assert.deepEqual(max, min);
});

test("an odd split (7 samples, 3 columns) still covers every sample once: the global min and max survive, because the groups must not drop the last samples", () => {
  const samples = Float32Array.of(0, 0, -0.5, 0, 0, 0, 0.5);
  const { min, max } = computeColumnPeaks(samples, 3);
  assert.equal(Math.min(...min), -0.5);
  assert.equal(Math.max(...max), 0.5);
});
