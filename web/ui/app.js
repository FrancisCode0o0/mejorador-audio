// app.js — page controller: file input, decoding, mono 48 kHz, and the summaries.
// Plan step: F1.1 (choose a file and show what the browser decoded) and
// F1.2 (mono mix and resampling to 48 kHz, shown as "Procesado"),
// F1.4 (processing chain and A/B playback of original and processed).

import { decodeAudioFile, DECODE_ERROR_CODES } from "../io/decode.js";
import { resampleTo48k, RESAMPLE_ERROR_CODES, TARGET_SAMPLE_RATE_HZ } from "../io/resample.js";
import { mixToMono } from "../dsp/mono.js";
import { processSignal } from "../dsp/pipeline.js";
import { playSamples, stopPlayback } from "../io/playback.js";
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

const PLAYBACK_ERROR_TEXT_KEY = "error.noAudioContext";

const fileInput = document.getElementById("file-input");
const fileLabel = document.getElementById("file-label");
const statusMessage = document.getElementById("status");
const summaryList = document.getElementById("summary");
const processedHeading = document.getElementById("processed-heading");
const processedList = document.getElementById("processed");
const waveformCanvas = document.getElementById("waveform");
const playOriginalButton = document.getElementById("play-original");
const playProcessedButton = document.getElementById("play-processed");
const stopButton = document.getElementById("stop");
const playbackButtons = [playOriginalButton, playProcessedButton, stopButton];

// The mono 48 kHz signal and its processed version. The AudioBuffer is not
// kept: it holds every channel at the source rate and is not needed again.
let originalSamples48k = null;
let processedSamples48k = null;

document.title = t("page.title");
document.getElementById("heading").textContent = t("page.heading");
fileLabel.textContent = t("file.label");
processedHeading.textContent = t("processed.heading");
waveformCanvas.setAttribute("aria-label", t("waveform.label"));
playOriginalButton.textContent = t("play.original");
playProcessedButton.textContent = t("play.processed");
stopButton.textContent = t("play.stop");
playOriginalButton.addEventListener("click", () => startPlayback(playOriginalButton, originalSamples48k));
playProcessedButton.addEventListener("click", () => startPlayback(playProcessedButton, processedSamples48k));
stopButton.addEventListener("click", stopPlayback);
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
  originalSamples48k = samples;
  processedSamples48k = processSignal(samples, TARGET_SAMPLE_RATE_HZ);
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
  setPlaybackEnabled(true);
}

function redrawWaveform() {
  if (processedSamples48k) drawWaveform(waveformCanvas, processedSamples48k);
}

function startPlayback(button, samples) {
  // Called synchronously from the click so the AudioContext starts in the gesture.
  try {
    playSamples(samples, TARGET_SAMPLE_RATE_HZ, () => markPlaying(null));
  } catch {
    statusMessage.textContent = t(PLAYBACK_ERROR_TEXT_KEY);
    return;
  }
  markPlaying(button);
}

// Marks which play button is active (null = none). playSamples stops the
// previous sound first, whose onEnded unmarks its button before the new one
// is marked here.
function markPlaying(activeButton) {
  for (const playButton of [playOriginalButton, playProcessedButton]) {
    playButton.setAttribute("aria-pressed", String(playButton === activeButton));
  }
}

function setPlaybackEnabled(enabled) {
  for (const button of playbackButtons) button.disabled = !enabled;
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
  stopPlayback();
  setPlaybackEnabled(false);
  originalSamples48k = null;
  processedSamples48k = null;
  statusMessage.textContent = "";
  processedHeading.hidden = true;
  summaryList.replaceChildren();
  processedList.replaceChildren();
  waveformCanvas.getContext("2d").clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
  waveformCanvas.hidden = true;
}
