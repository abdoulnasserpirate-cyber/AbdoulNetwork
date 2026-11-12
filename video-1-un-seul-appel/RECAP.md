# Récapitulatif — Allô Multi-Services Maradi · Vidéo 1/3 « UN SEUL APPEL »

## Livrables

| Fichier | Format | Durée | Taille |
|---|---|---|---|
| `allo-video1-un-seul-appel-9x16-HD.mp4` | 1080×1920 · H.264 CRF 18 · AAC 192k | 37,5 s | 13.8 Mo (13.2 Mio) |
| `allo-video1-un-seul-appel-9x16-whatsapp.mp4` | 1080×1920 · 2 passes · AAC 128k | 37,5 s | 14.4 Mo (13.7 Mio) |
| `allo-video1-un-seul-appel-16x9-HD.mp4` | 1920×1080 · H.264 CRF 18 · AAC 192k | 37,5 s | 15.1 Mo (14.4 Mio) |
| `allo-video1-un-seul-appel-16x9-whatsapp.mp4` | 1920×1080 · 2 passes · AAC 128k | 37,5 s | 14.4 Mo (13.7 Mio) |
| `miniature-9x16.png`, `miniature-16x9.png` | plan final (logo + numéro) | — | — |

WhatsApp : débit vidéo = 14 × 8192 / 37,5 − 128 = **2 930 kb/s**. Résolution pleine conservée, avec un grain léger contre le banding.

## Scènes (timecodes du film, 30 fps)

| # | Temps | Voix | Image | Transition d'entrée |
|---|---|---|---|---|
| 1 | 0,00–3,30 | *(sonnerie)* « Et si un seul appel suffisait pour tout régler ? » | combiné qui vibre, ondes, UN SEUL APPEL XXL | 1re image déjà en mouvement |
| 2a | 3,25–4,30 | « Un colis à livrer » | COLIS sur orange, le carton tombe | onde de sonnerie → circle reveal |
| 2b | 4,30–5,28 | « des courses » | COURSES sur jaune | slice : COLIS se fend |
| 2c | 5,28–6,00 | « des documents » | DOCUMENTS étiré, bleu roi | coupe nette sur le temps |
| 2d | 6,00–6,86 | « un repas » | 4 cases : colis · courses · documents · repas (assiette + couverts) | split-screen 4 cases |
| 2e | 6,86–8,78 | « un colis venu du Nigeria » | trajet Kano → Maradi, le carton voyage | whip pan : le scooter traverse |
| 2f | 8,78–9,74 | « la lessive » | LESSIVE avec la vraie photo dans les lettres | volet vertical |
| 2g | 9,74–10,60 | « le repassage » | le fer « repasse » le mot | volet latéral |
| 3 | 10,60–11,94 | « Un seul nom. » | ondes qui se contractent, montée | dip sombre |
| 4 | 11,94–14,55 | « Allô Multi-Services Maradi, on s'en occupe ! » | DROP : le logo se construit, bandeau jaune | flood blanc (drop musical) |
| 5 | 14,55–23,10 | 3 prix | livreur / agent / chemise · badges À PARTIR DE 500 F, À PARTIR DE 1 000 F, 100 F LE COMPLET | zoom-through dans le « ô » + morph combiné → scooter → carton → fer |
| 6 | 22,90–27,20 | « 7 jours sur 7, même le week-end, dans tout Maradi et ses environs » | 7J/7 XXL, 7 jours (S et D en jaune), épingle Maradi + zones | volet diagonal, puis slice vers la carte |
| 7 | 27,00–33,00 | « Appelez ou écrivez sur WhatsApp au 74 58 18 24 » | téléphone : appel entrant, numéro composé paire par paire sur la voix, bouton vert qui pulse | morph combiné → bulle WhatsApp |
| 8 | 32,85–37,50 | « Allô Multi-Services, tous vos besoins, un seul appel ! » | swoosh, logo, slogan manuscrit officiel, pastille 74 58 18 24, 7j/7 · Maradi – Guidan Kaji, autres numéros | onde → circle reveal |

## Vérifications

- Prix affichés : 500 F (livraison, « selon la zone »), 1 000 F (colis, réception et livraison à Maradi), 100 F le complet (repassage, haut + bas). Ils sont conformes aux données vérifiées.
- Numéros : 74 58 18 24 (principal, +227), 88 57 92 90 et 89 96 71 19. Ils sont conformes.
- Voix : transcription Whisper au mot près. Chaque mot-clé, prix et chiffre du numéro est calé sur sa prononciation : 74 → 28,94 s, 58 → 30,02 s, 18 → 30,98 s, 24 → 31,82 s.
- Sous-titres retirés à la demande du client. Le fichier `compositions/captions.html` reste disponible si besoin.

## Marque

- Couleurs (échantillonnées sur les affiches) :
  - marine `#06123A` / `#0B2163`
  - marine du logo `#0A3470`
  - bleu roi `#1A4FD6`
  - orange `#F5730F`
  - jaune `#FFC814`
  - blanc `#FFFFFF`
  - brume `#EEF3FB`
  - vert WhatsApp `#25D366`
- Police : **Montserrat** Black et ExtraBold italique (SIL OFL), fournie avec le projet (`assets/fonts`).
- Logo : vectorisé depuis l'affiche officielle « Lessive & Repassage » (`tools/vectorize_logo.py`), sans recoloration ni déformation, et découpé en calques animables.
- Photos : livreur (fournie), agent qui prépare des colis (recadré depuis l'affiche « Nigeria »), lessive et chemise repassée (fournies).

## Son

- Voix : votre enregistrement, filtré (passe-haut 80 Hz) et légèrement compressé. Il est décalé de 0,9 s pour placer la sonnerie d'ouverture.
- Musique : afro-house à 122 BPM **composée et synthétisée pour ce projet** (`tools/music.py`), donc 100 % libre de droits. Le drop tombe sur « Allô » et le tempo respire sur le numéro.
  - Le réseau de la session bloquait les bibliothèques de musique, d'où ce choix.
  - Pour la remplacer par un morceau de votre choix : déposez-le dans `assets/music/`, puis relancez `tools/mix.py`.
- Ducking : la musique est environ 19 dB sous la voix. Le mix final est à −14,0 LUFS, avec un pic vrai à −1,0 dBTP.
- Bruitages : Pixabay (licence libre, voir `assets/sfx/CREDITS-pixabay.md`). La sonnerie est synthétisée.
- Le son a été **mesuré, pas écouté** : je ne peux pas entendre le rendu. Écoutez-le avant publication.

## Projet source

- Formats :
  - `index.html` : 16:9.
  - `format-9x16/` : 9:16. Il utilise les **mêmes** scènes (`compositions/`) et les mêmes ressources (`assets/`) via des liens.
  - Chaque scène s'adapte au ratio par des container queries : une correction s'applique donc aux deux formats.
- Retimer les scènes : modifier `tools/build_roots.py`.
- Refaire le mix : `tools/mix.py`.
- Rendus : `tools/render_all.sh`.
- Livrables : `tools/encode_livrables.sh`.
