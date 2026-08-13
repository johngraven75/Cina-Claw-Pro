---
name: waoowaoo-studio
description: Develop, deploy, configure, migrate, and troubleshoot the waoowaoo AI video studio. Use when the user mentions waoowaoo, its Next.js application, novel-to-storyboard workflow, image or voice generation, Remotion video assembly, provider configuration, Docker deployment, workers, queues, MySQL, Redis, or MinIO.
---

# Waoowaoo Studio

Use current upstream source for the exact version. Treat the project as an early-beta application with persistent media, database, provider-cost, and security concerns.

## Route the task

- Development: inspect the current Next.js, Prisma, worker, queue, and provider contracts before editing.
- Deployment: review compose configuration, exposure, secrets, persistence, and backups before starting services.
- Troubleshooting: gather non-secret logs and health evidence from the failing component before changing data.
- Content generation: confirm source rights, likeness/voice consent, provider costs, and the desired storyboard/video output.

## Safe operation

1. Record the selected version and deployment mode.
2. Inspect existing configuration without printing confidential values.
3. Back up MySQL, MinIO/media, and relevant configuration before migration or upgrade.
4. Replace all documented default credentials and application secrets. Bind management, database, object-storage, and queue interfaces to loopback or a protected network unless public exposure is explicitly designed.
5. Validate configuration, then perform the smallest relevant health or test check.
6. Report changed files, services, migration effects, cost-bearing calls, and rollback.

Never run docker compose down -v, clear old data, reset the database, delete media, or rebuild persistent volumes without explicit authorization for that exact destructive action. Do not install packages, start services, configure provider accounts, or submit paid generation jobs merely because this skill triggered.

Source: the requested URL redirects to https://github.com/waooAI/waoowaoo. The repository is CC BY-NC-SA 4.0; respect its noncommercial and share-alike terms.
