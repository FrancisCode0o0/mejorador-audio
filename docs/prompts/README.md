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
(Commit) und Prüfung. Prompts aus Chats auf Spanisch stehen sinngemäß auf
Deutsch; rekonstruierte Prompts sind in ihrer Datei als solche markiert.

Welche Werkzeuge, Modelle und Harnesses mit welcher Version im Projekt
eingesetzt werden und wofür: `00-werkzeuge.md`.

Zwei Gruppen: **wesentliche Prompts** betreffen den Aufbau der App
(Funktionen, Architektur, Daten, Code); **ergänzende Prompts** betreffen
Arbeitsweise, Werkzeuge und Organisation.

## Wesentliche Prompts

| Nr | Datei | Schritt / Thema | Commit |
|---|---|---|---|
| 01 | `01-datei-laden.md` | F1.1 · Datei wählen und dekodieren | 13af8ba |
| 02 | `02-mono-48khz.md` | F1.2 · Mono-Mix und 48 kHz | c747595 |
| 03 | `03-wellenform.md` | F1.3 · Wellenform im Canvas | 6313743 |
| 04 | `04-ab-wiedergabe.md` | F1.4 · Verarbeitungskette und A/B-Wiedergabe | 6490709 |
| 05 | `05-positionsleiste.md` | F1.4b · Gemeinsame Positionsleiste, Pause und Stopp | „F1.4b: shared position bar, pause and stop" |
| 06 | `06-wav-export.md` | F1.5 · WAV-Export, von Hand geschrieben | 74479bd |
| 07 | `07-spektrale-subtraktion.md` | F3 · Recherche: Spektrale Subtraktion als Vergleichsbasis (Chat, kein Code) | — |
| 08 | `08-spitzennormalisierung.md` | F1.6 · Spitzennormalisierung, erstes Glied der Kette | „F1.6: peak normalisation as the first link of the chain" |
| 09 | `09-projektursprung.md` | Planung · Eigene Alternative zu Adobe Enhance Speech (rekonstruiert) | — |
| 10 | `10-mobil-sprachen-lautheit.md` | Anforderungen · Handy, drei Sprachen, Lautheitsziel | — |
| 11 | `11-lernen-aus-nutzung.md` | Datenschutz · Lernt das Modell aus der Nutzung? | — |
| 12 | `12-paaraufnahmen.md` | Daten · Aus zwei ähnlichen Fassungen lernen | — |
| 13 | `13-wartbarer-code.md` | Architektur · Schichten dsp/io/ui, wartbarer Code | — |
| 14 | `14-rolle-der-ki.md` | Verständnis · Was macht die KI in der App? | — |
| 15 | `15-nur-sprache-mono-stereo.md` | Umfang · Nur Sprache? Mono oder Stereo | — |
| 16 | `16-langsames-anhoeren.md` | F3A · Einen Abschnitt verlangsamt anhören (WSOLA) | — |
| 17 | `17-wellenformen-ueberlagert.md` | F1.7 · Original und Verarbeitung übereinander (später ersetzt, siehe 32) | — |
| 32 | `32-mobil-sprachen-wellenform.md` | F1.7 · Handy-Layout, Sprachprüfung, zwei Wellenformen, Abspielmarke und Uhr | „F1.7: two waveform rows, playhead, clock and language check" |

## Ergänzende Prompts

| Nr | Datei | Thema | Commit |
|---|---|---|---|
| 18 | `18-rollenverteilung.md` | Wer baut, wer prüft? (Option D) | — |
| 19 | `19-jcode-anpassung.md` | jcode als Ausführer, zwei Modi | — |
| 20 | `20-snapshots.md` | Wozu Snapshots der VM? | — |
| 21 | `21-sichere-automatisierung.md` | Nur risikoarm automatisieren | — |
| 22 | `22-isolierte-zellen.md` | Agenten in Zellen (bubblewrap) | — |
| 23 | `23-mehrere-agenten.md` | Mehrere Agenten gleichzeitig? | — |
| 24 | `24-eine-quelle.md` | Eine einzige Quelle für den Plan | — |
| 25 | `25-abgabeprojekt.md` | MejoraDeAudio wird das Abgabeprojekt | — |
| 26 | `26-gem-verifikator.md` | Gem mit eingebautem Fehler testen | — |
| 27 | `27-claude-code-abgesichert.md` | Claude Code nur mit Freigabe | — |
| 28 | `28-ki-steuern-lernen.md` | KI steuern lernen; Vorhersageübungen | — |
| 29 | `29-markierte-dateien.md` | Sind 2727 markierte Dateien schlecht? | — |
| 30 | `30-werkzeuge-dokumentieren.md` | Kursanforderung: Werkzeuge, Modelle, Harness dokumentieren | — |
| 31 | `31-chats-durchsuchen.md` | Alte Chats nach wichtigen Prompts durchsuchen | — |
