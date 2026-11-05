# 21 · Arbeitsweise – nur automatisieren, was kein Risiko bringt

- **Datum:** 20.10.2026
- **Werkzeug:** Claude (Chat auf claude.ai), Code mit Tests
- **Gruppe:** ergänzend (Arbeitsweise)

## Prompt (Original auf Spanisch, sinngemäß übersetzt)

> Gut, der Teil mit Download und Installation bleibt unverändert. Aber
> die Dinge, die man ohne Risiko und ohne drastische Änderungen am Plan
> automatisieren kann, mach sie.

## Antwort (Zusammenfassung)

Vorher hatte Claude 19 Kandidaten im ganzen Plan gesucht und nach Risiko
und realistischer Zeitersparnis sortiert. Gebaut wurde nur, was dem
aktuellen Schritt dient:

- Einrichtungsskript der VM und Ampel beim Sitzungsstart;
- Snapshots per `vmrun` (nie erzwungen, nie löschend);
- Schlüsseldetektor `tools/check_secrets.py` mit Pre-Commit-Hook
  (Google-, Kaggle- und GitHub-Schlüssel, private Schlüssel) → nach einem
  früheren Vorfall mit einem sichtbaren API-Schlüssel;
- Benachrichtigung aufs Handy (ntfy), nur mit dem Status, nie mit Daten.

36 neue Tests und Mutationstests; geprüft, dass in keinem der beiden
Repositorys je ein Schlüssel eingecheckt wurde.

## Entscheidung (Fran)

Nur risikoarme, sofort nützliche Automatisierungen; die übrigen bleiben im
Plan an ihrer Stelle.
