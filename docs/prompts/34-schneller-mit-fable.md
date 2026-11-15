# 34 · Arbeitsweise – schneller bauen mit Claude Fable

- **Datum:** 14.11.2026 (Querprüfung) und 15.11.2026 (Rest)
- **Werkzeug:** Claude (Chat auf claude.ai, Opus 5.5)
- **Gruppe:** ergänzend (Arbeitsweise)

## Prompts (Original auf Spanisch, gekürzt und sinngemäß übersetzt)

> Ich habe Claude Fable bis Ende des Monats. Damit bauen wir den Rest der
> App auf einmal. Danach prüfen andere Modelle, denn ein Modell, das sich
> selbst prüft, macht immer dieselben Fehler.

> Es hat keinen Sinn, jeden Schritt freizugeben, den ich nicht verstehe.
> Du erklärst mir die Grundlagen, ich lerne später. Die Übungen bleiben,
> mindestens doppelt so viele.

> Ein erstes Training mit Fable, ein tieferes danach mit den anderen
> Werkzeugen, alles Automatisierbare automatisiert – in Colab.

## Antwort (Zusammenfassung)

Claude stimmte zu und nannte zwei Grenzen: Hunderte Einzelfreigaben machen
einen großen Durchlauf unmöglich, und ein Nutzungslimit kann ihn
unterbrechen. Daher wird er in Blöcke mit eigenem Commit geteilt. Bei
Funden kleiner Modelle zählt nur ein reproduzierbarer Fall.

## Entscheidung (Fran)

- Fable baut den Rest der App (ab F1.8) in einem oder wenigen Durchläufen,
  in Blöcken. Commit nur, wenn die Tests bestehen und die App eine
  Testdatei verarbeitet; die Commit-Nachricht nennt die Prüfung.
- Keine Freigabe jeder Änderung mehr. Es bleiben feste Sperren: keine
  Laufwerke D: und E:, keine SSH-Schlüssel, keine Installationen außerhalb
  des Prompts, kein Push mit roten Tests.
- Danach Querprüfung durch andere Modelle (Lupe, Gesamtblick, Gem
  „Verifikator“ blind). Fehler gelten nur mit einem Test, der fehlschlägt.
- Fable schreibt auch Datenaufbereitung und Training und startet ein
  erstes Training. Das tiefere Training läuft danach in Colab; Fran sitzt
  nur bei Heiklem und Unverzichtbarem am PC.
- Claude erklärt jeden Teil im Überblick; die PR1-Übungen werden
  mindestens verdoppelt.

**Grund:** Tempo. Die Methode war größer geworden als die App; etwas
freizugeben, das man nicht versteht, schützt nicht. Tests bei jedem Commit
und die Prüfung von außen halten die technische Schuld klein.
