# Stop aux pubs — @abdoulnetwork

Montage vertical TikTok/Reels/Shorts : bloquer les publicités du téléphone via le DNS privé `dns.adguard.com`.

| Fichier | Contenu |
|---|---|
| `video_finale.mp4` | 1080×1920, 30 fps, H.264 High CRF 18, AAC 48 kHz 192 kbps, -14 LUFS, 64,5 s |
| `video_finale.srt` | Sous-titres corrigés (groupes de 2 à 4 mots) |
| `couverture.jpg` | Couverture 1080×1920 « STOP AUX PUBS 🚫 » |
| `scripts/` | Pipeline de montage reproductible (EDL, mixage, rendu, transcriptions) |

Pipeline : `tr.py` (transcription) → `edl.py` (coupes calées sur l'énergie + `overrides.json`) → `verify.py` (re-transcription de chaque segment) → `render.py --plan` → `mix.py` (+ limiteur, -14 LUFS) → `render.py video_finale.mp4`.
