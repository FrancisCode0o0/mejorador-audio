# 06 · F1.5 – WAV-Export, von Hand geschrieben

- **Datum:** 24.10.2026
- **Werkzeug:** Claude Code (Sonnet 5.5), Prompt entworfen von Claude
- **Ziel:** Die verarbeitete Fassung als WAV-Datei herunterladen (mono,
  48 kHz, 16 Bit, verlustfrei). Der Dateikopf wird von Hand geschrieben,
  ohne Bibliothek, und mit einer Referenz aus soundfile (libsndfile)
  geprüft.
- **Entscheidungen vorab:**
  - Umrechnung laut Plan: auf [−1, 1] begrenzen, mal 32767, runden wie
    `Math.round` (Hälften nach oben). −1 wird also zu −32767. libsndfile
    selbst rechnet mit 32768; deshalb bekommt libsndfile in der Referenz
    die fertigen Ganzzahlen und schreibt nur die Datei.
  - numpy rundet Hälften zur geraden Zahl, `Math.round` nach oben; die
    Referenz rechnet deshalb mit floor(x · 32767 + 0,5).
  - Die Referenzvektoren erzeugt `tests/ref/wav_ref.py`; die CI erzeugt sie
    bei jedem Push neu und vergleicht sie mit der eingecheckten Datei.
    `.prettierignore` schließt `tests/ref/vectors/` aus, sonst würde
    Prettier die erzeugte Datei umformatieren und die CI rot werden.
  - Das WAV wird erst beim Klick gebaut und nicht aufbewahrt (sonst eine
    zweite Kopie des Audios im Speicher).
  - Vorbereitet von Claude im Chat am 24.10.2026: Prototyp mit 30/30 Tests,
    Mutationsprüfung und Probelauf in Chromium. `wav.json` und
    `.prettierignore` hat Claude direkt ins Repository gelegt; den Rest
    schrieb Claude Code nach dem Prompt unten.

## Prompt

> Planschritt F1.5 (die verarbeitete Fassung als von Hand geschriebene
> WAV-Datei exportieren). Zuerst docs/style.md lesen. Noch nicht committen.
> Weder node, npm, npx, python noch die Tests ausführen. Edit/Write
> verwenden, eine Datei nach der anderen; keine Skripte zum Bearbeiten.
> `tests/ref/vectors/wav.json` und `.prettierignore` liegen schon im
> Repository; nicht ändern.
>
> 1. Neue Datei `web/io/wav.js` (rein: kein DOM, kein Web Audio;
>    Little-Endian):
>    - `floatToInt16(sample)`: NaN → 0; auf [−1, 1] begrenzen;
>      `Math.round(clipped * 32767) + 0` (das `+ 0` macht aus −0 eine 0).
>    - `encodeWavMono16(samples, sampleRateHz)` → ArrayBuffer: kanonischer
>      Kopf von 44 Bytes (RIFF, Größe = 36 + Datenbytes, WAVE, „fmt " mit
>      Größe 16, Format 1 = PCM, 1 Kanal, Abtastrate, Byterate = Rate · 2,
>      Blockausrichtung 2, 16 Bit, „data", Datenbytes), danach die Werte als
>      Int16. RangeError, wenn die Rate keine positive ganze Zahl ist oder die
>      Daten nicht in die Größenfelder passen.
>    - Benannte Konstanten mit Einheit und Herkunft; Kopfkommentar mit
>      Planschritt F1.5 und Quelle (Microsoft RIFF-Spezifikation 1991,
>      WAVE_FORMAT_PCM).
> 2. Neue Datei `tests/io/wav.test.js` (node:test): für jeden Fall in
>    `wav.json` muss die erzeugte Datei als Hex gleich `expectedWavHex` sein
>    und `floatToInt16` jedes Eingangswerts gleich `expectedInt16`. Dazu die
>    Kopffelder von 3 stillen Werten bei 48 kHz einzeln; NaN → 0,
>    ±Infinity → ±32767; −1e-9 ergibt +0; Rate 0 und 44100,5 werfen
>    RangeError. Jeder Testname sagt, was er prüft, mit welcher Toleranz
>    (null) und warum.
> 3. Neue Datei `tests/ref/wav_ref.py` (Generator der Vektoren): vier Fälle
>    (Grenzwerte bei 48 kHz; Zufall mit festem Startwert und Spitze 1,2;
>    ein Wert bei 44,1 kHz; leeres Signal). Erwartet:
>    floor(clip(x, −1, 1) · 32767 + 0,5) als int16; soundfile schreibt die
>    WAV-Datei, liest sie zurück und muss dieselben Werte liefern. Ohne
>    Argument schreibt das Skript `wav.json`; mit `--check` vergleicht es
>    nur die Fälle mit der eingecheckten Datei und endet mit 0 oder 1.
> 4. `web/index.html`: nach dem Stopp-Knopf ein Knopf `download-wav`,
>    deaktiviert.
> 5. `web/i18n.js`: „export.wav" („Descargar WAV") und „export.fileSuffix"
>    („procesado").
> 6. `web/ui/app.js`: der Knopf wird mit den Wiedergabeknöpfen aktiviert
>    und in clearResult deaktiviert; der Dateiname wird gemerkt. Beim Klick:
>    WAV bauen, Blob „audio/wav", Objekt-URL, temporäres `<a download>` mit
>    dem Namen „<Name ohne letzte Endung>-procesado.wav", `click()`, URL nach
>    10 000 ms freigeben (Safari startet den Download vielleicht noch).
> 7. `.github/workflows/ci.yml`: numpy 2.5.4 und soundfile 0.14.0
>    installieren; neuer letzter Schritt `python tests/ref/wav_ref.py
>    --check`.
> 8. `docs/arquitectura.md`, Abschnitt 3: Zeilen für die neuen Dateien;
>    Zeilen von index.html, app.js, i18n.js und ci.yml anpassen.
>
> Danach git status zeigen.

## Abgelehnt und Korrekturen

- Nichts abgelehnt. Claude Code hat nichts ausgeführt, wie verlangt.
- Abweichung, angenommen: ein Name mit Punkt am Anfang („.hidden") behält
  den Punkt („.hidden-procesado.wav"), weil ein Punkt am Anfang keine
  Endung abtrennt.
- Claude Code hat den Knopf in die bestehende Liste `playbackButtons`
  aufgenommen statt in eine zweite Liste; das entspricht dem Prompt.

## Ergebnis

- **Commit:** 74479bd („F1.5: WAV export written by hand, reference vectors
  from soundfile"); CI #2 grün.
- **Prüfung durch Claude vor dem Commit:** 32/32 Tests grün; die 12 Tests
  des Prototyps laufen auch mit dem `wav.js` von Claude Code (zwei getrennt
  geschriebene Fassungen, gleiche Datei Byte für Byte); `wav_ref.py
  --check`: OK; Prettier, ESLint, ruff, `check_secrets.py`: OK;
  5 Mutationen in `wav.js` (Skala 32768, `trunc` statt `round`, −0, ohne
  Begrenzung, Big-Endian) alle erkannt.
- **Prüfung im Browser (Fran):** Datei geladen, „Descargar WAV": der Name
  endet auf „-procesado.wav", die Datei spielt in einem normalen Player und
  klingt wie die verarbeitete Fassung auf der Seite.
