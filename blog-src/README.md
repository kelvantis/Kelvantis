# blog-src

Bronbestanden voor de blog. Eén markdown-bestand per artikel: `blog-src/<slug>.md`.
YAML-frontmatter voor metadata en structuur, daaronder de body in markdown.

Het script `scripts/build_blog.py` rendert een bron naar de statische pagina
`blog/<slug>/index.html`. Die gegenereerde HTML committen we; de bron, het
template en het script blijven lokaal en gaan via `.vercelignore` niet mee naar
Vercel. Er draait dus geen framework of build-step op de host.

## Bouwen

```bash
python -m pip install -r scripts/requirements.txt   # eenmalig
python scripts/build_blog.py                        # alle artikelen
python scripts/build_blog.py ai-chatbot-website     # één artikel
```

De build faalt hard bij:

1. een em-dash (`—`) waar dan ook in de output (en-dashes in ranges mogen wel);
2. een FAQ-antwoord in de JSON-LD dat afwijkt van het zichtbare FAQ-antwoord.

## Frontmatter-velden

| Veld | Verplicht | Uitleg |
|------|-----------|--------|
| `slug` | ja | mapnaam onder `/blog/`, bepaalt canonical + trailing slash |
| `meta_title` | ja | `<title>` + OG/Twitter-titel, doelterm vooraan, ~60 tekens |
| `h1` | ja | zichtbare H1; markeer het accent met `==tekst==` |
| `description` | ja | meta description, OG/Twitter-description en JSON-LD-description |
| `deck` | ja | onderkop onder de H1 (`.kr-deck`) |
| `date_published` | ja | ISO-datum, bv. `"2026-04-08"` |
| `date_modified` | ja | ISO-datum |
| `cluster` | ja | katern-label, bv. `AI`, `Automatisering`, `Websites`, `GEO & AEO` |
| `founded_year` | ja | jaartal in de masthead-regel "Opgericht … · Maastricht" |
| `reading_minutes` | ja | getal; rendert als "{n} min lezen" |
| `tldr` | ja | "In het kort"-blok, 40-60 woorden, begint met de kernterm |
| `faq_title` | ja | kop boven het FAQ-blok; accent met `==tekst==` |
| `faq` | ja | lijst van `{ vraag, antwoord }`; **enige bron** voor zowel het zichtbare FAQ-blok als de FAQPage-JSON-LD |
| `author_bio` | ja | bio-zin(nen) in het auteursblok; de LinkedIn-link wordt vast toegevoegd |
| `related` | ja | "Lees ook"-kaarten: `{ cat, title, url, pillar? }`; zet `pillar: true` op de dienstkaart |
| `cta_label` | ja | eyebrow boven de slot-CTA |
| `cta_title` | ja | CTA-titel; markeer het zachte accent met `%%tekst%%` |
| `cta_sub` | ja | CTA-subtekst |
| `cta_primary_label` / `cta_primary_url` | ja | eerste CTA-knop (meestal de dienstpagina) |
| `cta_secondary_label` / `cta_secondary_url` | nee | tweede CTA-knop (default: "Gratis gesprek plannen" → `/contact/`) |
| `cta_trust` | nee | trust-regel onder de CTA (default: "Gratis · Geen verplichtingen · Reactie binnen 24 uur") |
| `ad` | nee | tussentijdse dienst-CTA: `{ text, button, url }`; nodig zodra de body `[[ad]]` bevat |
| `pillar_url` / `pillar_anchor` | nee | documenteren de contextuele pijler-link (die zelf in de body staat) |
| `og_image` | nee | OG/Twitter-afbeelding; default `og-image.png` van de site |
| `sources` | nee | bronnenregel boven het auteursblok (`Bronnen: …`) |
| `author` | nee | default `Kjell Kuijpers` |

Vaste waarden (navbar, footer, auteur-schema, Organization, e-mail, oprichtingsjaar
in de schema's, publisher, speakable) staan in het template en worden 1-op-1
overgenomen uit de bestaande artikelen. Voeg hier geen nieuwe waarden voor toe.

## Body-conventies

Gewone markdown voor H2/H3, alinea's, lijsten en links. Daarnaast:

- **Lead.** De eerste alinea wordt automatisch de lead (`.kr-lead`).
- **Direct-antwoord na elke H2 (de GEO-techniek).** Open elke H2-sectie met een
  zelfstandig, citeerbaar antwoord van 40-60 woorden dat begint met de kernterm.
  Dat is simpelweg de eerste alinea na de kop: geen aparte markup, hij krijgt
  dezelfde body-styling als de rest, zodat het consistent oogt.
- **Accent in koppen.** `==tekst==` → `<span class="accent">tekst</span>`.
  Werkt in `h1`, `faq_title` en in body-koppen (H2/H3).
- **Zacht accent in de CTA-titel.** `%%tekst%%` → `<span class="soft">tekst</span>`.
- **Tussentijdse dienst-CTA.** Zet een losse regel `[[ad]]` op de gewenste plek;
  het script vult hem met het `ad`-blok uit de frontmatter.
- **Eenmalige componenten** (vergelijkingstabel, pull-quote, checklist) schrijf je
  als gewone HTML in de body; markdown laat die ongemoeid doorlopen. Let dan zelf
  op: geen em-dashes (de build-guard vangt ze af).

## Tekst

Nederlands, wij-vorm, nuchter. Geen verzonnen cijfers of garanties. Trailing
slashes op interne links.
