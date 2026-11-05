// Tests for formatClock in web/ui/clock.js (plan step F1.7). Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatClock } from "../../web/ui/clock.js";

// The expected texts use U+2212 (not a hyphen); the comparison is exact, so the tolerance is zero.

test("(0, 80) gives '0:00 / −1:20': at the start the clock shows the whole length; exact string match, because the text is the contract", () => {
  assert.equal(formatClock(0, 80), "0:00 / −1:20");
});

test("(3.7, 80) gives '0:03 / −1:17': elapsed is floored (3.7 → 3) and remaining is ceil(76.3) = 77; exact match, because the two must round in opposite directions", () => {
  assert.equal(formatClock(3.7, 80), "0:03 / −1:17");
});

test("(80, 80) gives '1:20 / −0:00': at the end nothing remains; exact match, because the clock must not show a leftover second", () => {
  assert.equal(formatClock(80, 80), "1:20 / −0:00");
});

test("(3725, 3725) gives '62:05 / −0:00': minutes are not capped at 59 and seconds keep two digits; exact match, because long files must not wrap to hours", () => {
  assert.equal(formatClock(3725, 3725), "62:05 / −0:00");
});

test("a negative elapsed time is treated as 0, because a seek before the start must not show a negative clock; exact match", () => {
  assert.equal(formatClock(-5, 80), formatClock(0, 80));
  assert.equal(formatClock(-5, 80), "0:00 / −1:20");
});

test("a NaN elapsed time is treated as 0, because an unset position must not print 'NaN'; exact match", () => {
  assert.equal(formatClock(Number.NaN, 80), "0:00 / −1:20");
});

test("an elapsed time above the total is clamped to the total, because the end of the sound is the last position; exact match", () => {
  assert.equal(formatClock(95, 80), "1:20 / −0:00");
});

test("a fractional total rounds the remaining time up: (0, 80.2) gives '0:00 / −1:21', because a started second still counts as remaining; exact match", () => {
  assert.equal(formatClock(0, 80.2), "0:00 / −1:21");
});
