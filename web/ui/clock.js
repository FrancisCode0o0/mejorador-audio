// clock.js — the playback clock text "m:ss elapsed / −m:ss remaining".
// Plan step: F1.7 (Fran's request of 2026-10-23). Pure: no DOM, no texts.

const SECONDS_PER_MINUTE = 60;
const SECOND_DIGITS = 2;
// U+2212 MINUS SIGN, not the hyphen: it has the width of the plus sign, so the
// remaining time lines up with the elapsed time in a tabular-number font.
const MINUS_SIGN = "−";
const SEPARATOR = " / ";

/**
 * Formats the clock of the player, e.g. (3.7, 80) → "0:03 / −1:17".
 * Elapsed is floored to whole seconds and remaining is ceil(total − elapsed),
 * so the clock shows the whole length at the start and "−0:00" at the end, and
 * the two never jump together. Minutes are not capped at 59 (62:05 stays so).
 * @param {number} elapsedSeconds clamped to [0, totalSeconds]; NaN counts as 0
 * @param {number} totalSeconds length of the sound; NaN or negative counts as 0
 * @returns {string}
 */
export function formatClock(elapsedSeconds, totalSeconds) {
  const total = Number.isNaN(totalSeconds) ? 0 : Math.max(0, totalSeconds);
  const elapsed = Number.isNaN(elapsedSeconds) ? 0 : Math.min(total, Math.max(0, elapsedSeconds));
  const elapsedText = formatMinutesSeconds(Math.floor(elapsed));
  const remainingText = formatMinutesSeconds(Math.ceil(total - elapsed));
  return `${elapsedText}${SEPARATOR}${MINUS_SIGN}${remainingText}`;
}

function formatMinutesSeconds(wholeSeconds) {
  const minutes = Math.floor(wholeSeconds / SECONDS_PER_MINUTE);
  const seconds = wholeSeconds % SECONDS_PER_MINUTE;
  return `${minutes}:${String(seconds).padStart(SECOND_DIGITS, "0")}`;
}
