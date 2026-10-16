---
workflow: general-video
flow: automation
storyboard: no
message: "Baya Mahieddine a transformé une passion démesurée en un héritage qui nous survit."
destination: "YouTube / Facebook / WhatsApp (master 4K, copie 1080p)"
aspect: "16:9"
resolution: "3840x2160 (rendu --resolution 4k depuis une composition 1920x1080)"
fps: 30
language: "en (intro) + fr"
length: "< 2:00 (91.5 s)"
---

# Brief — « L'histoire de Baya Mahieddine »

## Intent

Montage documentaire cinématographique : la narratrice, AMOUSSOU HOUNGBEDJI Marie Marthe
(étudiante béninoise, Université Dan Dicko Dankoulodo de Maradi, Niger), raconte l'histoire de
Baya Mahieddine puis pourquoi elle compte. Chaque personne, lieu, date ou objet cité est illustré.

## Source footage

5 rushes verticaux 360×640 : 0077 et 0078 = deux prises de l'intro + « The Story » (la meilleure prise
de chaque phrase est retenue ; les deux prises s'arrêtent vers 58 s, juste avant « André Breton et
Pablo Picasso » — ces noms sont donc montrés à l'image sur « elle se fait remarquer par son talent ») ;
0074 → 0075 → 0076 = « Why this story matters ».

## Constraints (verbatim from the user)

- MP4 · 16:9 paysage · 3840×2160 · 30 fps, < 2:00, aucune barre noire, visage jamais coupé.
- « N'utilise pas des dessins animés … utilise de vraies choses … des images réelles … historique. »
- Présentatrice verticale dans un panneau (modes A/B/C/D), fond jamais vide.
- Sous-titres karaoké mot par mot, mots-clés mis en valeur.
- Son : débruitage, EQ, compression, -14 LUFS / -1 dBTP, musique douce orientale/méditerranéenne en ducking.
- Exports : 4K, 1080p, .srt, credits.txt, projet source.

## Decisions

- Images : uniquement des photographies réelles (Open Images Dataset, CC BY 2.0) — photochromes
  d'Algérie vers 1899 (Library of Congress), photo d'archive d'André Breton (1938), autoportrait de
  Picasso, Paris 1950, etc. Aucun dessin animé ni illustration générée.
- Musique et sons : composés/synthétisés pour le film (aucun droit tiers).
- Réseau limité à GitHub / npm / PyPI / GCS / S3 : Wikimedia Commons inaccessible, donc pas de
  portrait de Baya elle-même ; elle est évoquée par l'Alger de son époque et par son nom à l'écran.
