---
workflow: product-launch-video
flow: automation
storyboard: no
message: "Sublime Booty by Chris : des soins naturels pour sublimer vos courbes, payables par NITA, AMANA ou Wave et livrés partout au Niger"
destination: youtube + tiktok
aspect: 1920x1080 + 1080x1920
language: fr
audience: "Femmes au Niger (Maradi et autres villes) qui veulent prendre soin de leur silhouette"
length: 45-50s
angle: promo
vo_mode: verbatim
---

## Intent

Publicité motion design élégante, fluide, dynamique et accrocheuse pour la marque
**Sublime Booty by Chris** (l'utilisateur a écrit « Sublime Beauty », les affiches
disent « Sublime Booty »). Couleur de référence : **rose vif**. Pas de vidéo de
référence : le style d'animation est laissé libre (« je te laisse choisir la
meilleure motion design adaptée »).

## Assets

- assets/posters/affiche-cereales-booty-gain-vip.jpg — produit vedette, logo, WhatsApp 87 32 55 96, prix 25 000 FCFA.
- assets/posters/liste-produits-prix.jpg — liste complète des produits et prix.
- assets/posters/coordonnees-paiement.jpg — NITA / AMANA / Wave, dépôt 227 92485612 (Mehou Loko Christelle), livraison Maradi 1 000 F, autres villes 1 500 F.
- assets/img/* — découpes tirées des affiches (sachet, logo, emblème, logos de paiement).

## Customizations

- Deux rendus : paysage 1920x1080 (`index.html`) et vertical 1080x1920 (`vertical.html`), mêmes scènes.
- Voix off : texte `SCRIPT.md` lu par l'utilisatrice / l'utilisateur ; en attendant, voix temporaire Kokoro `ff_siwis` dans `assets/voice/scratch/` pour caler le rythme.
- Musique de fond composée localement (`assets/bgm/sublime-groove.wav`, 104 BPM).

## Notes

- Ne pas lire « sans effets secondaires » ni promettre de résultat médical.
- Quand la vraie voix off arrive : la découper par scène, mettre à jour `src/timeline.json` (durées + repères), relancer `node build.mjs`, puis rendre les deux formats.
