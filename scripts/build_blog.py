#!/usr/bin/env python3
"""Statische blog-generator voor Kelvantis.

Leest een bronbestand (blog-src/<slug>.md) met YAML-frontmatter plus
markdown-body, vult blog-template.html (Jinja2) en schrijft een kant-en-klare,
statische pagina naar blog/<slug>/index.html.

Er gaat niets extra naar Vercel: dit script en de bronnen worden via
.vercelignore uit de deploy gehouden. Alleen de gegenereerde index.html telt.

Gebruik:
    python scripts/build_blog.py            # bouwt alle blog-src/*.md
    python scripts/build_blog.py <slug>     # bouwt alleen dat artikel

Conventies in de body, zie ook blog-src/README.md:
  * De eerste alinea wordt de lead (class "kr-lead").
  * Elke H2 opent met een zelfstandig direct-antwoord van 40-60 woorden
    (de belangrijkste GEO-techniek). Dat is gewoon de eerste alinea na de H2;
    geen aparte markup nodig, hij krijgt dezelfde body-styling.
  * Markeer een accent in een kop met ==tekst== -> <span class="accent">.
  * Markeer een zacht accent in de CTA-titel met %%tekst%% -> <span class="soft">.
  * Zet de tussentijdse dienst-CTA met een losse regel: [[ad]]
"""

from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

import markdown
import yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape
from markupsafe import Markup

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "blog-src"
TEMPLATE_NAME = "blog-template.html"
OUT_DIR = ROOT / "blog"
SITE = "https://kelvantis.com"
DEFAULT_AUTHOR = "Kjell Kuijpers"
DEFAULT_OG_IMAGE = f"{SITE}/og-image.png"
DEFAULT_CTA_TRUST = "Gratis · Geen verplichtingen · Reactie binnen 24 uur"
LINKEDIN = "https://www.linkedin.com/in/kjellkuijpers/"

NL_MONTHS = [
    "januari", "februari", "maart", "april", "mei", "juni",
    "juli", "augustus", "september", "oktober", "november", "december",
]

EM_DASH = "—"


# --------------------------------------------------------------------------- #
# Hulpfuncties
# --------------------------------------------------------------------------- #
def long_date_nl(iso: str) -> str:
    """'2026-04-08' -> '8 april 2026' (geen voorloopnul)."""
    y, m, d = (int(part) for part in iso.split("-"))
    return f"{d} {NL_MONTHS[m - 1]} {y}"


def strip_markers(text: str) -> str:
    """Verwijder ==..== en %%..%% markers en houd de pure tekst over."""
    text = re.sub(r"==(.+?)==", r"\1", text)
    text = re.sub(r"%%(.+?)%%", r"\1", text)
    return text


def apply_markers(escaped: str) -> str:
    """Zet ==..== om naar accent-span en %%..%% naar soft-span."""
    escaped = re.sub(r"==(.+?)==", r'<span class="accent">\1</span>', escaped)
    escaped = re.sub(r"%%(.+?)%%", r'<span class="soft">\1</span>', escaped)
    return escaped


def inline_html(text: str) -> Markup:
    """Escape platte tekst en pas daarna de accent/soft-markers toe."""
    return Markup(apply_markers(html.escape(text, quote=False)))


def render_ad(ad: dict) -> str:
    text = html.escape(ad["text"], quote=False)
    button = html.escape(ad["button"], quote=False)
    url = html.escape(ad["url"], quote=True)
    return (
        '<aside class="kr-ad">\n'
        '  <span class="kr-ad-label">Kelvantis</span>\n'
        f"  <p>{text}</p>\n"
        f'  <a class="btn btn--primary" href="{url}">{button} '
        '<span class="arr">→</span></a>\n'
        "</aside>"
    )


def render_body(md_text: str, ad: dict | None) -> str:
    body = markdown.markdown(md_text, extensions=["extra", "sane_lists"])
    # Eerste alinea wordt de lead.
    body = body.replace("<p>", '<p class="kr-lead">', 1)
    # Tussentijdse dienst-CTA.
    if "[[ad]]" in md_text:
        if ad is None:
            raise SystemExit("Body bevat [[ad]] maar frontmatter mist 'ad'.")
        body = re.sub(r"<p>\s*\[\[ad\]\]\s*</p>", render_ad(ad), body)
    # Krant-koppen.
    body = body.replace("<h2>", '<h2 class="kr-h2">')
    body = body.replace("<h3>", '<h3 class="kr-h3">')
    # Accent-markers in koppen.
    body = apply_markers(body)
    return body


# --------------------------------------------------------------------------- #
# JSON-LD
# --------------------------------------------------------------------------- #
def build_jsonld(meta: dict, canonical: str, headline: str) -> tuple[str, str, str]:
    author = meta.get("author", DEFAULT_AUTHOR)
    og_image = meta["_og_image"]

    article = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": f"{canonical}#article",
        "headline": headline,
        "description": meta["_og_description"],
        "image": og_image,
        "inLanguage": "nl",
        "datePublished": meta["date_published"],
        "dateModified": meta["date_modified"],
        "mainEntityOfPage": {"@id": canonical},
        "isPartOf": {"@id": f"{SITE}/#website"},
        "author": {
            "@type": "Person",
            "name": author,
            "jobTitle": "Oprichter & AI-strateeg",
            "worksFor": {"@id": f"{SITE}/#organization"},
            "image": f"{SITE}/Kjell.jpg",
            "sameAs": [LINKEDIN],
        },
        "publisher": {
            "@id": f"{SITE}/#organization",
            "logo": {"@type": "ImageObject", "url": f"{SITE}/logo.svg"},
        },
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": [".kr-tldr", ".faq-answer"],
        },
    }

    breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{SITE}/blog/"},
            {"@type": "ListItem", "position": 3, "name": headline, "item": canonical},
        ],
    }

    faq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": f"{canonical}#faq",
        "mainEntity": [
            {
                "@type": "Question",
                "name": item["vraag"],
                "acceptedAnswer": {"@type": "Answer", "text": item["antwoord"]},
            }
            for item in meta["faq"]
        ],
    }

    dump = lambda obj: json.dumps(obj, ensure_ascii=False, indent=2)
    return dump(article), dump(breadcrumb), dump(faq)


# --------------------------------------------------------------------------- #
# Build-guards
# --------------------------------------------------------------------------- #
def guard_no_em_dash(out_html: str, slug: str) -> None:
    idx = out_html.find(EM_DASH)
    if idx != -1:
        ctx = out_html[max(0, idx - 40): idx + 40].replace("\n", " ")
        raise SystemExit(
            f"BUILD-GUARD ({slug}): em-dash (U+2014) gevonden in de output. "
            f"Gebruik een gewone streep of en-dash in ranges.\n  ...{ctx}..."
        )


def guard_faq_match(out_html: str, faq_json: str, slug: str) -> None:
    json_answers = [
        q["acceptedAnswer"]["text"] for q in json.loads(faq_json)["mainEntity"]
    ]
    visible = re.findall(
        r'<div class="faq-answer"><p>(.*?)</p></div>', out_html, flags=re.DOTALL
    )
    visible_answers = [html.unescape(v).strip() for v in visible]
    if json_answers != visible_answers:
        raise SystemExit(
            f"BUILD-GUARD ({slug}): FAQ-antwoorden in JSON-LD wijken af van de "
            f"zichtbare FAQ.\n  JSON: {json_answers}\n  Zichtbaar: {visible_answers}"
        )


# --------------------------------------------------------------------------- #
# Build
# --------------------------------------------------------------------------- #
def parse_source(path: Path) -> tuple[dict, str]:
    raw = path.read_text(encoding="utf-8")
    if not raw.startswith("---"):
        raise SystemExit(f"{path.name}: ontbrekende YAML-frontmatter.")
    _, fm, body = raw.split("---", 2)
    meta = yaml.safe_load(fm) or {}
    return meta, body.strip("\n")


def build_one(path: Path, env: Environment) -> Path:
    meta, body_md = parse_source(path)
    slug = meta["slug"]
    canonical = f"{SITE}/blog/{slug}/"
    author = meta.get("author", DEFAULT_AUTHOR)

    og_image = meta.get("og_image", DEFAULT_OG_IMAGE)
    if not og_image.startswith("http"):
        og_image = f"{SITE}/{og_image.lstrip('/')}"
    meta["_og_image"] = og_image

    # Descriptions: meta description kan afwijken van OG en Twitter (bv. korter
    # voor de Twitter-card). Beide vallen terug op de hoofd-description.
    og_description = meta.get("og_description", meta["description"])
    twitter_description = meta.get("twitter_description", meta["description"])
    meta["_og_description"] = og_description

    headline = strip_markers(meta["h1"])
    jsonld_article, jsonld_breadcrumb, jsonld_faq = build_jsonld(
        meta, canonical, headline
    )

    context = {
        "slug": slug,
        "meta_title": meta["meta_title"],
        "description": meta["description"],
        "og_description": og_description,
        "twitter_description": twitter_description,
        "canonical": canonical,
        "og_image": og_image,
        "date_published": meta["date_published"],
        "date_modified": meta["date_modified"],
        "author": author,
        "founded_year": meta["founded_year"],
        "pub_long": long_date_nl(meta["date_published"]),
        "mod_long": long_date_nl(meta["date_modified"]),
        "reading_minutes": meta["reading_minutes"],
        "cluster": meta["cluster"],
        "deck": meta["deck"],
        "tldr": meta["tldr"],
        "h1_html": inline_html(meta["h1"]),
        "faq_title_html": inline_html(meta["faq_title"]),
        "body_html": Markup(render_body(body_md, meta.get("ad"))),
        "faq": meta["faq"],
        "sources": Markup(meta["sources"]) if meta.get("sources") else None,
        "author_bio": meta["author_bio"],
        "related": meta["related"],
        "cta_label": meta["cta_label"],
        "cta_title_html": inline_html(meta["cta_title"]),
        "cta_sub": meta["cta_sub"],
        "cta_primary_label": meta["cta_primary_label"],
        "cta_primary_url": meta["cta_primary_url"],
        "cta_secondary_label": meta.get("cta_secondary_label", "Gratis gesprek plannen"),
        "cta_secondary_url": meta.get("cta_secondary_url", "/contact/"),
        "cta_trust": meta.get("cta_trust", DEFAULT_CTA_TRUST),
        "jsonld_article": Markup(jsonld_article),
        "jsonld_breadcrumb": Markup(jsonld_breadcrumb),
        "jsonld_faq": Markup(jsonld_faq),
    }

    out_html = env.get_template(TEMPLATE_NAME).render(**context)
    if not out_html.endswith("\n"):
        out_html += "\n"

    guard_no_em_dash(out_html, slug)
    guard_faq_match(out_html, jsonld_faq, slug)

    out_path = OUT_DIR / slug / "index.html"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(out_html, encoding="utf-8")
    return out_path


def main() -> None:
    env = Environment(
        loader=FileSystemLoader(str(ROOT)),
        autoescape=select_autoescape(["html"]),
        keep_trailing_newline=True,
    )

    if len(sys.argv) > 1:
        slug = sys.argv[1].strip("/")
        sources = [SRC_DIR / f"{slug}.md"]
        if not sources[0].exists():
            raise SystemExit(f"Bron niet gevonden: {sources[0]}")
    else:
        sources = sorted(p for p in SRC_DIR.glob("*.md") if p.stem != "README")

    if not sources:
        raise SystemExit("Geen bronbestanden gevonden in blog-src/.")

    for path in sources:
        out_path = build_one(path, env)
        print(f"gebouwd: {out_path.relative_to(ROOT).as_posix()}")


if __name__ == "__main__":
    main()
