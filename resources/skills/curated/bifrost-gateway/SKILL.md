---
name: bifrost-gateway
description: Configure, secure, develop, validate, and troubleshoot maximhq/bifrost, including its AI provider gateway, OpenAI-compatible API, MCP gateway, plugins, governance, caching, logging, telemetry, and virtual keys. Use when the user mentions Bifrost, its Go gateway, provider routing, MCP tools, or a Bifrost deployment.
---

# Bifrost Gateway

Use current upstream documentation and source for the exact checked-out version. Start with read-only inspection and keep network, credential, data-retention, and paid-provider effects visible.

## Workflow

1. Identify the version, deployment mode, failing surface, requested outcome, and authorized change scope.
2. Inspect status, configuration shape, logs, and health evidence without printing secrets, prompts, tool arguments, or response bodies.
3. Fetch current upstream documentation for the relevant provider, plugin, API, or MCP feature. Do not assume the development branch matches a released binary.
4. Back up the exact configuration before editing. Make the smallest authorized change.
5. Validate syntax and local health first. Use a fake or non-billable request when possible; obtain explicit scope before a live provider request.
6. Report changed files and services, exposed interfaces, cost-bearing calls, retained data, and rollback steps.

## Security and privacy

- Do not install or start Bifrost, create persistence, expose a listener, add provider credentials, enable telemetry or request logging, or connect an MCP server merely because this skill triggered.
- Treat provider keys, virtual keys, prompts, completions, embeddings, request metadata, and MCP arguments as sensitive. Redact them from output and logs.
- Bind administrative and gateway interfaces to loopback or a protected network by default. Use authentication, TLS, least-privilege credentials, rate limits, and provider/model allowlists for shared deployments.
- Treat MCP tools as executable capabilities. Review server provenance, transport, tool schemas, file/network access, approval boundaries, and allowlists before enabling them.
- Explain retention and privacy consequences before enabling logs, governance, caching, telemetry, or tracing.
- Do not make destructive configuration changes, rotate production credentials, clear caches or logs, or restart shared services without exact authorization and a rollback.

## Development

Read the repository's current AGENTS.md and the narrow internal workflow relevant to the task. Respect module-specific Go versions and commands. Prefer targeted unit or mocked integration tests. Live provider, network, load, and end-to-end tests require explicit credentials, budget, and target authorization.

Source: https://github.com/maximhq/bifrost (Apache-2.0). The gateway executable, plugins, credentials, and services are not bundled.
