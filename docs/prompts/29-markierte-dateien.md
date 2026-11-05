# 29 · Daten – sind 2727 markierte Dateien schlecht?

- **Datum:** 24.10.2026
- **Werkzeug:** Claude (Chat auf claude.ai), PowerShell-Auswertung
- **Gruppe:** ergänzend (Daten)

## Prompt (Original auf Spanisch, sinngemäß übersetzt)

> Wenn alles richtig ist, fangen wir mit F1.5 an.

(nach dem Einfügen der Ausgabe des Downloadskripts: 107 661 Audiodateien,
2727 von der Eingangskontrolle markiert)

## Antwort (Zusammenfassung)

- Noch nicht alles richtig, aber nichts blockiert F1.5 (die Daten werden
  erst in F3 gebraucht).
- Auswertung der CSV nach Datensatz und Grund:
  - DAPS: 1515 wegen 44,1 kHz (erwartet, nur zur Bewertung) und 303
    „unlesbar" = `._*.wav`, Metadaten eines Macs ohne Ton;
  - VCTK 783 und EARS 126 wegen „spektralem Abfall": fast alle zwischen
    20 und 30 dB, gemischte Grenzfrequenzen, gehäuft bei einzelnen
    Sprechern → Fehlalarme (Stimmen mit wenig Energie in den Höhen), die
    Schwelle von 20 dB war für echte Sprache zu knapp.

## Entscheidung (Fran)

Nichts wird ausgeschlossen; der Lader überspringt `._*`; in F3.0 wird die
Schwelle auf 30 dB neu geeicht und alles mit Zahlen geprüft.
