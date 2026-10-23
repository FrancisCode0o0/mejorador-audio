# Prompt-Protokoll · mejorador-audio

Hier stehen die wichtigsten Prompts, mit denen die App gebaut wurde
(Anforderung des Kurses: Protokoll der wichtigen Prompts, auf Deutsch).

Autor des Projekts: Francis García Reyes (GitHub: FrancisCode0o0).

## Arbeitsweise

- **Claude Code** (Sonnet 5.5, Modus „Manual") schreibt den Code auf dem PC.
  Jede Datei und jeder Befehl braucht eine Freigabe.
- **Claude** (Chat auf claude.ai) entwirft die Prompts nach dem Projektplan,
  prüft jede Datei, führt die Tests aus und kontrolliert jeden Push.
- **Fran** gibt die Schritte frei und testet die App im Browser.

Die Prompts gingen auf Englisch an Claude Code, weil Code, Kommentare und
technische Dokumente auf Englisch sind (`docs/style.md`). Hier stehen sie
sinngemäß auf Deutsch. Code-Namen bleiben unverändert.

## Format

Eine Datei pro Prompt: `NN-kurzname.md`, mit Ziel, Prompt, Ergebnis
(Commit) und Prüfung.

| Nr | Datei | Schritt | Commit |
|---|---|---|---|
| 01 | `01-datei-laden.md` | F1.1 · Datei wählen und dekodieren | 13af8ba |
| 02 | `02-mono-48khz.md` | F1.2 · Mono-Mix und 48 kHz | c747595 |
| 03 | `03-wellenform.md` | F1.3 · Wellenform im Canvas | 6313743 |
| 04 | `04-ab-wiedergabe.md` | F1.4 · Verarbeitungskette und A/B-Wiedergabe | 6490709 |
| 05 | `05-positionsleiste.md` | F1.4b · Gemeinsame Positionsleiste, Pause und Stopp | „F1.4b: shared position bar, pause and stop" |
