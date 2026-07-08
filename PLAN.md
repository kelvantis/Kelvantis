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

## Later (aparte projecten, elk met eigen plansessie)
- **Configurator** "bouw je systeem" met live meeprintend bonnetje (prijs + levertijd).
- **Het Loket**: AI-intake die een mini-groeiplan afdrukt (gekoppeld aan eigen stack, gelabeld als gegenereerd).
- **Machinekamer**: live geanonimiseerde systeemdata als vervanging van testimonials.
- **Patenttekening-illustraties** voor de vier diensten (eerst stijlproef op één dienst).

## Vaste afspraken
- Kleine PR's; per sessie max. één component live.
- Na elke sessie: 1 screenshot mobiel + 1 desktop bewaren in /docs/visual-log/ (geheugen tegen stijldrift).
- Nieuwe ideeën tijdens het bouwen → onderaan dit bestand in "Parkeerlijst", niet uitvoeren.

## Notities
- Meting /bedankt/ (check sessie 4): er hangt géén analytics of conversiemeting aan /bedankt/ of aan de rest van de site — bewuste keuze, de privacypagina belooft expliciet "geen analytics-trackers". Er is dus ook geen KPI-event nodig bij bonnetje-succes op /contact/; een event toevoegen zou de privacybelofte breken. Wil je ooit meten, dan eerst privacybeleid + CSP herzien (aparte beslissing).
- Sessie 3 — actie voor Kjell: de e-mailbevestiging in bonnetje-stijl staat klaar in `docs/email-bevestiging-bonnetje.html`. Plakken in Formspree → formulier xwvweodo → Settings → Autoresponse (custom HTML). Dit kan niet vanuit de repo; tot die tijd krijgt de afzender de standaard Formspree-bevestiging (of geen).
- Lokale verificatie (sessie 3 e.v.): testserver is `npx serve -l 8123` vanuit de repo-root. De eerder gebruikte `python -m http.server` bleek flaky (sporadisch deels geladen CSS → valse meetuitslagen in sessie 1 en 2); niet meer gebruiken voor metingen.
- 360px-overflow /over-ons/ (sessie 1): op de Vercel-deploy (kelvantis.com) 6× gemeten, scrollWidth stabiel 360 en founder-foto correct begrensd op 300px. De sporadische 848px-meting was een artefact van de lokale python-testserver (CSS-race), geen sitefout. Afgesloten.

## Parkeerlijst
- Vercel serveert alles in de repo-root publiek: `DESIGN.md`, `PLAN.md` en `kelvantis-signature-referentie.html` zijn dus bereikbaar via kelvantis.com. Overwegen: uitsluiten van deploy (`.vercelignore`) — de referentie-HTML gebruikt bovendien Google Fonts CDN (alleen demo, mag niet in productiepagina's).
