---
name: production-product-builder
description: Build, upgrade, or rescue complete production-grade digital products from a prompt or existing repository. Use for SaaS, web apps, mobile-backed APIs, AI products, marketplaces, dashboards, developer tools, ecommerce, internal tools, landing pages, major features, or prototype-to-production work requiring audit, strategy, design, implementation, integration, testing, security, performance, documentation, and deployment preparation. Also use for premium content-led microsites such as brand, clinic, studio, portfolio, restaurant, venue, launch, event, and campaign sites with motion, 3D, SEO/AEO, structured data, and release gates; or when the request includes auth, payments, observability, growth loops, conversion, retention, referrals, collaboration, or launch readiness.
---

# Production Product Builder

Imported from [Faizalimam990/Startup_builder_pro](https://github.com/Faizalimam990/Startup_builder_pro). Preserve repository instructions and the user's authorization boundaries while using this workflow.

Turn a product prompt or repository into the fullest safe, working, measurable implementation the scope allows. Build end-to-end vertical slices, not disconnected screens. Optimize for durable user value and voluntary sharing rather than manipulative virality.

## Start every run

1. Read repository instructions and inspect the actual stack, entry points, routes, data, auth, tests, CI, deployment, analytics, and uncommitted work.
2. Read [references/execution-workflow.md](references/execution-workflow.md) and [references/quality-gates.md](references/quality-gates.md).
3. Read only the task-relevant resources:
   - brand, practitioner, studio, venue, launch, campaign, portfolio, or any content-led site with no application backend: [references/premium-microsite-playbook.md](references/premium-microsite-playbook.md)
   - tool and integration selection: [references/tool-routing.md](references/tool-routing.md)
   - AI features, agents, RAG, voice, or model integrations: [references/ai-product-playbook.md](references/ai-product-playbook.md)
   - activation, retention, sharing, referrals, launch, SEO/AEO, or growth: [references/growth-playbook.md](references/growth-playbook.md)
   - third-party libraries, assets, hosting, or services: [references/source-catalog.md](references/source-catalog.md)
   - documentation and handoff: [references/deliverables.md](references/deliverables.md)
4. Run `scripts/repo_audit.sh <repository>` when shell access is available. Treat its report as discovery evidence, not proof that a feature works.
5. Translate the request into outcomes, users, jobs, journeys, conversion, requirements, exclusions, risks, assumptions, measurable acceptance criteria, and a dependency-ordered plan. Continue into implementation unless the user explicitly requests planning only.

## Operating contract

- Treat explicit user requirements as authoritative and preserve working architecture and unrelated changes.
- Resolve ordinary ambiguity with documented assumptions. Ask only for decisions that are irreversible, destructive, legally sensitive, externally consequential, or impossible to infer safely.
- Use the smallest architecture that satisfies the job. Extend a sound stack instead of replacing it for preference.
- Complete UI, domain logic, persistence, authorization, integrations, failure states, analytics, tests, and docs for each critical journey.
- Use real tools to inspect, edit, render, browse, test, and measure. Never substitute a plausible claim for executed evidence.
- Never expose secrets, access paid sources or external accounts without authorization, invent proof or metrics, bypass licenses, or run intrusive tests against production or third parties.
- Keep critical content usable without animation, WebGL, third-party scripts, or an ideal network.
- Do not commit, push, deploy, publish, purchase, message users, or mutate production unless explicitly authorized.

## Product decision system

Prioritize work in this order:

1. **Trust and correctness** — data integrity, authorization, privacy, truthful claims, recoverability.
2. **Core value** — the shortest complete path from first visit to a meaningful outcome.
3. **Activation and retention** — onboarding, templates, sensible defaults, saved progress, reminders, collaboration, and recurring value.
4. **Distribution** — indexable content, shareable artifacts, invitations, embeds, referrals, integrations, and launch surfaces that are natural consequences of product use.
5. **Polish** — premium visual hierarchy, motion, 3D, delight, and secondary customization.

For every proposed feature, state the user problem, expected behavior, success signal, abuse/privacy risk, and cheapest valid implementation. Reject decorative or growth work that weakens the core journey.

## Premium microsite track

When the job is to make a visitor understand, trust, and contact or buy — rather than to operate an application — run the specialist track instead of the full product workflow. Signals: brand site, landing page, portfolio, clinic or practice site, restaurant, venue, launch or campaign page, "make it feel premium", scroll animations, 3D product.

Read [references/premium-microsite-playbook.md](references/premium-microsite-playbook.md), then use the bundled knowledge base rather than reasoning from memory:

```bash
python3 scripts/microsite_search.py --list-domains
python3 scripts/microsite_search.py "<query>" --domain archetype|section|motion|webgl|schema|stack|brand|budget|content
python3 scripts/microsite_brief.py --list
python3 scripts/microsite_brief.py --archetype <name> --name "<client>" --out docs/MICROSITE_BRIEF.md
scripts/microsite_gate.sh <project-dir>
```

Track rules that override the generic defaults:

- Replace backend scope with an explicit exclusion list. Never invent auth, tenancy, migrations, or payments for a brochure site.
- Write the real content before the layout; keep it in one typed content module so copy is reviewable in a single diff.
- Ship a complete, accessible, motion-free static shell first. Motion and WebGL are added on top of something that already works.
- One WebGL centrepiece maximum, lazy-loaded behind a poster and a capability gate, with a static fallback that is a deliverable rather than a catch block.
- Every credential, number, testimonial, price, and affiliation comes from the client. Placeholders are marked `TODO(client)` and fail the gate.
- Pre-render the HTML. A client-rendered shell with an empty root element forfeits search, link previews, and no-JS visitors.

When the `ui-ux-pro-max` skill is installed, prefer it for palette, font pairing, and style exploration; `data/brand-kits.csv` is the offline fallback and the default for Codex installations without it.

## Tool orchestration

Select tools by capability and evidence needed; do not install a fashionable stack by default. Follow the decision matrix in `references/tool-routing.md`.

- Use repository search, language servers, type systems, tests, and build tools for code truth.
- Use a controlled browser for rendered behavior, breakpoints, keyboard flow, console/network errors, metadata, and screenshots.
- Use image generation only for original raster assets; use code-native SVG/CSS/canvas for interface primitives and established icon systems.
- Use document, PDF, spreadsheet, and presentation tooling when those formats are actual deliverables, then render and inspect them.
- Use official APIs/connectors for source-of-truth systems; request authorization before writes with external consequences.
- Use specialist security, SEO/AEO, UI/UX, accessibility, performance, and cloud tooling when installed and task-relevant. Fall back to standards-based local checks and document coverage gaps.
- Parallelize independent read-only discovery and verification when the environment explicitly permits agent delegation. Keep edits ownership-safe and integrate before broad tests.

## Build an outcome contract

Before large edits, capture a compact contract in the plan or `docs/PRODUCT_STRATEGY.md`:

- audience, problem, promise, primary action, activation event, and return trigger;
- roles, permissions, core journeys, page/route map, data and integration boundaries;
- functional and non-functional acceptance criteria;
- baseline and target metrics when supplied, plus instrumentation needed to measure them;
- privacy, accessibility, security, performance, reliability, SEO/AEO, and deployment constraints;
- assumptions, exclusions, dependencies, risks, and rollback path.

Never fabricate a baseline or forecast. Mark estimates as hypotheses and define how to validate them.

## Implement in dependency order

1. Safe configuration, environment validation, secrets, and feature flags.
2. Schema, migrations, fixtures, and rollback/backup considerations.
3. Domain logic, API contracts, validation, authorization, idempotency, and error models.
4. Design tokens, accessible primitives, content hierarchy, and all interaction states.
5. Primary journey end to end; then secondary journeys and edge states.
6. External integrations with timeouts, retries, signatures, replay defense, fallbacks, and observability.
7. Ethical growth loop and instrumentation where the product benefits from it.
8. SEO/AEO, structured data, social cards, performance budgets, and offline/degraded behavior.
9. Tests, scans, browser verification, documentation, deployment, and rollback guidance.

After each coherent slice, run focused checks and fix causal failures before expanding scope.

## Engineer growth without dark patterns

When growth is in scope, read `references/growth-playbook.md` and implement at most one primary loop first. A valid loop must connect value to a natural distribution action:

`user receives value -> creates or shares useful artifact -> recipient experiences value -> recipient activates -> loop repeats`

Instrument the funnel from acquisition through activation, retention, referral, and revenue where applicable. Include consent, attribution, abuse controls, unsubscribe/revocation, rate limits, and privacy minimization. Do not add forced invites, contact scraping, spam, fake scarcity, hidden consent, misleading social proof, or rewards that incentivize abuse.

## Production engineering requirements

- Validate every trust boundary with schema-safe parsing and consistent nonsensitive errors.
- Enforce authentication and object-level authorization server-side with deny-by-default permissions.
- Use safe queries, transactions, indexes based on access patterns, bounded pagination, request limits, and upload controls.
- Protect sessions, cookies, webhooks, redirects, URL fetching, payments, CORS, CSRF, and secrets as applicable.
- Add health/readiness checks, structured logs, useful metrics/traces, error reporting hooks, audit events, backup, restore, migration, and rollback guidance.
- Make loading, empty, partial, error, unauthorized, offline, retry, success, and destructive-action states deliberate.
- Meet WCAG 2.2 AA: semantic structure, keyboard access, visible focus, contrast, labels, announcements, touch targets, zoom/reflow, and reduced motion.
- Set product-specific budgets for Core Web Vitals, route weight, images/fonts, third-party scripts, API latency, and expensive render loops. Record exceptions.
- Keep public copy specific and truthful. Never invent customers, reviews, usage numbers, prices, certifications, security guarantees, or outcomes.

## Verify with evidence

Run the applicable subset and record exact commands, results, and gaps:

- format, lint, static analysis, typecheck, unit, integration, API, component, and end-to-end tests;
- production build plus migration and startup smoke checks;
- dependency, secret, SAST, container, and infrastructure scans;
- browser console/network, responsive viewport, keyboard, screen-reader spot check, automated accessibility, visual regression, and reduced-motion checks;
- production-mode performance, metadata, canonical, robots, sitemap, structured data, Open Graph, and broken-link checks;
- authorization, tenant isolation, validation, abuse, webhook, payment, data export/deletion, backup/restore, and rollback tests where relevant.

Run `scripts/project_gate.sh <repository>` near delivery and supplement it with project-specific commands. A skipped check is a coverage gap, not a pass. Never weaken a meaningful test or security control to obtain green output.

## Finish the product

Create only relevant deliverables from `references/deliverables.md`. Ensure the repository contains enough information to set up, configure, migrate, seed, test, build, deploy, observe, troubleshoot, roll back, and report security issues.

Before declaring completion, verify that:

- critical journeys work end to end and acceptance criteria map to evidence;
- production build and critical tests ran successfully, or exact blockers are explicit;
- no known critical/high exploitable security issue, secret, unlicensed asset, fabricated claim, broken placeholder, dead control, or unexplained TODO remains;
- responsive, accessibility, performance, SEO/AEO, privacy, and browser coverage are recorded honestly;
- documentation matches the implementation and the working tree contains only intended changes.

Use the concise evidence-based final format in `references/deliverables.md`. Never call the result production-ready when a required release gate failed or was not run.
