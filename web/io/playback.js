// playback.js — plays mono samples through the shared AudioContext.
// Plan step: F1.4 (A/B listening), F1.4b (start position and position query).
// Source: Web Audio API, AudioBufferSourceNode.start(when, offset).
// Only one sound plays at a time.

import { getAudioContext } from "./audio-context.js";

const MONO_CHANNEL_COUNT = 1;
const START_NOW_SECONDS = 0;

export const END_REASONS = { ended: "ended", stopped: "stopped" };

// { source, onEnded, startSeconds, startedAtSeconds, durationSeconds } of the
// sound that is playing, or null.
let current = null;

/**
 * Plays mono samples, stopping any sound that is already playing.
 * Call it synchronously inside the click handler so the AudioContext can
 * start on iOS.
 * @param {Float32Array} samples
 * @param {number} sampleRateHz sample rate of `samples`
 * @param {(reason: "ended" | "stopped") => void} onEnded runs once when this
 *   sound ends by itself ("ended") or is stopped ("stopped")
 * @param {number} [startSeconds] where to start; out of range starts at 0
 * @throws {Error} if the browser has no Web Audio API
 */
export function playSamples(samples, sampleRateHz, onEnded, startSeconds = 0) {
  const audioContext = getAudioContext();
  stopPlayback();
  const buffer = audioContext.createBuffer(MONO_CHANNEL_COUNT, samples.length, sampleRateHz);
  buffer.copyToChannel(samples, 0);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  const resolvedStartSeconds = resolveStartSeconds(startSeconds, buffer.duration);
  const playing = {
    source,
    onEnded,
    startSeconds: resolvedStartSeconds,
    startedAtSeconds: audioContext.currentTime,
    durationSeconds: buffer.duration,
  };
  source.onended = () => finish(playing, END_REASONS.ended);
  current = playing;
  source.start(START_NOW_SECONDS, resolvedStartSeconds);
}

/** Stops the current sound, if any; its onEnded runs with "stopped". */
export function stopPlayback() {
  if (!current) return;
  const playing = current;
  playing.source.stop();
  finish(playing, END_REASONS.stopped);
}

/**
 * Position of the sound that is playing.
 * @returns {number | null} seconds from the start of the signal, or null if nothing plays
 */
export function getPlaybackPositionSeconds() {
  if (!current) return null;
  return computePlaybackPositionSeconds(
    current.startSeconds,
    current.startedAtSeconds,
    getAudioContext().currentTime,
    current.durationSeconds,
  );
}

/**
 * Start position to use for a requested one. Playing from the end restarts
 * from the beginning, as players do.
 * @param {number} requestedSeconds
 * @param {number} durationSeconds
 * @returns {number}
 */
export function resolveStartSeconds(requestedSeconds, durationSeconds) {
  if (requestedSeconds < 0 || requestedSeconds >= durationSeconds) return 0;
  return requestedSeconds;
}

/**
 * Position in the signal from the context clock. `now` can equal `startedAt`
 * (or be earlier) while iOS is still resuming the context, so the elapsed
 * time never goes negative.
 * @param {number} startSeconds position where the sound started
 * @param {number} startedAtSeconds context time when it started
 * @param {number} nowSeconds context time now
 * @param {number} durationSeconds length of the signal
 * @returns {number} in [0, durationSeconds]
 */
export function computePlaybackPositionSeconds(startSeconds, startedAtSeconds, nowSeconds, durationSeconds) {
  const position = startSeconds + Math.max(0, nowSeconds - startedAtSeconds);
  return Math.min(Math.max(position, 0), durationSeconds);
}

// Idempotent: stop() also fires `ended` later, and onEnded must run only once.
function finish(playing, reason) {
  if (current === playing) current = null;
  playing.source.onended = null;
  if (playing.onEnded) {
    const onEnded = playing.onEnded;
    playing.onEnded = null;
    onEnded(reason);
  }
}
