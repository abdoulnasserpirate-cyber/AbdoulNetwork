#!/usr/bin/env bash
# usage: tools/snap.sh <out-dir> <times...>  — snapshots both formats into <out-dir>/{v,h}
set -e
cd "$(dirname "$0")/.."
./make-horizontal.sh
out="$1"; shift; T="$(IFS=,; echo "$*")"
for v in vertical horizontal; do
  (cd $v && rm -rf "$out/$v" && timeout 1500 npx hyperframes snapshot --at "$T" --no-end --describe false -o "$out/$v" 2>&1 | grep -E "saved|rror" || true)
done
