#!/usr/bin/env bash
set -euo pipefail

public_url="https://belovn1999-rgb.github.io/autogood-kalkulatory/"

cd "$(dirname "$0")/.."

if [ "$(git branch --show-current)" != "main" ]; then
  echo "Refusing to publish: switch to main first."
  exit 2
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Refusing to publish a dirty worktree."
  echo "Commit or stash unrelated work first; this helper never stages files."
  git status --short
  exit 2
fi

pnpm run verify
git push origin main

echo "Waiting for GitHub Pages to refresh..."
for attempt in 1 2 3 4 5 6 7 8 9 10 11 12; do
  status="$(curl -L -s -o /tmp/autogood-pages-check.html -w '%{http_code}' "$public_url")"
  if [ "$status" = "200" ]; then
    break
  fi
  echo "Attempt $attempt: public page returned $status, waiting..."
  sleep 10
done

if [ "${status:-}" != "200" ]; then
  echo "Pushed to GitHub, but Pages did not return 200 yet."
  echo "Check shortly: $public_url"
  exit 1
fi

pnpm run smoke:release
echo "Public release smoke test passed: $public_url"
