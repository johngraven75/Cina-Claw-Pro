#!/usr/bin/env bash
set -u

# Best-effort repository quality gate. It discovers common project types and
# runs only scripts/tools that are present. Project-specific commands should be
# run in addition to this script.

ROOT="${1:-.}"
cd "$ROOT" || exit 2

pass=0
fail=0
skip=0

run_gate() {
  local label="$1"
  shift
  printf '\n==> %s\n' "$label"
  if "$@"; then
    printf 'PASS: %s\n' "$label"
    pass=$((pass + 1))
  else
    printf 'FAIL: %s\n' "$label" >&2
    fail=$((fail + 1))
  fi
}

skip_gate() {
  printf 'SKIP: %s\n' "$1"
  skip=$((skip + 1))
}

has_npm_script() {
  local script="$1"
  node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts['$script'] ? 0 : 1)" >/dev/null 2>&1
}

run_js_gate() {
  local runner=()

  if [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then
    runner=(pnpm)
  elif [ -f yarn.lock ] && command -v yarn >/dev/null 2>&1; then
    runner=(yarn)
  elif { [ -f bun.lock ] || [ -f bun.lockb ]; } && command -v bun >/dev/null 2>&1; then
    runner=(bun run)
  elif command -v npm >/dev/null 2>&1; then
    runner=(npm run)
  else
    skip_gate "JavaScript gates: no supported package manager found"
    return
  fi

  local script
  for script in format:check lint typecheck test build; do
    if has_npm_script "$script"; then
      run_gate "JavaScript $script" "${runner[@]}" "$script"
    else
      skip_gate "JavaScript script '$script' is not defined"
    fi
  done

  if command -v npm >/dev/null 2>&1; then
    run_gate "npm dependency audit (high severity)" npm audit --audit-level=high
  else
    skip_gate "npm dependency audit: npm unavailable"
  fi
}

run_python_gate() {
  if command -v ruff >/dev/null 2>&1; then
    run_gate "Python Ruff check" ruff check .
    run_gate "Python Ruff format check" ruff format --check .
  else
    skip_gate "Python Ruff is not installed"
  fi

  if command -v mypy >/dev/null 2>&1; then
    run_gate "Python mypy" mypy .
  else
    skip_gate "Python mypy is not installed"
  fi

  if command -v pytest >/dev/null 2>&1; then
    run_gate "Python pytest" pytest
  else
    skip_gate "Python pytest is not installed"
  fi

  if command -v pip-audit >/dev/null 2>&1; then
    run_gate "Python dependency audit" pip-audit
  else
    skip_gate "Python pip-audit is not installed"
  fi
}

run_php_gate() {
  if ! command -v composer >/dev/null 2>&1; then
    skip_gate "PHP gates: Composer is unavailable"
    return
  fi

  run_gate "Composer manifest validation" composer validate --no-check-publish
  run_gate "Composer dependency audit" composer audit

  if composer run-script --list 2>/dev/null | grep -q '^  lint '; then
    run_gate "PHP lint script" composer run lint
  else
    skip_gate "Composer script 'lint' is not defined"
  fi

  if composer run-script --list 2>/dev/null | grep -q '^  test '; then
    run_gate "PHP test script" composer run test
  else
    skip_gate "Composer script 'test' is not defined"
  fi
}

run_ruby_gate() {
  if ! command -v bundle >/dev/null 2>&1; then
    skip_gate "Ruby gates: Bundler is unavailable"
    return
  fi

  if bundle exec ruby -e 'exit(Gem.loaded_specs.key?("rubocop") ? 0 : 1)' >/dev/null 2>&1; then
    run_gate "Ruby RuboCop" bundle exec rubocop
  else
    skip_gate "Ruby RuboCop is not installed"
  fi

  if [ -f Rakefile ]; then
    run_gate "Ruby Rake tests" bundle exec rake test
  else
    skip_gate "Ruby Rakefile is not present"
  fi

  if bundle exec ruby -e 'exit(Gem.loaded_specs.key?("bundler-audit") ? 0 : 1)' >/dev/null 2>&1; then
    run_gate "Ruby dependency audit" bundle exec bundle-audit check --update
  else
    skip_gate "Ruby bundler-audit is not installed"
  fi
}

if [ -f package.json ]; then
  run_js_gate
else
  skip_gate "JavaScript project not detected"
fi

if [ -f pyproject.toml ] || [ -f requirements.txt ] || [ -f setup.py ]; then
  run_python_gate
else
  skip_gate "Python project not detected"
fi

if [ -f deno.json ] || [ -f deno.jsonc ]; then
  if command -v deno >/dev/null 2>&1; then
    run_gate "Deno format" deno fmt --check
    run_gate "Deno lint" deno lint
    run_gate "Deno test" deno test
  else
    skip_gate "Deno toolchain unavailable"
  fi
fi

if [ -f go.mod ]; then
  if command -v go >/dev/null 2>&1; then
    run_gate "Go test" go test ./...
    run_gate "Go vet" go vet ./...
  else
    skip_gate "Go toolchain unavailable"
  fi
fi

if [ -f Cargo.toml ]; then
  if command -v cargo >/dev/null 2>&1; then
    run_gate "Rust fmt" cargo fmt -- --check
    run_gate "Rust clippy" cargo clippy --all-targets --all-features -- -D warnings
    run_gate "Rust test" cargo test --all-features
  else
    skip_gate "Rust toolchain unavailable"
  fi
fi

if [ -f composer.json ]; then
  run_php_gate
fi

if [ -f Gemfile ]; then
  run_ruby_gate
fi

if find . -maxdepth 2 -name '*.csproj' -print -quit | grep -q .; then
  if command -v dotnet >/dev/null 2>&1; then
    run_gate ".NET restore" dotnet restore
    run_gate ".NET build" dotnet build --no-restore
    run_gate ".NET test" dotnet test --no-build
  else
    skip_gate ".NET SDK unavailable"
  fi
fi

if [ -f pom.xml ]; then
  if command -v mvn >/dev/null 2>&1; then
    run_gate "Maven verify" mvn --batch-mode verify
  else
    skip_gate "Maven unavailable"
  fi
elif [ -f gradlew ]; then
  run_gate "Gradle check" ./gradlew check
elif [ -f build.gradle ] || [ -f build.gradle.kts ]; then
  if command -v gradle >/dev/null 2>&1; then
    run_gate "Gradle check" gradle check
  else
    skip_gate "Gradle unavailable and wrapper not found"
  fi
fi

if find . -maxdepth 3 -name '*.tf' -print -quit | grep -q .; then
  if command -v terraform >/dev/null 2>&1; then
    run_gate "Terraform format" terraform fmt -check -recursive
    if find . -maxdepth 1 -name '*.tf' -print -quit | grep -q .; then
      run_gate "Terraform validate" terraform validate
    else
      skip_gate "Terraform validate: no root module detected"
    fi
  else
    skip_gate "Terraform unavailable"
  fi
fi

if find . -maxdepth 3 -type f \( -name 'Dockerfile' -o -name 'Dockerfile.*' \) -print -quit | grep -q .; then
  if command -v hadolint >/dev/null 2>&1; then
    while IFS= read -r dockerfile; do
      run_gate "Hadolint $dockerfile" hadolint "$dockerfile"
    done < <(find . -maxdepth 3 -type f \( -name 'Dockerfile' -o -name 'Dockerfile.*' \) | sort)
  else
    skip_gate "Dockerfile lint: hadolint is not installed"
  fi
fi

if command -v shellcheck >/dev/null 2>&1; then
  shell_files=()
  while IFS= read -r shell_file; do
    shell_files+=("$shell_file")
  done < <(find . -maxdepth 3 -type f -name '*.sh' -not -path './node_modules/*' -not -path './vendor/*' | sort)
  if [ "${#shell_files[@]}" -gt 0 ]; then
    run_gate "ShellCheck" shellcheck "${shell_files[@]}"
  else
    skip_gate "ShellCheck: no shell scripts detected"
  fi
else
  skip_gate "ShellCheck is not installed"
fi

if command -v gitleaks >/dev/null 2>&1; then
  run_gate "Secret scan" gitleaks detect --no-banner --redact --source .
else
  skip_gate "Secret scan: gitleaks is not installed"
fi

if command -v trivy >/dev/null 2>&1; then
  run_gate "Filesystem vulnerability scan" trivy fs --severity HIGH,CRITICAL --exit-code 1 .
else
  skip_gate "Filesystem vulnerability scan: trivy is not installed"
fi

printf '\nSummary: %s passed, %s failed, %s skipped\n' "$pass" "$fail" "$skip"

if [ "$fail" -gt 0 ]; then
  exit 1
fi
