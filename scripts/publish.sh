#!/usr/bin/env bash
set -euo pipefail

message="${1:-Update AUTOGOOD calculators}"
public_url="https://belovn1999-rgb.github.io/autogood-kalkulatory/"

cd "$(dirname "$0")/.."

if [ -z "$(git status --porcelain)" ]; then
  echo "No local changes to publish."
  echo "Public URL: $public_url"
  exit 0
fi

git add -A
git commit -m "$message"
git push

echo "Waiting for GitHub Pages to refresh..."
for attempt in 1 2 3 4 5 6 7 8 9 10 11 12; do
  status="$(curl -L -s -o /tmp/autogood-pages-check.html -w '%{http_code}' "$public_url")"
  if [ "$status" = "200" ]; then
    echo "Public URL is live: $public_url"
    exit 0
  fi
  echo "Attempt $attempt: public page returned $status, waiting..."
  sleep 10
done

echo "Pushed to GitHub, but Pages did not return 200 yet."
echo "Check shortly: $public_url"
exit 1
