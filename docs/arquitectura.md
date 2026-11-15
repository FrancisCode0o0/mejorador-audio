# Architecture — mejorador-audio

## 1. Planned processing chain

Items in brackets are optional links, added in later phases.

```
audio file
  → decode
  → mono, 48 kHz
  → high-pass 80 Hz
  → [hum removal]
  → [WPE dereverberation]
  → STFT
  → [own model: gains per band]
  → ISTFT
  → mastering EQ
  → compressor
  → LUFS normalisation (two passes)
  → true-peak limiter
  → WAV export
```

Decoding, resampling to 48 kHz and WAV export are in `web/io/`; the mono mix
and every other link are one file each in `web/dsp/`. `web/dsp/pipeline.js` is
the only place that chains the `dsp` links.

Until F3 the only link is peak normalisation (F1.6), which F3 replaces with
loudness normalisation and the true-peak limiter.

## 2. Folder map

- `web/dsp/` — pure signal processing: Float32Array in and out. No DOM, no
  i18n, no Web Audio. Runs unchanged in the browser, a Web Worker and Node. One
  file per link of the chain, named after it (`highpass.js`, `limiter.js`…);
  `pipeline.js` alone chains them.
- `web/io/` — decoding and resampling with Web Audio; WAV export.
- `web/ui/` — DOM, `<canvas>`, buttons, controls and `t()`.
- `web/i18n.js` — all visible texts; used only by `ui/`.
- `tests/dsp/<link>.test.js` — tests for `web/dsp/<link>.js`.
- `tests/ref/<link>_ref.py` — generates the reference vectors (JSON: input +
  expected output) for that link.
- `train/` — Python training; `train/features.py` mirrors `web/dsp/features.js`.
- `tools/` — repository tools (secret checker).
- `docs/` — documentation (`style.md`, this file).

Dependencies go one way only: `ui → io, dsp`. `dsp` imports nothing from `io`
or `ui`.

## 3. Files that exist today

| File | Layer | What it does |
| --- | --- | --- |
| `web/index.html` | ui | One-column page for phones (no horizontal scroll down to 320 px): file input, summaries, the waveform box (two rows, original in grey and processed in blue, each with a canvas and a name, and one playhead over both; the row of the playing sound glows), a position range with its clock text, and the buttons (play original, play processed, pause, stop, download WAV); loads `ui/app.js` as a module. Contains no visible text. |
| `web/ui/app.js` | ui | Page controller. Reads the chosen file, calls `decodeAudioFile`, shows name, duration, channels and sample rate, or an error text. Plays original or processed with one shared position (an A/B switch continues at the same moment): the range, the playhead and the clock follow playback, and the waveform row of the playing sound glows (via `createWaveformRows`; no row glows when paused, stopped or ended); the range release and a click or tap anywhere in the waveform box both seek (`seekTo`; a click, not pointerdown, so scrolling by swipe does not seek), and a playing sound continues from there; "Pausa" stops and keeps the position, "Parar" stops and returns to 0. "Descargar WAV" hands the processed signal to `downloadWav`. |
| `web/ui/download.js` | ui | `downloadWav(samples, sampleRateHz, chosenFileName)`: builds the 16-bit WAV with `encodeWavMono16` at call time (not kept), and downloads it as `<name>-procesado.wav` through a temporary link; the object URL is revoked after 10 s. Moved out of `app.js` in F1.7. |
| `web/ui/clock.js` | ui | `formatClock(elapsedSeconds, totalSeconds)`: "m:ss / −m:ss" (elapsed floored, remaining rounded up, minutes not capped, U+2212 minus). Pure: no DOM, no texts. |
| `web/ui/summary.js` | ui | `formatDuration`, `formatHertz` and `showRows`: the file summaries, moved out of `app.js`. |
| `web/i18n.js` | ui (texts) | Spanish texts (including the WAV download button, file-name suffix, the names and labels of the two waveform rows and the seek hint), `t(key)` and the frozen `TEXTS` object (exported for the language check). |
| `web/io/wav.js` | io | `encodeWavMono16(samples, rate)`: mono 16-bit PCM WAV with the canonical 44-byte header, written by hand; `floatToInt16(sample)`: NaN → 0, clip, scale 32767, round. Pure: no DOM, no Web Audio. |
| `tests/io/wav.test.js` | tests | node:test tests for `wav.js`: byte-for-byte equality with the soundfile vectors, header fields, NaN / infinities / −0, invalid rates. |
| `tests/ref/wav_ref.py` | tests (reference) | Generates `tests/ref/vectors/wav.json` with soundfile; `--check` regenerates in memory and compares with the committed file. |
| `tests/ref/vectors/wav.json` | tests (reference) | Generated vectors (input, expected 16-bit codes, expected WAV as hex). Not edited by hand; keeps the generator's layout. |
| `.prettierignore` | CI (tools) | Keeps Prettier away from the generated vectors in `tests/ref/vectors/`. |
| `web/io/decode.js` | io | `decodeAudioFile(file)`: reads the File and decodes it with `decodeAudioData` on the shared context; rejects with an Error carrying a `code`. |
| `web/io/audio-context.js` | io | `getAudioContext()`: the one shared AudioContext; created and resumed synchronously inside a user gesture (iOS). |
| `web/io/playback.js` | io | `playSamples(samples, rate, onEnded, startSeconds)` / `stopPlayback` / `getPlaybackPositionSeconds`: plays mono samples through the shared context from a start position, one sound at a time; `onEnded` gets `"ended"` or `"stopped"`. The pure helpers `resolveStartSeconds` and `computePlaybackPositionSeconds` are exported for tests. |
| `tests/io/playback.test.js` | tests | node:test tests for `resolveStartSeconds` and `computePlaybackPositionSeconds` (position maths, clamping, clock lag, out-of-range start). |
| `web/dsp/pipeline.js` | dsp | `processSignal`: the only place that chains the dsp links; the only link today is `normalizePeak` (F1.6). |
| `tests/dsp/pipeline.test.js` | tests | node:test tests for `processSignal` (output equals `normalizePeak(input)`, new object). |
| `web/dsp/peak-normalize.js` | dsp | `normalizePeak(samples)`: scales by one gain so that max\|x\| is `PEAK_TARGET_LINEAR` = 0.89 (≈ −1 dBFS); silence and empty input are copied. Temporary: F3 replaces it. |
| `tests/dsp/peak-normalize.test.js` | tests | node:test tests for `normalizePeak` (known values within 1e-7, negative peak, above full scale, silence, empty, new object). |
| `web/dsp/mono.js` | dsp | `mixToMono(channels)`: averages N channels into one new Float32Array. |
| `web/io/resample.js` | io | `resampleTo48k(samples, rate)`: renders mono samples at 48 kHz in an OfflineAudioContext; returns them unchanged if already 48 kHz. |
| `web/ui/waveform.js` | ui | `computeColumnPeaks` (pure min/max per column), `drawWaveform` (one signal on one canvas, scale ±1, one line per device pixel column), `createWaveformRows` (wires the box with the two rows: sets their names, labels and the seek hint from i18n; returns `draw`, `clear`, `setActive` for the glow of the playing row, `placePlayhead` and `fractionAt`), `fractionFromPointer` (pure: pointer x → 0..1 along the box) and `placePlayhead` (moves the separate playhead element, so the canvases are not redrawn while playing). |
| `tests/ui/waveform.test.js` | tests | node:test tests for `computeColumnPeaks` (known split, more columns than samples, constant signal, odd split) and `fractionFromPointer` (inside, left, right, width 0). |
| `tests/ui/clock.test.js` | tests | node:test tests for `formatClock` (start, rounding in opposite directions, end, minutes above 59, negative and NaN elapsed, elapsed above total). |
| `tests/ui/i18n.test.js` | tests | Language check of the CI: same keys in every language, every key used in `web/ui/*.js` exists, no visible text in `index.html`, no `i18n.js` import in `web/dsp/` or `web/io/`. |
| `tests/dsp/mono.test.js` | tests | node:test tests for `mixToMono` (stereo average, copy not alias, length, N channels, errors). |
| `docs/style.md` | docs | Code style rules. |
| `docs/arquitectura.md` | docs | This file. |
| `AGENTS.md` | repo | Rules for the jcode agent. |
| `README.md` | docs | Short project description (in Spanish), folder overview and demo link. |
| `tools/check_secrets.py` | tools | Secret checker: refuses a commit whose added lines contain a known key format or the value of an exported secret variable. |
| `tools/tests/test_check_secrets.py` | tools (tests) | pytest tests for the secret checker and the pre-commit hook; fake keys are built at runtime. |
| `.githooks/pre-commit` | tools (git hook) | Runs `tools/check_secrets.py --staged` before each commit; refuses the commit if no Python is found. |
| `.githooks/pre-push` | tools (git hook) | Refuses a push unless `npm test`, Prettier, ESLint and, once `tests/browser/` exists, the Chromium smoke test pass. Fails closed. |
| `.github/workflows/pages.yml` | CI | Publishes the `web/` folder to GitHub Pages after the CI workflow finished successfully for a push to `main` (`workflow_run`); a red push is not deployed. |
| `.github/workflows/ci.yml` | CI | On every push: JS tests (node:test), Prettier and ESLint; ruff check and ruff format; `check_secrets.py --all`; pytest for `tools/`; `tests/ref/wav_ref.py --check` (reference vectors still match soundfile). Tool and reference-library versions pinned. |
| `package.json`, `package-lock.json` | CI (tools) | Development tools only (Prettier, ESLint), pinned; scripts `test`, `format:check`, `lint`. Nothing from npm is used in `web/`. |
| `.prettierrc.json` | CI (tools) | Prettier settings: 100 columns. |
| `eslint.config.js` | CI (tools) | ESLint rules: recommended set; browser globals for `web/`, Node globals for `tests/`. |
| `ruff.toml` | CI (tools) | ruff settings: 100 columns, classic rule set pinned; `tools/` keeps the layout it shares with jcode-adaptado. |
| `train/check_env.py` | train | Phase 0 check that the Python training packages (numpy, scipy, soundfile, torch, pystoi; pesq optional) work. |
| `.gitattributes` | repo | Forces LF line endings for shell scripts and git hooks. |
| `.gitignore` | repo | Keeps caches, training data, audio files, editor files and `reports/` out of git. |
| `docs/.gitkeep`, `tests/.gitkeep`, `train/.gitkeep` | repo | Empty placeholders that keep those folders in git. |
