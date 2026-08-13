# End-to-End Execution Workflow

## Table of contents

1. Intake modes
2. Discovery
3. Planning
4. Implementation order
5. Verification loop
6. Existing repository rules
7. Greenfield rules
8. Failure handling

## 1. Intake modes

### Existing repository

- Inspect before editing.
- Read repository instructions such as `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, and package-level READMEs.
- Map existing routes, services, data models, tests, CI, and deployment.
- Preserve architecture and conventions unless they directly prevent the requested outcome.

### Greenfield product

- Create the minimum complete architecture that can run locally and deploy safely.
- Prefer a monorepo only when multiple independently deployable applications or shared packages justify it.
- Create an explicit file tree and bootstrap commands.
- Include a working vertical slice early: UI -> API -> database -> test.

### Design-only request

- If the user truly asks only for design, do not invent backend scope.
- Still provide accessible responsive implementation or a clearly specified handoff if code is requested.

### Premium microsite

- Brand, practitioner, studio, venue, launch, campaign, or portfolio sites: content-led, one to six routes, no authenticated user, no application backend.
- Switch to `references/premium-microsite-playbook.md` and the `data/` knowledge base. Do not carry authorization, migration, tenancy, or payment scope into the plan; state those exclusions instead.
- If the request later needs accounts, orders, or dashboards, that is a migration to the main workflow, not a reason to start with unused infrastructure.

## 2. Discovery

Capture:

- product objective and primary conversion;
- audiences, roles, permissions, and major journeys;
- pages, features, integrations, content, data, and reporting;
- expected traffic, latency, availability, privacy, geography, and compliance;
- brand constraints, reference sites, supplied assets, and paid licenses;
- deployment target, budget, deadline, and operational owner when known.

Run repository discovery commands appropriate to the environment. Avoid reading large generated directories such as `node_modules`, build output, vendor bundles, and binary assets unless needed.

## 3. Planning

Create a dependency-ordered plan with acceptance criteria. Use phases:

1. Audit and requirements
2. Strategy and information architecture
3. Data and API design
4. Design system and content
5. Core implementation
6. Integrations and infrastructure
7. Tests and security
8. Performance, accessibility, and SEO
9. Documentation and handoff

Mark assumptions. Do not stop after planning unless the user explicitly requested a plan only.

## 4. Implementation order

Prefer this sequence:

1. Configuration, environment schema, and safe secret handling
2. Database schema and migrations
3. Domain models and services
4. API contracts, validation, authorization, and error handling
5. Design tokens and reusable UI primitives
6. Primary journey end to end
7. Secondary pages and edge states
8. Background jobs and external integrations
9. Analytics, observability, and feature flags
10. SEO, structured data, and content
11. Tests, security controls, and performance optimization
12. Documentation and CI/CD

Commit or checkpoint at coherent boundaries when the environment permits.

## 5. Verification loop

For every major feature:

1. Implement the smallest coherent slice.
2. Run focused tests.
3. Exercise success, validation, authorization, empty, and failure paths.
4. Inspect browser console, server logs, and network behavior.
5. Fix defects.
6. Run broader regression checks.
7. Update documentation and acceptance status.

At the end, run the repository-wide gate and project-specific commands.

## 6. Existing repository rules

- Do not perform unrelated refactors.
- Do not rewrite lockfiles unless dependencies changed.
- Follow existing formatting, linting, testing, and migration conventions.
- Preserve public APIs unless the change is intentional and documented.
- Read migrations before altering data models.
- Back up or export destructive data before any authorized destructive operation.
- Treat generated code according to its generator; change the source template or schema rather than hand-editing generated output when possible.

## 7. Greenfield rules

Include:

- a reproducible package manager lockfile;
- environment validation and `.env.example`;
- database migration and seed commands;
- health endpoints and structured logs;
- lint, format, typecheck, unit, integration, and end-to-end scripts;
- CI pipeline covering build and tests;
- security headers and baseline abuse controls;
- accessible layout, error boundaries, and 404/500 states;
- deployment instructions and rollback notes.

## 8. Failure handling

When a command fails:

1. Read the complete error and identify the first causal failure.
2. Check environment, version, dependency, configuration, and network assumptions.
3. Fix the cause, not the symptom.
4. Rerun the smallest relevant command.
5. Rerun the full gate if the focused check passes.
6. Report blockers with the command, error summary, likely cause, and exact user action required.

Do not hide failures, fabricate results, or describe unexecuted checks as passed.
