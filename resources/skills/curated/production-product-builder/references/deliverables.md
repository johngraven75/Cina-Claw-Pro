# Deliverables and Final Report

## Table of contents

1. Repository deliverables
2. Documentation templates
3. Final response format

## 1. Repository deliverables

Create only the documents relevant to the project, but ensure their content exists somewhere.

### `README.md`

Include:

1. Product overview and status
2. Key features and screenshots/diagrams when available
3. Tech stack and architecture summary
4. Prerequisites
5. Local setup
6. Environment variables
7. Database migrations and seed data
8. Development, lint, typecheck, test, build, and run commands
9. API or integration notes
10. Deployment and rollback
11. Monitoring and troubleshooting
12. Security reporting
13. Known limitations

### `docs/PRODUCT_STRATEGY.md`

Include:

- audience and problem;
- value proposition and positioning;
- user journeys and information architecture;
- scope and acceptance criteria;
- success metrics;
- content and SEO strategy;
- risks, assumptions, dependencies, and roadmap.

### `docs/ARCHITECTURE.md`

Include:

- context and constraints;
- components and responsibilities;
- data model and flows;
- API boundaries;
- authentication and authorization;
- external integrations;
- background work and caching;
- deployment topology;
- observability, backup, scaling, and failure modes;
- major decisions and alternatives.

### `docs/QA_REPORT.md`

Use a table containing area, command/test, result, evidence, and notes. Include manual browser/accessibility checks and known gaps.

### `docs/SECURITY_REVIEW.md`

Include:

- assets, trust boundaries, sensitive data, and threat actors;
- relevant threats and mitigations;
- tools/commands run and results;
- unresolved findings with severity and remediation;
- release recommendation.

### `SECURITY.md`

Include supported versions, reporting channel placeholder, expected response process, safe-harbor language only when approved, and disclosure expectations.

## 2. Documentation rules

- Use real commands and paths from the repository.
- Do not include secrets or production identifiers.
- Mark placeholders clearly.
- Prefer Mermaid for maintainable diagrams.
- Keep status and known limitations current.
- Link documents from the README.

## 3. Final response format

Use this structure:

# Completed

One paragraph describing the implemented outcome and primary user journey.

## What changed

Group by product/UX, frontend, backend/data, infrastructure, tests/security, SEO/content, and documentation. Mention important files.

## Verification

List exact commands and whether they passed, failed, or were blocked. Include manual checks.

## Assumptions and substitutions

State inferred decisions, unavailable paid sources, placeholders, or free alternatives used.

## Remaining risks

List only genuine unfinished items with severity and exact remediation. Write `None identified` only when justified.

## Run or deploy

Give the shortest correct commands and required environment setup.

Never state "production ready" when a required gate was not run or passed.
