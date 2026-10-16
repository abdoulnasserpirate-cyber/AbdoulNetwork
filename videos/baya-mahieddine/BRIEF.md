---
workflow: general-video
flow: automation
storyboard: no
message: "Baya Mahieddine a transformé une passion démesurée en un héritage qui nous survit."
destination: "YouTube / Facebook / WhatsApp (master 4K, copie 1080p)"
aspect: "16:9"
resolution: "3840x2160 (rendu --resolution 4k depuis une composition 1920x1080)"
fps: 30
language: "fr (+ titre de bloc en anglais)"
length: "< 2:00"
---

# Brief — « L'histoire de Baya Mahieddine »

## Intent

Montage documentaire cinématographique : la narratrice, AMOUSSOU HOUNGBEDJI Marie Marthe
(étudiante béninoise, Université Dan Dicko Dankoulodo de Maradi, Niger), raconte pourquoi
l'histoire de Baya Mahieddine compte. Chaque personne, lieu, date ou objet cité est illustré à l'écran.

## Source footage (constat après transcription)

Les 3 rushes fournis (0074 → 0075 → 0076, ~48 s) ne contiennent **que le Bloc 2
« Why this story matters »**. L'intro parlée et « The Story » ne sont pas dans les rushes.

Décision (autonome, signalée à l'utilisatrice) : « The Story » est racontée en
**prologue documentaire typographique** (texte cinétique + motion design + musique), à partir du
texte de référence fourni ; la présentation de la narratrice passe par un lower-third animé.
Aucune voix de synthèse n'est ajoutée : seule sa vraie voix est utilisée.

## Constraints (verbatim from the user)

- MP4 · 16:9 paysage · 3840×2160 · 30 fps, < 2:00, aucune barre noire, visage jamais coupé.
- Présentatrice verticale dans un panneau (modes A/B/C/D), fond jamais vide.
- Sous-titres karaoké mot par mot, mots-clés mis en valeur.
- Son : débruitage, EQ, compression, -14 LUFS / -1 dBTP, musique douce orientale/méditerranéenne en ducking.
- Exports : 4K, 1080p, .srt, credits.txt, projet source.

## Environment limits

Réseau : seuls GitHub, npm et PyPI sont joignables (Wikimedia Commons, Unsplash, Pexels, Pixabay,
Hugging Face bloqués). Donc : pas de photos d'archive ni d'œuvres de Baya téléchargeables →
motion design original inspiré (fleurs, oiseaux, jardins), cartes vectorielles (Natural Earth via
`world-atlas`), icônes Tabler (MIT), musique et SFX générés de façon procédurale (originaux).
