#!/usr/bin/env bash
# Run the browser tests: ./tests/run.sh   (needs Node and Playwright with Chromium)
set -e
cd "$(dirname "$0")"
node features.js
node crawl.js
