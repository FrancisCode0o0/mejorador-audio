# 14 · Verständnis – was macht die KI in der App, was mache ich?

- **Datum:** 22.10.2026
- **Werkzeug:** Claude (Chat auf claude.ai), Projektwissen durchsucht
- **Gruppe:** wesentlich (Aufbau der App)

## Prompts (Original auf Deutsch, wörtlich, Tippfehler korrigiert)

> Mach KI dynamisch die App oder Stelle ich die App ein? Auf Deutsch.

und danach (auf Spanisch, sinngemäß): Mit welchen Programmen wird das
Modell trainiert?

## Antwort (Zusammenfassung)

- **Fest (einmal entschieden):** Netzarchitektur, Signalparameter
  (Rahmen, Überlappung, Abtastrate), Lautheitsziel, Trainingsdaten. Nach
  dem Training sind die Gewichte eingefroren; die App lernt im Browser
  nichts dazu.
- **Dynamisch (jeder Rahmen von ≈ 20 ms):** Spektrum berechnen → das Netz
  rechnet mit den festen Gewichten eine Maske (0–1 pro Band) → Spektrum ⊙
  Maske → nächster Rahmen, neue Maske.
- **Bild:** Das Training ist das Lernen eines Rezepts, die Gewichtsdatei
  das aufgeschriebene Rezept, der eigene JS-Code die Küche, die es auf
  jede Aufnahme anwendet. Kein Server, kein KI-Dienst.
- **Trainingswerkzeuge:** Python 3.12, PyTorch, numpy, scipy, soundfile;
  Training mit kostenloser GPU auf Kaggle; Bewertung mit PESQ, STOI und
  DNSMOS.
