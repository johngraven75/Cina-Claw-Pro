# Security Policy

## Supported versions

Security fixes are applied to the latest stable Cina-Claw Pro release.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's private vulnerability reporting page:

<https://github.com/johngraven75/Cina-Claw-Pro/security/advisories/new>

Include the affected version, Windows version, reproduction steps, impact, and any relevant logs with credentials and personal data removed.

## Security boundaries

- Provider credentials use Electron `safeStorage`; packaged Windows builds use Windows DPAPI.
- Host execution defaults to an allowlist and prompts when a command is not covered.
- Only the reviewed bundled skill set is auto-enabled. Community skills and plugins require explicit installation.
- The Renderer must use typed Main-process host APIs and may not directly own Gateway transport.

Never commit or paste API keys, OAuth tokens, provider credentials, signing keys, certificates, or user transcripts into issues or logs.
