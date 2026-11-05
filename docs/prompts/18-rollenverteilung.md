# 18 · Arbeitsweise – wer baut, wer prüft?

- **Datum:** 19.10.2026 (Entscheidung), 20.10.2026 (Grundsatz in Frans Worten)
- **Werkzeug:** Claude (Chat auf claude.ai), Websuche
- **Gruppe:** ergänzend (Arbeitsweise)
- **Hinweis:** Der Prompt vom 19.10. stammt aus dem Sitzungsprotokoll, nicht
  wörtlich; der vom 20.10. ist wörtlich (Spanisch, sinngemäß übersetzt).

## Prompts

> 19.10. (Protokoll): Vergleiche mögliche Aufteilungen der Arbeit zwischen
> Claude, Gemini und jcode nach Qualität und Zeit.

> 20.10.: Die Frage ist, wie man am besten programmiert und dabei alle
> Werkzeuge nutzt. Ein einziges Werkzeug kann vielleicht alles, aber wenn
> sich jede Ressource auf einen Teil spezialisiert, könnte es besser
> werden, oder? Mir geht es darum, alle meine Ressourcen zugunsten der
> Qualität arbeiten zu lassen.

## Antwort (Zusammenfassung)

Vier Aufteilungen verglichen:

| | Aufteilung | Stunden | Qualität |
|---|---|---|---|
| A | jcode baut, Claude prüft | ≈ 58 h | mittel |
| B | Claude baut, Gemini prüft | ≈ 55 h | hoch |
| C | B + jcode im Hintergrund | ≈ 52 h | hoch |
| D | C + Bibliotheken als Referenz | ≈ 48 h | am höchsten |

Grundsatz: Spezialisieren lohnt sich nur mit gegenseitiger Prüfung. Der
beste Prüfer für Rechencode ist eine Bibliothek, die Tausende benutzen
(numpy, scipy, pyloudnorm, soundfile), nicht eine zweite KI.

## Entscheidung (Fran)

Option D: Claude baut und testet jede Komponente; Referenzen aus
etablierten Bibliotheken nur in den Tests; Gemini (Gem „Verificador")
schreibt unabhängige Referenzen nur, wo es keine Bibliothek gibt; jcode
führt lange Aufgaben im Hintergrund aus und repariert keinen Code.
