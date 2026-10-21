# Photo → vidéo pub avec l'IA (@abdoulnetwork)

Vidéo motion design de 67,5 s calée sur `assets/audio/voix-off.mp3`, en deux formats.

| Livrable | Fichier |
|---|---|
| Vertical 1080×1920 (TikTok / Reels) | `renders/photo-en-video-pub-abdoulnetwork.mp4` |
| Horizontal 1920×1080 (YouTube / Facebook) | `renders/photo-en-video-pub-abdoulnetwork-16x9.mp4` |
| Textes TikTok / WhatsApp / Facebook + commentaire épinglé | `TEXTES.md` |
| Table de timing (synchro voix) | `TIMING.md`, `timing.json` |

## Projet source (modifiable)

Les deux compositions HyperFrames sont **générées** depuis une seule source :

- `tools/build.py` : contenu des 7 scènes (textes, heures d'apparition `data-at`, sons)
- `tools/style.css` : mise en page (règles `.V` = vertical, `.H` = horizontal)
- `tools/timeline.js` : timeline GSAP (entrées, sorties, transitions, typewriter, glitchs…)

```bash
python3 tools/build.py                 # régénère index.html + horizontal/index.html
npx hyperframes preview                # aperçu vertical (Studio)
npx hyperframes render -o renders/v-raw.mp4 --fps 30 --crf 18
(cd horizontal && npx hyperframes render -o ../renders/h-raw.mp4 --fps 30 --crf 18)
```

Audio : `tools/music.py` (musique composée, libre de droits), `tools/sfx.py` (glitch, clavier, impact).
Voix traitée : passe-haut 70 Hz, compression légère, -15 LUFS / -1,5 dBTP (`assets/audio/voix.wav`) ;
musique « duckée » sous la voix (`assets/audio/music-ducked.wav`).

Composants du registre HyperFrames utilisés : `shimmer-sweep` (étiquette Étape 3),
`grain-overlay` (grain léger, texture figée pour la vitesse de rendu), `confetti` (explosion du tampon GRATUIT).
