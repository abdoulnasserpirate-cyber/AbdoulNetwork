# « 30 jours de contenu » — 3 montages pro

Vidéo face caméra (35 s, 9:16) : astuce TikTok → ChatGPT → 30 idées de vidéos.

| Fichier | Style | Idéal pour |
|---|---|---|
| `renders/A_split_screen_tuto_1080p.mp4` | Écran partagé : toi en haut, démo animée en bas (barre de recherche, suggestions, prompt IA, calendrier 30 jours) | TikTok |
| `renders/B_dynamique_viral_1080p.mp4` | Plein écran rythmé : punch-zooms, secousses, flashs, gros sous-titres surlignés, emojis, compteur 0→30 | Instagram Reels |
| `renders/C_cinema_epure_1080p.mp4` | Cinéma : étalonnage chaud, push-in lent, grain film, light leaks, chapitres en serif, sous-titres sobres | Facebook |

Tous : 1080×1920, 30 i/s, H.264 High, AAC 256 kb/s, son nettoyé et normalisé à −14 LUFS.

## Traitement commun (`scripts/prep.py`)
- Image : débruitage, upscale Lanczos 720p → 1080p, netteté, courbe de tons, « power window » qui éclaircit le visage sous la casquette.
- Voix : declip, coupe-bas, réduction de bruit, EQ (moins de boue, plus de présence), compression.
- Transcription mot à mot (Whisper) corrigée à la main : `scripts/words.json`.

## Refaire les rendus avec la vidéo originale
1. Déposer le fichier caméra d'origine dans `src/original.mp4` (il est utilisé en priorité).
2. Lancer :
   ```bash
   python3 scripts/prep.py
   python3 scripts/edit_a_split.py
   python3 scripts/edit_b_dynamic.py
   python3 scripts/edit_c_cinema.py
   ```
   Aperçu d'images fixes : `python3 scripts/edit_b_dynamic.py 2.5 15 29` → `snapshots/B_preview.png`.

Dépendances : ffmpeg, Python 3 avec numpy, scipy, opencv-python-headless, Pillow.
Les effets sonores sont synthétisés dans `scripts/common.py` (aucune musique sous licence).
