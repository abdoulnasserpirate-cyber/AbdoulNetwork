#!/usr/bin/env bash
# Encode les livrables à partir des masters HyperFrames (renders/master-*.mp4) :
#   - HD (H.264 CRF 18, high, yuv420p, AAC 192k, faststart)
#   - WhatsApp (< 15 Mo, 2 passes, AAC 128k 44,1 kHz) — débit = 14*8192/durée - 128
#   - miniatures PNG
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=.
for F in 9x16 16x9; do
  M=renders/master-$F.mp4
  DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$M")
  HD=$OUT/allo-video2-colis-kano-$F-HD.mp4
  WA=$OUT/allo-video2-colis-kano-$F-whatsapp.mp4
  ffmpeg -y -loglevel error -i "$M" -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart "$HD"
  TARGET=${WA_TARGET_MB:-14}
  VB=$(python3 -c "print(int($TARGET*8192/$DUR - 128))")
  LOG=tmp/x264-$F
  ffmpeg -y -loglevel error -i "$M" -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v ${VB}k \
    -pass 1 -passlogfile "$LOG" -an -f mp4 /dev/null
  ffmpeg -y -loglevel error -i "$M" -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v ${VB}k \
    -maxrate $((VB * 2))k -bufsize $((VB * 4))k -pass 2 -passlogfile "$LOG" \
    -c:a aac -b:a 128k -ar 44100 -ac 2 -movflags +faststart "$WA"
  echo "$F durée=${DUR}s débit vidéo WhatsApp=${VB}k"
done
# miniatures : plan final (logo + carton + slogan)
ffmpeg -y -loglevel error -ss 64.2 -i renders/master-9x16.mp4 -frames:v 1 miniature-9x16.png
ffmpeg -y -loglevel error -ss 64.2 -i renders/master-16x9.mp4 -frames:v 1 miniature-16x9.png
ls -lh allo-video2-colis-kano-*.mp4 miniature-*.png
