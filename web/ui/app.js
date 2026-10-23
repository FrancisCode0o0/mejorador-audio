// app.js — page controller: file input, decoding, and the file summary.
// Plan step: F1.1 (choose a file and show what the browser decoded).

import { decodeAudioFile, DECODE_ERROR_CODES } from "../io/decode.js";
import { t } from "../i18n.js";

const DURATION_DECIMALS = 2;

// Increases on every change event. Decoding is asynchronous and its duration
// depends on the file, so an older file can finish after a newer one; a result
// is shown only if its number is still the latest, otherwise the old file's
// summary would overwrite the file the user chose last.
let latestChoiceNumber = 0;

const ERROR_TEXT_KEYS = {
  [DECODE_ERROR_CODES.noAudioContext]: "error.noAudioContext",
  [DECODE_ERROR_CODES.readFailed]: "error.readFailed",
  [DECODE_ERROR_CODES.decodeFailed]: "error.decodeFailed",
};

const fileInput = document.getElementById("file-input");
const fileLabel = document.getElementById("file-label");
const statusMessage = document.getElementById("status");
const summaryList = document.getElementById("summary");

document.title = t("page.title");
document.getElementById("heading").textContent = t("page.heading");
fileLabel.textContent = t("file.label");
fileInput.addEventListener("change", onFileChosen);

function onFileChosen() {
  const file = fileInput.files[0];
  if (!file) return;
  latestChoiceNumber += 1;
  const choiceNumber = latestChoiceNumber;
  clearResult();
  statusMessage.textContent = t("file.decoding");
  // Called synchronously from the event so the AudioContext starts in the gesture.
  decodeAudioFile(file).then(
    (audioBuffer) => {
      if (choiceNumber === latestChoiceNumber) showSummary(file, audioBuffer);
    },
    (error) => {
      if (choiceNumber === latestChoiceNumber) showError(error);
    },
  );
}

function showSummary(file, audioBuffer) {
  statusMessage.textContent = "";
  const rows = [
    ["info.name", file.name],
    ["info.duration", `${audioBuffer.duration.toFixed(DURATION_DECIMALS)} ${t("unit.seconds")}`],
    ["info.channels", String(audioBuffer.numberOfChannels)],
    ["info.sampleRate", `${audioBuffer.sampleRate} ${t("unit.hertz")}`],
  ];
  for (const [labelKey, value] of rows) {
    const term = document.createElement("dt");
    term.textContent = t(labelKey);
    const description = document.createElement("dd");
    description.textContent = value;
    summaryList.append(term, description);
  }
}

function showError(error) {
  const textKey = ERROR_TEXT_KEYS[error.code] ?? "error.decodeFailed";
  statusMessage.textContent = t(textKey);
}

function clearResult() {
  statusMessage.textContent = "";
  summaryList.replaceChildren();
}
