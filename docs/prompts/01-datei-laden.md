# 01 · F1.1 – Audiodatei wählen und dekodieren

- **Datum:** 23.10.2026
- **Werkzeug:** Claude Code (Sonnet 5.5), Prompt entworfen von Claude
- **Ziel:** Die Seite lädt eine Audiodatei und zeigt ihre Eckdaten. Dazu die
  erste Architekturübersicht (Planschritt 1.0.g).

## Prompt

> Lies docs/style.md und halte dich daran. Planschritt F1.1 von
> mejorador-audio, dazu docs/arquitectura.md (Planschritt 1.0.g). Noch nicht
> committen.
>
> 1. `web/io/decode.js`: `decodeAudioFile(file)` → Promise<AudioBuffer>. Die
>    Datei als ArrayBuffer lesen und mit `AudioContext.decodeAudioData`
>    dekodieren. Den AudioContext nur innerhalb der Nutzeraktion erzeugen oder
>    fortsetzen, weil iOS ihn sonst angehalten lässt. Schlägt das Dekodieren
>    fehl, mit einem Fehler abbrechen, den die Oberfläche anzeigen kann.
> 2. `web/i18n.js`: ein Textobjekt nur für „es" und eine Funktion `t(key)`.
>    Jeder sichtbare Text der Seite kommt von hier.
> 3. `web/ui/app.js` (ES-Modul): ein Dateifeld (`accept="audio/*"`). Nach der
>    Auswahl Name, Dauer in Sekunden (2 Nachkommastellen), Zahl der Kanäle und
>    Abtastrate in Hz zeigen, oder eine klare Fehlermeldung, wenn die Datei
>    nicht dekodierbar ist.
> 4. `web/index.html`: die Seite aus Phase 0 ersetzen. `ui/app.js` als
>    `type="module"` laden. Einspaltiges Layout, das auf einem schmalen
>    Handybildschirm funktioniert.
> 5. `docs/arquitectura.md` auf Englisch, drei Teile: die geplante
>    Verarbeitungskette (Audio → Dekodieren → Mono 48 kHz → Hochpass 80 Hz →
>    [Brummentfernung] → [WPE] → STFT → [eigenes Modell: Verstärkung pro Band]
>    → ISTFT → Mastering-EQ → Kompressor → LUFS-Normalisierung (zwei Durchgänge)
>    → True-Peak-Limiter → WAV-Export); die Ordnerkarte aus docs/style.md; eine
>    Tabelle der heute vorhandenen Dateien mit Schicht und Aufgabe.
>
> Jede neue Datei beginnt mit dem Kopf, den docs/style.md verlangt
> (Planschritt F1.1 oder 1.0.g). Danach `git status` und `git diff --stat`
> zeigen.

## Korrektur nach der Prüfung

Wählte man während des Dekodierens eine zweite Datei, mischten sich zwei
Ergebnisse. Folge-Prompt: jede Auswahl bekommt eine laufende Nummer, nur das
Ergebnis der neuesten wird angezeigt. Außerdem: Kopf in `index.html`,
vollständige Dateitabelle in `docs/arquitectura.md`.

## Ergebnis

- **Commit:** 13af8ba
- **Prüfung im Browser:** WhatsApp-Sprachnachricht (ogg/opus) → 5,53 s,
  1 Kanal, 44100 Hz. Eine .txt-Datei → Fehlermeldung.
