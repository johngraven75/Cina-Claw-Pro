# Tool and Integration Routing

## Table of contents

1. Selection rules
2. Capability matrix
3. Product-layer routing
4. Evidence hierarchy
5. External actions and fallbacks

## 1. Selection rules

Choose a tool only when it materially improves correctness, speed, evidence, or maintainability. Prefer, in order:

1. existing repository tools and conventions;
2. authoritative APIs, connectors, schemas, and CLIs;
3. maintained open-source tools with compatible licenses;
4. small original implementations;
5. clearly documented placeholders only when a final implementation is blocked.

Check version compatibility, license, accessibility, privacy, bundle/runtime cost, maintenance, lock-in, failure behavior, and local/deployment support before adopting a dependency. Do not install a tool just because it appears in this catalog.

## 2. Capability matrix

| Need | Preferred capability | Use it for | Required evidence |
|---|---|---|---|
| Repository discovery | `rg`, file inventory, manifests, lockfiles, git diff | stack, routes, scripts, instructions, pending work | command output plus inspected source |
| Code correctness | formatter, linter, typechecker, unit/integration runner | static and behavioral defects | exact commands and exit status |
| Rendered web UX | controlled browser, Playwright/Cypress | journeys, responsive layout, console/network, keyboard | viewport notes, logs, screenshots when useful |
| Accessibility | axe/Lighthouse plus manual keyboard and screen-reader spot checks | WCAG issues and interaction semantics | automated report plus manual coverage |
| Performance | production build analyzer, Lighthouse/WebPageTest, profiler | CWV, route weight, CPU, API/query latency | measured environment and budgets |
| Security | dependency audit, Gitleaks, Semgrep/CodeQL, Trivy, ZAP on authorized test targets | supply chain, secrets, SAST, containers/IaC, DAST | command, target, scope, finding severity |
| APIs | OpenAPI/GraphQL schema, contract tests, Bruno/Postman | typed contracts and boundary behavior | validation/auth/error cases |
| Data | migrations, ORM/SQL tooling, query plans, fixtures | schema, indexes, transactions, recovery | migration up/down and representative query evidence |
| Auth | maintained provider/library or existing auth stack | identity, sessions, passkeys/OAuth/SSO, RBAC/ABAC | server-side authz and abuse tests |
| Payments | provider SDK/CLI and signed webhooks | checkout, subscription, refunds, reconciliation | test-mode event and idempotency evidence |
| Observability | OpenTelemetry, structured logger, error/metrics platform | logs, traces, metrics, alert hooks | local/test signal and redaction review |
| SEO/AEO | crawler, structured-data validator, Lighthouse, search-console tooling | crawlability, metadata, entity clarity | page-level checks and truthful schema |
| Original imagery | image generation or licensed media source | raster hero art, illustrations, social cards | provenance, license, dimensions, optimization |
| Icons/UI primitives | existing design system, licensed icon set, SVG/CSS | accessible interface assets | rendered states and accessible names |
| Motion/3D | Motion/GSAP/Rive/Lottie, Three/R3F/Spline/model-viewer | explanatory motion or spatial interaction | reduced-motion, lazy-load, performance, fallback |
| Office artifacts | document/PDF/spreadsheet/presentation tooling | actual requested deliverable formats | render and visual inspection |
| Source systems | purpose-built connector/API | GitHub, issue trackers, docs, CRM, messaging, cloud | authorization and post-write verification |
| Microsite design intelligence | `ui-ux-pro-max` when installed, otherwise `scripts/microsite_search.py` over `data/*.csv` | archetype, section, motion, WebGL, schema, stack, palette, budget, copy decisions | the queried row plus the resulting decision recorded in the brief |
| Microsite release check | `scripts/microsite_gate.sh` against the production build | prerender, metadata, JSON-LD, budgets, placeholders, reduced motion, landmarks | gate output plus the browser, keyboard and Lighthouse passes it does not cover |

When a named connector or specialist skill is unavailable, do not impersonate it. Use local standards-based checks where possible, state the coverage gap, and recommend installation only when that named capability is essential.

## 3. Product-layer routing

### Discovery and strategy

- Inspect the repository before web research.
- Browse official documentation for current framework/API behavior and primary sources for technical decisions.
- Use spreadsheets or notebooks only when quantitative modeling is material; keep final assumptions and formulas reviewable.
- Use whiteboards/diagrams only when dependencies, state, or ownership are difficult to express linearly.

### Design and content

- Derive tokens and components from the product audience and task, not trend copying.
- Use a UI/UX specialist capability for accessibility, interaction states, responsive behavior, and design-system review when available.
- Generate original imagery only after identifying aspect ratio, responsive crops, art direction, alt-text role, and performance budget.
- Create social preview images from reusable templates so metadata stays consistent across pages.

### Implementation

- Prefer code generators already owned by the framework (migrations, API clients, component scaffolds).
- Keep generated source reproducible; patch its schema/template, not generated output, when possible.
- Introduce queues, caches, search, vector stores, feature flags, or realtime systems only when a documented requirement justifies operational cost.
- Wrap external providers behind narrow adapters when switching cost or outage behavior matters.

### Verification and operations

- Test the smallest causal surface first, then the complete release gate.
- Verify third-party failures with stubs or test modes: timeout, malformed response, duplicate event, replay, rate limit, partial outage, and recovery.
- Use preview/test environments for dynamic security and payment/webhook checks.
- Record tool versions or report timestamps where reproducibility matters.

## 4. Evidence hierarchy

Use the strongest available evidence:

1. executed end-to-end behavior in a representative environment;
2. integration or contract test against a controlled dependency;
3. focused automated test or static tool result;
4. inspected source/configuration;
5. reasoned inference, explicitly labeled;
6. unverified assumption, recorded as a risk.

Do not promote lower-level evidence into a higher-level claim. A successful build does not prove runtime behavior; an automated accessibility scan does not prove keyboard or screen-reader usability; source inspection does not prove deployment.

## 5. External actions and fallbacks

Before any external write, verify the exact account, environment, target, payload, reversibility, and user authorization. Preview or draft when possible. After an authorized write, re-read the target and report what changed.

If a tool is missing:

1. use an existing equivalent in the repository;
2. run a safe local fallback;
3. install only when it is necessary and authorized;
4. otherwise record the exact missing coverage and the command or action needed to close it.
