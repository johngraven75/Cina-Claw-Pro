---
name: ego-browser-operator
description: Operate and troubleshoot citrolabs/ego-lite and its ego-browser automation runtime. Use when the user explicitly asks for ego lite, ego-browser, its task spaces, authenticated browser automation, installation guidance, or development of its open-source harness.
---

# Ego Browser Operator

Use ego-browser only when explicitly requested and available. For ordinary website tasks, prefer the installed first-party browser capability.

## Workflow

1. Identify whether the task is browser operation, installation, or harness development.
2. For operation, check availability only when needed. Fetch the current upstream SKILL.md for exact helpers and task-space semantics.
3. Reuse one agent-owned task space for the user goal. Observe before acting and verify after meaningful actions.
4. Treat website mutations as external writes. Confirm the exact target and action when required by the active service workflow.
5. Hand control to the user for login, CAPTCHA, sensitive confirmation, or manual intervention. Resume only after explicit confirmation.
6. Finish or close the task space unless the user asks to keep it open.

## Ownership and privacy

- Never claim, take over, close, or modify a user-owned or inactive task space without explicit confirmation.
- Never extract, display, store, or transmit cookies, tokens, passwords, browser profiles, or private session data.
- Do not migrate Chrome data, install the macOS application, download a binary, or add browser integrations unless the user explicitly requests setup.
- Do not bypass access controls, CAPTCHAs, rate limits, or website protections.
- Do not assume the separate closed-source ego lite application shares the repository's MIT license.

Source: https://github.com/citrolabs/ego-lite (open-source harness and skill: MIT). The ego lite browser application is not bundled.
