#!/bin/bash
# Rendu des 2 masters HD (CRF 18) — même timeline, même bande-son
set -e
cd "$(dirname "$0")/.."
npx hyperframes render --crf 18 --fps 30 -o renders/master-16x9.mp4 --quiet
(cd format-9x16 && npx hyperframes render --crf 18 --fps 30 -o ../renders/master-9x16.mp4 --quiet)
echo RENDER_DONE
