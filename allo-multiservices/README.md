# Allô Multi-Services Maradi — site-application

Site vitrine installable (PWA) d'Allô Multi-Services, agence de livraison et de services à Maradi.
HTML, CSS et JavaScript sans framework ni étape de build. Animations : GSAP 3 + ScrollTrigger, Lenis.

## Structure

```
index.html, a-propos.html, contact.html   pages
offline.html, 404.html                    page hors connexion, page introuvable
manifest.webmanifest, service-worker.js   PWA
netlify.toml, robots.txt, sitemap.xml     déploiement et référencement
css/   tokens.css (couleurs, typo), main.css (composants), motion.css (animations)
js/    config.js (données), app.js (menu, header), motion.js, contact.js, pwa.js
assets/logo, assets/img, assets/icons, assets/og
scripts/   outils Node (non nécessaires pour servir le site)
src-assets/  fichiers sources (logo fourni, affiche, aperçu des icônes)
```

## Modifier les informations

Tout est dans `js/config.js` : numéros, numéro WhatsApp, adresse, disponibilité, tarif,
et `servicesDomicile.actif` (mettre `false` masque la carte « Services à domicile » et l'option du formulaire).

Les pages contiennent aussi ces valeurs en dur, pour le référencement et l'aperçu WhatsApp.
En cas de changement de numéro, faites aussi une recherche de `74 58 18 24` et `22774581824` dans les fichiers HTML.

Après toute modification mise en ligne, incrémentez `VERSION` dans `service-worker.js`
(ex. `v1.0.1`) : les visiteurs verront « Nouvelle version disponible ».

## Tester en local

```bash
cd allo-multiservices
python3 -m http.server 8080
# puis http://localhost:8080
```

## Mettre en ligne (GitHub puis Netlify)

1. Le code est sur GitHub (dépôt `AbdoulNetwork`, dossier `allo-multiservices/`).
2. Sur Netlify : **Add new site > Import an existing project > GitHub**, choisir le dépôt.
3. Réglages de build :
   - **Base directory** : `allo-multiservices`
   - **Build command** : laisser vide
   - **Publish directory** : `allo-multiservices` (ou `.` relatif à la base)
4. Déployer. Netlify donne une adresse du type `https://xxxx.netlify.app`
   (renommable dans *Site configuration > Change site name*, par exemple `allomultiservice`).

### Mettre la vraie adresse dans les balises (obligatoire pour l'aperçu WhatsApp)

Les balises Open Graph, `canonical` et le sitemap utilisent pour l'instant `https://DOMAINE`.
Une fois l'adresse finale connue :

```bash
cd allo-multiservices
node scripts/set-domain.js https://allomultiservice.netlify.app
git add -A && git commit -m "Adresse du site" && git push
```

Netlify redéploie automatiquement après le `push`.

### Vérifier l'aperçu du lien

- Facebook / Messenger : https://developers.facebook.com/tools/debug/ — coller l'adresse, cliquer « Scrape Again ».
- WhatsApp garde l'aperçu en mémoire. Après une modification, tester avec `?v=2` à la fin du lien
  (`https://allomultiservice.netlify.app/?v=2`), puis `?v=3`, etc.
- L'image de partage (`assets/og/og-image.jpg`) fait 1200 × 630 px et environ 65 Ko (limite WhatsApp : 300 Ko).

## Outils (facultatif)

```bash
cd allo-multiservices/scripts && npm install   # installe sharp
cd ..
node scripts/prepare-logo.js      # détoure le logo fourni (src-assets/logo-source.jpg)
node scripts/generate-icons.js    # icônes PWA + favicon + aperçu src-assets/apercu-icones.png
node scripts/optimize-images.js   # photos en AVIF / WebP / JPG
node scripts/generate-og.js       # image de partage (nécessite Playwright)
```

## Photos

Une seule photo réelle est disponible : le livreur, extraite de l'affiche officielle
(720 px de large à l'origine, donc un peu douce sur grand écran). Pour un rendu net, demander au client :

1. **Photo du livreur en haute définition** (fichier original de l'affiche, au moins 2000 px de large,
   cadrage horizontal, livreur + sac visibles) — pour l'accueil.
2. **Une photo large de l'équipe ou de plusieurs livreurs** à Maradi (paysage, au moins 2400 px de large) — pour le bandeau de la page À propos.
3. Idéalement, **le logo en fichier vectoriel** (SVG, AI ou PDF) : il permettrait un `favicon.svg`
   et des contours parfaitement nets. Le logo actuel est un JPG détouré automatiquement.

Déposer les fichiers dans `src-assets/`, adapter la liste dans `scripts/optimize-images.js`, puis relancer le script.
