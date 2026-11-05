# 23 · Arbeitsweise – mehrere Agenten gleichzeitig?

- **Datum:** 22.10.2026
- **Werkzeug:** Claude (Chat auf claude.ai), Websuche
- **Gruppe:** ergänzend (Arbeitsweise)

## Prompt (Original auf Spanisch, sinngemäß übersetzt)

> Dieses Hin und Her zwischen den Chats … Man muss doch alles verbinden
> können, damit ich nicht der Laufbursche bin. Recherchiere, welche
> Umgebungen es schon gibt. Was bringen sie mit? Welche Vorteile haben
> sie? So etwas könnte nicht nur mir, sondern auch Kommilitonen helfen.

## Antwort (Zusammenfassung)

- Es gibt solche Programme (AionUi, Maestro, PAL MCP u. a.): mehrere
  Terminal-Agenten (Claude Code, Gemini CLI) in einem Fenster, ein
  „Chef" verteilt die Arbeit.
- Erfahrungsberichte (auch von Anthropic): mit einem Agenten anfangen;
  Mehragentensysteme verbrauchen ein Vielfaches an Tokens und stolpern
  beim Programmieren, wo die Entscheidungen eng zusammenhängen.
- Grobe Rechnung: mehrere KIs ≈ 4–5 h Aufbau, Ersparnis großteils vom
  Koordinieren aufgefressen; Chat + Claude Code direkt im Repository
  spart ≈ 6–10 h Kopieren und Einfügen.

## Entscheidung (Fran)

Chat auf claude.ai vom Handy, Claude Code auf dem PC direkt im Repository,
jcode nur für lange Aufgaben; keine Orchestrierung mehrerer KIs.
