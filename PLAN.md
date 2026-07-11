# KELVANTIS — Implementatieplan (Claude Code)

> Werkwijze: één component per sessie. Elke sessie start met: "Lees DESIGN.md en kelvantis-signature-referentie.html. Bouw uitsluitend wat in deze sessie staat. Kopieer gedrag uit de referentie, interpreteer niet opnieuw."
> Elke sessie eindigt met de checklist uit DESIGN.md §5 en een visuele check op mobiel (360px) én desktop.

## Sessie 0 — Fundering (½ dag)

> **Stackcheck (vastgesteld, 2026-07-08):** statische HTML-site op Vercel — geen framework, geen WordPress. 18 pagina's als `<map>/index.html`, één gedeelde `styles.css`, één `js/site.js` (defer, sitebreed geladen), blog gegenereerd via `scripts/build_blog.py` uit `blog-src/`. **Integratie-aanpak: componenten direct in de codebase — CSS in `styles.css`, JS in `js/site.js`.** Let op: de CSP in `vercel.json` staat voor `script-src` alleen `'self'` + één sha256-hash (van het inline anti-FOUC-script) toe; nieuwe inline scripts vereisen een nieuwe hash, dus alle nieuwe JS gaat in `js/site.js`.

- Zet `DESIGN.md` en `kelvantis-signature-referentie.html` in de root van de repo. ✅
- Voeg de tokens/easings uit DESIGN.md toe aan de globale CSS (of controleer dat ze er al staan). ✅ (`--ease-mech`, `--t-press`, `--t-stamp`, `--t-feed` toegevoegd; rest bestond al identiek)
- Voeg de inkt-focusring en reduced-motion-blok globaal toe. ✅ (focusring bestond, offset/radius gelijkgetrokken naar 2px; `scroll-behavior: auto` toegevoegd onder reduced-motion)
- **Stackcheck (blokkerend):** stel vast waar kelvantis.com op draait. WordPress/Elementor → componenten als klein custom CSS/JS-bestand (enqueue) + shortcodes/blocks; custom code → direct in de codebase. Leg de keuze vast in PLAN.md. ✅ (zie notitie hierboven)
- Definition of done: tokens live, focusring zichtbaar, niets visueel veranderd.

## Sessie 1 — WET 1: De Stempel (1 dag)
- Implementeer `.stamp` + IntersectionObserver sitebreed.
- Vervang ALLE bestaande entrance-animaties (fades/slides) door de stempel. Inventariseer eerst, vervang daarna — geen mix.
- Pas toe op: sectiestickers, H2's, prijsbedragen, badges, FAQ-items.
- DoD: geen enkele fade-in meer op de site; reduced-motion = alles direct zichtbaar.

## Sessie 2 — WET 2: Het Bonnetje, plek 1 (1 dag)
- Bouw de receipt-component (perforatie, leaders, dubbele rule, stempelmark) als herbruikbare partial.
- Eerste inzet: **prijsopbouw op /website-laten-maken/** naast of onder de prijskaarten.
- DoD: bonnetje print bij in-view, één keer; correct op 360px; inhoud klopt met echte prijzen.

## Sessie 3 — Contactflow als bonnetje (1–2 dagen)
- Na formulierverzending op /contact/: aanvraag wordt als bonnetje "geprint" (naam, onderwerp, ref-nummer, tijd) + stempel "ONTVANGEN · REACTIE < 24 UUR".
- Favicon wisselt naar vinkje na verzending. E-mailbevestiging in dezelfde bonnetje-stijl (HTML-mail, simpel).
- DoD: werkt ook zonder JS (normale bevestigingspagina), geen dataverlies, AVG-proof (geen data in URL).

## Sessie 4 — Hero die leeft (1 dag)
- Leadflow-kaart op de homepage: events die doorrollen (script uit referentie), pulse-dot, tikkende timestamps, label `DEMO` zichtbaar.
- Mechanische tellers op de statistieken (stapsgewijs, --ease-mech) + bron-voetnoot als opklapbaar mono-labeltje.
- DoD: "live" tikt echt; demo-label leesbaar; reduced-motion = statische eindstaat.

## Sessie 5 — WET 4: De Feed (1 dag)
- View Transitions API voor paginawissels met klasse-fallback uit de referentie.
- Feed-wissel voor de prijzen-toggle (eenmalig/maandelijks) indien aanwezig.
- DoD: geen crossfades meer; back/forward werkt; geen layout-shift.

## Sessie 6 — WET 3: Ink→Signal hero-morph (½ dag)
- Eén morph, alleen in de homepage-hero (bijv. "handwerk" → mono). Speelt één keer per sessie (sessionStorage).
- DoD: geen CLS, aria-label intact, reduced-motion = eindstaat.

## Sessie 7 — Karakter & vangnet (1 dag)
- 404 "PAPIERSTORING" + knop "storing verhelpen →" (home).
- Easter egg: typ "hype" → stempel "GEEN HYPE" (één keer per sessie, Escape sluit).
- Selectie-highlight in signal met inktrand; scrollbar-accent.
- DoD: alles uitschakelbaar, niets blokkeert interactie.

## Sessie 8 — Projecten → Werkplaats (1–2 dagen)
- Herbouw /projecten/ als "Werkplaats": documenteer eigen systemen als cases (deze website, eigen automations) met echte, meetbare cijfers (laadtijd, bouwtijd, stack) in bonnetje-vorm.
- DoD: nul verzonnen claims; elke meting reproduceerbaar.

## Sessie 9 — Correctieronde na livegebruik (uitgevoerd 11 juli 2026)
Conversie en leesbaarheid winnen van conceptueel design. WET 2 (bonnetje) volledig vervallen en de Ink→Signal-morph geschrapt (zie DESIGN.md §2 "Vervallen"); hero-leadflow verwijderd (dash-label "Live" → "Voorbeeld", vloer-conform); alle vier bonnetjes vervangen door gewone info-kaarten; FAQ-categorieindex uitgelijnd; /privacy/ → /privacybeleid/ en /voorwaarden/ → /algemene-voorwaarden/ met 301's. Case-kaart /projecten/ nu in mensentaal — laadtijd-claim gedekt door verse meting (11-07-2026: mediaan 0,3 s LCP/load over 5 runs, mobiele viewport, zonder lab-throttling; eerste koude aanvraag 3,0 s).
**Open:** oprichterstekst homepage §04 + /over-ons/ — wacht op exacte tekst van Kjell (losse micro-commit). Sessie 10 (samenvoegen workflow + AI) krijgt een eigen plan.

## Later (aparte projecten, elk met eigen plansessie)
- **Configurator** "bouw je systeem" met live meeprintend bonnetje (prijs + levertijd).
- **Het Loket**: AI-intake die een mini-groeiplan afdrukt (gekoppeld aan eigen stack, gelabeld als gegenereerd).
- **Machinekamer**: live geanonimiseerde systeemdata als vervanging van testimonials.
- **Patenttekening-illustraties** voor de vier diensten (eerst stijlproef op één dienst).

## Vaste afspraken
- Kleine PR's; per sessie max. één component live.
- Een lege of indirecte meting is een blokkerend signaal — het onderdeel is pas af als beide kanten van een gedrag direct bewezen zijn (bijv. uitgaand én inkomend, verzenden én tonen). Niet wegverklaren als testartefact zonder tegenbewijs (les uit de VT-freeze van sessie 5/6).
- Na elke sessie: 1 screenshot mobiel + 1 desktop bewaren in /docs/visual-log/ (geheugen tegen stijldrift).
- Nieuwe ideeën tijdens het bouwen → onderaan dit bestand in "Parkeerlijst", niet uitvoeren.

## Notities
- Werkplaats-meetrapport (sessie 8, /projecten/): de cijfers op het case-bonnetje zijn gemeten op 09-07-2026 en moeten **elk kwartaal herijkt** worden (volgende: oktober 2026). Reminder bewust géén automatisering: terugkerende agenda-afspraak "Werkplaats-cijfers herijken (recept in PLAN.md)", eerste week van oktober/januari/april — actie Kjell. Verouderde metingen zijn erger dan geen metingen. Methode per cijfer staat in de voetnoten op de pagina; reproductie: Lighthouse 13.4 ×5 (mediaan, mobiel), transferSize-som homepage ×3, layout-shift-observer met 500ms font-delay, git log.
- Meting /bedankt/ (check sessie 4): er hangt géén analytics of conversiemeting aan /bedankt/ of aan de rest van de site — bewuste keuze, de privacypagina belooft expliciet "geen analytics-trackers". Er is dus ook geen KPI-event nodig bij bonnetje-succes op /contact/; een event toevoegen zou de privacybelofte breken. Wil je ooit meten, dan eerst privacybeleid + CSP herzien (aparte beslissing).
- E-mailbevestiging (sessie 9): de bonnetje-mailtemplate is afgevoerd met het bonnetje-concept. Wil je een autoresponse, stel dan in Formspree (formulier xwvweodo → Settings → Autoresponse) een gewone tekstmail in: "Bedankt voor je bericht — we reageren binnen 24 uur op werkdagen." Actie Kjell, optioneel.
- Lokale verificatie (sessie 3 e.v.): testserver is `npx serve -l 8123` vanuit de repo-root. Correctie (sessie 4): de sporadische valse metingen (848px-overflow) lagen niet aan de python-server maar aan headless Chromium dat styles.css af en toe leeg parset (0 cssRules, ±1 op 6 loads) — treedt ook met npx serve op. Sitefout uitgesloten (live Vercel 6/6 schoon). Metingen doen daarom altijd een guard vooraf: check dat `document.styleSheets` regels bevat, anders pagina herladen.
- 360px-overflow /over-ons/ (sessie 1): op de Vercel-deploy (kelvantis.com) 6× gemeten, scrollWidth stabiel 360 en founder-foto correct begrensd op 300px. De sporadische 848px-meting was een artefact van de lokale python-testserver (CSS-race), geen sitefout. Afgesloten.

## Parkeerlijst
- **LCP-verbetering homepage (eerste kandidaat oktober-herijking, of eerder):** gemeten 2,8 s (mobiel gesimuleerd, 09-07-2026) — tegen de 2,5s-grens. Vermoedelijke winst: hero/LCP-element en font-preload-volgorde. Doel: een tweede vóór/ná-regel op het Werkplaats-bonnetje, zodat "verbeteren op bewijs" een doorlopend verhaal wordt.
- Voorbestaande load-CLS homepage (~0.03–0.05, bron: hero-copy/hero-sub, vermoedelijk Fraunces font-swap bij eerste paint) — ook op de live site aanwezig, los van de sessies. Onder de 0.1-drempel maar het onderzoeken waard (font-metrics-override of size-adjust op de fallback).
- WET 4 / cross-document View Transitions opnieuw proberen zodra Chrome dit betrouwbaar doet. Bevinding sessie 6 (juli 2026): `@view-transition { navigation: auto }` laat de inkomende pagina permanent render-blocked hangen in Chrome stable én Playwright-Chromium (pagereveal vuurt nooit, animaties bevroren op 0, reveals vuren nooit → hero onzichtbaar); Edge werkt wél. Reproductie: interne klik met @view-transition actief, ook met default-crossfade en zonder eigen keyframes. Nu: klasse-feed (inkomend) voor alle browsers.
- Vercel serveert alles in de repo-root publiek: `DESIGN.md`, `PLAN.md` en `kelvantis-signature-referentie.html` zijn dus bereikbaar via kelvantis.com. Overwegen: uitsluiten van deploy (`.vercelignore`) — de referentie-HTML gebruikt bovendien Google Fonts CDN (alleen demo, mag niet in productiepagina's).
