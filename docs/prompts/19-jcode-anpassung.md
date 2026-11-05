# 19 · Werkzeug – jcode für die Rolle als Ausführer anpassen

- **Datum:** 19.10.2026
- **Werkzeug:** Claude (Chat auf claude.ai); Quelle: jcode von Prof. Dr.
  Jörn Fischer (Gitea der Hochschule, MIT-Lizenz)
- **Gruppe:** ergänzend (Werkzeuge)

## Prompts (Original auf Spanisch, sinngemäß übersetzt)

> Gäbe es irgendwann einen Fall, in dem man das nicht ändern müsste?

> Wäre dieser Teil dann nicht besser so, damit man ihn ändern kann, wenn
> es nötig ist?: MAX_STEPS fest auf 15, ohne jedes Mal /max-turns
> schreiben zu müssen.

## Antwort (Zusammenfassung)

- Das Original ist zum Bauen gemacht (Tests schreiben, Code ändern, bis
  die Tests grün sind) und bricht ab, wenn das Tageskontingent endet.
- Statt Werkzeuge zu löschen: **zwei Modi**, umschaltbar mit `/mode`.
  „Ausführer" (Standard): ohne Bearbeitungswerkzeuge, schreibt nur in
  `reports/`. „Erbauer": Fischers Original, als Reserve, falls Claudes
  Kontingent in einer dichten Phase ausgeht.
- Auf Frans Einwand: alle Stellwerte in `settings.json` statt fest im
  Code, z. B. Schrittgrenze pro Modus (15 / 40), Kompaktierung,
  Reihenfolge der Modelle für den automatischen Wechsel bei
  Kontingentfehlern.
- Die anschließende Sicherheitsprüfung fand vier echte Fehler, die die
  ersten 28 Tests nicht erkannten; danach 32/32 Tests und Mutationstests.

## Entscheidung (Fran)

jcode-adaptado als eigenes Repository auf Basis des Zweigs `multimodal`,
mit beiden Modi und allen Stellwerten in `settings.json`.
