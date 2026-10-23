# 03 · F1.3 – Wellenform im Canvas

- **Datum:** 23.10.2026
- **Werkzeug:** Claude Code (Sonnet 5.5), Prompt entworfen von Claude
- **Ziel:** Die geladene Aufnahme ist als Wellenform sichtbar.

## Prompt

> Planschritt F1.3. Zuerst docs/style.md lesen. Noch nicht committen.
>
> 1. `web/ui/waveform.js` mit zwei exportierten Funktionen:
>    - `computeColumnPeaks(samples, columnCount)` → { min: Float32Array,
>      max: Float32Array }: teilt die Samples in columnCount aufeinanderfolgende
>      Gruppen (so gleich groß wie möglich; jedes Sample gehört zu genau einer
>      Gruppe) und liefert Minimum und Maximum jeder Gruppe. Rein, ohne DOM,
>      damit es in Node testbar ist.
>    - `drawWaveform(canvas, samples)`: setzt die Pixelgröße des Canvas auf
>      CSS-Breite × devicePixelRatio, berechnet ein Min/Max-Paar pro physischer
>      Pixelspalte und zeichnet pro Spalte eine senkrechte Linie, 0 in der
>      Mitte, +1 oben, −1 unten. Die Farben kommen aus CSS-Variablen am Canvas.
> 2. `tests/ui/waveform.test.js` (node:test): [0, 1, −1, 0,5] in 2 Spalten →
>    min [0, −1], max [1, 0,5]; mehr Spalten als Samples wirft keinen Fehler und
>    deckt jedes Sample ab; ein konstantes Signal ergibt min = max. Jeder Test
>    sagt, was er prüft und warum.
> 3. `web/index.html`: ein Canvas in voller Breite (feste CSS-Höhe, z. B.
>    120 px) unter dem Block „Procesado", ausgeblendet, solange kein Audio da
>    ist.
> 4. `web/ui/app.js`: nach dem Umtasten monoSamples48k zeichnen; bei
>    Größenänderung des Fensters neu zeichnen; in clearResult den Canvas leeren
>    und ausblenden.
> 5. `docs/arquitectura.md`, Abschnitt 3: die neuen Dateien eintragen.
>
> Danach git status zeigen.

## Ergebnis

- **Commit:** 6313743
- **Tests:** 10/10 grün (6 Mono-Mix, 4 Wellenform; Node 22, ausgeführt von
  Claude).
- **Prüfung im Browser:** Wellenform sichtbar, Sprechpausen flach, beim
  Verkleinern des Fensters neu gezeichnet.
