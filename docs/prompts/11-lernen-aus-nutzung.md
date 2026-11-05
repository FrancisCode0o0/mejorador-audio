# 11 · Datenschutz – kann das Modell aus der Nutzung weiterlernen?

- **Datum:** 19.10.2026
- **Werkzeug:** Claude (Chat auf claude.ai), kein Code
- **Gruppe:** wesentlich (Aufbau der App)

## Prompts (Original auf Spanisch, sinngemäß übersetzt)

> Könnte das Modell nicht auch mit der Nutzung durch die Anwender
> weitertrainiert werden?

> Und mit einer Bewertung von null bis zehn, wenn man vor dem
> Herunterladen eine Hörprobe bekommt?

## Antwort (Zusammenfassung)

- **Nicht automatisch:** Zum Lernen braucht das Modell die richtige
  Antwort, also die saubere Stimme. Von einer Nutzeraufnahme gibt es nur
  die verrauschte Fassung („Prüfungen korrigieren ohne Lösungen").
  Außerdem müsste das Audio das Gerät verlassen; die DSGVO behandelt die
  Stimme als personenbezogenes Datum.
- **Hörprobe:** sehr gut. 20–30 s werden zuerst verarbeitet, A/B
  zwischen Original und bereinigt, Stärke einstellbar, erst dann die
  ganze Datei.
- **Bewertung:** misst, trainiert aber nicht. Skala 1–5 statt 0–10
  (gleichmäßigere Antworten), nie Pflicht vor dem Download, zusammen mit
  der Art des Geräuschs.
- **Statistik statt Audio:** ≈ 78 Zahlen pro Datei (Rauschprofil je
  Band, Schwankung, SNR, Hall, Brummen, Übersteuerung), nur mit
  Einwilligung, gerundet, ohne Kennung → sie eichen den Beispielgenerator
  der Phase 5 mit echten Verteilungen statt geschätzter Bereiche.

## Entscheidung (Fran)

Hörprobe mit A/B in F3; Bewertung 1–5, freiwillige Statistik und manueller
Verbesserungszyklus in F11. Das Modell lernt nie selbstständig aus
Nutzeraufnahmen.
