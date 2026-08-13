#!/usr/bin/env bash
set -u

ROOT="${1:-.}"

if [ ! -d "$ROOT" ]; then
  printf 'ERROR: repository path does not exist: %s\n' "$ROOT" >&2
  exit 2
fi

cd "$ROOT" || exit 2

section() {
  printf '\n## %s\n' "$1"
}

list_matches() {
  local label="$1"
  shift
  printf '%s: ' "$label"
  local matches
  matches="$(find . -maxdepth 3 -type f \( "$@" \) -not -path './.git/*' -not -path './node_modules/*' -not -path './vendor/*' -not -path './.venv/*' -not -path './dist/*' -not -path './build/*' 2>/dev/null | sort | sed 's#^./##' | head -n 30)"
  if [ -n "$matches" ]; then
    printf '\n%s\n' "$matches"
  else
    printf 'none detected\n'
  fi
}

printf '# Repository Audit: %s\n' "$(basename "$(pwd)")"
printf 'Path: `%s`\n' "$(pwd)"

section "Working tree"
if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  printf 'Branch: `%s`\n' "$(git branch --show-current 2>/dev/null || true)"
  status="$(git status --short 2>/dev/null || true)"
  if [ -n "$status" ]; then
    printf 'Uncommitted changes:\n```text\n%s\n```\n' "$status"
  else
    printf 'Uncommitted changes: none\n'
  fi
else
  printf 'Git repository: not detected\n'
fi

section "Repository instructions"
list_matches "Instruction files" -name 'AGENTS.md' -o -name 'CLAUDE.md' -o -name 'CONTRIBUTING.md' -o -name 'README.md'

section "Stack signals"
list_matches "JavaScript/TypeScript/Deno" -name 'package.json' -o -name 'pnpm-lock.yaml' -o -name 'yarn.lock' -o -name 'bun.lock' -o -name 'bun.lockb' -o -name 'tsconfig.json' -o -name 'deno.json' -o -name 'deno.jsonc'
list_matches "Python" -name 'pyproject.toml' -o -name 'requirements.txt' -o -name 'uv.lock' -o -name 'Pipfile'
list_matches "Other runtimes" -name 'go.mod' -o -name 'Cargo.toml' -o -name '*.csproj' -o -name 'composer.json' -o -name 'Gemfile' -o -name 'pom.xml' -o -name 'build.gradle'
list_matches "Containers/IaC" -name 'Dockerfile' -o -name 'docker-compose.yml' -o -name 'compose.yml' -o -name '*.tf' -o -name 'serverless.yml' -o -name 'wrangler.toml'

section "Delivery signals"
list_matches "Continuous integration" -path './.github/workflows/*' -o -name '.gitlab-ci.yml' -o -name 'Jenkinsfile' -o -name 'bitbucket-pipelines.yml'
list_matches "Environment examples" -name '.env.example' -o -name '.env.sample' -o -name '*.env.example'
list_matches "Database/migrations" -path '*/migrations/*' -o -name 'schema.prisma' -o -name 'drizzle.config.*' -o -name 'alembic.ini'
list_matches "Tests" -path '*/tests/*' -o -path '*/test/*' -o -name '*.test.*' -o -name '*.spec.*' -o -name 'playwright.config.*' -o -name 'cypress.config.*'

section "Available project scripts"
if [ -f package.json ] && command -v node >/dev/null 2>&1; then
  node -e 'const p=require("./package.json"); for (const [k,v] of Object.entries(p.scripts||{})) console.log(`- ${k}: ${v}`)' 2>/dev/null || printf 'Could not parse package.json scripts\n'
else
  printf 'No readable package.json scripts detected\n'
fi

section "Follow-up"
printf '%s\n' '- Read every applicable instruction file before editing.' '- Inspect entry points, routes, schemas, auth boundaries, and critical tests directly.' '- Treat missing signals as discovery prompts, not proof that a capability is absent.' '- Run project-specific checks and scripts/project_gate.sh before delivery.'
