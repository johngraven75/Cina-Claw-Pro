# Quality Gates

## Table of contents

1. Product and UX
2. Frontend
3. 3D and motion
4. Backend and data
5. Security
6. Testing
7. Accessibility
8. Performance
9. SEO and content
10. Infrastructure and operations
11. Documentation
12. Release decision

## 1. Product and UX

- Every major feature maps to a user need and acceptance criterion.
- Primary navigation and conversion path are obvious.
- Empty, loading, partial, success, warning, error, unauthorized, and offline states exist where relevant.
- Forms explain requirements and preserve recoverable user input.
- Destructive actions require appropriate confirmation and recovery.
- Pricing, claims, testimonials, usage figures, and trust badges are factual.

## 2. Frontend

- Semantic HTML and reusable components.
- No broken links, dead controls, console errors, hydration failures, or missing assets.
- Responsive at common mobile, tablet, laptop, and wide-screen sizes.
- Input validation is shared or consistent across client and server.
- Route-level error and loading handling.
- No unnecessary global state or duplicated business logic.
- Third-party scripts load intentionally and do not block critical rendering.

## 3. 3D and motion

- GLB/glTF assets have verified licenses and attribution requirements recorded.
- Geometry, textures, animations, and draw calls are optimized.
- Heavy scenes are lazy-loaded with a poster or skeleton.
- Reduced-motion behavior and a non-WebGL fallback exist.
- Canvas is keyboard/screen-reader safe; essential meaning is also available as text.
- Rendering pauses offscreen or when hidden.
- Mobile quality tier is tested on constrained hardware or emulation.

### Content-led microsites

Run `scripts/microsite_gate.sh <project-dir>` against the production build. It checks prerendered content, head metadata and social cards, JSON-LD validity, robots and sitemap, image alt text and intrinsic dimensions, initial JS/CSS gzip budgets, absence of 3D in the initial load graph, reduced-motion handling, shipped placeholders, asset weights, insecure resources and leaked keys, landmarks and skip link, autoplay media, and anchor targets.

It is static inspection only. It does not replace the browser, keyboard, reduced-motion, throttled-network, Lighthouse, or screen-reader passes listed in sections 7 and 8.

## 4. Backend and data

- Typed or documented API contracts.
- Validation at every trust boundary.
- Authentication and server-side authorization, including object-level checks.
- Consistent error model without sensitive leakage.
- Safe query construction and appropriate indexes.
- Transactions for multi-step consistency.
- Timeouts, retries, idempotency, and rate limits where relevant.
- Migration, rollback, backup, restore, and seed approach documented.
- Health/readiness checks and structured logs.

## 5. Security

Apply the relevant OWASP application and API risks. At minimum verify:

- access control and tenant isolation;
- authentication/session/token security;
- injection prevention;
- XSS and unsafe HTML handling;
- CSRF for cookie-authenticated mutations;
- SSRF and unsafe URL fetching;
- file upload type, size, name, storage, and malware controls;
- path traversal and archive extraction safety;
- CORS and security headers;
- secret handling and accidental logging;
- dependency and supply-chain risk;
- rate limits and abuse prevention;
- audit logs for sensitive actions;
- privacy minimization and retention;
- webhook signature verification and replay defense;
- payment verification on the server where applicable.

Required scans when practical:

- dependency audit;
- secret scan;
- static analysis/SAST;
- container and infrastructure scan;
- dynamic scan in an authorized test environment.

Never run intrusive tests against production or third-party systems without explicit authorization.

## 6. Testing

- Unit tests for domain logic and utilities.
- Integration tests for persistence and external boundaries.
- API tests for validation, authorization, and errors.
- Component tests for important interactive states.
- End-to-end tests for primary journeys.
- Regression test for each fixed defect where practical.
- Visual regression for design-critical components when available.
- Contract tests or mocks for unstable external services.
- Deterministic fixtures and isolated test data.

Tests must assert behavior, not implementation trivia. Do not reduce meaningful coverage to force green status.

## 7. Accessibility

Target WCAG 2.2 AA unless a stricter requirement is stated.

- Keyboard-only operation and logical focus order.
- Visible focus indicators.
- Skip links and landmarks for complex pages.
- Labels, names, descriptions, errors, and status announcements.
- Sufficient text and non-text contrast.
- Zoom/reflow and text-spacing tolerance.
- Touch target size and spacing.
- Captions/transcripts for meaningful media.
- Reduced motion and no flashing hazards.
- Automated audit plus manual keyboard and screen-reader spot checks.

## 8. Performance

- Measure production builds, not only development mode.
- Track Core Web Vitals and route-specific bottlenecks.
- Optimize font loading, images, code splitting, caching, and third-party scripts.
- Keep critical content independent of large 3D/animation bundles.
- Use responsive media, modern formats, compression, and CDN caching.
- Avoid memory leaks, unbounded listeners, runaway timers, and unnecessary render loops.
- Define budgets appropriate to the product and record exceptions.

## 9. SEO and content

- Unique title, description, H1, canonical, and crawl rules per indexable page.
- Valid sitemap, robots, status codes, and redirect rules.
- Open Graph/social cards and stable share images.
- Structured data matches visible content and validates.
- Descriptive links, headings, alt text, and internal linking.
- No duplicate filler copy, hidden keywords, doorway pages, or fabricated claims.
- Content answers user intent and clearly explains the product, proof, objections, and next action.

## 10. Infrastructure and operations

- Environment separation and least-privilege credentials.
- Reproducible deployment and rollback.
- Health checks, autoscaling or capacity assumptions, and graceful shutdown.
- Centralized logs, metrics, traces, error reporting, and useful alerts.
- Backups and restore procedure.
- Data retention, deletion, and incident response responsibilities.
- Cost-sensitive defaults and resource limits.
- CI protects main branches and blocks failed critical gates.

## 11. Documentation

- README commands are tested or clearly marked as examples.
- Environment variables include purpose, required/optional status, and safe sample values.
- Architecture and API documentation match implementation.
- Deployment, migration, rollback, backups, tests, and troubleshooting are documented.
- Security contact and vulnerability reporting process exist.
- Known limitations and deferred risks are explicit.

## 12. Release decision

### Pass

All critical journeys, build, required tests, high-risk security controls, documentation, and deployment prerequisites are complete.

### Conditional pass

Only low/medium risks remain, each with owner, impact, workaround, and target action. State that release is conditional.

### Fail

Any unresolved critical journey, build failure, data-loss risk, secret exposure, broken authorization, critical/high exploitable vulnerability, unlicensed asset, or misleading public claim blocks release.
