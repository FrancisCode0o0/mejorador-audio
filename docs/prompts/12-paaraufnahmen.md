# 12 · Trainingsdaten – aus zwei ähnlichen Fassungen lernen

- **Datum:** 19.10.2026
- **Werkzeug:** Claude (Chat auf claude.ai), kein Code
- **Gruppe:** wesentlich (Aufbau der App)

## Prompts (Original auf Spanisch, sinngemäß übersetzt)

> Nur eine Frage: Angenommen, wir haben mehrere Stunden Live-Konzerte von
> Liedern, die es auch als Studiofassung gibt. Gäbe es eine Möglichkeit,
> das Modell auch damit zu trainieren?

> Eigentlich kann man Rechtschreibung doch lernen, indem man zwei
> ähnliche Texte liest: Wo der saubere und der schmutzige übereinstimmen,
> ist es fast hundertprozentig sicher, dass es richtig ist.

## Antwort (Zusammenfassung)

- Erste Antwort: nein, denn Live und Studio sind zwei verschiedene
  Darbietungen, und es ist Musik, nicht Sprache.
- Nach dem Einwand: **Die Idee trägt.** Beide Fassungen zeitlich
  ausrichten, je 20-ms-Rahmen und Band prüfen, ob sie übereinstimmen, nur
  dort lernen, den Rest als „ohne Daten" markieren. Das Modell lernt
  Verstärkungen pro Band, und die vertragen eine Ausrichtung auf wenige
  Millisekunden.
- Für Sprache noch besser: **denselben Moment mit zwei Geräten
  aufnehmen** (Mikrofon am Mund = sauber, Handy auf dem Tisch = verrauscht)
  → echte statt simulierter Paare, ohne Lizenzprobleme.

## Entscheidung (Fran)

F5 (optional): eigene Paaraufnahmen zum Bewerten und für ein letztes
Feintuning. Konzerte von Freunden nur mit schriftlicher Erlaubnis, als
Quelle für echtes Rauschen und für einen getrennten Musikmodus (F11);
vorerst zurückgestellt.
