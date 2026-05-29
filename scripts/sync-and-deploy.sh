#!/usr/bin/env bash
# Sync KindleDict to GitHub and deploy production on Vercel.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if git diff --quiet HEAD 2>/dev/null && git diff --cached --quiet 2>/dev/null && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo "No git changes to commit."
else
  echo "==> Committing changes..."
  git add -A
  git commit -m "${1:-chore: sync KindleDict updates}"
fi

echo "==> Pushing to origin..."
git push origin HEAD

echo "==> Deploying to Vercel (production)..."
vercel deploy --prod --yes

echo "==> Done."
