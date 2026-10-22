#!/usr/bin/env bash
# Regenerates the 16:9 version from the 9:16 source project (scenes adapt via @media orientation).
set -euo pipefail
cd "$(dirname "$0")"
rm -rf horizontal/compositions horizontal/assets
mkdir -p horizontal
cp -r vertical/compositions vertical/assets horizontal/
cp vertical/hyperframes.json vertical/package.json vertical/CLAUDE.md vertical/AGENTS.md horizontal/ 2>/dev/null || true
sed -e 's/data-resolution="portrait"/data-resolution="landscape"/' \
    -e 's/width=1080, height=1920/width=1920, height=1080/' \
    -e 's/width: 1080px; height: 1920px;/width: 1920px; height: 1080px;/' \
    -e 's/data-width="1080" data-height="1920"/data-width="1920" data-height="1080"/g' \
    vertical/index.html > horizontal/index.html
sed -i 's/data-width="1080" data-height="1920"/data-width="1920" data-height="1080"/' horizontal/compositions/*.html
sed -i 's/"name": "sublime-vertical"/"name": "sublime-horizontal"/' horizontal/package.json
