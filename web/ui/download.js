// download.js — builds the WAV of a signal and offers it as a file download.
// Plan step: F1.5 (download of the processed signal as a WAV file); moved out of
// app.js in F1.7 to keep app.js short, with the same behaviour.

import { encodeWavMono16 } from "../io/wav.js";
import { t } from "../i18n.js";

const WAV_MIME_TYPE = "audio/wav";
const WAV_EXTENSION = ".wav";
// Safari may still be starting the download when click() returns; revoking the
// URL at once could cancel it. 10 s is far longer than that start-up.
const OBJECT_URL_REVOKE_DELAY_MS = 10000;

/**
 * Downloads mono samples as a 16-bit WAV named "<name>-procesado.wav". The WAV
 * is built at call time and not kept: it would be a second copy of the audio.
 * @param {Float32Array} samples
 * @param {number} sampleRateHz
 * @param {string} chosenFileName name of the file the user chose, used to name the download
 */
export function downloadWav(samples, sampleRateHz, chosenFileName) {
  const wav = encodeWavMono16(samples, sampleRateHz);
  const url = URL.createObjectURL(new Blob([wav], { type: WAV_MIME_TYPE }));
  const link = document.createElement("a");
  link.href = url;
  link.download = downloadFileName(chosenFileName);
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_REVOKE_DELAY_MS);
}

// "voz.m4a" → "voz-procesado.wav"; a name without a dot keeps all of it.
// A leading dot (".hidden") is not an extension separator.
function downloadFileName(fileName) {
  const lastDotIndex = fileName.lastIndexOf(".");
  const baseName = lastDotIndex > 0 ? fileName.slice(0, lastDotIndex) : fileName;
  return `${baseName}-${t("export.fileSuffix")}${WAV_EXTENSION}`;
}
