# 07 · F3 – Recherche: Spektrale Subtraktion als Vergleichsbasis

- **Datum:** 26.10.2026
- **Werkzeug:** Claude (Chat auf claude.ai, Opus 5.5), kein Code
- **Anlass:** Der Professor hat die Spektrale Subtraktion als Methode zur
  Rauschminderung empfohlen.
- **Ziel:** Klären, wie die Methode funktioniert, wie sie sich zum
  geplanten Verfahren (SPP-MMSE + OM-LSA, Plan F3, Schritte 2–3) verhält
  und ob sie in den Plan gehört.

## Prompt

> Mein Professor hat mir empfohlen, die Spektrale Subtraktion als Methode
> zum Säubern der Aufnahmen zu versuchen. Wenn ich es richtig verstanden
> habe, ist die Stimme im Spektrogramm leichter zu erkennen, weil sie von
> null aus beginnt.

## Antwort (Zusammenfassung)

- **Korrektur des Verständnisses:** Erkannt wird nicht die Stimme, sondern
  das **Rauschen**. In Sprechpausen klingt nur Rauschen; dort wird sein
  mittleres Spektrum N̂(k) gemessen und danach von jedem Fenster
  abgezogen.
- **Ablauf (Boll 1979):** Signal in kurze Fenster schneiden, FFT;
  je Frequenz k: |Ŝ(k)|² = max(|Y(k)|² − α·N̂(k), β·|Y(k)|²);
  Phase von Y behalten, inverse FFT, Overlap-Add.
  α = Überschätzung des Rauschens, β = Untergrenze (Berouti et al. 1979).
- **Bekannte Schwächen:** „musikalisches Rauschen" (das echte Rauschen
  schwankt um seinen Mittelwert, nach der Subtraktion bleiben einzelne
  Spitzen stehen, die wie Pfeiftöne klingen); braucht Pausen und
  gleichbleibendes Rauschen.
- **Verhältnis zum Plan:** SPP-MMSE + OM-LSA ist ein direkter Nachfahre
  der Spektralen Subtraktion: ebenfalls eine Verstärkung G(k) ≤ 1 je
  Frequenz, aber die Rauschschätzung braucht keine Pausen, und die
  Verstärkung wird geglättet, damit kein musikalisches Rauschen entsteht.
  Ein Ersatz wäre ein Rückschritt gegenüber einer schon getroffenen
  Entscheidung.

## Entscheidung (Fran, 26.10.2026)

Die Spektrale Subtraktion kommt als **Vergleichsbasis** in die Phase F3,
nicht als endgültiges Verfahren: Sie läuft im Parameter-Sweep (F3,
Schritt 9) mit denselben Maßen (PESQ, STOI, DNSMOS, Kurtosis-Verhältnis
des Restrauschens) neben SPP-MMSE + OM-LSA. Das Ergebnis liefert für die
Abgabe den Vergleich „klassisches Verfahren nach Boll gegen das gewählte
Verfahren".

## Quellen

- S. F. Boll, „Suppression of acoustic noise in speech using spectral
  subtraction", IEEE Trans. ASSP 27(2), 1979, S. 113–120.
- M. Berouti, R. Schwartz, J. Makhoul, „Enhancement of speech corrupted by
  acoustic noise", Proc. IEEE ICASSP 1979, S. 208–211.
