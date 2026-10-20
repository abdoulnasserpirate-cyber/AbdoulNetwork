---
workflow: general-video
flow: automation
storyboard: no
message: "Les 5 erreurs que tout le monde fait avec ChatGPT — compte combien tu en fais"
destination: tiktok
aspect: 1080x1920
language: fr
audience: "Public francophone d'Afrique de l'Ouest qui utilise ChatGPT au quotidien"
length: 66s (voix off 62 s + fin logo)
angle: listicle
---

## Intent

Vidéo TikTok verticale en motion design niveau agence pour @abdoulnetwork (marque Abdoul Network).
Brief complet de l'utilisateur : « PROMPT POUR CLAUDE CODE : vidéo TikTok en motion design
« Les 5 erreurs que tout le monde fait avec ChatGPT » ». Consigne : ne poser aucune question.

## Assets

- assets/voice/voix-off-raw.mp3 — voix off ElevenLabs fournie (62 s), pilote tout le montage.
- assets/images/logo.png — logo officiel AN (utilisé tel quel, coins arrondis par masque CSS).
- assets/images/photo.jpg → photo-rond.jpg (recadrage visage) — signature.
- assets/images/reference-1.png, reference-2.png — références de style (fonds, pastilles, cartes).

## Customizations

- Palette : bleu nuit #0B1026→#141B3D, orange #FF7A1A, crème #FFF4E6, rouge/vert seulement pour ✗/✓.
- Poppins 500/700/800/900 (+ italique 800), Inter en secours, fichiers locaux.
- Compteur 5 cases persistant, signature permanente, fonds sombre/clair alternés.
- Musique lo-fi 90 BPM composée en code (scripts/build_audio.py), ducking sidechain, SFX synthétisés.

## Notes

- Hugging Face bloqué dans l'environnement : transcription mot à mot faite avec Parakeet TDT v3
  (sherpa-onnx, modèle récupéré via GitHub) → timing/words.json.
- Lint : 14 avertissements structurels (fichier monolithique) acceptés ; `check` passe.
