# 26 · Werkzeug – Gem „Verificador" mit absichtlich eingebautem Fehler testen

- **Datum:** 22.10.2026
- **Werkzeug:** Claude (Chat auf claude.ai), Websuche; Gemini 4 Argon im Gem
- **Gruppe:** ergänzend (Werkzeuge)

## Prompts (Original auf Spanisch, sinngemäß übersetzt)

> Bejahende Anweisungen funktionieren immer besser.

> Such die aktuellen Empfehlungen zum Prompting für Gems und gib mir die
> vollständigen Anweisungen zum Einfügen.

## Antwort (Zusammenfassung)

- Test: Der Gem bekam `floatToInt16` mit einem absichtlich eingebauten
  Fehler. Version 1 der Anweisungen: LaTeX trotz Verbot, eine Kleinigkeit
  als „Fehler" aufgebläht und eine falsche technische Behauptung.
- Zu Frans Satz: praktisch richtig („kein LaTeX" stellt dem Modell gerade
  das Unerwünschte vor Augen), „immer" ist zu stark.
- Aktuelle Empfehlungen von Google: Gliederung in Rolle, Kontext,
  Aufgaben, Format; ein kurzes Beispiel in den Anweisungen; Wichtiges
  oben; die Rolle passend zu den Regeln („skeptischer Prüfer").
- Version 2: Der Gem fand den Fehler, ohne LaTeX und ohne falsche
  Behauptungen.

## Entscheidung (Fran)

Version 2 übernommen; der Gem bekommt keine Wissensdateien, jede Aufgabe
bringt ihre eigene vollständige Spezifikation mit.
