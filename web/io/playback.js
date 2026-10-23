// playback.js — plays mono samples through the shared AudioContext.
// Plan step: F1.4 (A/B listening). Source: Web Audio API, AudioBufferSourceNode.
// Only one sound plays at a time.

import { getAudioContext } from "./audio-context.js";

const MONO_CHANNEL_COUNT = 1;

// { source, onEnded } of the sound that is playing, or null.
let current = null;

/**
 * Plays mono samples, stopping any sound that is already playing.
 * Call it synchronously inside the click handler so the AudioContext can
 * start on iOS.
 * @param {Float32Array} samples
 * @param {number} sampleRateHz sample rate of `samples`
 * @param {() => void} onEnded runs once when this sound finishes or is stopped
 * @throws {Error} if the browser has no Web Audio API
 */
export function playSamples(samples, sampleRateHz, onEnded) {
  const audioContext = getAudioContext();
  stopPlayback();
  const buffer = audioContext.createBuffer(MONO_CHANNEL_COUNT, samples.length, sampleRateHz);
  buffer.copyToChannel(samples, 0);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  const playing = { source, onEnded };
  source.onended = () => finish(playing);
  current = playing;
  source.start();
}

/** Stops the current sound, if any; its onEnded runs. */
export function stopPlayback() {
  if (!current) return;
  const playing = current;
  playing.source.stop();
  finish(playing);
}

// Idempotent: stop() also fires `ended` later, and onEnded must run only once.
function finish(playing) {
  if (current === playing) current = null;
  playing.source.onended = null;
  if (playing.onEnded) {
    const onEnded = playing.onEnded;
    playing.onEnded = null;
    onEnded();
  }
}
