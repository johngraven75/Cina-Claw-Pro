# Total Automation Policy

Cina-Claw Pro follows the owner's repo-wide automation rules, adapted for Electron, OpenClaw, and Windows packaging.

- Preserve accepted functionality. Do not remove, hide, or silently disable features to make CI pass.
- Inspect failures, fix root causes, and rerun until green or until a hard external blocker is proven.
- Validate clean restore, lint, typecheck, unit tests, harness checks, Renderer build, Windows packaging, and release assets.
- Preserve settings, encrypted provider accounts, OpenClaw configuration, agents, channels, skills, sessions, and scheduled tasks across upgrades.
- Never claim a build or release is green without evidence for the exact commit or tag.
- Never commit credentials, API keys, signing keys, tokens, private certificates, or user transcripts.
- Marketplace skills and plugins are discoverable, but only reviewed bundled capabilities may be enabled automatically.

Every stable release must include a matching version tag, tagged source, Windows installer and update metadata, `SHA256SUMS.txt`, release notes, and a successful carry-forward verification.
