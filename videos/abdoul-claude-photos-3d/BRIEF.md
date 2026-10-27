---
workflow: general-video
flow: automation
storyboard: yes
message: "Claude peut retrouver toutes tes photos sur Internet — et t'aider à les faire retirer"
destination: tiktok
aspect: 1080x1920
fps: 60
language: fr
audience: "Public d'Afrique francophone (Niger), curieux d'IA pratique, sur TikTok / Reels"
length: 55-60s
angle: tutoriel viral / vie privée
---

## Intent

Vidéo verticale originale pour la marque **Abdoul Network** (@abdoulnetwork), présentée
par Abdoul Nasser Oumarou (prénom affiché : **Abdul**). Reprend la structure, le rythme
et l'ambiance d'une vidéo de référence (scan de visage → preuve 9 endroits → étape 1
selfie + prompt → astuce connecteur Chrome → étape 2 recherche inversée → résultats →
bonus demandes de retrait → outro), mais avec son visage, son texte et une réalisation
3D continue (Three.js) plus fluide.

## Assets

- assets/photo/selfie-original.png — selfie fourni (ne jamais modifier les traits).
- assets/photo/selfie-bust-transparent.png — détouré, recadrage buste, PNG transparent.
- assets/photo/selfie-led-red.png — trame LED rouge (aperçu 2D / repli).
- assets/photo/selfie-duotone-red.png — duotone noir → rouge, alpha conservé.
- assets/photo/selfie-depth-luma.png — carte de luminance pour le relief du mur LED 3D.
- assets/photo/avatar-natural-256.png — avatar naturel pour l'interface Claude.
- capture/ — la vidéo de référence n'est PAS versionnée (structure seulement, aucune image réutilisée).

## Customizations

- Noir / rouge vif #FF2A2A / blanc, trame de points, grain, vignettage.
- Une seule scène Three.js continue, caméra qui voyage (pas de coupes sèches).
- Interface Claude recréée en HTML (mode sombre), « Bonjour, Abdul ».
- 1080×1920, 60 fps, H.264 + AAC. Animations déterministes pilotées par la timeline.
- Zones de sécurité TikTok : haut 150 px, bas 420 px, droite 140 px.

## Notes

- Phase 1 livrée (voix-off.txt, storyboard.md, préparation photo). ARRÊT : attendre
  l'enregistrement audio d'Abdul avant toute construction ou rendu.
- Le chiffre « 9 endroits » doit correspondre à un vrai test fait par Abdul ; sinon,
  adapter le chiffre partout (voix + compteurs + grilles).
- Liste des 9 endroits = ses vrais espaces, liens tronqués/floutés, aucune URL inventée.
- Ne pas présenter le RGPD comme la loi du Niger ; aucun article de loi cité.
- Aucun filigrane / pseudo / nom / visage du créateur de la référence.
