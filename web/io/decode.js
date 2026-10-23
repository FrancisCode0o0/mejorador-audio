// decode.js — decodes a user-chosen audio File into an AudioBuffer.
// Plan step: F1.1 (decode). Source: Web Audio API, BaseAudioContext.decodeAudioData.
//
// The io layer has no visible texts (see docs/style.md), so errors carry a
// stable `code` that the UI maps to a text with t().

import { getAudioContext } from "./audio-context.js";

export const DECODE_ERROR_CODES = Object.freeze({
  noAudioContext: "no-audio-context",
  readFailed: "read-failed",
  decodeFailed: "decode-failed",
});

/**
 * Decodes an audio file with the browser's decoder.
 * Call it directly from the user's gesture handler: the AudioContext is
 * created/resumed synchronously, before the first await, because iOS keeps
 * it suspended otherwise.
 * @param {File} file
 * @returns {Promise<AudioBuffer>} rejects with an Error whose `code` is one of
 *   DECODE_ERROR_CODES
 */
export function decodeAudioFile(file) {
  let audioContext;
  try {
    audioContext = getAudioContext();
  } catch (error) {
    return Promise.reject(decodeError(DECODE_ERROR_CODES.noAudioContext, error));
  }
  return decodeWith(audioContext, file);
}

async function decodeWith(audioContext, file) {
  let bytes;
  try {
    bytes = await file.arrayBuffer();
  } catch (error) {
    throw decodeError(DECODE_ERROR_CODES.readFailed, error);
  }
  try {
    // The promise form rejects with a DOMException on undecodable data.
    return await audioContext.decodeAudioData(bytes);
  } catch (error) {
    throw decodeError(DECODE_ERROR_CODES.decodeFailed, error);
  }
}

function decodeError(code, cause) {
  const error = new Error(`Audio decoding failed (${code})`, { cause });
  error.code = code;
  return error;
}
