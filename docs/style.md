# Code style — mejorador-audio

Applies to everything that enters the repository, whoever writes it (Claude,
Gemini, or jcode in constructor mode): code, reference tests, scripts and
technical documentation. Source: plan_mejorador_audio.txt, section 4.

## Language

- Names, comments, commit messages and technical docs (`docs/`, `README.md`)
  in English. Interface texts live only in `web/i18n.js` (es / en / de).

## Layers and files

- `web/dsp/` — pure signal processing: receives and returns Float32Array. No
  DOM, no i18n, no Web Audio. Must run unchanged in the browser, in a Web
  Worker and in Node.
- `web/io/` — decoding and resampling with Web Audio; WAV export.
- `web/ui/` — DOM, `<canvas>`, buttons, controls and `t()`.
- Dependencies go one way only: `ui → io, dsp`. `dsp` imports nothing from
  `io` or `ui`. `web/i18n.js` is used only by `ui/`.
- One file per link of the processing chain, named after the link
  (`highpass.js`, `noise-spp-mmse.js`, `gain-omlsa.js`, `compressor.js`,
  `loudness.js`, `limiter.js`…). `web/dsp/pipeline.js` is the only place that
  chains them, in the order of the plan.
- No catch-all "utils" files: a helper lives in the module that uses it, or in
  a module with its own name (`fft.js`, `window.js`).
- Python ↔ JS features: `train/features.py` and `web/dsp/features.js` have
  the same functions, in the same order, with equivalent names
  (snake_case ↔ camelCase).
- No libraries inside `web/`. Development tools (Prettier, ESLint, ruff) and
  reference libraries (numpy, scipy, pyloudnorm, nara_wpe, librosa,
  soundfile, PyTorch) are allowed only outside `web/`, references only in
  `tests/ref/`.
- New file → add it to the map in `docs/arquitectura.md`.

## Inside a file

- Order: header → named constants → public functions → private helpers. It
  reads top to bottom without jumps.
- Header in every file: what it does, the plan step it comes from, and the
  source it follows (paper, standard, section).
- Descriptive, complete names (`noiseEstimate`, not `ne`); units in the name
  when there are units (`attackMs`, `thresholdDb`).
- Functions ≈ 40 lines at most, one task each; files ≈ 300 lines at most.
- No magic numbers: every constant has a name, a unit and an origin
  (e.g. `XI_H1_DB = 15 // Gerkmann & Hendriks 2012`).
- Comments explain WHY, not what. Every formula cites its reference and uses
  the plan's notation.
- Clear over clever, unless a measurement justifies the trick — then comment
  the measurement.
- Python: type hints and docstrings. JS: JSDoc on public functions.

## Tests

- Mirror the code: `tests/dsp/<link>.test.js` for `web/dsp/<link>.js`,
  `tests/ref/<link>_ref.py` generates its reference vectors (JSON: input +
  expected output).
- Each test has one line saying what it checks, with which threshold, and why
  that threshold. Tolerances against reference libraries are documented the
  same way.
- Never weaken, skip or delete a test to make it pass. Regenerating a sound
  regression reference needs its own commit with the reason written.

## Tooling

- Prettier + ESLint (JS) and ruff (Python) must pass; CI fails otherwise.
- A file that cannot be understood from its header and comments is not done,
  even if its tests pass.
