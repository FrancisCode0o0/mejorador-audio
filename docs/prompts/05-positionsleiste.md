# 05 · F1.4b – Gemeinsame Positionsleiste, Pause und Stopp

- **Datum:** 23.10.2026
- **Werkzeug:** Claude Code (Sonnet 5.5), Prompt entworfen von Claude
- **Ziel:** Eine einzige Leiste für Original und verarbeitete Fassung. Beim
  Wechsel A/B läuft die Wiedergabe an derselben Stelle weiter, damit man
  dieselbe Passage sofort vergleichen kann.
- **Entscheidungen vorab:** Beim Ziehen springt der Klang erst beim
  Loslassen (keine Knackser beim Ziehen). Am natürlichen Ende geht die
  Position auf 0. Bei Pause oder Stopp startet das Loslassen der Leiste
  nichts: die Leiste wählt die Stelle, der Knopf wählt die Fassung.

## Prompt

> Planschritt F1.4b (eine gemeinsame Positionsleiste für Original und
> verarbeitete Fassung). Zuerst docs/style.md lesen. Noch nicht committen.
> Weder node noch die Tests ausführen.
>
> 1. `web/io/playback.js`:
>    - `playSamples(samples, sampleRateHz, onEnded, startSeconds = 0)`: die
>      Quelle mit `source.start(0, resolveStartSeconds(startSeconds,
>      durationSeconds))` starten; Kontextzeit beim Start, Startposition und
>      Dauer merken.
>    - `onEnded(reason)`: reason ist `"ended"`, wenn der Klang von selbst sein
>      Ende erreicht, und `"stopped"`, wenn stopPlayback (oder ein neues
>      playSamples) ihn gestoppt hat. Weiterhin genau einmal pro Klang.
>    - `getPlaybackPositionSeconds()`: null, wenn nichts läuft, sonst
>      `computePlaybackPositionSeconds(startSeconds, startedAtSeconds,
>      audioContext.currentTime, durationSeconds)`.
>    - Zwei exportierte reine Funktionen (ohne Web Audio, in Node testbar):
>      `resolveStartSeconds(requestedSeconds, durationSeconds)` liefert 0, wenn
>      requested < 0 oder ≥ Dauer (vom Ende abspielen beginnt von vorn), sonst
>      requested; `computePlaybackPositionSeconds(startSeconds,
>      startedAtSeconds, nowSeconds, durationSeconds)` liefert
>      startSeconds + max(0, now − startedAt), begrenzt auf [0, Dauer] (now kann
>      gleich startedAt sein, solange iOS den Kontext noch fortsetzt).
> 2. `tests/io/playback.test.js` (node:test) für die zwei reinen Funktionen:
>    1,0 + (10,5 − 10,0) bei Dauer 5 → 1,5; Laufzeit über das Ende → 5;
>    now < startedAt → der Start; requested −1 → 0; requested = Dauer → 0;
>    requested 2,5 von 5 → 2,5. Jeder Test sagt, was er prüft und warum.
>    playback.js in Node zu importieren darf window nicht berühren.
> 3. `web/index.html`: unter der Wellenform und über den Knöpfen ein
>    `<input type="range" id="position">` in voller Breite (min 0, step 0.01,
>    deaktiviert bis Audio da ist, mindestens 2.75rem hoch für Touch) und ein
>    `<span id="position-time">` mit „aktuell / gesamt s".
> 4. `web/ui/app.js`, eine gemeinsame `positionSeconds`:
>    - Original / verarbeitet abspielen: läuft schon ein Klang, zuerst
>      positionSeconds = getPlaybackPositionSeconds(); dann playSamples(samples,
>      48000, onEnded, positionSeconds). Der Wechsel A/B läuft also an derselben
>      Stelle weiter.
>    - onEnded("ended") → positionSeconds = 0; onEnded("stopped") → behalten.
>    - Solange ein Klang läuft, bewegt eine requestAnimationFrame-Schleife die
>      Leiste und den Zeittext; nicht, während der Nutzer zieht.
>    - Ereignis `input` der Leiste (Ziehen): nur den Zeittext ändern. Ereignis
>      `change` (Loslassen): positionSeconds übernehmen; läuft ein Klang, dieselbe
>      Fassung dort neu starten.
>    - Nach dem Laden: max = Dauer, Wert 0, aktiv. clearResult: Position 0,
>      Leiste deaktiviert, Text leer.
> 5. `web/i18n.js`: neuer Text „position.label" („Posición", als aria-label der
>    Leiste).
> 6. `docs/arquitectura.md`, Abschnitt 3: neue und geänderte Dateien eintragen;
>    die Köpfe der geänderten Dateien nennen F1.4b.
>
> Danach git status zeigen.

## Ergänzung (Wunsch von Fran)

> Änderung an F1.4b: zwei Knöpfe statt eines „Parar".
> - „Pausa" (neuer Knopf `id="pause"`, Textschlüssel „play.pause"): stoppt und
>   behält die Position.
> - „Parar" (bestehendes `id="stop"`): stoppt und setzt die Position auf 0;
>   Leiste und Zeittext gehen auf 0 zurück.
> - Reihenfolge: Reproducir original, Reproducir procesado, Pausa, Parar.

## Abgelehnt und Korrekturen

- Claude Code wollte alle vier Dateien mit einem Python-Skript auf einmal
  umschreiben. Abgelehnt; Folge-Prompt: „Keine Python- oder Shell-Skripte zum
  Bearbeiten. Dieselben Änderungen mit dem Edit-Werkzeug, eine Datei nach der
  anderen."
- Nach der Prüfung: fehlendes Leerzeichen in `<button id="stop"type="button"`.

## Ergebnis

- **Tests:** 18/18 grün (Node 22, ausgeführt von Claude).
- **Prüfung im Browser:** Leiste läuft mit; Wechsel A/B bei Sekunde 2 läuft
  dort weiter; Pause behält die Stelle; Stopp geht auf 0; Ziehen beim
  Abspielen springt beim Loslassen; am Ende zurück auf 0.
