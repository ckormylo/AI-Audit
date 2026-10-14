#!/bin/bash
# Starts the L12 deck with live reload (macOS). Leave this window open while you edit slides.md.
cd "$(dirname "$0")"
(sleep 1; open http://localhost:5212) &
node scripts/serve.mjs
