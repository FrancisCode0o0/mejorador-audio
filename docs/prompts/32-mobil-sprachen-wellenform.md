# 32 · F1.7 – Handy-Layout, Texte nur über i18n, zwei Wellenformen, Abspielmarke und Uhr

- **Datum:** 05.11.2026
- **Werkzeug:** Claude Code 2.1.308 (Sonnet 5.5), Prompts entworfen und
  Ergebnis geprüft von Claude (Chat auf claude.ai, Opus 5.5)
- **Gruppe:** wesentlich (Aufbau der App)
- **Ziel:** Die Seite wird fürs Handy fertig (eine Spalte, kein
  waagerechtes Scrollen bis 320 px), alle sichtbaren Texte kommen aus
  `i18n.js` und die CI prüft das. Man sieht Original und Verarbeitung,
  eine Abspielmarke läuft über die Wellenform, ein Tipp auf die Wellenform
  springt an diese Stelle, und eine Uhr zeigt „m:ss / −m:ss".
- **Entscheidungen vorab** (Vorbereitung im Chat am 02.11.2026):
  - Die Abspielmarke ist ein eigenes Element über dem Canvas: Die
    Wellenformen werden nicht 60-mal pro Sekunde neu gezeichnet.
  - Uhr in `web/ui/clock.js`: vergangene Zeit abgerundet, Restzeit
    aufgerundet, damit am Anfang die ganze Länge und am Ende −0:00 steht.
  - `formatDuration`, `formatHertz`, `showRows` wandern nach
    `web/ui/summary.js`, damit `app.js` bei ≈ 300 Zeilen bleibt.
  - Sprachprüfung als Node-Test (`tests/ui/i18n.test.js`), läuft also in
    der CI mit.

## Prompt (an Claude Code auf Englisch, hier sinngemäß)

> Planschritt F1.7 (eine Spalte fürs Handy, alle Texte über i18n, beide
> Wellenformen übereinander, Abspielmarke auf der Wellenform, Uhr). Zuerst
> docs/style.md lesen. Nicht committen. Weder node, npm, npx, python noch
> die Tests ausführen. Edit/Write, eine Datei nach der anderen.
> `docs/prompts/`, `AGENTS.md`, `docs/style.md`, `.github/`, `package.json`
> nicht anfassen.
>
> 1. Neue Datei `web/ui/clock.js` (rein, kein DOM):
>    `formatClock(elapsedSeconds, totalSeconds)`; vergangene Zeit auf
>    [0, total] begrenzt (NaN → 0) und abgerundet, Restzeit
>    ceil(total − elapsed); Minuten nicht auf 59 begrenzt; Sekunden immer
>    zweistellig; das Minus ist U+2212 als benannte Konstante. Beispiel:
>    (3,7, 80) → „0:03 / −1:17".
> 2. Neue Datei `web/ui/summary.js`: `formatDuration`, `formatHertz` und
>    `showRows` unverändert aus `app.js` verschieben.
> 3. `web/ui/waveform.js`: `drawWaveforms(canvas, original, processed)`
>    (Original heller dahinter, Verarbeitung davor, gleiche Skala ±1);
>    reine Funktion `fractionFromPointer(clientX, left, width)`, auf [0, 1]
>    begrenzt, Breite ≤ 0 → 0; `placePlayhead(element, fraction)` setzt
>    `style.left` in Prozent.
> 4. `web/index.html`: Canvas in `<div id="waveform-box">` (relativ,
>    `touch-action: manipulation`), darin `<div id="playhead">` (absolut,
>    2 px, volle Höhe, `pointer-events: none`). Nichts breiter als 320 px.
> 5. `web/ui/app.js`: beide Wellenformen zeichnen (auch bei Größenänderung);
>    eine Funktion `seekTo(seconds)` für das Loslassen des Reglers und den
>    Druck auf die Wellenform; läuft ein Ton, spielt er dort weiter;
>    Positionsanzeige setzt die Marke und zeigt `formatClock(...)`.
> 6. `web/i18n.js`: Beschriftung der Wellenform anpassen,
>    `waveform.seekHint` = „Toca la onda para saltar a ese punto" als
>    `title` der Box; das Textobjekt eingefroren als `TEXTS` exportieren.
> 7. Tests: `tests/ui/clock.test.js` (Anfang, Rundung, Ende, 62:05,
>    negativ und NaN, über der Gesamtlänge); Fälle für
>    `fractionFromPointer`; `tests/ui/i18n.test.js`: gleiche Schlüssel in
>    allen Sprachen, jeder Schlüssel aus `web/ui/*.js` existiert, kein
>    sichtbarer Text in `index.html`, kein Import von `i18n.js` in
>    `web/dsp/` oder `web/io/`.
> 8. `docs/arquitectura.md`: Zeilen für die neuen Dateien, geänderte
>    Zeilen angepasst.

## Korrekturen nach der Prüfung und nach Frans Test

1. **`click` statt `pointerdown`** (Fehler im eigenen Prompt, von Claude
   bei der Prüfung gefunden): `pointerdown` feuert, sobald ein Finger die
   Wellenform berührt; wer die Seite wischt, um zu scrollen, wäre
   gesprungen. `click` feuert nur bei einem Tipp ohne Bewegung.
2. **Download in eigene Datei `web/ui/download.js`**: `app.js` hatte 326
   Zeilen, `docs/style.md` erlaubt ≈ 300.
3. **Original im Inneren unsichtbar** (Frans Test mit einer Datei bei
   −20 dB): Die Verarbeitung macht das Signal 8,9-mal größer, also deckte
   die blaue Wellenform die hellere vollständig zu. Erster Versuch: in jeder
   Spalte die kleinere Wellenform vorne. Danach Farbe Hellblau → Grau, weil
   Fran beide Blautöne nicht unterscheiden konnte.
4. **Zwei Zeilen statt übereinander.** Fran:
   > Dieses Design taugt nicht, weil die Leute bei einer Wellenform in der
   > anderen nicht verstehen, was sie sehen. Entweder erscheint beim
   > Drücken von Original oder Verarbeitet die jeweilige Wellenform, oder
   > sie stehen getrennt in zwei verschiedenen Zeilen.

   Auf Claudes Frage (zwei Zeilen oder eine Wellenform, die wechselt):
   > Zwei Zeilen, aber jede soll an den Rändern ein wenig leuchten, wenn sie
   > ausgewählt ist. Etwas Dezentes.

   Umsetzung: oben das Original (grau), unten die Verarbeitung (blau),
   jede 80 px hoch, gleiche Skala, Name in der Ecke; die Abspielmarke geht
   über beide; die Zeile des Tons, der gerade spielt, leuchtet dezent
   (`box-shadow`, ohne Übergang bei `prefers-reduced-motion`). Diese
   Entscheidung ersetzt die aus Eintrag 17 (übereinander).
5. Prettier: ein Import gehörte auf eine Zeile.

Nichts abgelehnt. Claude Code hat nichts ausgeführt, wie verlangt.

## Ergebnis

- **Commit:** „F1.7: two waveform rows, playhead, clock and language
  check".
- **Prüfung durch Claude vor dem Commit** (saubere Kopie, Dateien Byte für
  Byte gleich wie auf dem PC): 56/56 Tests grün, Prettier, ESLint und
  `check_secrets.py` OK; 12 Mutationen alle erkannt (u. a. Rundung der
  Uhr, Bindestrich statt U+2212, unbekannter Textschlüssel, sichtbarer
  Text in `index.html`, `dsp/` importiert `i18n.js`). `app.js`: 298 Zeilen.
- **Test von Fran im Browser** (PC, Edge, auch in der Handy-Ansicht mit
  393 px): zwei Zeilen, Uhr, Marke, Springen per Klick während und ohne
  Wiedergabe, Wechsel A/B an derselben Stelle, Leuchten der aktiven Zeile,
  kein waagerechtes Scrollen, WAV-Download. Die Fehler in der Konsole
  stammen von einer Browser-Erweiterung (Zotero) und vom fehlenden
  `favicon.ico`, nicht von der App.
