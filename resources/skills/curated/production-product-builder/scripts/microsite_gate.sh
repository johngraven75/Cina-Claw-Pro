#!/usr/bin/env bash
set -u

# Premium-microsite release gate. Runs against a PRODUCTION BUILD, not source.
#
#   scripts/microsite_gate.sh <project-dir>
#
# Environment overrides:
#   BUILD_DIR        explicit build output directory
#   BUDGET_JS_KB     initial JS budget, gzip KB (default 150)
#   BUDGET_CSS_KB    CSS budget, gzip KB (default 40)
#   BUDGET_IMG_KB    per-image budget, KB (default 250)
#   BUDGET_MODEL_KB  per-3D-model budget, KB (default 800)
#
# This gate checks what static inspection can prove. It does not replace a
# browser pass, a keyboard pass, Lighthouse, or a screen-reader spot check.

ROOT="${1:-.}"
cd "$ROOT" || exit 2

BUDGET_JS_KB="${BUDGET_JS_KB:-150}"
BUDGET_CSS_KB="${BUDGET_CSS_KB:-40}"
BUDGET_IMG_KB="${BUDGET_IMG_KB:-250}"
BUDGET_MODEL_KB="${BUDGET_MODEL_KB:-800}"

pass=0
fail=0
skip=0
warn=0

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

warn_gate() {
  local label="$1"
  shift
  printf '\n==> %s\n' "$label"
  if "$@"; then
    printf 'PASS: %s\n' "$label"
    pass=$((pass + 1))
  else
    printf 'WARN: %s\n' "$label"
    warn=$((warn + 1))
  fi
}

skip_gate() {
  printf 'SKIP: %s\n' "$1"
  skip=$((skip + 1))
}

# ---------------------------------------------------------------- discovery --

if [ -n "${BUILD_DIR:-}" ]; then
  BUILD="$BUILD_DIR"
else
  BUILD=""
  for candidate in dist build out .output/public _site public/build; do
    if [ -f "$candidate/index.html" ]; then
      BUILD="$candidate"
      break
    fi
  done
fi

if [ -z "$BUILD" ] || [ ! -d "$BUILD" ]; then
  printf 'No production build found. Run the project build first, for example:\n\n  npm run build\n  scripts/microsite_gate.sh .\n\nOr set BUILD_DIR=<dir>.\n' >&2
  exit 2
fi

INDEX="$BUILD/index.html"
if [ ! -f "$INDEX" ]; then
  printf 'No %s. This gate requires a pre-rendered entry document.\n' "$INDEX" >&2
  exit 2
fi

printf 'Build directory: %s\n' "$BUILD"
printf 'Budgets: JS %sKB gzip, CSS %sKB gzip, image %sKB, model %sKB\n' \
  "$BUDGET_JS_KB" "$BUDGET_CSS_KB" "$BUDGET_IMG_KB" "$BUDGET_MODEL_KB"

export BUILD INDEX BUDGET_JS_KB BUDGET_CSS_KB BUDGET_IMG_KB BUDGET_MODEL_KB

# ------------------------------------------------------------------- checks --

check_prerendered() {
  python3 - <<'PY'
import os, re, sys
html = open(os.environ['INDEX'], encoding='utf-8', errors='replace').read()
body = re.search(r'<body[^>]*>(.*)</body>', html, re.S | re.I)
inner = body.group(1) if body else ''
inner = re.sub(r'<(script|style|template|noscript)\b.*?</\1>', '', inner, flags=re.S | re.I)
text = re.sub(r'<[^>]+>', ' ', inner)
text = re.sub(r'\s+', ' ', text).strip()
print(f'rendered body text: {len(text)} characters')
if len(text) < 500:
    print('Entry document ships almost no content. Crawlers, link unfurlers and')
    print('no-JS visitors see an empty shell. Add a prerender/SSG step.')
    sys.exit(1)
PY
}

check_head_tags() {
  python3 - <<'PY'
import os, re, sys
html = open(os.environ['INDEX'], encoding='utf-8', errors='replace').read()
head = re.search(r'<head[^>]*>(.*)</head>', html, re.S | re.I)
head = head.group(1) if head else html
problems = []

def has(pattern):
    return re.search(pattern, head, re.I | re.S) is not None

title = re.search(r'<title[^>]*>(.*?)</title>', head, re.S | re.I)
if not title or len(title.group(1).strip()) < 10:
    problems.append('missing or too-short <title>')
elif len(title.group(1).strip()) > 70:
    print(f'note: title is {len(title.group(1).strip())} characters and will be truncated in search results')

desc = re.search(r'<meta[^>]+name=["\']description["\'][^>]*content=["\']([^"\']*)', head, re.I)
if not desc or len(desc.group(1).strip()) < 50:
    problems.append('missing or too-short meta description')

if not re.search(r'<html[^>]+lang=', html, re.I):
    problems.append('<html> has no lang attribute')
if not has(r'<meta[^>]+name=["\']viewport["\']'):
    problems.append('missing viewport meta')
if not has(r'<meta[^>]+property=["\']og:title["\']'):
    problems.append('missing og:title')
if not has(r'<meta[^>]+property=["\']og:image["\']'):
    problems.append('missing og:image (link previews will be blank)')
if not has(r'<link[^>]+rel=["\']canonical["\']'):
    problems.append('missing canonical link')

for p in problems:
    print(f'- {p}')
sys.exit(1 if problems else 0)
PY
}

check_structured_data() {
  python3 - <<'PY'
import json, os, re, sys
html = open(os.environ['INDEX'], encoding='utf-8', errors='replace').read()
blocks = re.findall(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.S | re.I)
if not blocks:
    print('No JSON-LD found. A microsite without structured data forfeits rich results.')
    sys.exit(1)
bad = 0
for i, block in enumerate(blocks, 1):
    try:
        data = json.loads(block)
    except json.JSONDecodeError as exc:
        print(f'- block {i}: invalid JSON ({exc})')
        bad += 1
        continue
    items = data if isinstance(data, list) else [data]
    for item in items:
        if not isinstance(item, dict):
            print(f'- block {i}: not an object')
            bad += 1
            continue
        if '@context' not in item or '@type' not in item:
            print(f'- block {i}: missing @context or @type')
            bad += 1
        else:
            print(f'- block {i}: {item["@type"]} OK')
        blob = json.dumps(item)
        if 'aggregateRating' in blob:
            print(f'- block {i}: declares aggregateRating — this must reflect real, on-page reviews')
        if 'TODO' in blob or 'example.com' in blob:
            print(f'- block {i}: contains a placeholder value')
            bad += 1
sys.exit(1 if bad else 0)
PY
}

check_crawl_files() {
  local missing=0
  for f in robots.txt sitemap.xml; do
    if [ -f "$BUILD/$f" ]; then
      printf -- '- %s present\n' "$f"
    else
      printf -- '- %s missing\n' "$f"
      missing=1
    fi
  done
  return $missing
}

check_images() {
  python3 - <<'PY'
import os, re, sys
html = open(os.environ['INDEX'], encoding='utf-8', errors='replace').read()
imgs = re.findall(r'<img\b[^>]*>', html, re.I)
if not imgs:
    print('no <img> elements in the entry document')
    sys.exit(0)
no_alt = [t for t in imgs if not re.search(r'\balt\s*=', t, re.I)]
no_dims = [t for t in imgs
           if not (re.search(r'\bwidth\s*=', t, re.I) and re.search(r'\bheight\s*=', t, re.I))
           and 'aspect-ratio' not in t]
eager_lazy = [t for t in imgs if re.search(r'loading\s*=\s*["\']lazy', t, re.I) and re.search(r'fetchpriority\s*=\s*["\']high', t, re.I)]
print(f'{len(imgs)} images, {len(no_alt)} without alt, {len(no_dims)} without intrinsic dimensions')
for t in no_alt[:5]:
    print(f'- no alt: {t[:110]}')
for t in no_dims[:5]:
    print(f'- no width/height (CLS risk): {t[:110]}')
for t in eager_lazy[:5]:
    print(f'- contradictory loading=lazy with fetchpriority=high: {t[:110]}')
sys.exit(1 if (no_alt or no_dims or eager_lazy) else 0)
PY
}

check_bundle_budget() {
  python3 - <<'PY'
import gzip, os, re, sys
from pathlib import Path

build = Path(os.environ['BUILD'])
html = (build / 'index.html').read_text(encoding='utf-8', errors='replace')
js_budget = int(os.environ['BUDGET_JS_KB']) * 1024
css_budget = int(os.environ['BUDGET_CSS_KB']) * 1024

refs = set()
for pattern in (r'<script[^>]+src=["\']([^"\']+)', r'<link[^>]+rel=["\']modulepreload["\'][^>]+href=["\']([^"\']+)',
                r'<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']([^"\']+)',
                r'<link[^>]+rel=["\']preload["\'][^>]+href=["\']([^"\']+\.(?:js|css))'):
    refs.update(re.findall(pattern, html, re.I))

def gz(path: Path) -> int:
    return len(gzip.compress(path.read_bytes(), 6))

js_total = css_total = 0
rows = []
for ref in sorted(refs):
    if ref.startswith(('http://', 'https://', '//', 'data:')):
        continue
    path = build / ref.lstrip('/')
    if not path.is_file():
        continue
    size = gz(path)
    rows.append((ref, size))
    if path.suffix == '.js':
        js_total += size
    elif path.suffix == '.css':
        css_total += size

for ref, size in sorted(rows, key=lambda r: -r[1]):
    print(f'- {size/1024:8.1f} KB gzip  {ref}')

print(f'\ninitial JS  {js_total/1024:.1f} KB gzip (budget {js_budget/1024:.0f} KB)')
print(f'initial CSS {css_total/1024:.1f} KB gzip (budget {css_budget/1024:.0f} KB)')

failed = False
if js_total > js_budget:
    print('Initial JS over budget. Code-split, lazy-load the heavy section, or drop a dependency.')
    failed = True
if css_total > css_budget:
    print('CSS over budget. Check for an unpurged utility framework or duplicated token layers.')
    failed = True
sys.exit(1 if failed else 0)
PY
}

check_no_3d_in_entry() {
  python3 - <<'PY'
import os, re, sys
from pathlib import Path
build = Path(os.environ['BUILD'])
html = (build / 'index.html').read_text(encoding='utf-8', errors='replace')
entry = set(re.findall(r'<script[^>]+src=["\']([^"\']+\.js)', html, re.I))
entry |= set(re.findall(r'rel=["\']modulepreload["\'][^>]+href=["\']([^"\']+\.js)', html, re.I))
signatures = ('WebGLRenderer', 'PerspectiveCamera', 'GLTFLoader', 'BufferGeometry')
hits = []
for ref in sorted(entry):
    path = build / ref.lstrip('/')
    if not path.is_file():
        continue
    text = path.read_text(encoding='utf-8', errors='ignore')
    found = [s for s in signatures if s in text]
    if found:
        hits.append((ref, found, path.stat().st_size))
if not hits:
    print('no three.js signatures in the entry graph')
    sys.exit(0)
for ref, found, size in hits:
    print(f'- {ref} ({size/1024:.0f} KB raw) contains {", ".join(found)}')
print('3D code is in the initial load graph. Dynamic-import the canvas section and')
print('ship a poster image so first paint never waits on WebGL.')
sys.exit(1)
PY
}

check_reduced_motion() {
  python3 - <<'PY'
import os, sys
from pathlib import Path
build = Path(os.environ['BUILD'])
found_css = False
for path in list(build.rglob('*.css')) + list(build.rglob('*.js')) + [build / 'index.html']:
    if not path.is_file():
        continue
    if 'prefers-reduced-motion' in path.read_text(encoding='utf-8', errors='ignore'):
        print(f'- honoured in {path.relative_to(build)}')
        found_css = True
        break
if not found_css:
    print('No prefers-reduced-motion handling anywhere in the build.')
    print('Every scroll or entrance effect needs an immediate end state under reduce.')
    sys.exit(1)
PY
}

check_placeholders() {
  python3 - <<'PY'
import os, re, sys
from pathlib import Path
build = Path(os.environ['BUILD'])
patterns = {
    'TODO(client)': r'TODO\(client\)',
    'lorem ipsum': r'lorem\s+ipsum',
    'example.com': r'example\.com',
    'placeholder domain': r'your-(domain|site|company)',
    'dummy phone': r'\+1\s?234\s?567',
    'unfilled template': r'\{\{\s*\w+\s*\}\}',
}
hits = []
for path in list(build.rglob('*.html')) + list(build.rglob('*.js')) + list(build.rglob('*.css')):
    if not path.is_file():
        continue
    text = path.read_text(encoding='utf-8', errors='ignore')
    for label, pattern in patterns.items():
        for m in re.finditer(pattern, text, re.I):
            snippet = text[max(0, m.start() - 40):m.start() + 60].replace('\n', ' ')
            hits.append(f'- {label} in {path.relative_to(build)}: ...{snippet.strip()}...')
for h in hits[:15]:
    print(h)
if hits:
    print(f'\n{len(hits)} placeholder(s) reached the production build.')
    sys.exit(1)
print('no placeholder markers found')
PY
}

check_asset_weights() {
  python3 - <<'PY'
import os, sys
from pathlib import Path
build = Path(os.environ['BUILD'])
img_budget = int(os.environ['BUDGET_IMG_KB']) * 1024
model_budget = int(os.environ['BUDGET_MODEL_KB']) * 1024
img_ext = {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'}
model_ext = {'.glb', '.gltf', '.usdz', '.fbx', '.obj'}
over = []
for path in build.rglob('*'):
    if not path.is_file():
        continue
    size = path.stat().st_size
    ext = path.suffix.lower()
    if ext in img_ext and size > img_budget:
        over.append((size, 'image', path.relative_to(build)))
    elif ext in model_ext and size > model_budget:
        over.append((size, 'model', path.relative_to(build)))
for size, kind, rel in sorted(over, reverse=True):
    print(f'- {size/1024:8.0f} KB  {kind}  {rel}')
if over:
    print('\nCompress with AVIF/WebP for images, or gltf-transform / gltfjsx --transform for models.')
    sys.exit(1)
print('all images and models within budget')
PY
}

check_insecure_and_leaks() {
  python3 - <<'PY'
import os, re, sys
from pathlib import Path
build = Path(os.environ['BUILD'])
problems = []
for path in list(build.rglob('*.html')) + list(build.rglob('*.js')):
    if not path.is_file():
        continue
    text = path.read_text(encoding='utf-8', errors='ignore')
    for m in re.finditer(r'(?:src|href)=["\'](http://[^"\']+)', text, re.I):
        problems.append(f'- insecure http resource in {path.relative_to(build)}: {m.group(1)[:80]}')
    for label, pattern in (('AWS key', r'AKIA[0-9A-Z]{16}'),
                           ('private key', r'-----BEGIN [A-Z ]*PRIVATE KEY-----'),
                           ('bearer token', r'(?:sk|pk)_live_[0-9a-zA-Z]{16,}')):
        if re.search(pattern, text):
            problems.append(f'- possible {label} in {path.relative_to(build)}')
for f in ('.env', '.env.local', '.env.production'):
    if (build / f).exists():
        problems.append(f'- {f} was copied into the build output')
for p in problems[:15]:
    print(p)
sys.exit(1 if problems else 0)
PY
}

check_anchor_targets() {
  python3 - <<'PY'
import os, re, sys
from pathlib import Path
build = Path(os.environ['BUILD'])
html = (build / 'index.html').read_text(encoding='utf-8', errors='replace')
anchors = {h for h in re.findall(r'href=["\']#([^"\']+)', html) if h}
ids = set(re.findall(r'\bid=["\']([^"\']+)', html))
missing = sorted(a for a in anchors if a not in ids)
if anchors:
    css = ' '.join(p.read_text(encoding='utf-8', errors='ignore') for p in build.rglob('*.css') if p.is_file())
    if 'scroll-margin' not in css and 'scroll-padding' not in css:
        print('- anchors present but no scroll-margin-top/scroll-padding-top: targets will sit under a sticky header')
        missing.append('__scroll_margin__')
for a in missing:
    if a != '__scroll_margin__':
        print(f'- href="#{a}" has no matching element id')
if not anchors:
    print('no in-page anchors')
sys.exit(1 if missing else 0)
PY
}

check_skip_link() {
  python3 - <<'PY'
import os, re, sys
html = open(os.environ['INDEX'], encoding='utf-8', errors='replace').read()
has_skip = re.search(r'href=["\']#(main|content|main-content)["\']', html, re.I) or re.search(r'class=["\'][^"\']*skip', html, re.I)
has_main = re.search(r'<main\b', html, re.I)
problems = []
if not has_main:
    problems.append('- no <main> landmark')
if not has_skip:
    problems.append('- no skip link to main content as the first focusable element')
for p in problems:
    print(p)
sys.exit(1 if problems else 0)
PY
}

check_autoplay_media() {
  python3 - <<'PY'
import os, re, sys
html = open(os.environ['INDEX'], encoding='utf-8', errors='replace').read()
bad = []
for tag in re.findall(r'<video\b[^>]*>', html, re.I):
    if re.search(r'\bautoplay\b', tag, re.I) and not re.search(r'\bmuted\b', tag, re.I):
        bad.append(f'- autoplaying video without muted: {tag[:100]}')
for tag in re.findall(r'<audio\b[^>]*>', html, re.I):
    if re.search(r'\bautoplay\b', tag, re.I):
        bad.append(f'- autoplaying audio: {tag[:100]}')
for tag in re.findall(r'<iframe\b[^>]*>', html, re.I):
    if 'autoplay=1' in tag.lower():
        bad.append(f'- third-party iframe with autoplay on load: {tag[:100]}')
for b in bad:
    print(b)
if not bad:
    print('no unmuted autoplay media')
sys.exit(1 if bad else 0)
PY
}

# -------------------------------------------------------------------- run it --

run_gate  "Entry document is pre-rendered"        check_prerendered
run_gate  "Head metadata and social cards"        check_head_tags
run_gate  "Structured data parses and is real"    check_structured_data
run_gate  "robots.txt and sitemap.xml"            check_crawl_files
run_gate  "Images: alt text and intrinsic size"   check_images
run_gate  "Initial bundle budget"                 check_bundle_budget
run_gate  "No 3D in the initial load graph"       check_no_3d_in_entry
run_gate  "Reduced motion is honoured"            check_reduced_motion
run_gate  "No placeholder content shipped"        check_placeholders
run_gate  "Image and model asset weights"         check_asset_weights
run_gate  "No insecure resources or leaked keys"  check_insecure_and_leaks
run_gate  "Landmarks and skip link"               check_skip_link
run_gate  "No unmuted autoplay media"             check_autoplay_media
warn_gate "Anchor targets and scroll-margin"      check_anchor_targets

if command -v gitleaks >/dev/null 2>&1; then
  run_gate "Secret scan (source)" gitleaks detect --no-banner --redact --source .
else
  skip_gate "Secret scan: gitleaks is not installed"
fi

printf '\nSummary: %s passed, %s failed, %s warned, %s skipped\n' "$pass" "$fail" "$warn" "$skip"
printf 'Static inspection only. Still required: browser pass at 4 viewports, keyboard-only pass,\n'
printf 'prefers-reduced-motion pass, throttled-network pass, Lighthouse, automated accessibility\n'
printf 'scan plus a screen-reader spot check, and structured-data validation in Rich Results Test.\n'

if [ "$fail" -gt 0 ]; then
  exit 1
fi
