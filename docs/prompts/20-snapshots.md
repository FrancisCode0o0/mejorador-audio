# 20 · Verständnis – wozu Snapshots der virtuellen Maschine?

- **Datum:** 20.10.2026
- **Werkzeug:** Claude (Chat auf claude.ai), kein Code
- **Gruppe:** ergänzend (Werkzeuge)

## Prompt (Original auf Spanisch, sinngemäß übersetzt)

> Wozu das mit den Snapshots?

## Antwort (Zusammenfassung)

- Ein Snapshot ist ein Wiederherstellungspunkt: VMware speichert den
  genauen Zustand der Platte; geht etwas schief, ist man in einer Minute
  zurück.
- **Vor einer Installation** (Ubuntu 26.04 ist sehr neu, nicht alles war
  vorher testbar): Bricht sie halb ab, zurück statt einer Stunde
  Paketreparatur.
- **Nach einer gelungenen Installation:** ein bekannter guter Zustand.
- Nur bei ausgeschalteter VM (sonst ≈ 6 GB RAM im Snapshot) und nicht mehr
  als drei, weil VMware die Platte sonst nicht vergrößern lässt.

## Ergebnis

`snapshot_vm.ps1` schaltet sanft ab, erzeugt Snapshots mit Datum und warnt
ab drei.
