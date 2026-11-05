# 09 · Planung – Projektursprung: eigene Alternative zu Adobe Enhance Speech

- **Datum:** 19.10.2026 (Planungsgespräch vor Phase 0)
- **Werkzeug:** Claude (Chat auf claude.ai), kein Code
- **Gruppe:** wesentlich (Aufbau der App)
- **Hinweis:** Das Planungsgespräch lief außerhalb des claude.ai-Projekts
  und ist dort nicht durchsuchbar. Der Prompt ist aus dem Sitzungsprotokoll
  des Plans (Eintrag „Planificación", 19.10.2026) und aus Frans
  Zusammenfassung vom 20.10.2026 rekonstruiert, nicht wörtlich.

## Prompt (rekonstruiert)

> Ich möchte eine eigene Alternative zu Adobe Enhance Speech bauen, von
> Grund auf und ohne Budget (0 €). Recherchiere, was Adobe Research zu
> seiner Sprachverbesserung veröffentlicht hat, welche freien Verfahren
> es gibt, und ob man aus den Zahlen, die bei der Analyse verrauschter
> Aufnahmen anfallen, etwas für die Trainingsdaten lernen kann.

## Antwort (Zusammenfassung)

- Adobes System arbeitet in zwei Stufen: Entrauschen und danach
  Regenerieren der Stimme (HiFi-GAN-2). Die zweite Stufe erfindet Inhalt
  und braucht große Modelle → das Projekt baut nur die erste Stufe nach.
- Aus Adobes Veröffentlichungen übernommen: DAPS als Bewertungsdatensatz,
  das Degradationsrezept von HiFi-GAN-2 für den Beispielgenerator (F5),
  die Masterkurve (F9), der Blackbox-Vergleich (F8).
- Freie Verfahren mit 0 € Kosten: klassische Kette plus kleines eigenes
  Netz im Stil von RNNoise.

## Entscheidung (Fran)

Web-App, die zu 100 % im Browser läuft (die Aufnahme verlässt das Gerät
nie), eigenes kleines Modell im RNNoise-Stil, DAPS nur zur Bewertung,
Hosting auf GitHub Pages, später installierbar (PWA). Daraus entstand der
Phasenplan.

## Quellen

- J. Su, Z. Jin, A. Finkelstein, „HiFi-GAN-2: Studio-Quality Speech
  Enhancement via Generative Adversarial Networks Conditioned on Acoustic
  Features", 2021.
- G. J. Mysore, „Can we automatically transform speech recorded on common
  consumer devices in real-world environments into professional
  production quality speech?" (DAPS), IEEE SPL, 2015.
- J.-M. Valin, „A Hybrid DSP/Deep Learning Approach to Real-Time
  Full-Band Speech Enhancement" (RNNoise), 2018.
