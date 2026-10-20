# 5 erreurs ChatGPT — vidéo TikTok Abdoul Network

Projet HyperFrames source (1080×1920, 30 i/s, 66 s).

| Fichier | Rôle |
|---|---|
| `index.html` | composition complète (7 scènes, compteur, signature, logo, audio) |
| `TIMING.md` / `timing/words.json` | table de timing mot à mot de la voix off |
| `scripts/build_audio.py` | traitement voix, musique lo-fi composée en code, ducking, SFX |
| `TEXTES-PUBLICATION.md` | légendes TikTok / WhatsApp / Facebook + commentaire épinglé |
| `renders/5-erreurs-chatgpt-abdoulnetwork.mp4` | vidéo finale |

## Modifier

- **Un texte** : éditer `index.html` (chaque mot synchronisé porte `data-at="secondes"`).
- **Un timing de scène** : objet `T` en haut du `<script>` + `data-start`/`data-duration` des `<section>`.
- **Aperçu** : `npx hyperframes preview` · **Contrôle** : `npx hyperframes check`
- **Rendu** : `npx hyperframes render --quality high --output renders/5-erreurs-chatgpt-abdoulnetwork.mp4`
- **Audio** : remplacer `assets/voice/voix-off-raw.mp3` puis `python3 scripts/build_audio.py`.
