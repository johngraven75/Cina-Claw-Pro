---
id: preinstalled-skill-source-integrity
title: Preinstalled Skill Source Integrity
type: ai-coding-rule
appliesTo:
  - plugin-lifecycle-management
---

Preinstalled skills may come from reviewed remote repositories or reviewed repository-local adapter sources. Keep source selection explicit and reproducible.

Rules:

- every manifest entry declares exactly one source: `repo` plus `repoPath`, or a repository-relative `localPath`
- reject duplicate slugs, missing versions for local sources, absolute local paths, and paths that escape the repository
- every local source contains a `SKILL.md` whose frontmatter name equals the manifest slug
- only reviewed bundled entries may set `autoEnable: true`; marketplace discovery never implies activation
- materialization records remote commit provenance or the declared local adapter version in the packaged lock
- never overwrite an existing user-managed skill or silently replace a locally edited preinstalled skill
- preserve source and license attribution inside each curated adapter package
