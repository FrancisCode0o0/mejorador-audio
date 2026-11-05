// app.js — page controller: file input, decoding, mono 48 kHz, and the summaries.
// Plan step: F1.1 (choose a file, show what the browser decoded), F1.2 (mono
// 48 kHz, "Procesado"), F1.4 (processing chain, A/B playback), F1.4b (shared
// position bar, pause, stop), F1.5 (WAV download, built in download.js) and
// F1.7 (original and processed waveforms in two rows, playhead, click-to-seek, clock).

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
import { downloadWav } from "./download.js";
import { createWaveformRows } from "./waveform.js";
import { formatClock } from "./clock.js";
import { formatDuration, formatHertz, showRows } from "./summary.js";
import { t } from "../i18n.js";

const PROCESSED_CHANNEL_COUNT = 1;

// Increases on every change event. An older file can finish decoding after a
// newer one; a result is shown only if its number is still the latest, otherwise
// it would overwrite the file the user chose last. Checked after every await.
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
const waveformBox = document.getElementById("waveform-box");
const waveformRows = createWaveformRows(waveformBox);
const playOriginalButton = document.getElementById("play-original");
const playProcessedButton = document.getElementById("play-processed");
const pauseButton = document.getElementById("pause");
const stopButton = document.getElementById("stop");
const positionRange = document.getElementById("position");
const positionTime = document.getElementById("position-time");
const downloadButton = document.getElementById("download-wav");
// Every button that needs a processed result: enabled after processing, disabled in clearResult.
const playbackButtons = [
  playOriginalButton,
  playProcessedButton,
  pauseButton,
  stopButton,
  downloadButton,
];

// The mono 48 kHz signal and its processed version. The AudioBuffer is not
// kept: it holds every channel at the source rate and is not needed again.
let originalSamples48k = null;
let processedSamples48k = null;
// Name of the chosen file, used to name the download.
let chosenFileName = null;

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
positionRange.setAttribute("aria-label", t("position.label"));
playOriginalButton.textContent = t("play.original");
playProcessedButton.textContent = t("play.processed");
pauseButton.textContent = t("play.pause");
stopButton.textContent = t("play.stop");
downloadButton.textContent = t("export.wav");
playOriginalButton.addEventListener("click", () => switchPlayback(playOriginalButton));
playProcessedButton.addEventListener("click", () => switchPlayback(playProcessedButton));
pauseButton.addEventListener("click", pausePlayback);
stopButton.addEventListener("click", resetPlayback);
downloadButton.addEventListener("click", downloadProcessedWav);
positionRange.addEventListener("input", onPositionDragged);
positionRange.addEventListener("change", onPositionReleased);
waveformBox.addEventListener("click", onWaveformClicked);
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
  chosenFileName = file.name;
  statusMessage.textContent = "";
  processedHeading.hidden = false;
  showRows(processedList, [
    ["info.channels", String(PROCESSED_CHANNEL_COUNT)],
    ["info.sampleRate", formatHertz(TARGET_SAMPLE_RATE_HZ)],
    ["info.duration", formatDuration(samples.length / TARGET_SAMPLE_RATE_HZ)],
  ]);
  // Unhide first: a hidden canvas has zero width, so nothing could be drawn.
  waveformBox.hidden = false;
  redrawWaveform();
  positionSeconds = 0;
  positionRange.max = String(samples.length / TARGET_SAMPLE_RATE_HZ);
  showPosition(positionSeconds);
  setPlaybackEnabled(true);
}

function downloadProcessedWav() {
  if (!processedSamples48k) return;
  downloadWav(processedSamples48k, TARGET_SAMPLE_RATE_HZ, chosenFileName);
}

function redrawWaveform() {
  if (processedSamples48k) waveformRows.draw(originalSamples48k, processedSamples48k);
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
  seekTo(Number(positionRange.value));
}

// Seeks on click, not pointerdown: pointerdown fires as soon as a finger touches
// the waveform, so swiping the page to scroll would also seek. click fires only
// for a tap or a mouse click without movement, and not for the right button.
function onWaveformClicked(event) {
  if (!originalSamples48k) return;
  seekTo(waveformRows.fractionAt(event.clientX) * totalSeconds());
}

// The one way to jump (range release, click on the waveform); a playing sound continues there.
function seekTo(seconds) {
  positionSeconds = seconds;
  showPosition(positionSeconds);
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

// Also moves the playhead, so it follows the range while it is dragged.
function showPositionText(seconds) {
  const total = totalSeconds();
  positionTime.textContent = formatClock(seconds, total);
  waveformRows.placePlayhead(total > 0 ? seconds / total : 0);
}

function totalSeconds() {
  return originalSamples48k.length / TARGET_SAMPLE_RATE_HZ;
}

// Marks the active play button and its waveform row (null = none: pause, stop, end).
// playSamples stops the previous sound first, whose onEnded unmarks its button
// before the new one is marked here.
function markPlaying(button) {
  activeButton = button;
  waveformRows.setActive(button === playOriginalButton, button === playProcessedButton);
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

function showError(error) {
  const textKey = ERROR_TEXT_KEYS[error.code] ?? "error.decodeFailed";
  statusMessage.textContent = t(textKey);
}

function clearResult() {
  stopPlayback();
  setPlaybackEnabled(false);
  originalSamples48k = null;
  processedSamples48k = null;
  chosenFileName = null;
  positionSeconds = 0;
  positionRange.value = "0";
  positionTime.textContent = "";
  statusMessage.textContent = "";
  processedHeading.hidden = true;
  summaryList.replaceChildren();
  processedList.replaceChildren();
  waveformRows.clear();
  waveformBox.hidden = true;
  waveformRows.placePlayhead(0);
}
