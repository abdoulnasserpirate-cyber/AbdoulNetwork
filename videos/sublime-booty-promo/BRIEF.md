---
workflow: general-video
flow: automation
storyboard: yes
message: "Sublime Booty by Chris : des soins beauté premium, à commander maintenant sur WhatsApp au +227 92 48 56 12"
destination: youtube-facebook + tiktok-reels-whatsapp
aspect: 1920x1080 + 1080x1920
language: fr
audience: "Femmes de Maradi, du Niger et de l'international"
length: 48.875s (durée exacte de la voix off)
angle: promo
---

## Intent

Publicité vidéo premium « Rose Noir Luxe » (niveau Dior / Fenty / Huda Beauty) pour Sublime Booty by Chris,
commerçante à Maradi (Niger). Deux livrables, même contenu, mise en page repensée pour chaque format :
`sublime_booty_16x9.mp4` (1920x1080, 30 fps) et `sublime_booty_9x16.mp4` (1080x1920, 30 fps).
Storyboard (1 image clé par scène, 2 formats) à valider avant le rendu final.

## Assets

- assets/voice/voix_off.mp3 — voix off fournie, piste principale, 48,875 s.
- assets/ref/affiche-paiement.jpg — logo SB + couronne, logos NITA / AMANA / Wave (recadrés dans assets/logos/).
- assets/ref/affiche-produits.jpg — liste des produits et prix.
- assets/products/*.png — packshots générés (tools/packshots.html → tools/shoot.mjs), en attendant de vraies photos.
- assets/logos/sb-crown.png, crown.png, sb.png — monogramme SB + couronne redessinés en or.

## Customizations

- Palette v2 (retour cliente « je veux une vraie couleur rose ») : rose vif #FF00A8 dominant (référence assets/ref/rose-reference.jpg), profondeur #D6008C → #8C005C, or #F0CF78 / #FFF4C4.
- Typo v3 (retour cliente « texte bien grand, polices bien visibles, rendu cinématographique ») : Cinzel Black/ExtraBold (titres, prix, numéro), Playfair Display Black Italic (accents), Montserrat ExtraBold (libellés). Tailles fortement augmentées.
- Fond : rubans de satin rose ondulants, bokeh, light leaks rose et or, grain, vignettage.
- Mouvements : révélations par masque, push-in permanent, flare anamorphique, transitions flash + zoom/blur.
- Produits : podium brillant, projecteur, halo rose, reflet au sol, lévitation.
- Sound design discret (whoosh, shimmer) ; musique seulement si `musique.mp3` est fourni (−18 dB, ducking).
- Export H.264 yuv420p CRF 18, AAC 192 kbps.

## Notes

- Ne jamais afficher de frais de livraison. Prix et numéro vérifiés caractère par caractère.
- 9:16 : rien d'important dans les 220 px du haut ni les 380 px du bas.
- Transcription Whisper impossible (HuggingFace bloqué par le réseau) : calage fait sur les pauses
  (silencedetect) et l'enveloppe d'énergie, recoupé avec les repères fournis.
