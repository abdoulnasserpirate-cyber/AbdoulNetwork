# Vidéo 2/3 · « Kano → Maradi : vos colis entre de bonnes mains » · Récapitulatif

## Livrables

| Fichier | Format | Durée | Taille |
|---|---|---|---|
| `allo-video2-colis-kano-9x16-HD.mp4` | Vertical 1080×1920 · HD (master) | 65.5 s | **23.7 Mo** (22.6 Mio) |
| `allo-video2-colis-kano-9x16-whatsapp.mp4` | Vertical 1080×1920 · WhatsApp | 65.5 s | **14.6 Mo** (13.9 Mio) |
| `allo-video2-colis-kano-16x9-HD.mp4` | Horizontal 1920×1080 · HD (master) | 65.5 s | **23.0 Mo** (22.0 Mio) |
| `allo-video2-colis-kano-16x9-whatsapp.mp4` | Horizontal 1920×1080 · WhatsApp | 65.5 s | **14.6 Mo** (13.9 Mio) |

Miniatures : `miniature-9x16.png`, `miniature-16x9.png` (plan final : logo, carton, slogan, numéro).

## Choix techniques

- **HyperFrames** (déjà utilisé dans ce dépôt) : composition HTML/GSAP déterministe, une seule timeline pilotée par les mots de la voix.
- **Une source, deux mises en page** : `src/template.html` (HTML/CSS) + `src/film.js` (timeline unique, positions par format) → `node scripts/build.mjs` génère `build/9x16/` et `build/16x9/`. Toute correction s'applique aux deux formats.
- 30 fps · 65,5 s = voix (0 → 63,4 s) + plan final.
- Transcription au mot près : modèle de reconnaissance vocale français local (sherpa-onnx, zipformer FR), latence mesurée et corrigée (-0,34 s), orthographe corrigée à la main → `transcript.json`.
- Audio : voix normalisée à -14 LUFS (`audio/voix-off.wav`, original conservé dans `audio/voix-off-originale.mp3`).

## Scènes et timecodes (calés sur la voix)

| # | Timecode | Voix | Scène | Transition d'entrée |
|---|---|---|---|---|
| 1 | 0:00 – 0:06 | « Votre colis arrive du Nigeria… » | Carte, épingle Kano, carton miniature sur le pointillé jaune | — (première frame déjà en mouvement) |
| 2 | 0:06 – 0:12.5 | « Voici Hadiza… » | Carte de Hadiza, chauffeur, boutique | **Travelling caméra** le long du pointillé jusqu'à Maradi |
| 3 | 0:12.5 – 0:15.2 | « Alors, elle appelle… » | Téléphone : appel vers Allô · étape ① | **Zoom-out carte → téléphone** (raccord épingle → icône de localisation) |
| 4 | 0:15.2 – 0:18.9 | « Sur WhatsApp… » | Conversation WhatsApp (numéro masqué, photo du carton) · étape ② | Push horizontal dans l'écran |
| 5 | 0:18.9 – 0:22.2 | « Notre équipe appelle le chauffeur… » | Agent ↔ chauffeur sur fond marine · étape ③ | **La pastille 3 se transforme en scène plein écran** |
| 6 | 0:22.2 – 0:26 | « Le colis est récupéré, vérifié, réemballé… » | Carton qui tombe, s'ouvre, photo de l'agent qui scotche, checklist · étape ④ | Panneau qui remonte + **zoom-through dans le carton** |
| 7 | 0:26 – 0:34 | « Puis il est livré à Maradi… sous-région » | Carte du Niger : livraison à Maradi, flèches vers Niamey, Zinder, Tahoua, Agadez, toutes les villes, puis Nigeria, Bénin, Togo, Burkina Faso, Mali, Tchad | **Ruban adhésif Allô qui traverse l'écran (wipe)** |
| 8 | 0:34 – 0:38 | « Hadiza reçoit la confirmation… » | Notification « Votre colis est bien pris en charge » · étape ⑤ | Le téléphone monte |
| 9 | 0:38 – 0:51 | « Les tarifs ? … » | 1 000 / 1 500 / 2 000 F CFA, avec les photos des affiches | Bandeaux qui glissent + **flip 3D d'une carte à la suivante** |
| 10 | 0:51 – 0:53 | « Et une facture claire à la fin. » | Facture qui s'imprime (aucun montant inventé : « Montant définitif : indiqué ici ») | Cartes qui sortent, imprimante |
| 11 | 0:53 – 0:54.7 | « Votre colis, on s'en occupe ! » | Le carton héros tombe au centre | Impact |
| 12 | 0:54.7 – 1:00.3 | « Appelez ou écrivez sur WhatsApp au 74 58 18 24 » | Boutons, numéro paire par paire, Guidan Kaji · 7j/7 | Apparition en cascade |
| 13 | 1:00.3 – 1:05.5 | « Allô Multi-Services Maradi. Tous vos besoins… » | Le carton se referme, le logo s'imprime sur sa face, recul de caméra, slogan, numéro | Ruban + fermeture du carton |

## Charte

- **Polices** : Montserrat 700/800/900 (titres, chiffres, sous-titres), Inter 500–700 (texte d'interface), Kalam 700 (slogan manuscrit). Fichiers dans `assets/fonts/` (licence SIL OFL).
- **Couleurs (échantillonnées sur les affiches)** : bleu marine logo `#06347E` · encre des titres `#0B1A4F` · bleu roi `#0B44B3` · jaune `#FDCB05` · fond `#F4F7FD` · blanc `#FFFFFF`. Vert WhatsApp `#25D366` uniquement sur le bouton et l'icône WhatsApp.
- **Logo** : vectorisé (tracé fidèle en 2 couleurs) depuis l'affiche « Vos colis en provenance du Nigeria ? » → `assets/logo/logo-allo-trace.svg` (+ variante blanche pour fond foncé). Ni redessiné ni déformé.
- **Icônes** : un seul style de trait (2,2 px, extrémités arrondies).

## Audio

- Voix off : votre enregistrement. Il contient déjà un fond musical : **aucune seconde musique n'a été ajoutée**, pour éviter que deux musiques se superposent.
- Bruitages : synthétisés pour ce projet (`scripts/gen_sfx.py`), libres de droits : whoosh, pop, bip de validation, notification, ruban adhésif, impression, flip, impact.

## Sources des images

- Affiches officielles (`../affiches/`) : logo, photo de l'agent qui scotche, vignettes moto / agence de transport / ouverture du colis.
- `assets/photos/hadiza.jpg` et `livraison.jpg` : photos que vous avez fournies.
- Carte : Natural Earth via `world-atlas` (domaine public), projetée une seule fois en SVG statique.

## Modifier la vidéo

```bash
node scripts/build.mjs                       # régénère build/9x16 et build/16x9
cd build/9x16 && npx hyperframes@0.9.39 preview   # aperçu / édition dans Studio
npx hyperframes@0.9.39 render --fps 30 --crf 18 -o ../../renders/master-9x16.mp4
cd ../.. && ./scripts/encode.sh              # HD + WhatsApp + miniatures
```

## Contrôle qualité effectué

- Voix finale : -13,8 LUFS intégrés, crête -2,3 dBFS (HD et WhatsApp).
- Prix vérifiés contre l'affiche tarifs : 1 000 / 1 500 / 2 000 F CFA « à partir de ». Numéros : 74 58 18 24 (principal), 88 57 92 90, 89 96 71 19, +227. Adresse : Maradi – Guidan Kaji.
- Captures de chaque scène inspectées dans les 2 formats (zones sûres : rien dans les 250 px du bas ni les 180 px du haut en vertical ; sous-titres à 62 px du bas en horizontal).
- Versions WhatsApp : 6 frames inspectées par format (textes, prix, numéros nets, pas de banding).
- `hyperframes check` : il reste uniquement des faux positifs connus (texte du ruban volontairement rogné, chiffres du traqueur recouverts par la coche ✓, écran d'appel déjà sorti du téléphone).

## Points à valider

1. **Photo de Hadiza** : l'image fournie est un aperçu Adobe Stock avec filigrane. Il faut acheter la licence ou la remplacer par votre propre photo avant toute diffusion publique. Pour la remplacer : `assets/photos/hadiza.jpg` (format carré), puis rebuild et rendu.
2. **Texte réellement prononcé** (le montage suit l'audio) : « du Nigeria **ou d'un autre pays** » et **Agadez** dans la liste des villes. Agadez n'est pas sur l'affiche, mais c'est une ville du Niger, couverte par « toutes les villes du Niger ».
3. Les numéros 88 57 92 90 et 89 96 71 19 sont affichés en petit sous le numéro principal : à retirer si vous préférez un seul numéro.
4. Le numéro du chauffeur dans la conversation WhatsApp est fictif et masqué (« +234 ●● ●●● ●●●● »).
