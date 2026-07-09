#!/bin/zsh
set -e

cd "$(dirname "$0")"

NODE_BIN="$(command -v node || true)"
if [[ -z "$NODE_BIN" && -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]]; then
  NODE_BIN="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi

if [[ -z "$NODE_BIN" ]]; then
  echo "Node.js is not installed. Install Node.js or run this from Codex bundled runtime."
  read -r "?Press Enter to close..."
  exit 1
fi

if [[ ! -f "tools/partslink24/.env" ]]; then
  echo "Missing tools/partslink24/.env with PartsLink24 credentials."
  echo "Create it from tools/partslink24/.env.example before running."
  read -r "?Press Enter to close..."
  exit 1
fi

open "http://127.0.0.1:4174/partslink24.html"
"$NODE_BIN" server/partslink24-api.mjs
