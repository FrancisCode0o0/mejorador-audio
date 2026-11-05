# 13 · Architektur – Code, den ein Mensch warten kann

- **Datum:** 19.10.2026 (Anforderung) und 20.10.2026 (Ordner und Schichten)
- **Werkzeug:** Claude (Chat auf claude.ai), kein Code
- **Gruppe:** wesentlich (Aufbau der App)

## Prompts (Original auf Spanisch, sinngemäß übersetzt)

> 19.10.: Der Code muss sich über die Zeit warten lassen und für einen
> Menschen verständlich sein, auch wenn ihn ein Agent schreibt.
> *(aus dem Sitzungsprotokoll, nicht wörtlich)*

> 20.10.: Steht in den Regeln für Verständlichkeit und Wartung auch,
> wie der Code gruppiert werden soll? Oder braucht es das nicht?

## Antwort (Zusammenfassung)

- Die bisherigen Regeln legten nur Größe und „ein Modul pro Glied" fest,
  nicht Ordner, Reihenfolge und Abhängigkeiten.
- Das ist nötig, nicht kosmetisch: Die Signalkette läuft später in Node
  (Regressionstests, F3) und in einem Web Worker (F4). Beide haben kein
  DOM. Ein Signalmodul, das `document`, ein `<canvas>` oder `t()`
  anfasst, bricht dort.
- Vorschlag: drei Schichten `web/dsp/` (reine Signalverarbeitung,
  Float32Array rein und raus), `web/io/` (Dekodieren, WAV-Export),
  `web/ui/` (Oberfläche); Abhängigkeiten nur `ui → io, dsp`; eine Datei
  pro Glied, `pipeline.js` als einziger Verketter; feste Reihenfolge in
  jeder Datei; Tests spiegeln den Code; Python- und JS-Merkmale mit
  gleicher Struktur; keine „utils"-Sammeldateien.

## Entscheidung (Fran)

Alles übernommen, vor dem ersten Code (F1.1): `docs/style.md`,
`AGENTS.md`, `docs/arquitectura.md`, Prettier, ESLint und ruff in der CI.
