# 08 · F1.6 – Spitzennormalisierung, erstes Glied der Kette

- **Datum:** 29.10.2026
- **Werkzeug:** Claude Code (Sonnet 5.5), Prompt entworfen von Claude
- **Ziel:** Das erste echte Glied in `pipeline.js`: die lauteste Probe
  max|x| wird auf 0,89 ≈ −1 dBFS gebracht, alle Proben mit derselben
  Verstärkung. Die Aufnahme klingt gleich, nur lauter (oder leiser, wenn
  die Spitze über 1 lag).
- **Entscheidungen vorab:**
  - Eine einzige Verstärkung g = 0,89 / max|x| für die ganze Datei: die
    Form des Signals bleibt, nur der Pegel ändert sich.
  - Stille (Spitze 0) wird kopiert, weil 0,89 / 0 NaN ergäbe.
  - Vorläufig: In F3 ersetzen die Lautheitsnormalisierung (zwei Durchgänge)
    und der True-Peak-Limiter dieses Glied.
  - Die ESLint-Ausnahme für `sampleRateHz` bleibt bis zum Hochpass in F3:
    max|x| hängt nicht von der Abtastrate ab.
  - Kein Python-Referenzvektor: die erwarteten Werte sind von Hand
    gerechnet, Toleranz 1e-7 (eine Rundung auf float32).
  - Vorbereitet von Claude im Chat am 29.10.2026: Prototyp mit 39/39 Tests,
    Prettier und ESLint OK, 6 Mutationen erkannt.

## Prompt

> Planschritt F1.6 (erstes Glied: Spitzennormalisierung). Zuerst
> docs/style.md lesen. Noch nicht committen. Weder node, npm, npx, python
> noch die Tests ausführen. Edit/Write verwenden, eine Datei nach der
> anderen; keine Skripte zum Bearbeiten. `docs/prompts/07-…` und
> `docs/prompts/README.md` sind schon geändert; nicht anfassen.
>
> 1. Neue Datei `web/dsp/peak-normalize.js` (rein: kein DOM, kein Web
>    Audio): Kopf mit Planschritt F1.6, „vorläufig, F3 ersetzt es" und
>    Quelle (Plan). Exportierte Konstante `PEAK_TARGET_LINEAR = 0.89` mit
>    JSDoc (20·log10(0,89) ≈ −1,01 dBFS, ein Dezibel Reserve, damit der
>    16-Bit-Export nie übersteuert). `normalizePeak(samples)` gibt immer ein
>    neues Float32Array zurück: Spitze = max|x| aus der privaten Hilfsfunktion
>    `findAbsolutePeak` (0 bei leerem Signal); bei Spitze 0 eine Kopie, mit
>    Kommentar; sonst eine Verstärkung PEAK_TARGET_LINEAR / Spitze für jede
>    Probe, mit Kommentar, warum nur eine.
> 2. `web/dsp/pipeline.js`: `normalizePeak` importieren und zurückgeben;
>    Kopfzeile zum Planschritt anpassen; die ESLint-Ausnahme für
>    `sampleRateHz` behalten, Begründung: „erst der Hochpass in F3 nutzt
>    sie"; Kommentar, dass die Spitzennormalisierung nicht von der Abtastrate
>    abhängt.
> 3. Neue Datei `tests/dsp/peak-normalize.test.js`: −1 dB auf 0,05 dB
>    genau; [0,5, −0,25, 0,125] → [0,89, −0,445, 0,2225]; negative Spitze
>    [0,1, −0,5, 0,25] → [0,178, −0,89, 0,445]; über Vollaussteuerung
>    [1,2, −0,6] → [0,89, −0,445]; bei diesen drei Toleranz 1e-7 als
>    benannte Konstante, Probe für Probe mit Index in der Meldung; Stille
>    bleibt genau null ohne NaN; leer → Länge 0; neues Objekt und unveränderte
>    Eingabe, für ein normales Signal und für Stille. Jeder Testname sagt,
>    was er prüft, mit welcher Toleranz und warum.
> 4. `tests/dsp/pipeline.test.js`: Der Test „ohne Glieder gleich der
>    Eingabe" wird ersetzt: `processSignal(input, 48000)` ist genau gleich
>    `normalizePeak(input)`; der Test „neues Objekt" bleibt.
> 5. `docs/arquitectura.md`: in Abschnitt 1 ein Satz zum einzigen Glied bis
>    F3; in Abschnitt 3 Zeilen für die zwei neuen Dateien, die Zeilen von
>    pipeline.js und pipeline.test.js angepasst.
>
> Danach git status zeigen.

## Abgelehnt und Korrekturen

- Nichts abgelehnt. Claude Code hat nichts ausgeführt, wie verlangt.
- Abweichung, angenommen: `samples.map((sample) => sample * gain)` statt
  einer Schleife; `map` eines Float32Array liefert ebenfalls ein neues
  Float32Array.
- Kleiner Stilfehler, angenommen: Im dB-Test stehen −1 und 0,05 ohne
  Namen.

## Ergebnis

- **Commit:** „F1.6: peak normalisation as the first link of the chain"
  (zusammen mit den Protokolleinträgen 07 und 08).
- **Prüfung durch Claude vor dem Commit:** 40/40 Tests grün in einer
  sauberen Kopie; die 7 Tests des Prototyps laufen auch mit dem
  `peak-normalize.js` von Claude Code; Prettier, ESLint,
  `check_secrets.py`: OK; 6 Mutationen (ohne `Math.abs`, ohne Schutz bei
  Stille, Ziel 0,9, ohne Verstärkung, Verstärkung umgekehrt, Eingabe statt
  Kopie zurückgegeben) alle erkannt.
