# 22 · Sicherheit – zwei Projekte, eine VM: Agenten in Zellen

- **Datum:** 20.10.2026
- **Werkzeug:** Claude (Chat auf claude.ai), Code mit Tests
- **Gruppe:** ergänzend (Werkzeuge)
- **Hinweis:** Prompt aus der Chatzusammenfassung rekonstruiert, nicht
  wörtlich.

## Prompt (rekonstruiert)

> Die Änderungen für das andere Projekt (Abschrift) könnten mein jcode
> betreffen. Prüf das. — Und ich bin für beide Projekte derselbe
> Linux-Benutzer.

## Antwort (Zusammenfassung)

- Konflikt: Der Agent von Abschrift sollte mit einem kostenlosen Modell
  laufen, das die Daten zum Training nutzen darf, und das unter demselben
  Linux-Benutzer → ein `cat ~/.bashrc` hätte den Gemini-Schlüssel und
  später private Aufnahmen an Dritte gegeben.
- Ein eigener Benutzer pro Agent war Fran zu aufwendig → dritter Weg:
  **eine Zelle pro Agent mit bubblewrap**. Jeder Befehl läuft in einem
  maßgeschneiderten Dateisystem: System nur lesbar, `/home` leer bis auf
  die Ordner dieses Agenten, Umgebung leer bis auf eine erlaubte Liste,
  eigenes `/proc`.
- Beim Bau von ma.3 gefunden und behoben: `search_files` konnte mit „.."
  aus dem Sandbox-Ordner heraus lesen; X11 nahm Verbindungen ohne Cookie
  an; Tasteneinschleusung (TIOCSTI) in einer interaktiven Zelle.

## Entscheidung (Fran)

Zellen für alle Agenten der VM; nur der Chat von MejoraDeAudio ändert
jcode und die VM-Skripte.
