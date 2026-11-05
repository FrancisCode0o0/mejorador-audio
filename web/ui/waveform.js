// waveform.js — peak computation, canvas drawing of one waveform, the wiring of
// the two waveform rows, and the playhead / pointer helpers.
// Plan step: F1.3 (show the mono 48 kHz signal); F1.7 (original and processed in
// two rows, playhead over both, seek by pointer). Each row has its own canvas
// drawn with drawWaveform on the same ±1 scale, so the difference in height
// between the rows is the effect of processing.
// computeColumnPeaks and fractionFromPointer are pure (no DOM) so they can be
// tested in Node; the DOM is touched only by the other functions.

import { t } from "../i18n.js";

const COLOR_PROPERTY = "--waveform-color";
const BACKGROUND_PROPERTY = "--waveform-background";
const FALLBACK_COLOR = "#1a73e8";
const FALLBACK_BACKGROUND = "#f1f3f4";
const ORIGINAL_ROW_SELECTOR = "#row-original";
const PROCESSED_ROW_SELECTOR = "#row-processed";
const PLAYHEAD_SELECTOR = "#playhead";
const CANVAS_SELECTOR = "canvas";
const NAME_SELECTOR = ".waveform-name";
const ACTIVE_CLASS = "is-active";
const FULL_SCALE = 1;
const MIN_LINE_HEIGHT_PX = 1; // so silence and single samples stay visible
const PERCENT = 100;

/**
 * Splits the samples into `columnCount` consecutive groups and returns the
 * minimum and maximum of each. Group c covers [floor(c*n/columns),
 * floor((c+1)*n/columns)), so every sample belongs to exactly one group and
 * group sizes differ by at most one. With more columns than samples some
 * groups are empty; those get min = max = 0 (a flat line at the middle).
 * @param {Float32Array} samples
 * @param {number} columnCount positive integer
 * @returns {{min: Float32Array, max: Float32Array}}
 */
export function computeColumnPeaks(samples, columnCount) {
  const min = new Float32Array(columnCount);
  const max = new Float32Array(columnCount);
  for (let column = 0; column < columnCount; column++) {
    const start = Math.floor((column * samples.length) / columnCount);
    const end = Math.floor(((column + 1) * samples.length) / columnCount);
    if (end === start) continue;
    let low = samples[start];
    let high = samples[start];
    for (let i = start + 1; i < end; i++) {
      if (samples[i] < low) low = samples[i];
      if (samples[i] > high) high = samples[i];
    }
    min[column] = low;
    max[column] = high;
  }
  return { min, max };
}

/**
 * Draws one waveform on a canvas: 0 in the vertical middle, +1 at the top and
 * -1 at the bottom. Every row uses this same scale, so a row for the original
 * and a row for the processed signal can be compared by height. The canvas must
 * be visible (a hidden canvas has no width). Colours come from the CSS custom
 * properties --waveform-color (the row's own) and --waveform-background, set on
 * the canvas or inherited from an ancestor.
 * @param {HTMLCanvasElement} canvas
 * @param {Float32Array} samples
 */
export function drawWaveform(canvas, samples) {
  const pixelRatio = window.devicePixelRatio || 1;
  // One peak pair per device pixel column, so lines are never blurred by scaling.
  canvas.width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
  canvas.height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
  const context = canvas.getContext("2d");
  const style = getComputedStyle(canvas);
  context.fillStyle = readColor(style, BACKGROUND_PROPERTY, FALLBACK_BACKGROUND);
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = readColor(style, COLOR_PROPERTY, FALLBACK_COLOR);

  const { min, max } = computeColumnPeaks(samples, canvas.width);
  const halfHeight = canvas.height / 2;
  for (let x = 0; x < canvas.width; x++) {
    const top = halfHeight - clamp(max[x]) * halfHeight;
    const bottom = halfHeight - clamp(min[x]) * halfHeight;
    context.fillRect(x, top, 1, Math.max(MIN_LINE_HEIGHT_PX, bottom - top));
  }
}

/**
 * Wires the waveform box: sets the texts of the two rows (name on the row,
 * accessible label of the canvas) and of the box (seek hint) from i18n, and
 * returns the operations the page needs on it. A row is a .waveform-row element
 * with one canvas and one .waveform-name span; the playhead is one element over
 * both rows.
 * @param {HTMLElement} boxElement the #waveform-box element
 * @returns {{
 *   draw: (originalSamples: Float32Array, processedSamples: Float32Array) => void,
 *   clear: () => void,
 *   setActive: (originalActive: boolean, processedActive: boolean) => void,
 *   placePlayhead: (fraction: number) => void,
 *   fractionAt: (clientX: number) => number,
 * }}
 */
export function createWaveformRows(boxElement) {
  const originalRow = boxElement.querySelector(ORIGINAL_ROW_SELECTOR);
  const processedRow = boxElement.querySelector(PROCESSED_ROW_SELECTOR);
  const playheadElement = boxElement.querySelector(PLAYHEAD_SELECTOR);
  boxElement.title = t("waveform.seekHint");
  setRowTexts(originalRow, t("waveform.originalName"), t("waveform.originalLabel"));
  setRowTexts(processedRow, t("waveform.processedName"), t("waveform.processedLabel"));
  return {
    draw(originalSamples, processedSamples) {
      drawWaveform(originalRow.querySelector(CANVAS_SELECTOR), originalSamples);
      drawWaveform(processedRow.querySelector(CANVAS_SELECTOR), processedSamples);
    },
    clear() {
      for (const row of [originalRow, processedRow]) {
        const canvas = row.querySelector(CANVAS_SELECTOR);
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      }
    },
    setActive(originalActive, processedActive) {
      originalRow.classList.toggle(ACTIVE_CLASS, originalActive);
      processedRow.classList.toggle(ACTIVE_CLASS, processedActive);
    },
    placePlayhead: (fraction) => placePlayhead(playheadElement, fraction),
    fractionAt(clientX) {
      const box = boxElement.getBoundingClientRect();
      return fractionFromPointer(clientX, box.left, box.width);
    },
  };
}

/**
 * Position of a pointer along a box, as a fraction of its width.
 * @param {number} clientX pointer x in viewport pixels
 * @param {number} left left edge of the box in viewport pixels
 * @param {number} width width of the box in pixels
 * @returns {number} (clientX − left) / width clamped to [0, 1]; 0 if width ≤ 0
 */
export function fractionFromPointer(clientX, left, width) {
  if (!(width > 0)) return 0;
  return clamp01((clientX - left) / width);
}

/**
 * Moves the playhead line to a fraction of the waveform width. The playhead is
 * a separate element on top of both rows: moving it only changes one CSS
 * property, while redrawing the waveforms 60 times a second would repaint
 * every pixel column for nothing.
 * @param {HTMLElement} playheadElement positioned absolutely inside the waveform box
 * @param {number} fraction clamped to [0, 1]
 */
export function placePlayhead(playheadElement, fraction) {
  playheadElement.style.left = `${clamp01(fraction) * PERCENT}%`;
}

function setRowTexts(rowElement, nameText, labelText) {
  rowElement.querySelector(NAME_SELECTOR).textContent = nameText;
  rowElement.querySelector(CANVAS_SELECTOR).setAttribute("aria-label", labelText);
}

function clamp(value) {
  return Math.min(FULL_SCALE, Math.max(-FULL_SCALE, value));
}

// NaN counts as 0 so a bad value cannot put the playhead outside the box.
function clamp01(value) {
  return Number.isNaN(value) ? 0 : Math.min(1, Math.max(0, value));
}

function readColor(style, propertyName, fallback) {
  return style.getPropertyValue(propertyName).trim() || fallback;
}
