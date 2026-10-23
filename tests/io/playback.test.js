// Tests for the pure functions of web/io/playback.js (plan step F1.4b). Run: node --test
// Importing the module must not touch window: audio-context.js reads it only when called.
import { test } from "node:test";
import assert from "node:assert/strict";
import { computePlaybackPositionSeconds, resolveStartSeconds } from "../../web/io/playback.js";

const DURATION_SECONDS = 5;

test("start 1.0 s, 0.5 s elapsed (10.5 − 10.0) gives 1.5 s; the values are exact in float64, so the tolerance is zero", () => {
  assert.equal(computePlaybackPositionSeconds(1.0, 10.0, 10.5, DURATION_SECONDS), 1.5);
});

test("elapsed time beyond the end is clamped to the duration, because the bar must not pass its maximum while `ended` is pending", () => {
  assert.equal(
    computePlaybackPositionSeconds(1.0, 10.0, 100.0, DURATION_SECONDS),
    DURATION_SECONDS,
  );
});

test("now before startedAt gives the start position, because the context clock can lag while iOS resumes it", () => {
  assert.equal(computePlaybackPositionSeconds(1.0, 10.0, 9.0, DURATION_SECONDS), 1.0);
});

test("a requested start of −1 s resolves to 0, because a negative offset is invalid for start()", () => {
  assert.equal(resolveStartSeconds(-1, DURATION_SECONDS), 0);
});

test("a requested start equal to the duration resolves to 0, because playing from the end restarts from the beginning", () => {
  assert.equal(resolveStartSeconds(DURATION_SECONDS, DURATION_SECONDS), 0);
});

test("a requested start of 2.5 s in a 5 s signal is kept, because it is inside the signal", () => {
  assert.equal(resolveStartSeconds(2.5, DURATION_SECONDS), 2.5);
});
