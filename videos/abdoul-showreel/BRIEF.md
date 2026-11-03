---
workflow: general-video
flow: automation
storyboard: no
message: "AbdoulNetwork fait des vidéos qui arrêtent le scroll — écris-moi sur WhatsApp"
destination: tiktok
aspect: 1080x1920 (+ 1920x1080 in horizontal/)
language: fr
length: 40s
angle: showreel / self-promo
---

## Intent
Reprendre la structure et le rythme d'une vidéo TikTok de référence (assets/reference.mp4),
avec la voix off de l'utilisateur, son nom (AbdoulNetwork), ses propres réalisations.

## Assets
- assets/voice/voiceover-raw.mp3 : voix off de l'utilisateur (36 s) ; words.json = timing par mot.
- assets/portfolio/ : planches fournies (Allô Multiservices, Chief-Chief v2, Sublime Booty ByChris,
  Lostalos Night Club, Savordash) ; assets/crops/ = images découpées.

## Customizations
- Couleurs : orange (accent) + bleu nuit, un peu de bleu, beige.
- WhatsApp +227 94 66 99 69 · TikTok @abdoulnetwork.
- Chaîne YouTube : pas de visuel fourni → lecteur et miniatures créés en motion design.

## Notes
- Source unique : src/build.py génère index.html (9:16) et horizontal/index.html (16:9).
