# Storyboard — « Claude retrouve tes photos » (3D) · Abdoul Network

**Format** 1080×1920 · 9:16 · 60 fps · ~57 s · voix d'Abdul + musique sombre −24 dB + SFX
**Timings provisoires** : ils seront recalés au mot près sur l'enregistrement (Phase 2).

## Phase 0 — Analyse de la référence (résumé)

1. 57 s, 576×1024 30 fps, 10 scènes : accroche scan → preuve 9 → étape 1 → description → astuce Chrome → étape 2 → navigateur → choc → bonus → outro. Ton découpage est juste.
2. Rythme : un changement visuel toutes les 1–2 s, jamais d'image fixe ; le titre du haut ne change qu'aux changements de scène, le texte du chat porte le mouvement entre-temps.
3. Titres : sans-serif gras blanc centré en haut, mot-clé rouge, 2 lignes max.
4. Compteurs bas : majuscules très grasses rouges, flou de mouvement + aberration chromatique, uniquement scènes 1, 2, 8, 9.
5. Interfaces : app Claude en mode sombre, inclinées en légère perspective, zoom caméra sur la zone utile ; pastilles numérotées sous le champ de saisie.
6. Transitions : glissements/zooms, cartons glitch plein écran (« L'ASTUCE », « LE BONUS ») de moins de 0,5 s.
7. Fond : noir + trame de points rouge sombre, léger vignettage.
8. Points faibles à dépasser : interfaces plates 2D, coupes visibles entre scènes, portrait LED statique, fin = carte TikTok générique (celle de la plateforme, pas du créateur).
9. Les demandes de retrait de la référence citent le « RGPD, article 17 » → on ne le reprend pas (non applicable au Niger tel quel).
10. On ne reprend rien de visible : ni texte, ni visage, ni pseudo, ni filigrane, ni images.

## Système visuel

| Élément | Règle |
|---|---|
| Palette | Noir #050505 · rouge #FF2A2A (halo #FF2A2A à 40 %) · blanc #F5F5F5 · gris UI #1F1F1F / #2A2A2A |
| Titres du haut | Inter Black / Montserrat ExtraBold 64 px, blanc + mot-clé rouge, entrée mot par mot (y +24 px → 0, `expo.out`, 60 ms d'écart). Top à 170 px, largeur max 860 px (marge droite 140 px). HTML, jamais en 3D. |
| Compteurs bas | Texte 3D extrudé rouge, 150 px, chiffres qui roulent (compteur mécanique), base à 1480 px. Flou de mouvement + aberration RGB à l'arrivée. |
| Fond | Trame de points rouge 6 % qui dérive lentement + grain 3 % + vignettage. |
| Caméra | Une seule scène Three.js. Tous les mouvements en `power3.inOut` / `expo.out`, pilotés par le temps de la timeline (aucun rAF libre, aléatoire seedé). |
| Zones sûres | Rien d'important : y < 150, y > 1500, x > 940. |

**Carte de l'espace 3D** (la caméra voyage entre ces « stations », sans coupe) :
`Mur LED (z 0)` → `Grille 9 cartes (autour du mur)` → `Panneau Claude (x +, z −400)` → `Panneau Paramètres (derrière, rotation 90°)` → `Éventail navigateurs (z −1200)` → retour `Grille 9` → `Document + enveloppes (z −1800)` → `Carte de fin (z −2400)`.

---

## Scène 1 — Accroche · 0:00–0:04 (4 s)

- **Titre** : Claude peut retrouver **toutes tes photos**
- **Action 3D** : le mur LED s'allume de bas en haut (sphères qui sortent du noir, relief = luminance du visage). Un plan laser rouge volumétrique traverse le visage de haut en bas puis remonte ; 4 coins de cadre 3D arrivent de la profondeur et se verrouillent (petit rebond) autour de la tête.
- **Caméra** : dolly-in lent 0 → −8 %, orbite douce −12° → +6°.
- **Compteur** : « ? PHOTOS » (le « ? » scintille comme un chiffre qui cherche).
- **Transition →** la caméra recule et monte : le mur rétrécit vers le haut du cadre.
- **SFX** : bip de scan ×2, nappe grave qui monte, verrouillage des coins (clic métallique).

## Scène 2 — Preuve · 0:04–0:07 (3 s)

- **Titre** : J'ai testé sur moi : **9 endroits**
- **Action 3D** : depuis le visage, 9 lignes lumineuses partent une à une ; une carte-vignette (floue/pixelisée, alternance rouge / N&B) jaillit au bout de chaque ligne et se range en grille 3×3, profondeur décalée ±40. Particules qui filent le long des lignes.
- **Caméra** : recul + légère plongée pour cadrer visage + grille.
- **Compteur** : « 1 ENDROIT » → roule jusqu'à « 9 ENDROITS » au mot « neuf ».
- **Transition →** les cartes basculent à plat et s'éloignent ; la caméra pivote à droite vers le panneau Claude qui s'allume.
- **SFX** : « tic » à chaque carte (9), whoosh de caméra.

## Scène 3 — Étape 1 : selfie + prompt · 0:07–0:15 (8 s)

- **Titre** : Étape 1 : **un selfie + un prompt**
- **Action 3D** : panneau flottant « app Claude » mode sombre, ombre douce, arrière-plan flou (profondeur de champ). Écran d'accueil : logo étoile Claude + « **Bonjour, Abdul** », avatar naturel en haut à droite. Curseur → clic sur « + » (halo rouge) → la miniature du selfie glisse dans le champ. Le prompt se tape caractère par caractère :
  > *Analyse cette photo et liste chaque détail précis qui me rend reconnaissable, pour que tu puisses m'identifier n'importe où en ligne.*
- **Pastilles** (sortent du panneau en relief, sur les mots) : ① Ajoute ton selfie · ② Décris chaque détail · ③ Ce qui me rend reconnaissable.
- **Caméra** : arrive en 3/4, se redresse face au panneau, zoom sur le champ de saisie pendant la frappe.
- **Transition →** clic sur Envoyer : le message monte, la caméra suit vers le haut.
- **SFX** : clic souris, frappe clavier, pop par pastille, « send ».

## Scène 4 — Claude décrit le visage · 0:15–0:18 (3 s)

- **Titre** : Claude décrit **ton visage**
- **Action 3D** : réponse « **Description visuelle détaillée** » qui s'écrit, en rubriques : Cheveux (courts, noirs, coupe nette) · Visage (ovale, pommettes marquées) · Sourcils · Yeux (marron foncé) · Nez · Barbe (fine, courte) · Teint (foncé) · Vêtements (chemise blanche col ouvert, blazer bleu marine) · Arrière-plan (fond gris dégradé). La ligne « Barbe » se surligne en rouge au mot « barbe ».
- **Caméra** : travelling vertical qui suit le texte, légère parallaxe du panneau.
- **Transition →** carton glitch.
- **SFX** : tapotement léger de génération.

## Scène 5 — L'astuce : connecteur Chrome · 0:18–0:26 (8 s)

- **Titre** : L'astuce : **le connecteur Chrome**
- **Action 3D** : carton « **L'ASTUCE** » en texte 3D extrudé qui traverse la caméra (flou de mouvement + aberration + glitch 6–8 images). Puis le panneau pivote de 90° pour révéler le panneau Paramètres : clic **Paramètres** → **Connecteurs** → champ de recherche, « Chrome » se tape → carte « Claude in Chrome » → clic **Installer** → coche verte → passe au rouge de marque.
- **Caméra** : zoom sur chaque cible de clic (menu, recherche, bouton), petits recadrages `power3.inOut` entre chaque.
- **Transition →** le panneau Paramètres se replie, retour au chat.
- **SFX** : impact glitch, clics, frappe, ding sur « Installer ».
- **À vérifier par Abdul** : le chemin exact dans *ta* version de l'app (Paramètres → Connecteurs → Claude in Chrome) et le libellé du bouton (« Installer » / « Connecter »). Claude in Chrome nécessite aussi l'extension dans Chrome. Je reproduirai ce que tu vois à l'écran.

## Scène 6 — Étape 2 : visage + nom · 0:26–0:36 (10 s)

- **Titre** : Étape 2 : **ton visage + ton nom**
- **Action 3D** : la description est en arrière-plan floue. Nouveau prompt tapé en direct :
  > *Avec mon selfie et tout ce que tu sais de moi — je m'appelle Abdoul Nasser Oumarou — utilise Chrome pour faire une recherche d'image inversée de mon visage, trouve chaque endroit où j'apparais en ligne, et donne-moi le lien de chacun.*
- **Pastilles** : ① Selfie + nom · ② Recherche d'image inversée · ③ Chaque endroit + le lien.
- **Caméra** : zoom progressif sur le champ, petite orbite ±5° pour ne jamais être figée.
- **Transition →** Envoyer : le panneau recule, des fenêtres de navigateur glissent derrière lui.
- **SFX** : frappe, pops, send.

## Scène 7 — Claude ouvre son navigateur · 0:36–0:42 (6 s)

- **Titre** : Claude ouvre **son propre navigateur**
- **Action 3D** : 4–5 fenêtres de navigateur génériques (moteurs de recherche d'images inversée, résultats flous) s'empilent en éventail 3D ; la caméra les traverse une à une. Barre de 4 pilules 3D en bas : Selfie + nom → Chrome → Endroits → Liens, qui se cochent en rouge (ding chacune). Puis retour au chat : « **J'ai trouvé 9 endroits où tu apparais :** » et la liste qui défile (liens tronqués + flous) :
  1. Page Facebook Abdoul Network · 2. TikTok @abdoulnetwork · 3. Instagram · 4. LinkedIn · 5. YouTube · 6. Chaîne WhatsApp AbdoulNetwork Lab · 7. Site portfolio Abdoul Network · 8. Digital Abdoul Academy · 9. Boutique Chariow
- **Caméra** : traversée de l'éventail (dolly avant), puis recul sur la liste.
- **Transition →** la liste se dissout en 9 cartes qui s'envolent vers la grille.
- **SFX** : whoosh par fenêtre, dings ×4.
- **Note** : les captures de moteurs de recherche sont recréées génériquement (aucun logo Google/Bing).

## Scène 8 — Choc · 0:42–0:44 (2 s)

- **Titre** : Le résultat fait **vraiment peur**
- **Action 3D** : retour sur le mur LED, grille de 9 cartes reformée autour ; pulsation rouge synchronisée sur « peur ».
- **Caméra** : coup de zoom rapide (punch-in 6 %) puis stabilisation.
- **Compteur** : « 9 ENDROITS » claque (aberration).
- **Transition →** carton glitch.
- **SFX** : impact grave + tension de la musique qui coupe 1 temps.

## Scène 9 — Le bonus · 0:44–0:53 (9 s)

- **Titre** : Le bonus : **une demande de retrait** par site
- **Action 3D** : carton « **LE BONUS** » 3D qui traverse la caméra. Chat : prompt tapé
  > *Maintenant, rédige une demande de retrait personnalisée pour chaque site où je ne veux plus apparaître, au nom de la protection de mes données.*
  Puis un document « **Demandes de retrait · 3/9** » défile (texte générique : objet, demande de suppression des photos, « Cordialement, Abdoul Nasser Oumarou » — sans article de loi). 9 enveloppes 3D s'envolent du document vers une grille 3×3, chacune avec un petit rebond.
- **Caméra** : suit le document puis recule pour cadrer la grille d'enveloppes.
- **Compteur** : « 1 DEMANDE » → « 9 DEMANDES ».
- **Transition →** les enveloppes partent vers le fond et deviennent des points de la trame ; la caméra plonge vers la carte de fin.
- **SFX** : glitch, frappe, « tic » ×9, petit « swoosh » d'envoi.

## Scène 10 — Outro · 0:53–0:58 (5 s)

- **Titre** : Abonne-toi pour **plus d'astuces IA**
- **Action 3D** : logo **Abdoul Network** en 3D (extrudé, reflet rouge) qui se pose ; barre de recherche où « @abdoulnetwork » se tape ; mini-portrait LED d'Abdul à gauche de la barre. Pas de logo TikTok.
- **Caméra** : arrivée en dolly-in, micro-orbite finale qui ralentit jusqu'à l'arrêt.
- **SFX** : frappe, ding final, musique qui se résout.

---

## Vérifications Phase 2

- Le « 9 » vient du vrai test d'Abdul ; si autre chiffre → tout s'adapte.
- Vignettes des 9 endroits = floutées/pixelisées (pas de vraies photos tierces).
- Aucun article de loi ; le RGPD n'est pas présenté comme loi nigérienne.
- Planche de 12 images + 5 points de synchro vérifiés avant livraison.
