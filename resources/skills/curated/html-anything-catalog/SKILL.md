---
name: html-anything-catalog
description: Search and adapt the 81 HTML design templates from nexu-io/html-anything for polished single-file artifacts. Use for landing pages, prototypes, dashboards, reports, articles, decks, posters, social cards, office documents, mobile mockups, wireframes, animations, Hyperframes, or other designed HTML outputs.
---

# HTML Anything Catalog

Select one design template and use it as an on-demand specification for a user-facing HTML artifact.

## Select and load

1. Run: python3 scripts/search_catalog.py references/catalog.json "deliverable style keywords" --limit 8
2. Choose the template that best matches the content, audience, surface, and aspect ratio.
3. Fetch its current full SKILL.md from nexu-io/html-anything using the indexed path.
4. Check the selected template directory for an inherited license or attribution requirement when redistributing.
5. Apply the user's brand, content, accessibility, and format requirements over template defaults.

## Produce the artifact

- Use real user content and clearly labeled placeholders. Do not invent metrics, testimonials, logos, citations, pricing, or factual claims.
- Build responsive, semantic, accessible HTML with sufficient contrast and keyboard usability.
- Prefer a self-contained artifact. Explain remote fonts, scripts, CDNs, or assets when they affect offline use or privacy.
- Verify rendering and interactions with the appropriate browser skill when available.
- For decks, frames, and video storyboards, preserve exact dimensions and metadata required by the selected template.

## Runtime and publishing boundaries

The upstream application can invoke logged-in coding-agent CLIs with permissive flags. Do not copy or execute those flags, reuse private CLI sessions, install dependencies, start the web app, or deploy it unless the user explicitly asks. Use normal Codex permissions.

Publishing or pasting to WeChat, X, Zhihu, social platforms, or public hosting is an external write and requires explicit scope. Never publish private source material merely because an export target exists.

Source: https://github.com/nexu-io/html-anything (Apache-2.0; bundled templates may retain separate upstream licenses).
