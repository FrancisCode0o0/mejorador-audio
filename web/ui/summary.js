// summary.js — formatting and listing of the file summaries (name, duration, rate…).
// Plan step: F1.7 (moved out of app.js, unchanged, to keep app.js short); the
// functions come from F1.1 and F1.2.

import { t } from "../i18n.js";

const DURATION_DECIMALS = 2;

/**
 * Formats a length in seconds with two decimals and the unit text.
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  return `${seconds.toFixed(DURATION_DECIMALS)} ${t("unit.seconds")}`;
}

/**
 * Formats a frequency in hertz with the unit text.
 * @param {number} hertz
 * @returns {string}
 */
export function formatHertz(hertz) {
  return `${hertz} ${t("unit.hertz")}`;
}

/**
 * Appends one <dt>/<dd> pair per row to a <dl>.
 * @param {HTMLElement} listElement
 * @param {Array<[string, string]>} rows [text key of the label, value text]
 */
export function showRows(listElement, rows) {
  for (const [labelKey, value] of rows) {
    const term = document.createElement("dt");
    term.textContent = t(labelKey);
    const description = document.createElement("dd");
    description.textContent = value;
    listElement.append(term, description);
  }
}
