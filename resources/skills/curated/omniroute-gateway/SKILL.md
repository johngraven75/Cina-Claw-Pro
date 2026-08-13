---
name: omniroute-gateway
description: Inspect, configure, and troubleshoot diegosouzapw/OmniRoute using its current documentation and native skills. Use when the user explicitly mentions OmniRoute, its CLI, local gateway, provider routing, Codex integration, or repository.
---

# OmniRoute Gateway

Use the current OmniRoute repository as the source of truth. Begin with read-only inspection and select only the upstream documentation or native skill needed for the user's request.

## Workflow

1. Identify the installed version, platform, deployment mode, and requested outcome.
2. Fetch the relevant current file from diegosouzapw/OmniRoute. Common starting points are docs/guides/CODEX-CLI-CONFIGURATION.md, skills/cli-health/SKILL.md, skills/cli-setup/SKILL.md, skills/cli-routing/SKILL.md, and skills/config-codex-cli/SKILL.md.
3. Inspect current status and configuration before proposing changes.
4. Make installation, configuration, service, network, account, or external-system changes only when the user explicitly asks for them.
5. Protect confidential values and private request content. Use user-controlled configuration rather than chat for sensitive values.
6. Back up exact configuration targets before authorized edits, validate syntax, perform the smallest useful health check, and describe rollback.

Do not assume that a provider, model, price, endpoint, or command is current. Verify it from the selected version and official upstream material.

Source: https://github.com/diegosouzapw/OmniRoute (MIT). The application is not bundled with this skill.
