// app.js — page controller: file input, decoding, mono 48 kHz, and the summaries.
// Plan step: F1.1 (choose a file and show what the browser decoded) and
// F1.2 (mono mix and resampling to 48 kHz, shown as "Procesado").

import { decodeAudioFile, DECODE_ERROR_CODES } from "../io/decode.js";
import { resampleTo48k, RESAMPLE_ERROR_CODES, TARGET_SAMPLE_RATE_HZ } from "../io/resample.js";
import { mixToMono } from "../dsp/mono.js";
import { drawWaveform } from "./waveform.js";
import { t } from "../i18n.js";

const DURATION_DECIMALS = 2;
const PROCESSED_CHANNEL_COUNT = 1;

// Increases on every change event. Decoding is asynchronous and its duration
// depends on the file, so an older file can finish after a newer one; a result
// is shown only if its number is still the latest, otherwise the old file's
// summary would overwrite the file the user chose last. It is checked after
// every await, in the decode step and in the resample step.
let latestChoiceNumber = 0;

const ERROR_TEXT_KEYS = {
  [DECODE_ERROR_CODES.noAudioContext]: "error.noAudioContext",
  [DECODE_ERROR_CODES.readFailed]: "error.readFailed",
  [DECODE_ERROR_CODES.decodeFailed]: "error.decodeFailed",
  [RESAMPLE_ERROR_CODES.resampleFailed]: "error.resampleFailed",
};

const fileInput = document.getElementById("file-input");
const fileLabel = document.getElementById("file-label");
const statusMessage = document.getElementById("status");
const summaryList = document.getElementById("summary");
const processedHeading = document.getElementById("processed-heading");
const processedList = document.getElementById("processed");
const waveformCanvas = document.getElementById("waveform");

// The mono 48 kHz signal that later links will process. The AudioBuffer is
// not kept: it holds every channel at the source rate and is not needed again.
let monoSamples48k = null;

document.title = t("page.title");
document.getElementById("heading").textContent = t("page.heading");
fileLabel.textContent = t("file.label");
processedHeading.textContent = t("processed.heading");
waveformCanvas.setAttribute("aria-label", t("waveform.label"));
fileInput.addEventListener("change", onFileChosen);
window.addEventListener("resize", redrawWaveform);

function onFileChosen() {
  const file = fileInput.files[0];
  if (!file) return;
  latestChoiceNumber += 1;
  const choiceNumber = latestChoiceNumber;
  clearResult();
  statusMessage.textContent = t("file.decoding");
  // Called synchronously from the event so the AudioContext starts in the gesture.
  const decoding = decodeAudioFile(file);
  processFile(file, decoding, choiceNumber).catch((error) => {
    if (choiceNumber === latestChoiceNumber) showError(error);
  });
}

async function processFile(file, decoding, choiceNumber) {
  const audioBuffer = await decoding;
  if (choiceNumber !== latestChoiceNumber) return;
  showRows(summaryList, [
    ["info.name", file.name],
    ["info.duration", formatDuration(audioBuffer.duration)],
    ["info.channels", String(audioBuffer.numberOfChannels)],
    ["info.sampleRate", formatHertz(audioBuffer.sampleRate)],
  ]);
  const mono = mixToMono(getChannels(audioBuffer));
  const samples = await resampleTo48k(mono, audioBuffer.sampleRate);
  if (choiceNumber !== latestChoiceNumber) return;
  monoSamples48k = samples;
  statusMessage.textContent = "";
  processedHeading.hidden = false;
  showRows(processedList, [
    ["info.channels", String(PROCESSED_CHANNEL_COUNT)],
    ["info.sampleRate", formatHertz(TARGET_SAMPLE_RATE_HZ)],
    ["info.duration", formatDuration(samples.length / TARGET_SAMPLE_RATE_HZ)],
  ]);
  // Unhide first: a hidden canvas has zero width, so nothing could be drawn.
  waveformCanvas.hidden = false;
  redrawWaveform();
}

function redrawWaveform() {
  if (monoSamples48k) drawWaveform(waveformCanvas, monoSamples48k);
}

function getChannels(audioBuffer) {
  const channels = [];
  for (let index = 0; index < audioBuffer.numberOfChannels; index++) {
    channels.push(audioBuffer.getChannelData(index));
  }
  return channels;
}

function formatDuration(seconds) {
  return `${seconds.toFixed(DURATION_DECIMALS)} ${t("unit.seconds")}`;
}

function formatHertz(hertz) {
  return `${hertz} ${t("unit.hertz")}`;
}

function showRows(listElement, rows) {
  for (const [labelKey, value] of rows) {
    const term = document.createElement("dt");
    term.textContent = t(labelKey);
    const description = document.createElement("dd");
    description.textContent = value;
    listElement.append(term, description);
  }
}

function showError(error) {
  const textKey = ERROR_TEXT_KEYS[error.code] ?? "error.decodeFailed";
  statusMessage.textContent = t(textKey);
}

function clearResult() {
  monoSamples48k = null;
  statusMessage.textContent = "";
  processedHeading.hidden = true;
  summaryList.replaceChildren();
  processedList.replaceChildren();
  waveformCanvas.getContext("2d").clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
  waveformCanvas.hidden = true;
}
