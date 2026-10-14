# Abdoul Network — Portfolio

Site une page : React + TypeScript + Vite · Tailwind · Motion · Lenis.

```bash
npm install
npm run dev     # développement
npm run build   # build de production → dist/
```

## Changer la photo

Remplace `public/images/profile.webp` (format portrait, ~720 px de large).
Si le fichier manque, un cadre « Photo à ajouter » s'affiche à la place.

## Modifier les textes et liens

Tout est dans `src/data/` :

- `contact.ts` — numéro WhatsApp, e-mail, réseaux sociaux, messages WhatsApp préremplis.
  Un champ vide (`''`) masque l'élément (e-mail, icône réseau…).
- `services.ts` — les 6 tuiles « Ce que je crée ».
- `projects.ts` — les réalisations.

## Ajouter une réalisation

1. Dépose les fichiers :
   - image de couverture WebP → `public/images/mon-projet.webp`
   - vidéo complète (optionnel) → `public/videos/mon-projet.mp4`
   - aperçu court et muet (optionnel, ~10 s) → `public/videos/mon-projet-preview.mp4`
2. Ajoute un objet dans `src/data/projects.ts` :

```ts
{
  id: 'mon-projet',
  title: 'Nom du projet',
  summary: 'Une phrase.',
  categories: ['web'],            // motion | video | web | apps | ia
  cover: '/images/mon-projet.webp',
  video: '/videos/mon-projet.mp4',
  preview: '/videos/mon-projet-preview.mp4',
  link: 'https://…',               // optionnel
  featured: false,
},
```

Les filtres sans projet sont masqués automatiquement.

Pour créer un aperçu muet léger à partir d'une vidéo :

```bash
ffmpeg -ss 0 -t 10 -i video.mp4 -an -vf scale=640:-2 -c:v libx264 -crf 30 -movflags +faststart preview.mp4
```

## Projets « Concept » et maquettes

Les projets marqués `concept: true` sont des démonstrations réalisées par Abdoul Network
(sans client réel). Un badge « Concept » s'affiche sur la carte et dans la modale.

Leurs visuels viennent du dossier `mockups/` : de vraies pages HTML/CSS (app, assistant IA,
site, montage, TikTok) que tu peux ouvrir, modifier et reproduire pour un client.
Pour régénérer les images (`public/images/concept-*.webp`) et les aperçus animés
(`public/videos/concept-*.mp4`) — Playwright et ffmpeg nécessaires :

```bash
node mockups/render.mjs                    # tout
node mockups/render.mjs app-boutiko        # une maquette
node mockups/render.mjs app-boutiko --cover  # image seulement
```

## Déployer sur Netlify

1. Pousse le dépôt sur GitHub.
2. Netlify → *Add new site* → *Import from GitHub* → choisis ce dépôt.
3. Les réglages sont lus depuis `netlify.toml` (build `npm run build`, dossier `dist`).

Chaque push sur la branche choisie redéploie le site.
