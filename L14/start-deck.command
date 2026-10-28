#!/bin/bash
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Node.js is not installed. You can still open index.html directly."; read -r; exit 1; }
(sleep 1; open http://localhost:5214) &
node scripts/serve.mjs
