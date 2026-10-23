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
| `web/index.html` | ui | One-column page with a file input; loads `ui/app.js` as a module. Contains no visible text. |
| `web/ui/app.js` | ui | Reads the chosen file, calls `decodeAudioFile`, shows name, duration, channels and sample rate, or an error text. |
| `web/i18n.js` | ui (texts) | Spanish texts and `t(key)`. |
| `web/io/decode.js` | io | `decodeAudioFile(file)`: reads the File and decodes it with `decodeAudioData` on the shared context; rejects with an Error carrying a `code`. |
| `web/io/audio-context.js` | io | `getAudioContext()`: the one shared AudioContext; created and resumed synchronously inside a user gesture (iOS). |
| `web/io/playback.js` | io | `playSamples` / `stopPlayback`: plays mono samples through the shared context, one sound at a time. |
| `web/dsp/pipeline.js` | dsp | `processSignal`: the only place that chains the dsp links; no links yet, returns a copy. |
| `tests/dsp/pipeline.test.js` | tests | node:test tests for `processSignal` (equal output, new object). |
| `web/dsp/mono.js` | dsp | `mixToMono(channels)`: averages N channels into one new Float32Array. |
| `web/io/resample.js` | io | `resampleTo48k(samples, rate)`: renders mono samples at 48 kHz in an OfflineAudioContext; returns them unchanged if already 48 kHz. |
| `web/ui/waveform.js` | ui | `computeColumnPeaks` (pure min/max per column) and `drawWaveform` (draws them on a canvas, one line per device pixel column). |
| `tests/ui/waveform.test.js` | tests | node:test tests for `computeColumnPeaks` (known split, more columns than samples, constant signal, odd split). |
| `tests/dsp/mono.test.js` | tests | node:test tests for `mixToMono` (stereo average, copy not alias, length, N channels, errors). |
| `docs/style.md` | docs | Code style rules. |
| `docs/arquitectura.md` | docs | This file. |
| `AGENTS.md` | repo | Rules for the jcode agent. |
| `README.md` | docs | Short project description (in Spanish), folder overview and demo link. |
| `tools/check_secrets.py` | tools | Secret checker: refuses a commit whose added lines contain a known key format or the value of an exported secret variable. |
| `tools/tests/test_check_secrets.py` | tools (tests) | pytest tests for the secret checker and the pre-commit hook; fake keys are built at runtime. |
| `.githooks/pre-commit` | tools (git hook) | Runs `tools/check_secrets.py --staged` before each commit; refuses the commit if no Python is found. |
| `.github/workflows/pages.yml` | CI | Publishes the `web/` folder to GitHub Pages on every push to `main`. |
| `train/check_env.py` | train | Phase 0 check that the Python training packages (numpy, scipy, soundfile, torch, pystoi; pesq optional) work. |
| `.gitattributes` | repo | Forces LF line endings for shell scripts and git hooks. |
| `.gitignore` | repo | Keeps caches, training data, audio files, editor files and `reports/` out of git. |
| `docs/.gitkeep`, `tests/.gitkeep`, `train/.gitkeep` | repo | Empty placeholders that keep those folders in git. |
