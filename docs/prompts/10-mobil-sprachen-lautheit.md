# 10 · Anforderungen – für alle, auf dem Handy, in drei Sprachen, mit Lautheitsziel

- **Datum:** 19.10.2026
- **Werkzeug:** Claude (Chat auf claude.ai), Websuche
- **Gruppe:** wesentlich (Aufbau der App)

## Prompts (Original auf Spanisch, sinngemäß übersetzt)

> Diese App soll jeder benutzen können, auch auf dem Handy. Da ich in
> einem deutschsprachigen Umfeld lebe, wäre es gut, wenn sie auch auf
> Englisch und Deutsch übersetzt wäre (das macht man zuletzt, oder?).

> Wird die App den Ton auf eine angenehme Lautstärke bringen, so wie
> MP3gain? Wenn ja, recherchiere, welchen Bereich Fachleute empfehlen.
> In MP3gain stelle ich meistens 95 ein.

## Antwort (Zusammenfassung)

- **Handy:** läuft im Browser ohne Installation; ab Phase 1 eine
  einspaltige Oberfläche und sparsamer Umgang mit Speicher.
- **Sprachen:** Die Übersetzung kommt zuletzt (F10), die Vorbereitung
  aber sofort: alle sichtbaren Texte aus einem einzigen Wörterbuch
  (`web/i18n.js`, `t("schlüssel")`) statt verstreut im HTML.
- **Lautheit:** gemessen in LUFS nach ITU-R BS.1770 statt der
  ReplayGain-Skala von MP3gain. Empfehlungen: −23 LUFS (EBU R128,
  Rundfunk), −18 LUFS (AES TD1008, Sprache im Streaming), −16 LUFS und
  Spitze ≤ −1 dBTP (Podcasts auf dem Handy). MP3gain 95 dB ≈ −12 LUFS
  (eigene Abschätzung, kein veröffentlichter Wert); so laut geht nur mit
  starker Kompression.

## Entscheidung (Fran)

Einspaltige Oberfläche und `i18n.js` ab Phase 1; in F3 ein Wähler für das
Lautheitsziel: −16 LUFS „Handy / Podcast" (Standard), −18, −23 und −12
„Laut" mit Hinweis auf starke Kompression; Spitzengrenze −1,5 dBTP.

## Quellen

- ITU-R BS.1770-5 (11/2023); EBU R128; AES TD1008.
- Auphonic, „Loudness Targets for Mobile Audio, Podcasts, Radio and TV",
  2013.
