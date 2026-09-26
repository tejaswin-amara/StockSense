#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
required=(README.md AGENTS.md CONTRIBUTING.md docs/product-requirements.md docs/architecture.md docs/data-model.md docs/api-contract.md docs/qa-security.md docs/ci-cd.md docs/operations.md docs/engineering-standard.md schemas/schema.prisma)
for f in "${required[@]}"; do test -s "$root/$f" || { echo "missing or empty: $f"; exit 1; }; done
for f in "$root"/docs/runbooks/*.md "$root"/docs/adr/*.md; do test -s "$f" || exit 1; done
if grep -R -nE '(^|[^A-Za-z])TBD([^A-Za-z]|$)' "$root" --include='*.md' --include='*.prisma' >/dev/null; then
  echo "unresolved TBD found"; exit 1
fi
echo "StockSense documentation validation passed"
