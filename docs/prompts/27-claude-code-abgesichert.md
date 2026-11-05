# 27 · Sicherheit – Claude Code nur mit Freigabe

- **Datum:** 22./23.10.2026
- **Werkzeug:** Claude (Chat auf claude.ai) und Claude Code 2.1.308
- **Gruppe:** ergänzend (Werkzeuge)
- **Hinweis:** Frans Vorgabe stammt aus dem Plan („Berechtigungen, die vor
  jedem Befehl fragen"), nicht aus einem einzelnen Prompt.

## Anlass

Beim Vorbereiten der PC-Sitzung stellte Claude fest: Seit Version
2.1.283 startet Claude Code im Modus `auto`, ein Klassifikator gibt
Befehle ohne Rückfrage frei. Das widersprach Frans Vorgabe.

## Lösung

- Einstellungsdatei: Modus „Manual", `auto` und `bypass` gesperrt,
  Arbeit nur in den drei Repositorys, Lesen und Schreiben auf D:, E: und
  `~/.ssh` verboten.
- Offene Grenze: Diese Regeln bremsen kein Python-Skript, das selbst
  Dateien öffnet, und Windows hat keine Sandbox → die eigentliche Sperre
  ist, dass Fran jeden Befehl sieht. Nie „don't ask again" für `python`
  oder `node`.
- Test der Sperren: „Lies E:\datos" wurde verweigert, „Leg eine Datei an"
  fragte nach (Antwort: Nein).
- Daraus die Freigabeliste für Fran (Dateien zuerst, alphabetisch, mit
  vollem Pfad), die jede Aufgabe für Claude Code begleitet.
