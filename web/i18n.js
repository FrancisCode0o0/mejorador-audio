// i18n.js — every visible text of the page, and the lookup function t(key).
// Plan step: F1.1 (texts); F1.4b adds the position and pause texts; F1.5 the WAV download texts;
// F1.7 the two waveform names and labels and the seek hint. Only ui/ imports this file (docs/style.md).
// Spanish only for now; "en" and "de" are added here when the plan reaches them.
// TEXTS is exported (frozen) only for tests/ui/i18n.test.js, the language check.

const LANGUAGE = "es";

export const TEXTS = Object.freeze({
  es: Object.freeze({
    "page.title": "Mejorador de audio",
    "page.heading": "Mejorador de audio",
    "file.label": "Elige un archivo de audio",
    "file.decoding": "Decodificando…",
    "processed.heading": "Procesado",
    "waveform.originalName": "Original",
    "waveform.processedName": "Procesado",
    "waveform.originalLabel": "Forma de onda del original",
    "waveform.processedLabel": "Forma de onda del procesado",
    "waveform.seekHint": "Toca la onda para saltar a ese punto",
    "play.original": "Reproducir original",
    "play.processed": "Reproducir procesado",
    "play.pause": "Pausa",
    "play.stop": "Parar",
    "position.label": "Posición",
    "export.wav": "Descargar WAV",
    "export.fileSuffix": "procesado",
    "info.name": "Nombre",
    "info.duration": "Duración",
    "info.channels": "Canales",
    "info.sampleRate": "Frecuencia de muestreo",
    "unit.seconds": "s",
    "unit.hertz": "Hz",
    "error.noAudioContext": "Este navegador no permite procesar audio (falta Web Audio).",
    "error.readFailed": "No se pudo leer el archivo.",
    "error.resampleFailed": "No se pudo convertir el audio a 48 kHz.",
    "error.decodeFailed":
      "No se pudo decodificar el archivo. Prueba con otro formato (WAV, MP3, M4A).",
  }),
});

/**
 * Returns the text for a key in the page language.
 * An unknown key returns the key itself, so a missing text is visible.
 * @param {string} key
 * @returns {string}
 */
export function t(key) {
  return TEXTS[LANGUAGE][key] ?? key;
}
