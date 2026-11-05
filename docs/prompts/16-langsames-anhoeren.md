# 16 · Funktion – einen Abschnitt verlangsamt anhören

- **Datum:** 29.10.2026
- **Werkzeug:** Claude (Chat auf claude.ai, Opus 5.5), kein Code
- **Gruppe:** wesentlich (Aufbau der App)
- **Anlass:** Vorschlag des Tutors, um bestimmte Stellen genauer zu hören.

## Prompts (Original auf Spanisch, sinngemäß übersetzt)

> Mein Tutor hat vorgeschlagen, eine Zeitlupen-Option für das ganze Audio
> und für bestimmte Teile hinzuzufügen.

> Um bestimmte Teile besser zu hören und damit der Nutzer ihre Qualität
> prüfen kann. Mach es mit B, und setz es dorthin, wo es am günstigsten
> ist.

## Antwort (Zusammenfassung)

- **A · `playbackRate` (≈ 1 h):** langsamer abspielen wie eine
  Schallplatte mit falscher Drehzahl; die Stimme wird tiefer.
- **B · WSOLA (≈ 3–5 h):** kurze, überlappende Stücke (≈ 30 ms) weiter
  auseinander neu zusammensetzen; vor jedem Stück wird der Punkt gesucht,
  an dem die Welle am besten passt → langsamer, gleiche Tonhöhe.
- Zum Beurteilen der Qualität muss die Tonhöhe bleiben, sonst lässt sich
  ein seltsamer Klang der Verarbeitung nicht vom Effekt unterscheiden.
  Nur zum Hören, kein Export.

## Entscheidung (Fran)

B, als neue Phase 3A direkt nach der Abgabe: Abschnitt auf der Wellenform
markieren, 1× / 0,75× / 0,5×, für Original und Verarbeitet; braucht die
Positionslinie (F1.7) und die FFT (F2).

## Quellen

- W. Verhelst, M. Roelands, „An overlap-add technique based on waveform
  similarity (WSOLA) for high quality time-scale modification of
  speech", Proc. IEEE ICASSP 1993.
