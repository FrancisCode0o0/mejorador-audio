# Werkzeuge, Modelle und Harnesses · mejorador-audio

Kursanforderung (2026-10-29): Neben den Prompts werden alle eingesetzten
Werkzeuge dokumentiert – Modelle, Harnesses, Entwicklungswerkzeuge und
Referenzbibliotheken –, jeweils mit Version und Aufgabe im Projekt.

Diese Datei wird in jeder Sitzung aktualisiert, in der sich ein Werkzeug oder
seine Version ändert. Die Versionen stammen aus der Anzeige des Werkzeugs
selbst (Kopfzeile von Claude Code, `package-lock.json`,
`.github/workflows/ci.yml`), nicht aus dem Gedächtnis.

Stand: 2026-11-15 (Beginn des Fable-Durchlaufs, Block 0).

## KI: Modelle und Harnesses

| Werkzeug | Art | Version / Modell | Aufgabe im Projekt | Seit | Schritte |
|---|---|---|---|---|---|
| Claude Code | Harness (Agent im Terminal, Windows) | 2.1.311 · Modell Sonnet 5.5 (Abo Claude Pro); bis zum 05.11.2026 vormittags 2.1.308 (automatisches Update) | Schreibt den Code und die Tests auf dem PC. Modus „Manual": jede Datei und jeder Befehl braucht Frans Freigabe; Zugriff nur auf die Projektordner (Prompt 27). | 2026-10-23 | F1.1–F1.7 |
| Claude Code | Harness (Agent im Terminal, Windows) | 2.1.311 · Modell Claude Fable 5 (`claude-fable-5-2`) | Baut den Rest der App (F1.8–F10) in einem Durchlauf, in Blöcken, ohne Einzelfreigaben; Commit und Push nur mit bestandenen Tests (Prompt 34). Feste Sperren bleiben: keine Laufwerke D: und E:, Installationen nur mit Frans Freigabe. | 2026-11-15 | ab F1.8 |
| Claude (Chat auf claude.ai, Projekt „MejoraDeAudio") | Harness (Chat) mit Brücke zum PC über die Claude-Desktop-App | Modell Claude Opus 5.5 (in der Sitzung eingestellt: `claude-opus-5-5`) | Führt den Projektplan, recherchiert Verfahren und Quellen, entwirft die Prompts für Claude Code, prüft jede Datei in einer sauberen Kopie (Tests, Prettier, ESLint, Mutationen), kontrolliert jeden Push und die CI, schreibt dieses Protokoll. | 2026-10-19 | Planung, F0–F1.7 |
| Gem „Verificador mejorador-audio" (Gemini-App) | Unabhängiger Prüfer (Gem) | Gemini 4 Argon (Abo Google AI Pro) | Unabhängige Referenzimplementierungen und Prüfungen aus der Spezifikation, ohne Claudes Code zu sehen (Prompt 26). Eingerichtet und mit einem eingebauten Fehler getestet; noch nicht für App-Code eingesetzt. | 2026-10-22 | ab F3 |
| jcode-adaptado (angepasster Fork von jcode) | Harness (Agent in der VM) | 0.10.0-ma.3 · Gemini 3.5 Flash Lite (Hauptmodell), Gemini 3.8 Flash (schwierige Diagnosen), Gemma 4 31B (Reserve); Google AI Studio, kostenlose Stufe | Nur Ausführer: führt Tests und lange Läufe in der VM aus und berichtet; ändert keinen Quellcode (`AGENTS.md`, Prompt 19). Befehle laufen in isolierten Zellen (bubblewrap, Prompt 22). Eingerichtet, noch nicht eingesetzt. | 2026-10-20 | ab F1.8 |

## Entwicklungswerkzeuge

| Werkzeug | Art | Version | Aufgabe im Projekt | In der CI seit |
|---|---|---|---|---|
| Node.js | Laufzeit für Tests | 22 (CI, `actions/setup-node@v4`); auf dem PC 22.23.5 (winget, seit 15.11.2026) | Führt die JS-Tests außerhalb des Browsers aus (`node --test`). | 1.0.f |
| Playwright (`@playwright/test`) | Browser-Testwerkzeug | 1.64.1; auf dem PC nur Chromium | Rauchtest: die App startet im Browser und verarbeitet eine Audiodatei (vor jedem Commit und Push). | ab F1.8 |
| Prettier | Formatierer | 3.9.10 | Einheitliches Format von `web/` und `tests/`; die CI bricht bei Abweichungen ab. | 1.0.f |
| ESLint (+ `@eslint/js`, `globals`) | Linter | 10.13.0 (`@eslint/js` 10.0.1, `globals` 17.13.0) | Findet Fehler und verbotene Muster in `web/` und `tests/`. | 1.0.f |
| Python | Laufzeit | 3.12 (CI und PC: `py -3.12`) | Referenzskripte, Geheimnisprüfung, lokaler Testserver (`http.server`). | 1.0.f |
| ruff | Linter und Formatierer (Python) | 0.16.9 | Prüft alle Python-Dateien. | 1.0.f |
| pytest | Testwerkzeug (Python) | 9.1.1 | Tests von `tools/check_secrets.py`. | 1.0.f |
| `tools/check_secrets.py` | Eigenes Werkzeug | — (im Repository) | Verhindert Commits mit API-Schlüsseln oder Tokens (Pre-commit-Hook und CI). | 1.0.f |
| GitHub Actions | CI | `actions/checkout@v4`, `actions/setup-node@v4`, `actions/setup-python@v5` | Bei jedem Push: Tests, Prettier, ESLint, ruff, Geheimnisprüfung, Referenzvektoren. | 1.0.f |
| GitHub Pages | Hosting | `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4` | Veröffentlicht `web/` als statische App. | 1.0.f |

## Referenzbibliotheken (nur in `tests/ref/`, nie in der App)

| Bibliothek | Version | Aufgabe | Seit |
|---|---|---|---|
| numpy | 2.5.4 | Rechnungen der Referenzskripte. | F1.5 |
| soundfile (libsndfile) | 0.14.0 | Unabhängige Referenz für den WAV-Export: schreibt die erwarteten Dateien, mit denen `web/io/wav.js` verglichen wird. | F1.5 |

Die App selbst (`web/`) verwendet keine Bibliotheken: nur JavaScript und die
Web Audio API des Browsers zum Dekodieren und Abspielen.

## Änderungen

| Datum | Werkzeug | Änderung |
|---|---|---|
| 15.11.2026 | Claude Code | Modell Claude Fable 5 (`claude-fable-5-2`) für den Durchlauf F1.8–F10 (Prompt 34). |
| 15.11.2026 | Node.js, Playwright | Node.js 22.23.5 auf dem PC installiert (fehlte dort bisher); `@playwright/test` 1.64.1 mit Chromium. |
| 15.11.2026 | Referenzbibliotheken | Auf dem PC für spätere Blöcke installiert, in die Tabelle kommen sie mit ihrem ersten Einsatz: scipy 1.18.1, pyloudnorm 0.2.0, nara_wpe 0.0.11, pyroomacoustics 0.10.1, librosa 1.0.1, pesq 0.0.4, pystoi 0.4.1. |
| 05.11.2026 | Claude Code | 2.1.308 → 2.1.311 (automatisches Update, Kanal „stable"). F1.7 bis zum Test mit 2.1.308, Commit der F1.7 mit 2.1.311. |
