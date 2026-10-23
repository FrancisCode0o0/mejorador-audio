# 02 · F1.2 – Mono-Mix und Umtastung auf 48 kHz

- **Datum:** 23.10.2026
- **Werkzeug:** Claude Code (Sonnet 5.5), Prompt entworfen von Claude
- **Ziel:** Jede Datei wird zu einem Kanal mit 48000 Hz. Die ganze
  Verarbeitungskette arbeitet mit diesem Format.

## Prompt

> Planschritt F1.2. Zuerst docs/style.md lesen. Noch nicht committen.
>
> 1. `web/dsp/mono.js`: `mixToMono(channels)` – channels ist ein Array von
>    Float32Array gleicher Länge; liefert ein neues Float32Array mit dem
>    Mittelwert aller Kanäle pro Abtastwert (Plan: m[i] = (L[i] + R[i]) / 2,
>    verallgemeinert auf N Kanäle). Ein Kanal → eine Kopie. Rein: kein DOM,
>    kein Web Audio.
> 2. `tests/dsp/mono.test.js` mit node:test und node:assert: Stereo [1, 0, −1]
>    und [0, 0, 1] → [0,5, 0, 0]; Mono-Eingabe liefert eine gleiche Kopie,
>    nicht dasselbe Objekt; die Länge bleibt gleich. Jeder Test sagt, was er
>    prüft und warum.
> 3. `web/io/resample.js`: `resampleTo48k(samples, sourceSampleRate)` →
>    Promise<Float32Array>. Ist die Quellrate schon 48000, die Samples
>    unverändert zurückgeben. Sonst in einem OfflineAudioContext(1,
>    Math.ceil(samples.length × 48000 / sourceSampleRate), 48000) rendern
>    (Konstruktor mit Positionsargumenten, mit webkitOfflineAudioContext als
>    Ausweichlösung für ältere Safari-Versionen).
> 4. `web/ui/app.js`: nach dem Dekodieren auf Mono mischen, umtasten, nur das
>    Mono-48-kHz-Float32Array behalten (nicht den AudioBuffer) und einen
>    zweiten Block „Procesado" mit 1 Kanal, Abtastrate und Dauer
>    (samples.length / 48000, 2 Nachkommastellen) zeigen. Die Regel „nur die
>    neueste Auswahl" gilt auch hier. Neue Texte kommen in web/i18n.js.
> 5. `docs/arquitectura.md`, Abschnitt 3: die drei neuen Dateien eintragen.
>
> Danach git status zeigen.

## Korrektur nach der Prüfung

Der Kommentar „Run: node --test tests/dsp" in der ersten Zeile des Tests
wurde zu „Run: node --test" (Node 22 nimmt dort keinen Ordner an).

## Ergebnis

- **Commit:** c747595
- **Tests:** 6/6 grün (Node 22, ausgeführt von Claude).
- **Prüfung im Browser:** „Procesado" zeigt 1 Kanal, 48000 Hz, 5,53 s.
