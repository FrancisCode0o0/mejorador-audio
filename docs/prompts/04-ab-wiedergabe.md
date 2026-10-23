# 04 · F1.4 – Verarbeitungskette und A/B-Wiedergabe

- **Datum:** 23.10.2026
- **Werkzeug:** Claude Code (Sonnet 5.5), Prompt entworfen von Claude
- **Ziel:** Original und verarbeitete Fassung lassen sich anhören und
  vergleichen. Die Kette ist noch leer, beide klingen also gleich.
- **Entscheidung vorab:** „Original" ist das Mono-Signal mit 48 kHz vor der
  Verarbeitung, nicht die Stereo-Datei (spart Speicher; verglichen wird, was
  die Verarbeitung ändert).

## Prompt

> Planschritt F1.4. Zuerst docs/style.md lesen. Noch nicht committen.
>
> 1. `web/io/audio-context.js`: den gemeinsamen AudioContext aus
>    web/io/decode.js in ein exportiertes `getAudioContext()` verschieben
>    (erzeugen, wenn er fehlt; fortsetzen, wenn er angehalten ist; synchron
>    innerhalb einer Nutzeraktion aufrufen). decode.js importiert ihn;
>    Verhalten und Fehlercodes bleiben gleich.
> 2. `web/dsp/pipeline.js`: `processSignal(samples, sampleRateHz)` → ein neues
>    Float32Array. Heute ohne Glieder, liefert eine Kopie; der Kopf sagt, dass
>    hier als einzigem Ort die dsp-Glieder verkettet werden (docs/style.md) und
>    dass F1.6 die Spitzen-Normalisierung hinzufügt.
> 3. `tests/dsp/pipeline.test.js` (node:test): ohne Glieder ist die Ausgabe
>    gleich der Eingabe und ein neues Objekt (das Original muss für das
>    A/B-Hören unverändert bleiben).
> 4. `web/io/playback.js`: `playSamples(samples, sampleRateHz, onEnded)` spielt
>    Mono-Samples über den gemeinsamen AudioContext ab (getAudioContext
>    synchron im Klick aufrufen), dazu `stopPlayback()`. Immer nur ein Klang:
>    ein neuer stoppt den laufenden. onEnded läuft, wenn er von selbst endet
>    oder gestoppt wird.
> 5. `web/ui/app.js` und `web/index.html`: nach dem Umtasten
>    `originalSamples48k` (das Mono-48-kHz-Signal) und
>    `processedSamples48k = processSignal(...)` behalten. Drei Knöpfe unter der
>    Wellenform: „Reproducir original", „Reproducir procesado", „Parar". Sie
>    sind deaktiviert, solange kein Audio da ist und wenn eine neue Datei
>    gewählt wird; der Knopf des laufenden Klangs ist markiert
>    (aria-pressed). Neue Texte kommen in web/i18n.js. clearResult stoppt die
>    Wiedergabe.
> 6. `docs/arquitectura.md`, Abschnitt 3: die neuen Dateien eintragen und
>    decode.js anpassen.
>
> Danach git status zeigen.

## Ergebnis

- **Commit:** 6490709
- **Tests:** 12/12 grün (Node 22, ausgeführt von Claude).
- **Prüfung im Browser (PC und Handy):** beide Knöpfe spielen ab, „Parar"
  stoppt, nie zwei Klänge gleichzeitig.
