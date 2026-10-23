// app.js — page controller: file input, decoding, mono 48 kHz, and the summaries.
// Plan step: F1.1 (choose a file and show what the browser decoded) and
// F1.2 (mono mix and resampling to 48 kHz, shown as "Procesado"),
// F1.4 (processing chain and A/B playback of original and processed) and
// F1.4b (one shared position bar, pause and stop).

import { decodeAudioFile, DECODE_ERROR_CODES } from "../io/decode.js";
import { resampleTo48k, RESAMPLE_ERROR_CODES, TARGET_SAMPLE_RATE_HZ } from "../io/resample.js";
import { mixToMono } from "../dsp/mono.js";
import { processSignal } from "../dsp/pipeline.js";
import {
  playSamples,
  stopPlayback,
  getPlaybackPositionSeconds,
  END_REASONS,
} from "../io/playback.js";
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
const pauseButton = document.getElementById("pause");
const stopButton = document.getElementById("stop");
const positionRange = document.getElementById("position");
const positionTime = document.getElementById("position-time");
const playbackButtons = [playOriginalButton, playProcessedButton, pauseButton, stopButton];

// The mono 48 kHz signal and its processed version. The AudioBuffer is not
// kept: it holds every channel at the source rate and is not needed again.
let originalSamples48k = null;
let processedSamples48k = null;

// One position shared by original and processed, so switching A/B continues at
// the same moment. While a sound plays it is only updated when playback stops
// or switches; the live position is read from getPlaybackPositionSeconds().
let positionSeconds = 0;
// The play button whose sound is playing, or null.
let activeButton = null;
let animationFrameId = null;
// True between the first `input` and the `change` of a drag on the range.
let isDraggingPosition = false;

document.title = t("page.title");
document.getElementById("heading").textContent = t("page.heading");
fileLabel.textContent = t("file.label");
processedHeading.textContent = t("processed.heading");
waveformCanvas.setAttribute("aria-label", t("waveform.label"));
positionRange.setAttribute("aria-label", t("position.label"));
playOriginalButton.textContent = t("play.original");
playProcessedButton.textContent = t("play.processed");
pauseButton.textContent = t("play.pause");
stopButton.textContent = t("play.stop");
playOriginalButton.addEventListener("click", () => switchPlayback(playOriginalButton));
playProcessedButton.addEventListener("click", () => switchPlayback(playProcessedButton));
pauseButton.addEventListener("click", pausePlayback);
stopButton.addEventListener("click", resetPlayback);
positionRange.addEventListener("input", onPositionDragged);
positionRange.addEventListener("change", onPositionReleased);
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
  positionSeconds = 0;
  positionRange.max = String(samples.length / TARGET_SAMPLE_RATE_HZ);
  showPosition(positionSeconds);
  setPlaybackEnabled(true);
}

function redrawWaveform() {
  if (processedSamples48k) drawWaveform(waveformCanvas, processedSamples48k);
}

function samplesOf(button) {
  return button === playOriginalButton ? originalSamples48k : processedSamples48k;
}

// A/B click: if a sound is playing, continue from its live position.
function switchPlayback(button) {
  const livePositionSeconds = getPlaybackPositionSeconds();
  if (livePositionSeconds !== null) positionSeconds = livePositionSeconds;
  startPlayback(button);
}

function startPlayback(button) {
  // Called synchronously from the click so the AudioContext starts in the gesture.
  try {
    playSamples(samplesOf(button), TARGET_SAMPLE_RATE_HZ, onPlaybackEnded, positionSeconds);
  } catch {
    statusMessage.textContent = t(PLAYBACK_ERROR_TEXT_KEY);
    return;
  }
  markPlaying(button);
  startPositionLoop();
}

// "ended" = reached the end by itself: the next play starts from the beginning.
// "stopped" = stopped or replaced: the position is kept.
function onPlaybackEnded(reason) {
  if (reason === END_REASONS.ended) positionSeconds = 0;
  markPlaying(null);
  showPosition(positionSeconds);
}

// Pause keeps the position.
function pausePlayback() {
  const livePositionSeconds = getPlaybackPositionSeconds();
  if (livePositionSeconds !== null) positionSeconds = livePositionSeconds;
  stopPlayback();
}

// Stop goes back to the beginning.
function resetPlayback() {
  stopPlayback();
  positionSeconds = 0;
  showPosition(positionSeconds);
}

function onPositionDragged() {
  isDraggingPosition = true;
  showPositionText(Number(positionRange.value));
}

function onPositionReleased() {
  isDraggingPosition = false;
  positionSeconds = Number(positionRange.value);
  showPositionText(positionSeconds);
  if (activeButton) startPlayback(activeButton);
}

function startPositionLoop() {
  if (animationFrameId === null) animationFrameId = requestAnimationFrame(updatePositionFrame);
}

function updatePositionFrame() {
  animationFrameId = null;
  const livePositionSeconds = getPlaybackPositionSeconds();
  if (livePositionSeconds === null) return;
  if (!isDraggingPosition) showPosition(livePositionSeconds);
  startPositionLoop();
}

function showPosition(seconds) {
  if (!originalSamples48k) return;
  positionRange.value = String(seconds);
  showPositionText(seconds);
}

function showPositionText(seconds) {
  const totalSeconds = originalSamples48k.length / TARGET_SAMPLE_RATE_HZ;
  positionTime.textContent = `${seconds.toFixed(DURATION_DECIMALS)} / ${formatDuration(totalSeconds)}`;
}

// Marks which play button is active (null = none). playSamples stops the
// previous sound first, whose onEnded unmarks its button before the new one
// is marked here.
function markPlaying(button) {
  activeButton = button;
  for (const playButton of [playOriginalButton, playProcessedButton]) {
    playButton.setAttribute("aria-pressed", String(playButton === button));
  }
}

function setPlaybackEnabled(enabled) {
  for (const button of playbackButtons) button.disabled = !enabled;
  positionRange.disabled = !enabled;
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
  positionSeconds = 0;
  positionRange.value = "0";
  positionTime.textContent = "";
  statusMessage.textContent = "";
  processedHeading.hidden = true;
  summaryList.replaceChildren();
  processedList.replaceChildren();
  waveformCanvas.getContext("2d").clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
  waveformCanvas.hidden = true;
}
