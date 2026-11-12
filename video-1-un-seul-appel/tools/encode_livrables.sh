#!/bin/bash
# Livrables finaux à partir des masters rendus (renders/master-*.mp4)
#  - HD : copie du master (H.264 CRF 18, AAC)
#  - WhatsApp : 2 passes libx264 -preset slow, débit = 14×8192/durée − 128 kb/s, AAC 128k 44.1 kHz, faststart
#  - miniatures PNG
set -e
cd "$(dirname "$0")/.."
NAME=allo-video1-un-seul-appel
for F in 9x16 16x9; do
  M=renders/master-$F.mp4
  DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$M")
  VB=$(python3 -c "print(int(14*8192/$DUR - 128))")
  echo "$F : durée $DUR s → vidéo $VB kb/s"
  # HD (master) : H.264 high, CRF 18, faststart
  ffmpeg -v error -y -i "$M" -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 44100 -ac 2 -movflags +faststart "$NAME-$F-HD.mp4"
  # WhatsApp : 2 passes + grain très léger contre le banding des dégradés
  P=renders/passlog-$F
  ffmpeg -v error -y -i "$M" -vf "noise=alls=3:allf=t" -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
    -b:v ${VB}k -maxrate $((VB*2))k -bufsize $((VB*2))k -pass 1 -passlogfile "$P" -an -f mp4 /dev/null
  ffmpeg -v error -y -i "$M" -vf "noise=alls=3:allf=t" -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
    -b:v ${VB}k -maxrate $((VB*2))k -bufsize $((VB*2))k -pass 2 -passlogfile "$P" \
    -c:a aac -b:a 128k -ar 44100 -ac 2 -movflags +faststart "$NAME-$F-whatsapp.mp4"
  rm -f "$P"*
done
# miniatures : le plan final (logo + numéro)
ffmpeg -v error -y -ss 37.2 -i renders/master-9x16.mp4 -frames:v 1 miniature-9x16.png
ffmpeg -v error -y -ss 37.2 -i renders/master-16x9.mp4 -frames:v 1 miniature-16x9.png
ls -lh "$NAME"-*.mp4 miniature-*.png
