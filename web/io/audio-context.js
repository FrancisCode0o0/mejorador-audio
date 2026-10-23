// audio-context.js — the one AudioContext shared by decoding and playback.
// Plan step: F1.4 (moved out of decode.js so playback.js can use it too).
// Source: Web Audio API; iOS keeps a context suspended until it is created or
// resumed inside a user gesture.

let sharedAudioContext = null;

/**
 * Returns the shared AudioContext, creating it if missing and resuming it if
 * suspended. Call it synchronously inside a user gesture handler (before any
 * await), because that is the only moment iOS allows it to start.
 * @returns {AudioContext}
 * @throws {Error} if the browser has no Web Audio API
 */
export function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("Web Audio API is not available");
  }
  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextClass();
  }
  if (sharedAudioContext.state === "suspended") {
    // Not awaited: the call itself must happen inside the gesture.
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}
