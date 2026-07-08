# KELVANTIS — DESIGN.md (de wet)

> Dit bestand is bindend. Elke component, pagina of animatie die hier niet doorheen komt, wordt niet gebouwd.
> Lees dit bestand aan het begin van élke Claude Code-sessie. Bij twijfel: kies de saaiste optie die aan deze regels voldoet.

Stijl in één zin: **neo-brutalisme op warm papier, aangedreven door een zichtbaar systeem.**
Merkessentie: geen hype, wel bewijs. De site vertelt niet dat het systeem werkt — je zíet het werken.

---

## 1. Tokens (ongewijzigd, bestaand)

```css
:root {
  /* Achtergronden (licht) */
  --paper: #F7F2E8;        /* standaard pagina-achtergrond */
  --paper-soft: #F1EADC;
  --paper-deep: #E8DFCB;
  --cream: #FDFAF3;        /* kaarten, nav, formulieren, bonnetjes */

  /* Ink (tekst/borders) */
  --ink: #1F1814;          /* koppen, borders, schaduwen; ook dark-sectie bg */
  --ink-soft: #5A4F46;     /* bodytekst */
  --ink-faint: #8E8275;    /* subtiel, alleen decoratief */
  --rule: #DDD2BC;         /* hairlines */
  --rule-strong: #C8BCA0;

  /* Accent */
  --signal: #FF4D2E;       /* hét oranje: accenten, CTA's, accentwoorden */
  --signal-warm: #F26A3D;
  --signal-deep: #C8331C;  /* oranje TEKST op lichte bg (WCAG AA) */
  --moss: #6B7355;         /* zeldzaam secundair groen */

  /* Op donker */
  --dark: #1F1814;
  --on-dark: #FDFAF3;
  --on-dark-soft: rgba(253,250,243,0.62);

  /* Typografie */
  --font-display: 'Fraunces', Georgia, serif;           /* koppen, 500–600 */
  --font-body: 'Inter Tight', system-ui, sans-serif;    /* body 17px / lh 1.55 */
  --font-mono: 'JetBrains Mono', ui-monospace, monospace; /* labels/meta/systeem */

  /* Bouwstenen */
  --border-ink: 2px solid var(--ink);
  --shadow-hard: 4px 4px 0 var(--ink);
  --shadow-hard-sm: 3px 3px 0 var(--ink);
  --shadow-hard-lg: 6px 6px 0 var(--ink);
  --r-sm: 4px; --r-md: 8px; --r-lg: 10px; --r-pill: 999px;
  --maxw: 1280px; --pad: 48px;

  /* Beweging */
  --ease-soft: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-stamp: cubic-bezier(0.34, 1.4, 0.64, 1);   /* overshoot: stempels */
  --ease-mech: cubic-bezier(0.7, 0, 0.2, 1);        /* mechanisch: feeds, tellers */
  --t-press: 120ms;   /* press-mechaniek */
  --t-stamp: 220ms;   /* stempel-landing */
  --t-feed: 420ms;    /* papier-doorvoer */
}
```

Fonts self-hosted (woff2, variable). **Geen Google Fonts CDN in productie** (AVG/CSP).

---

## 2. De vier signature-wetten

Dit zijn de enige plekken waar de site "durft". Al het andere blijft rustig.

### WET 1 — De Stempel (enige entrance-animatie)
Alles wat binnenkomt, **stempelt**. Badges, sectiekoppen, prijzen, bevestigingen, stickers.
- Beweging: `scale(1.14) → 1` + opacity `0 → 1`, duur `--t-stamp`, easing `--ease-stamp`.
- Zware elementen (koppen) zonder rotatie; stickers/badges landen met hun vaste tilt (−2° / 1.5°, afwisselend).
- Optioneel 1 frame "inktdruk": box-shadow flitst van `--shadow-hard-lg` naar `--shadow-hard`.
- **Verboden:** fade-only, slide-in van links/rechts, blur-in, zoom-out. Er bestaat maar één entrance.
- Stagger bij groepen: 70–80ms.
- **Uitzondering — teken-animaties:** een stroke-animatie die data tekent (zoals de hero-grafieklijn via `stroke-dashoffset`) is geen entrance maar het systeem dat zichtbaar werkt; die mag. Een fade die ondergeschikt is aan zo'n teken-animatie (het vlak dat onder de getekende lijn vult) mag mee, maar nooit als zelfstandige entrance van content.

### WET 2 — Het Bonnetje (universeel output-formaat)
Elke output van "het systeem" is een geprint bonnetje: prijsopbouw, formulier-bevestiging, leadflow-events, blogmeta, configurator-resultaat.
- Anatomie: `--cream` bg, `--border-ink`, `--shadow-hard`, **zigzag-perforatierand onder** (clip-path), inhoud volledig in `--font-mono`.
- Kop: `* KELVANTIS *` gecentreerd + datum/regel-id. Regels: label links, waarde rechts, gestippelde leader ertussen. Totaal/conclusie boven een dubbele rule.
- Print-animatie: regels verschijnen van boven naar beneden (max-height/clip reveal, `--ease-mech`), 90–140ms per regel. Afsluitende stempel ("BEVESTIGD", "GEEN HYPE", prijs) landt als laatste via WET 1.
- Eén bonnetje per view. Het is een moment, geen behang.

### WET 3 — Fraunces spreekt, Mono antwoordt (dialoogregel)
Typografie is een gesprek tussen mens en machine:
- **Fraunces** = de mens: koppen, beloftes, verhaal. Accentwoord: `font-style: italic; color: var(--signal)` (op licht in lopende tekst: `--signal-deep`).
- **JetBrains Mono** = het systeem: labels, meta, data, statussen, bonnetjes, timestamps, bronvermeldingen. Altijd 11–12px, uppercase, letter-spacing 0.12–0.14em (behalve in bonnetjes: normale case toegestaan).
- **Inter Tight** = neutrale drager (body). Nooit voor kop óf systeemtekst.
- Regel: elke sectie bevat beide stemmen. Een Fraunces-belofte zonder mono-bewijsregel eronder is onaf; een mono-datablok zonder menselijke kop is kil.

### WET 4 — De Feed (enige paginatransitie)
Pagina- en state-wissels bewegen als papier door een machine: horizontale doorvoer.
- Uitgaand: content schuift `translateX(-24px)` + fade uit; inkomend: van `translateX(32px)` naar 0. Duur `--t-feed`, easing `--ease-mech`. Implementatie: View Transitions API met klasse-fallback.
- **Verboden:** crossfade, verticale slides, scale-transities.
- Binnen een pagina geldt de feed voor tab-/stapwissels (bijv. prijzen-toggle, configurator-stappen).

---

## 3. Bestaande mechanieken (blijven van kracht)

- **Press-mechaniek** (knoppen/kaarten): hover `translate(2px,2px)` + schaduw 2px; active `translate(4px,4px)` + geen schaduw; transition `--t-press`.
- **Kaart:** paper/cream + `--border-ink` + `--shadow-hard`, radius `--r-md`.
- **Sticker:** ink-blok, cream mono-tekst uppercase, radius 3px, vaste tilt; nummers in `--signal`.
- **Live-indicatoren:** pulse-dot + mono-timestamp. Alles wat "live" heet, moet ook echt ticken (zie §5).
- **Sectieritme homepage:** paper → cream → dark → paper → signal-CTA-blok → dark footer. Sectielabels "§ 01 /".
- **Op donker:** borders/schaduwen in `--on-dark`; op het oranje CTA-blok: ondersteunende tekst in `--ink`.

---

## 4. Verboden (hard)

1. Geen ease-in-out-gezweef; alleen `--ease-soft`, `--ease-stamp`, `--ease-mech`.
2. Geen andere entrance dan de stempel; geen andere transitie dan de feed.
3. Oranje is **signaal**, geen decoratie: alleen accentwoorden, CTA's, nummers, statussen en het ene CTA-blok. Nooit grote vlakken elders, nooit oranje borders "voor de sier".
4. Geen pure-wit/pure-zwart; geen blur, glassmorphism, gradients, paars/blauw AI-look.
5. Geen borders < 2px op kaarten (hairlines `--rule` alleen als scheidingslijn).
6. Geen verzonnen cijfers, testimonials of klantnamen. Demo-data is altijd zichtbaar gelabeld `VOORBEELD` / `DEMO` in mono.
7. Geen animatie langer dan 600ms; geen animatie die interactie blokkeert.
8. Geen nieuwe kleuren, fonts of schaduwstijlen zonder wijziging van dít bestand.

---

## 5. Kwaliteitsvloer (elke PR)

- [ ] `prefers-reduced-motion: reduce`: álle beweging uit, eindstaat direct zichtbaar (stempel = gewoon zichtbaar; bonnetje = volledig geprint; feed = directe wissel; tellers = eindwaarde).
- [ ] Werkt zonder JS: content zichtbaar en bruikbaar (progressive enhancement; animaties zijn opt-in via JS-klasse `.js`).
- [ ] Toetsenbord: zichtbare focusring — 2px `--signal` outline met 2px offset ("inkt-focusring"), nooit `outline: none` zonder vervanging.
- [ ] Contrast AA: oranje lopende tekst op licht = `--signal-deep`; witte tekst op `--signal` alleen voor korte knop-/koplabels.
- [ ] Responsief tot 360px; touch-targets ≥ 44px.
- [ ] "Live"-elementen ticken echt (timestamp/rotatie), anders het woord "live" niet gebruiken.
- [ ] Copy: Nederlands, je-vorm, geen hype-woorden; cijfers met bron in mono-voetnoot.
- [ ] Performance: animaties alleen `transform`/`opacity`/`clip-path`; geen layout-thrash; fonts preloaded.

---

## 6. Definition of 10/10

Een component is pas klaar als:
1. Je hem herkent als Kelvantis **zonder logo** (stempel/bonnetje/dialoog/feed aanwezig waar relevant);
2. Hij de kwaliteitsvloer haalt (§5, alle vinkjes);
3. Er niets aan zit dat je niet kunt verantwoorden ("Chanel-regel": haal één accessoire weg vóór oplevering);
4. Hij iets **bewijst** in plaats van beweert (demo-data gelabeld, bron vermeld, of echt live).
