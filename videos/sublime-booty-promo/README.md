# Sublime Booty ByChris — Pub « Grande Promo » (Remotion)

Spot de ~58 s en deux formats, calé mot par mot sur `public/audio/voix.mp3`.

| Fichier | Format |
|---|---|
| `out/SublimeBooty-GrandePromo-16x9.mp4` | 1920×1080, 30 fps |
| `out/SublimeBooty-GrandePromo-9x16.mp4` | 1080×1920, 30 fps |
| `out/cover-16x9.png`, `out/cover-9x16.png` | miniatures |

## Changer un prix / un texte
Tout est dans **`src/data.ts`** (kits, prix, dates, paiement, livraison, WhatsApp, couleurs).
Modifier, puis relancer les rendus ci-dessous.

## Structure
- `src/Root.tsx` — compositions `Promo16x9`, `Promo9x16` (+ stills `Cover16x9`, `Cover9x16`).
  Durée = durée de `voix.mp3` + 1,5 s (`calculateMetadata`).
- `src/PromoAd.tsx` — `TransitionSeries` des 9 scènes, voix, sound design.
- `src/cues.ts` — repères de synchro : chaque scène/prix pointe sur un mot de `src/captions.json`.
- `src/scenes/S1…S9` — scènes (chacune gère les deux formats via `useLayout()`).
- `src/components/` — fond animé, pastilles de prix, silhouettes (Ken Burns + courbes), sous-titres.
- `public/sfx/` — whoosh / pop / shimmer / impact / ding générés avec ffmpeg.

## Transcription (sous-titres + synchro)
`node scripts/transcribe.mjs` (whisper.cpp, modèle `medium`, fr) — nécessite l'accès à huggingface.co.
Sans cet accès : `python3 scripts/transcribe_faster.py <dossier_modele_ctranslate2>` (faster-whisper).
Les petites erreurs de reconnaissance sont corrigées pour l'affichage dans `src/cues.ts` (`FIXES`).

## Musique séparée (optionnel)
La voix fournie contient déjà sa musique. Pour une musique à part : déposer
`public/audio/musique.mp3` et mettre `music: "audio/musique.mp3"` dans `AUDIO` (`src/data.ts`) —
volume 0,35, ducking à 0,15 pendant la voix, fondu final 1,5 s.

## Rendu
```bash
npm i
npx remotion studio                       # aperçu
npx remotion render Promo16x9 out/SublimeBooty-GrandePromo-16x9.mp4 --codec=h264 --crf=18 --audio-codec=aac --audio-bitrate=192k
npx remotion render Promo9x16 out/SublimeBooty-GrandePromo-9x16.mp4 --codec=h264 --crf=18 --audio-codec=aac --audio-bitrate=192k
npx remotion still Cover16x9 out/cover-16x9.png
npx remotion still Cover9x16 out/cover-9x16.png
node scripts/qc.mjs                       # images de contrôle dans out/qc
```
Dans un environnement sans téléchargement de Chrome : `REMOTION_CHROME=/chemin/vers/chrome-headless-shell`.
