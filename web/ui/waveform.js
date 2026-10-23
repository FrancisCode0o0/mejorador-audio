// waveform.js — peak computation and canvas drawing of a waveform.
// Plan step: F1.3 (show the mono 48 kHz signal).
// computeColumnPeaks is pure (no DOM) so it can be tested in Node; the DOM is
// touched only inside drawWaveform.

const COLOR_PROPERTY = "--waveform-color";
const BACKGROUND_PROPERTY = "--waveform-background";
const FALLBACK_COLOR = "#1a73e8";
const FALLBACK_BACKGROUND = "#f1f3f4";
const FULL_SCALE = 1;
const MIN_LINE_HEIGHT_PX = 1; // so silence and single samples stay visible

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
 * Draws the waveform on a canvas: 0 in the vertical middle, +1 at the top and
 * -1 at the bottom. The canvas must be visible (a hidden canvas has no width).
 * Colours come from the CSS custom properties --waveform-color and
 * --waveform-background set on the canvas.
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

function clamp(value) {
  return Math.min(FULL_SCALE, Math.max(-FULL_SCALE, value));
}

function readColor(style, propertyName, fallback) {
  return style.getPropertyValue(propertyName).trim() || fallback;
}
