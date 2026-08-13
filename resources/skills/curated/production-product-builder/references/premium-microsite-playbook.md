# Premium Microsite Playbook

Specialist track for brand, practitioner, studio, product-launch, venue, and campaign sites: content-led, few routes, no application backend, heavy craft in typography, scroll choreography, and one optional WebGL centrepiece.

## Table of contents

1. When this track applies
2. Why the generic product workflow is wrong here
3. Data layer and scripts
4. Required workflow
5. Section grammar
6. Motion doctrine
7. WebGL doctrine
8. Content, proof, and regulated claims
9. Conversion without a backend
10. SEO and AEO for few-route sites
11. Performance budgets
12. Verification evidence
13. Anti-patterns

## 1. When this track applies

Use it when all of these hold:

- the primary job is to make a visitor understand, trust, and contact/buy — not to operate an application;
- there is no authenticated user, tenant, dashboard, or persistent user-owned state;
- one to six routes, most content statically known at build time;
- perceived craft is part of the product promise.

Signals in the request: brand site, landing page, portfolio, practice/clinic site, restaurant, launch page, campaign, "make it feel premium", "award-winning", "scroll animations", "3D product", "like <agency site>".

Do not use it when the request needs accounts, roles, orders, inventory, dashboards, user-generated content, or scheduled jobs. Those go through the main `SKILL.md` workflow. A microsite that later grows a booking system is a migration, not a reason to start with a framework you do not need yet.

## 2. Why the generic product workflow is wrong here

The main contract assumes a backend. On a microsite, most of `SKILL.md` sections on authorization, tenant isolation, migrations, webhooks, and payments are inapplicable. Carrying them in produces a fabricated backend and a bloated plan.

Replace them explicitly in the outcome contract:

| Generic requirement | Microsite substitute |
|---|---|
| Roles and permissions | Audience segments and their single next action |
| Schema and migrations | Content model in typed TS objects or MDX/JSON, versioned in git |
| Authorization tests | Content truthfulness review and asset licence register |
| API contract tests | Link, anchor, deep-link, and form-endpoint checks |
| Uptime/observability stack | Host analytics, uptime ping, and form-delivery alert |
| Activation/retention loop | First-contact conversion and returning-visit recall (brand memory) |

State the exclusion list in writing. An unstated exclusion reads as an omission.

## 3. Data layer and scripts

Queryable intelligence lives in `data/*.csv`. Do not read whole files into context; query them.

```bash
python3 scripts/microsite_search.py "practitioner clinic authority" --domain archetype
python3 scripts/microsite_search.py "scroll reveal pinned section" --domain motion --max-results 4
python3 scripts/microsite_search.py "product bottle glb" --domain webgl
python3 scripts/microsite_search.py "local business doctor" --domain schema
python3 scripts/microsite_search.py "consumer beverage brand" --domain brand
python3 scripts/microsite_search.py "hero with 3d product" --domain section
python3 scripts/microsite_search.py "vite react spa" --domain stack
python3 scripts/microsite_search.py "3d heavy" --domain budget
python3 scripts/microsite_search.py "credential proof" --domain content
```

Generate the build brief before writing any component:

```bash
python3 scripts/microsite_brief.py --archetype practitioner-authority --name "Dr. Example" --out docs/MICROSITE_BRIEF.md
python3 scripts/microsite_brief.py --list
```

The brief emits the outcome contract, token seed, section map, route/file plan, JSON-LD skeleton, budgets, and the verification list. Edit it with real client facts; never ship its placeholders.

Verify the built output:

```bash
scripts/microsite_gate.sh <project-dir>
```

When `ui-ux-pro-max` is installed, prefer it for palette, font pairing, and style exploration and use `data/brand-kits.csv` only as the offline fallback. Codex installations without that skill use the bundled data as the primary source.

## 4. Required workflow

1. **Frame** — archetype, audience, promise, single primary action, proof inventory, exclusions. Query `--domain archetype`.
2. **Brief** — run `microsite_brief.py`, then replace every placeholder with client-supplied fact. Missing facts become open questions in the brief, not invented copy.
3. **Content first** — write the real copy for every section before layout. Layout follows sentence length, not the reverse. Copy lives in a typed content module so it is reviewable in one diff.
4. **Tokens** — colour, type scale (`clamp()` fluid pairs), spacing rhythm, radius, shadow, motion durations/easings as CSS custom properties or Tailwind theme extension. One source of truth. No literal hex or px in components.
5. **Static shell** — full page, semantic landmarks, real content, responsive, keyboard operable, zero motion, zero WebGL. This must be a shippable site on its own. Verify it before proceeding.
6. **Choreography** — add Lenis and GSAP ScrollTrigger per `--domain motion`. Every effect gets a reduced-motion end state.
7. **Centrepiece** — add at most one WebGL or heavy-canvas moment, lazy, budgeted, with a static poster fallback. Query `--domain webgl`.
8. **Distribution** — JSON-LD, OG/Twitter cards, sitemap, robots, favicon set, share image, canonical.
9. **Verify** — `scripts/microsite_gate.sh`, browser pass at four viewports, keyboard pass, reduced-motion pass, throttled-network pass, Lighthouse on the production build.
10. **Hand off** — content-edit guide (where to change copy without touching components), asset licence register, deploy and rollback commands.

Steps 5 and 6 are separable on purpose. If motion is added before the static shell works, the site has no fallback and no baseline to measure against.

## 5. Section grammar

A premium microsite is a sequence of arguments, not a stack of blocks. Each section answers one question and hands off to the next.

```
Hook        -> what is this and why should I keep scrolling
Proof       -> why is this credible (credentials, provenance, work, numbers you can source)
Substance   -> what exactly do I get (services, flavours, rooms, capabilities)
Mechanism   -> how does it work / what happens next
Objection   -> cost, safety, time, risk, FAQ
Human       -> who is behind it
Action      -> the single next step, repeated at the natural decision point
```

Rules:

- One idea per section. If a section needs two headlines, it is two sections.
- The primary action appears in the hook, after Proof or Substance, and in the footer. Three placements, one wording.
- Every section is reachable and readable with JavaScript motion disabled.
- Section vertical rhythm comes from one `--section-y` token, not per-section magic numbers.
- Query `--domain section` for slot lists, layout, motion, and required states per section type.

## 6. Motion doctrine

Motion earns its place by clarifying sequence, hierarchy, or physicality. Decorative motion that delays content is a defect.

- **Transport**: Lenis for smooth scroll. Register it as the ScrollTrigger scroller proxy or use `ScrollTrigger.update` on its `scroll` event; never run two competing scroll systems.
- **Trigger**: ScrollTrigger with `once: true` for reveals. Reserve `scrub` for progress-linked storytelling and `pin` for at most one section.
- **Properties**: animate `transform` and `opacity` only. Animating `width`, `height`, `top`, `margin`, or `filter` on scroll causes layout thrash.
- **Budget**: no more than 3 concurrent scrubbed timelines; kill timelines on unmount; `gsap.matchMedia()` for breakpoint-scoped animations.
- **First paint**: never hide above-the-fold content behind a reveal that requires JS. Hero copy is visible in the HTML paint; motion may only refine it.
- **Reduced motion**: `gsap.matchMedia({ reduced: "(prefers-reduced-motion: reduce)" })` must set the *end state* immediately — not a faster animation, and not a hidden element.
- **Pin discipline**: pinned sections must remain scrollable by keyboard and must not trap focus. Test with Tab from the section above.
- **Duration language**: three durations (fast 150–200ms, base 300–400ms, slow 600–900ms) and two easings. More than that reads as inconsistency, not richness.

Query `--domain motion` for the recipe, snippet, reduced-motion end state, and failure mode of each pattern.

## 7. WebGL doctrine

One centrepiece maximum. It is a feature with a cost, not a background.

- **Justify it**: state what the visitor understands from the 3D that a photograph cannot convey. Rotating a product to inspect it qualifies; a floating abstract blob does not.
- **Asset**: authored GLB/glTF, Draco or Meshopt compressed, baked lighting where possible, textures ≤ 1024px unless justified, single material where possible. Record source and licence before import.
- **Loading**: dynamic-import the canvas; never in the initial chunk. Show a poster image at the exact final composition so there is no layout shift.
- **Fallback**: static render for no-WebGL, `prefers-reduced-motion`, save-data, low device-memory, and failed asset load. The fallback is a first-class deliverable, not a `try/catch`.
- **Runtime**: pause the render loop when offscreen (`IntersectionObserver`) or when the tab is hidden; cap DPR (`Math.min(devicePixelRatio, 2)`); `frameloop="demand"` when the scene only changes on interaction.
- **Mobile tier**: reduce DPR, drop shadows/post-processing, or serve the poster outright below a width or memory threshold. Test on a real mid-range device or throttled emulation.
- **Accessibility**: the canvas is decorative (`aria-hidden`) and every fact it conveys is also in text, or it is interactive and has keyboard controls plus a described alternative. There is no third option.

Query `--domain webgl` for pattern, budget, fallback, and the checks to run.

## 8. Content, proof, and regulated claims

- Every credential, affiliation, award, year, number, and testimonial must come from the client. Nothing on this list may be generated, rounded up, or "made representative".
- Placeholders must be visibly marked (`TODO(client): …`) and must fail the gate. A plausible-looking invented credential is the worst possible defect on a trust-led site.
- Health, medical, legal, and financial sites are high-stakes content. Keep claims descriptive (qualifications held, conditions treated, procedures performed) and avoid outcome guarantees, cure claims, comparative superiority, and patient testimonials. Several jurisdictions restrict medical advertising and testimonials; flag this to the client rather than deciding for them.
- Do not collect health details, identity documents, or other sensitive personal data through a static form. Collect the minimum needed to make contact and say what happens to it.
- Photography of people, premises, and products needs a stated usage right. Record it in the licence register.
- Query `--domain content` for per-section copy formulas and their truthfulness constraints.

## 9. Conversion without a backend

Ranked by cost and reliability:

1. **Direct deep links** — `tel:`, `mailto:`, `https://wa.me/<international-number>`, map link, calendar link. Zero infrastructure, zero PII storage, works offline-ish, trivially verifiable. Correct default for practitioner, venue, and local-service sites.
2. **Hosted form endpoint** — provider POST with server-side spam control. Adds a dependency and a data-processing responsibility.
3. **Own serverless function** — only when you need validation, routing, or a receipt email. Then it needs rate limiting, honeypot/turnstile, input validation, and an error path that does not lose the message.

Whatever the choice: every action needs a success state, a failure state, and a fallback contact route visible on the same screen. Numbers and addresses must be verified against the client's source and formatted for international dialling.

## 10. SEO and AEO for few-route sites

- A single-page site still needs a unique `<title>`, meta description, canonical, and OG/Twitter image. Server-render or pre-render the HTML; a fully client-rendered shell with an empty `<div id="root">` gives crawlers and link unfurlers almost nothing.
- JSON-LD must describe entities that are visibly present on the page. Query `--domain schema` for the archetype template.
- Anchor navigation needs real `id` targets, `scroll-margin-top` for the sticky header, and history-safe links.
- Publish `sitemap.xml` and `robots.txt` even for one route.
- AEO: answer questions in the words visitors use, in a `FAQPage`-backed section, with self-contained answers that survive being quoted out of context.
- Local intent (clinic, restaurant, studio): consistent name/address/phone across the site, schema, and any external listing.

## 11. Performance budgets

Budgets are per route, production build, and are set before implementation. Query `--domain budget` for the tier table.

Defaults for a content microsite without WebGL: initial JS ≤ 150 KB gzip, CSS ≤ 40 KB gzip, LCP image ≤ 200 KB, fonts ≤ 2 families / 4 weights, LCP ≤ 2.5 s and CLS ≤ 0.1 on a throttled mid-range mobile profile.

With a WebGL centrepiece the 3D chunk and GLB are budgeted separately and must be excluded from the initial route weight. A 1.4 MB initial bundle is a budget failure regardless of how good the scene looks.

Font strategy: `preconnect` both Google Fonts origins or self-host; `display=swap`; subset to the scripts actually used; preload only the single hero face.

## 12. Verification evidence

Record commands and outcomes. Skipped is not passed.

```bash
npm run build
scripts/microsite_gate.sh .
npx --yes serve dist            # or the framework preview server
```

Then, against the production build:

- browser pass at 360, 768, 1280, 1920 with console and network clean;
- keyboard-only pass through every interactive element including pinned sections;
- `prefers-reduced-motion: reduce` pass — all content reachable, no motion;
- JS-disabled or slow-3G pass — hero and contact route still usable;
- Lighthouse or equivalent, reported with the throttling profile used;
- automated accessibility scan plus a manual screen-reader spot check of the hero, nav, and contact block;
- link, anchor, `tel:`, `mailto:`, and map-link check;
- structured-data validation and social-card render.

## 13. Anti-patterns

- Client-rendered shell with no pre-rendered HTML, then adding SEO tags that crawlers never see.
- Smooth-scroll library fighting native anchor scrolling, breaking deep links.
- Reveal animations on above-the-fold content, producing a blank hero on slow connections.
- `prefers-reduced-motion` implemented as "same animation, shorter duration".
- Pinned sections that trap keyboard focus or break at 360px.
- WebGL in the initial chunk, or a 3D scene with no poster fallback.
- Invented credentials, stock testimonials, fake counters, fake scarcity, unsourced statistics.
- A design token file that components then ignore with inline hex values.
- Shipping four font families because each looked good in isolation.
- Declaring the site production-ready on the strength of a successful build alone.
