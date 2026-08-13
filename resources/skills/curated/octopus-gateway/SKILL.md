---
name: octopus-gateway
description: Deploy, secure, configure, validate, and troubleshoot the bestruirui/octopus LLM API gateway, including Docker or binary setup, provider channels, model groups, gateway API keys, load balancing, and Claude Code or Codex client configuration. Use when the user mentions Octopus, bestruirui/octopus, an Octopus relay endpoint, sk-octopus keys, or asks to connect Claude Code or Codex to an Octopus gateway.
---

# Octopus Gateway

Treat `bestruirui/octopus` as a self-hosted LLM gateway application, not as a skill repository. This Codex wrapper covers operating the gateway and connecting clients to it safely.

## Route the request

- **Inspect or explain:** read current upstream documentation and report; do not deploy or edit files.
- **Deploy:** inspect the target host and choose Docker, a release binary, or a source build.
- **Configure:** establish channels, model groups, and scoped API keys in that order.
- **Connect a client:** merge Octopus settings into Claude Code or Codex configuration.
- **Troubleshoot:** collect reachability, logs, route, group, and key evidence before proposing a fix.

Ask only for missing details that materially affect the result. Never assume authority to expose a port publicly, change provider credentials, or overwrite a client configuration file.

## Verify the release

Octopus changes over time and its repository defaults to the `dev` branch. Before installing or asserting current behavior, inspect the current README, release notes, compose file, and relevant source at <https://github.com/bestruirui/octopus>. Honor a user-specified tag or commit and record the selected version.

Read [references/octopus-config.md](references/octopus-config.md) for known routes, defaults, and client templates. Reconcile them with the selected release.

## Deploy safely

Prefer Docker for a straightforward persistent deployment. Use a release binary when containers are unavailable, and build from source only when needed.

1. Confirm the runtime is available.
2. Resolve an explicit persistent data directory; do not use a broad path or unresolved variable.
3. Check whether the port is free.
4. Bind the host port to loopback by default. Public service requires explicit intent, TLS, access controls, and a reverse proxy.
5. Pin an image tag or commit when reproducibility matters.
6. Confirm the process stays up and the management UI responds.
7. Change the initial administrator password immediately and preserve `/app/data`.

Stop with Docker, SIGTERM, or Ctrl+C. Do not use `kill -9`; graceful shutdown flushes cached statistics.

## Configure in dependency order

1. **Channels:** add each upstream provider, base URL, and credential. Enter a provider base URL, not a full request endpoint; Octopus appends protocol routes. Validate it.
2. **Models and prices:** synchronize or define supported models and review pricing.
3. **Groups:** create stable client-facing model names and attach channels. A group name is the model identifier clients send. Choose round-robin, random, failover, or weighted routing intentionally.
4. **Gateway keys:** create an `sk-octopus-...` key scoped to required groups, with expiry, maximum cost, and model restrictions when available.
5. **Clients:** configure the base URL and group name, then reload the client.

Never expose provider or gateway keys in output, shell history, logs, screenshots, or committed files. Use protected configuration or secret stores, redact diagnostics, and set restrictive permissions.

## Connect clients

Use the relevant template in [references/octopus-config.md](references/octopus-config.md). Read the existing file, preserve unrelated settings, and create a timestamped backup before editing. For Claude Code, merge values into `~/.claude/settings.json`. For Codex, add an `octopus` provider to `~/.codex/config.toml` and use the supported credential mechanism. Do not replace other providers or defaults without permission.

Configure clients with a group name, not an upstream model name unless deliberately identical.

## Validate

Run the non-destructive root probe:

```bash
python3 scripts/check_octopus.py --base-url http://127.0.0.1:8080
```

A live model request can incur cost and requires explicit authorization:

```bash
python3 scripts/check_octopus.py --base-url http://127.0.0.1:8080 \
  --api-key 'sk-octopus-<redacted>' --model '<group-name>' --live-model-check
```

Prefer passing secrets from protected environment configuration. After validation, check analytics and intended failover behavior when relevant.

## Troubleshoot

| Symptom | Check |
|---|---|
| `401` or `403` | Key prefix, disabled/expired state, maximum cost, group scope, and authorization header |
| `404` or doubled route | Remove endpoint suffixes from provider channel URLs; use `/v1` only where the client template specifies it |
| Model not found | Client model must exactly match an enabled group with a usable channel |
| Timeout | Upstream provider, channel validation, proxy timeout, and failover state |
| Missing statistics | Forced termination, pending batch writes, and graceful shutdown |
| Data disappears | Host directory must persist and map to `/app/data` with write access |
| Uneven routing | Group mode, weights, priority, health, and per-channel mappings |

Do not delete the database, clear the volume, rotate credentials, or change production routing without explicit approval for the exact action. Back up persistent data before upgrades or database changes.

## Report

Summarize the version, endpoint exposure, data location, groups, client files changed, security controls, validation, and remaining secret-dependent steps. Redact credentials.

## Provenance

Created as a Codex-compatible operating skill for [bestruirui/octopus](https://github.com/bestruirui/octopus), which is a gateway application rather than a native skill package.
