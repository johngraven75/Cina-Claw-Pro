# Ethical Growth and Viral Product Loops

## Table of contents

1. Growth principles
2. Find the loop
3. Loop patterns
4. Funnel and metrics
5. Experiment system
6. Launch surfaces
7. Abuse, privacy, and trust gates
8. Implementation checklist

## 1. Growth principles

Growth is a product outcome, not a collection of popups. Improve the value moment first, then make that value easy to repeat, share, invite into, embed, or discover.

- Optimize for activated and retained users, not raw signups.
- Make sharing optional, useful to the recipient, reversible, and correctly permissioned.
- Put the sender's created value—not generic promotion—at the center of the loop.
- Ask for an invite, review, referral, or upgrade only after demonstrated value.
- Preserve a complete non-social path for users who do not want to invite others.
- Treat every projected uplift as a hypothesis until measured.

## 2. Find the loop

Define these five nodes before building:

1. **Value event** — the concrete outcome the user receives.
2. **Distribution object** — report, page, design, result, file, invite, embed, integration, or public artifact created by use.
3. **Recipient value** — why another person benefits before signing up.
4. **Activation event** — the earliest behavior correlated with ongoing value.
5. **Return trigger** — data change, collaboration, scheduled need, saved work, alert, or new content that brings the user back.

If no credible recipient value exists, choose SEO, partnerships, integrations, lifecycle messaging, or sales-assisted distribution instead of forcing a referral loop.

## 3. Loop patterns

| Pattern | Best fit | Product implementation | Guardrail |
|---|---|---|---|
| Collaborative loop | team/workflow products | invite with scoped role, contextual landing, shared object, activity notification | least privilege, revoke access, rate limit |
| Artifact loop | creation/analysis tools | branded share page, export, remix/template action, canonical attribution | privacy default, preview before publish |
| Communication loop | messaging/scheduling | recipient action without mandatory signup, useful follow-up | consent, unsubscribe, no contact scraping |
| Marketplace loop | supply/demand products | listing page, trust profile, inquiry/transaction workflow | fraud, moderation, dispute process |
| User-generated SEO | structured public contributions | indexable high-quality pages with taxonomy and moderation | no thin/duplicate pages, canonical rules |
| Template loop | repeatable creation tools | template gallery, duplicate/remix, creator credit | license and unsafe-content review |
| Embed/API loop | B2B/developer tools | useful widget, badge, API result, docs, attribution | performance, security, opt-out |
| Referral loop | products with clear economic value | trackable invitation and two-sided reward after qualified activation | fraud controls, terms, reward caps |
| Integration loop | workflow platforms | connect to adjacent tool and expose useful action/data | narrow scopes, token revocation, failure state |

Implement one primary loop until instrumentation demonstrates where it breaks. Avoid stacking invitations, referrals, notifications, and gamification before the core loop works.

## 4. Funnel and metrics

Define an event dictionary with event name, trigger, actor, properties, purpose, retention, and prohibited personal data. Prefer server-confirmed events for important state changes.

Measure:

- acquisition: qualified visit/source -> signup or first meaningful action;
- activation: signup -> activation event, plus time-to-value and completion rate;
- retention: activated cohort returning to repeat the value event at a product-appropriate interval;
- referral: eligible activated user -> share/invite -> recipient visit -> recipient activation;
- revenue: activated account -> qualified conversion, expansion, churn, and recovery where applicable.

Useful loop diagnostics:

- invitation rate = senders / eligible activated users;
- invitations per sender = accepted valid invitations / senders;
- recipient activation rate = activated recipients / unique valid recipients;
- cycle time = median time from sender activation to recipient activation;
- loop coefficient hypothesis = invitations per activated user × recipient activation rate.

Do not label the loop “viral” from the coefficient alone. Check retention, channel saturation, duplicate recipients, fraud, incentives, attribution windows, and cohort quality.

## 5. Experiment system

For every experiment record:

- user problem and evidence;
- hypothesis and mechanism;
- primary metric and guardrail metrics;
- population, eligibility, exposure event, assignment unit, and duration/sample caveat;
- implementation flag and rollback;
- accessibility, privacy, abuse, and support impact;
- decision rule: ship, iterate, stop, or investigate.

Do not ship deceptive control variants. Avoid peeking-driven claims, post-hoc metric selection, or declaring causal lift without a valid comparison. For low traffic, prefer qualitative research, funnel diagnostics, and sequential product improvements over underpowered A/B tests.

## 6. Launch surfaces

Build launch readiness into the product:

- truthful landing page with clear audience, outcome, demo, objections, FAQ, and CTA;
- fast onboarding with templates/sample data and an obvious first value event;
- shareable Open Graph/social cards and stable public URLs where appropriate;
- changelog, feedback path, support contact, status/trust information, and graceful error pages;
- product analytics dashboard or documented queries for activation and retention;
- lifecycle messages tied to user state, with preferences and unsubscribe controls;
- indexable use-case/integration/template content that answers real intent;
- AEO-ready entity facts, concise answer blocks, citations to first-party evidence, and schema matching visible content;
- referral/invite landing pages that preserve context and never reveal private sender data.

## 7. Abuse, privacy, and trust gates

Before release, threat-model the growth surface:

- spam, enumeration, invitation flooding, referral farming, self-referral, bot signups, coupon abuse;
- public-link guessing, unintended indexing, metadata leakage, unsafe previews, permission inheritance;
- user-generated XSS, malware, impersonation, illegal content, harassment, moderation and appeals;
- analytics overcollection, cross-context identity, session replay, consent, deletion, retention, and regional rules;
- notification fatigue, unsubscribe failure, account recovery abuse, and deceptive urgency.

Use rate limits, quotas, eligibility rules, signed/opaque tokens, scoped permissions, preview/confirmation, moderation, audit logs, revocation, block/report, fraud review, reward delays, and data minimization as applicable.

## 8. Implementation checklist

- [ ] Value, activation, distribution, recipient value, and return events are explicit.
- [ ] Primary loop works end to end, including invalid, expired, revoked, duplicate, unauthorized, and rate-limited states.
- [ ] Shared objects default to the safest reasonable visibility and clearly show audience.
- [ ] Analytics events have a typed schema, purpose, minimal properties, and tests.
- [ ] Attribution is idempotent and excludes obvious duplicates/self-referrals.
- [ ] Notifications have preferences, frequency controls, and compliant unsubscribe paths.
- [ ] Public/UGC pages have moderation, canonical/indexing rules, and truthful metadata.
- [ ] Experiment exposure and outcome events are distinct and server-confirmed where necessary.
- [ ] Dashboards segment activation/retention by source and cohort without exposing personal data.
- [ ] Feature flags and rollback isolate risky launch behavior.
- [ ] Support, fraud, privacy, and incident owners are documented when known.
