#!/usr/bin/env bash
# Final delivery: 4K master + 1080p copy. Run from the project root after `npx hyperframes check`.
set -euo pipefail
mkdir -p renders
# 1) HyperFrames render at 3840x2160 (composition is 1920x1080, rendered at device scale 2)
npx --yes hyperframes@0.8.165 render --resolution 4k --fps 30 --quality delivery --crf 10 -o renders/_render_4k.mp4
# 2) Master: H.264 High, >= 35 Mb/s, yuv420p, faststart, mix re-muxed as AAC 320k / 48 kHz
ffmpeg -y -i renders/_render_4k.mp4 -i assets/audio/mix.wav -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -profile:v high -preset slow -b:v 42M -maxrate 60M -bufsize 84M -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 320k -ar 48000 -ac 2 -movflags +faststart -shortest baya_mahieddine_final_4k_16x9.mp4
# 3) Light copy for WhatsApp / Facebook / YouTube
ffmpeg -y -i baya_mahieddine_final_4k_16x9.mp4 -vf scale=1920:1080:flags=lanczos -c:v libx264 -profile:v high \
  -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -movflags +faststart baya_mahieddine_1080p_16x9.mp4
ffprobe -v error -show_entries format=duration,bit_rate:stream=codec_name,width,height,r_frame_rate,sample_rate,bit_rate \
  -of compact baya_mahieddine_final_4k_16x9.mp4
