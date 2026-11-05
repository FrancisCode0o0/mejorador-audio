# 15 · Umfang – nur Sprache oder jedes Audio? Mono oder Stereo?

- **Datum:** 23.10.2026 (während F1.4)
- **Werkzeug:** Claude (Chat auf claude.ai), Plan geprüft
- **Gruppe:** wesentlich (Aufbau der App)

## Prompts (Original auf Spanisch, sinngemäß übersetzt)

> Aber die App ist für Audio im Allgemeinen, nicht nur für Sprache.

> Gut, einverstanden, aber ich möchte trotzdem, dass man zwischen Mono
> und Stereo wählen kann, weil es pingelige Leute gibt (wie mich), die die
> beste Qualität wollen. Und falls irgendwann entschieden wird, dass man
> auch als MP3 herunterladen kann, würde das die Qualität noch weiter
> senken.

## Antwort (Zusammenfassung)

- Das widerspricht dem Plan (Abschnitt 0: „verbessert Sprachaufnahmen").
  Die ganze Kette ist auf Sprache gebaut: SPP-MMSE und OM-LSA schätzen die
  Wahrscheinlichkeit von **Sprache**; Becken, Bass oder lange Töne würden
  als Rauschen gedrückt.
- **MP3:** schon ausgeschlossen. Ausgabe bleibt WAV, verlustfrei.
- **Stereo ohne neue Kette:** Analyse auf der Monomischung (L + R) / 2,
  dieselben Verstärkungen auf L und R → das Stereobild bleibt, die Analyse
  läuft einmal, der Speicher verdoppelt sich (≈ 70 MB/min).

## Entscheidung (Fran)

Sprache bis zur Abgabe (v0.2); Musikmodus getrennt in F11. Mono/Stereo
als Wahl direkt nach v0.2, Mono als Standard.
