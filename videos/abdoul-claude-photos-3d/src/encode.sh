#!/usr/bin/env bash
# Two-pass H.264 encode under 15 MB: encode.sh <master.mp4> <audio.wav> <out.mp4>
set -euo pipefail
IN="$1"; AUDIO="$2"; OUT="$3"
VB=${VB:-1850k}
LOG=$(mktemp -d)/x264
ffmpeg -v error -y -i "$IN" -an -c:v libx264 -preset slow -b:v "$VB" -pass 1 -passlogfile "$LOG" \
  -profile:v high -pix_fmt yuv420p -g 120 -f mp4 /dev/null
ffmpeg -v error -y -i "$IN" -i "$AUDIO" -map 0:v -map 1:a -c:v libx264 -preset slow -b:v "$VB" -pass 2 -passlogfile "$LOG" \
  -profile:v high -pix_fmt yuv420p -g 120 -c:a aac -b:a 128k -ar 48000 -shortest -movflags +faststart "$OUT"
ls -la "$OUT"
