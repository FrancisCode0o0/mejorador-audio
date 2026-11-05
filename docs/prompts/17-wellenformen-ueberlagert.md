# 17 · Oberfläche – Original und Verarbeitung übereinander zeigen

- **Datum:** 29.10.2026 (Abschluss von F1.6)
- **Werkzeug:** Claude (Chat auf claude.ai, Opus 5.5), Code geprüft
- **Gruppe:** wesentlich (Aufbau der App)

## Prompts (Original auf Spanisch, sinngemäß übersetzt)

> Perfekt, man hört es lauter, aber das Bild des Spektrogramms ändert
> sich nicht.

> Ja, man soll den Unterschied zum Original sehen.

## Antwort (Zusammenfassung)

- Das Bild ist die Wellenform, nicht das Spektrogramm (das kommt in F2).
- Sie ändert sich nicht, weil `app.js` seit F1.4 nur die verarbeitete
  Fassung zeichnet; beim Umschalten auf „Original" bleibt das Bild gleich.
- Zwei Möglichkeiten: (a) die Wellenform folgt dem Knopf, der gerade
  spielt; (b) beide übereinander, das Original dahinter und heller.

## Entscheidung (Fran)

(b), in F1.7: gleiche Leinwand, gleiche Skala (±1), Farben als
CSS-Variablen. So sieht man ohne Klick, was die Verarbeitung verändert.
