# 30 · Kursanforderung – auch Werkzeuge, Modelle und Harness dokumentieren

- **Datum:** 29.10.2026
- **Werkzeug:** Claude (Chat auf claude.ai, Opus 5.5), kein Code
- **Gruppe:** ergänzend (Organisation)

## Prompt (Original auf Spanisch, sinngemäß übersetzt)

> Schreib auf, dass das sehr wichtig ist: Der Professor hat gesagt, dass
> wir nicht nur die wichtigen Prompts dokumentieren müssen, sondern auch
> die verwendeten Werkzeuge, also die Modelle, den Harness usw.

## Antwort (Zusammenfassung)

- Die Prompt-Dateien nennen schon je ein Werkzeug und Modell; es fehlte
  die Gesamtübersicht.
- Neue Datei `docs/prompts/00-werkzeuge.md` (auf Deutsch): eine Zeile pro
  Werkzeug mit Name, Art (Modell, Harness, Entwicklungswerkzeug,
  Referenz), genauer Version und Modell, Rolle im Projekt und den
  Schritten, in denen es benutzt wurde.
- Versionen werden aus dem abgelesen, was das Werkzeug selbst zeigt (Kopf
  von Claude Code, `package-lock.json`, `ci.yml`), nicht aus dem
  Gedächtnis.

## Entscheidung (Fran)

Als Abgabeschritt E2b im Plan; die Datei wird in jeder Sitzung
aktualisiert, in der sich ein Werkzeug oder seine Version ändert, nicht
erst am Ende.
