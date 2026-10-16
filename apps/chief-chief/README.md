# Chief-Chief — application de commande

Site mobile (PWA) de commande Chief-Chief, construit d'après le storyboard (15 écrans) :
splash → pop-up promo → menu → fiche plat → panier → commande WhatsApp.

HTML/CSS/JS sans dépendance ni étape de build : il suffit de mettre ce dossier en ligne (Netlify, GitHub Pages, hébergeur classique).

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `config.js` | **Tout ce que le restaurant modifie** : numéro WhatsApp, horaires, promo, fermetures, zones, menu, prix |
| `index.html` | Structure des écrans |
| `styles.css` | Couleurs, mise en page, animations |
| `app.js` | Logique : carrousel, panier, recherche, notices, message WhatsApp |
| `sw.js`, `manifest.webmanifest` | Installation sur l'écran d'accueil + fonctionnement avec réseau faible |

## À faire avant la mise en ligne

1. `WHATSAPP_NUMBER` dans `config.js` : remplacer `227XXXXXXXX` par le vrai numéro (chiffres uniquement).
2. Vérifier les **prix**, les **noms et tarifs des 5 zones** et la liste des plats : ce sont des valeurs d'exemple.
3. Ajouter des photos dans `img/` (format 4:3, `.webp`) et les renseigner dans `img` / `thumb` de chaque plat.
   Sans photo, une vignette illustrée avec l'emoji du plat s'affiche.
4. Après une modification de fichiers, augmenter `CACHE` dans `sw.js` (`chief-chief-v2`, …).

## Réglages courants (`config.js`)

- Fermer un jour : `CLOSED_DATES: ["2026-12-25"]`
- Promo : `PROMO.active`, `percent`, `from`, `until` ; un plat est concerné avec `promo: true`
- Plat épuisé : `available: false`
- Ouverture future : `ORDER_OPEN_DATE: "2026-11-01"`

## Tester en local

```bash
cd apps/chief-chief && python3 -m http.server 8000
# puis ouvrir http://localhost:8000 en mode mobile (390 px)
```
