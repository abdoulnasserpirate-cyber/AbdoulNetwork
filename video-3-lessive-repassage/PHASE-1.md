# Allô Multi-Services Maradi · Vidéo 3/3 « Lessive & Repassage » · PHASE 1

## 1.1 Vérification

**Affiches trouvées : 4 sur 5.** Le dossier `./affiches/` n'existait pas sur cette branche. J'ai récupéré dans d'autres branches du dépôt les affiches suivantes, maintenant copiées dans `affiches/` :

| Fichier | Contenu | Résolution |
|---|---|---|
| `affiche-lessive-repassage.jpg` | Service Lessive & Repassage, grille de tarifs | 1080×1080 |
| `affiche-nigeria.jpg` | Colis en provenance du Nigeria | 1080×1080 |
| `affiche-livraison-express.jpg` | Livraison express dans tout Maradi, à partir de 500 F | 720×1080 |
| `affiche-partenariats-pro.jpg` | Partenariats professionnels | 1080×1080 |

**Il manque l'affiche « Prise en charge de vos colis »** (celle des tarifs à 1 000, 1 500 et 2 000 F). Elle ne sert pas pour cette vidéo, mais elle est nécessaire si vous voulez un dossier `affiches/` complet.

### Grille de prix (affiche Lessive & Repassage)
Elle correspond **exactement** aux données vérifiées. Aucun écart.

| Article | Prix |
|---|---|
| Complets (tous tissus : pagne, bazin, etc.) | 12 → 2 000 F · 20 → 2 500 F · 25 → 3 000 F |
| Draps complets (1 drap + 2 taies d'oreiller) | 1 ensemble → 200 F · 6 ensembles → 1 000 F |
| Chemises / T-shirts | 1 pièce → 100 F · 12 pièces → 1 000 F |
| Jeans | 1 pièce → 150 F · 12 pièces → 1 500 F |
| Shorts / débardeurs | 12 pièces → 800 F |
| **Repassage** | **Chaque complet (haut + bas) → 100 F** |

Également sur cette affiche : Intervention à domicile · Collecte du linge à domicile · Dépôt possible à Cité Benghazi · 74581824 / 88579290 / 89967119 · « Nous intervenons dans toute la ville de Maradi et ses environs ».

Remarques (pas des contradictions) :
- L'affiche lessive n'indique pas « Guidan Kaji » ni « 7j/7 ». Ces informations figurent sur les affiches Nigeria et Livraison.
- Ni l'affiche ni les données ne disent si **la collecte et le retour du linge sont inclus dans le prix**. Voir les confirmations.

### Couleurs échantillonnées
| Rôle | HEX | Source |
|---|---|---|
| Bleu marine (titres, « Nos tarifs », bandeau Maradi) | `#003F76` (variante `#004077`) | affiche lessive |
| Bleu marine profond (bandeaux du bas) | `#002F76` | affiche Nigeria |
| Bleu du logo (vectorisé) | `#0A3470` | logo SVG |
| Orange principal (bandeau titre, pastille 100 F) | `#EF5403` | affiche lessive |
| Orange clair (dégradé, haut du bandeau téléphone) | `#FD6F04` | affiche lessive |
| Orange profond (ombre de la pastille) | `#DB4102` | affiche lessive |
| Jaune (surlignage « On s'en occupe ! ») | `#FDD116` | affiche Nigeria |
| Pastilles de prix pêche | `#FAD49C` | affiche lessive |
| Crème (carte Repassage) | `#FEE5C1` | affiche lessive |
| Fond blanc cassé | `#FDFCF6` | affiche lessive |

→ Le bleu marine réel est **plus bleu** que le `#1A2B6D` du brief et l'orange est **plus rouge** que le `#F26A1B` du brief. Je propose d'utiliser les valeurs échantillonnées.

### Éléments réutilisables
- **Logo** : il en existe déjà une **version vectorisée propre** (SVG), créée pour la vidéo 1 : `logo-full.svg` avec ses morceaux séparés (Allô, swoosh, MULTI-SERVICES, MARADI, slogan). Je l'ai copiée dans `assets/logo/`. Elle est nette à toutes les tailles et peut s'animer pièce par pièce. Sur les affiches, le logo ne fait que ~240 px de large : c'est trop petit pour le détourer en HD.
- **Fer à repasser, serviettes pliées, panier** (en bas à droite de l'affiche lessive) : ce sont des photos réalistes d'environ 150 à 260 px de large dans une image de 1080 px. Le détourage serait possible avec rembg, mais **flou une fois agrandi** et dans un style photo qui ne colle pas à la direction « flat illustration ». **→ Je les redessine en vectoriel**, avec les mêmes couleurs : fer blanc et bleu, serviettes blanches et orange, panier en osier.
- **Icônes** (maison, camion, repère, machine, fer, vêtements) : je les redessine en vectoriel avec un seul style de trait.
- **Photos de personnes** (livreur, agent Nigeria) : elles ne servent pas dans cette vidéo illustrée.

---

## 1.2 Texte de voix off

### A) Texte brut (≈ 130 mots, environ 45 à 48 s)

Vingt complets à laver ce week-end… Vous préférez vous reposer, non ?

Frotter, rincer, étendre… et repasser le bazin pendant des heures.

Allô Multi-Services Maradi vient chercher votre linge chez vous. On le lave, on le repasse, et on vous le ramène.

Et les prix ? Tout doux : douze complets pour deux mille francs. Vingt-cinq complets pour trois mille francs. Chemises et t-shirts : cent francs la pièce. Et le repassage ? Seulement cent francs le complet !

Draps, jeans, shorts… tous nos tarifs sont à l'écran.

On intervient chez vous, on collecte votre linge, ou vous le déposez à Cité Benghazi. Partout dans Maradi !

Vous, vous vous reposez. Nous, on s'occupe du linge.

Appelez ou écrivez sur WhatsApp au 74 – 58 – 18 – 24.

Livraisons et colis ? On s'en occupe aussi !

Allô Multi-Services Maradi. Tous vos besoins, un seul appel !

> À lire : « soixante-quatorze… cinquante-huit… dix-huit… vingt-quatre », avec une petite respiration entre chaque groupe. Faites une petite pause après « tous nos tarifs sont à l'écran » : ce moment calme laisse le temps de lire la grille.

### B) Découpage (les timecodes sont indicatifs ; c'est la voix réelle qui commandera)

| # | ≈ Temps | Voix | Image | Texte à l'écran | Transition d'entrée |
|---|---|---|---|---|---|
| 1 | 0,0–3,5 | « Vingt complets à laver ce week-end… Vous préférez vous reposer, non ? » | Une avalanche de complets en pagne et bazin tombe sur la corde à linge, qui ploie et rebondit. Bulles de savon. | **20 complets ce week-end ?** | Aucune : la première frame est déjà en mouvement (vêtements en chute) |
| 2 | 3,5–7,0 | « Frotter, rincer, étendre… et repasser le bazin pendant des heures. » | Trois mini-vignettes en rythme : bassine qui mousse, linge essoré, fer qui fume sur un bazin froissé. Un petit personnage s'éponge le front. | Frotter · Rincer · Étendre · Repasser… | Pliage (fold) sur « Frotter » |
| 3 | 7,0–12,5 | « Allô Multi-Services Maradi vient chercher votre linge chez vous. On le lave, on le repasse, et on vous le ramène. » | La moto de collecte arrive devant une maison et charge le panier → tambour de machine → **match cut** : linge froissé → linge plié et net → la moto repart. | **On récupère · On lave · On repasse · On ramène** (4 pastilles en stagger), logo discret | Drap qui vole (cloth wipe) sur « Allô » ; puis spin du tambour sur « lave » |
| 4 | 12,5–16,5 | « Et les prix ? Tout doux : douze complets pour deux mille francs. » | Retour de la corde : un complet en pagne arrive en se balançant, avec une étiquette orange pincée. **Compteur 0 → 2 000 F**, puis tampon + cha-ching. | **12 complets = 2 000 F** | Bubble pop reveal sur « prix » |
| 5 | 16,5–19,0 | « Vingt-cinq complets pour trois mille francs. » | Un 2e vêtement glisse sur la corde. **Compteur 2 000 → 3 000 F**, tampon. | **25 complets = 3 000 F** | Glissement le long de la corde (continuité, pas un wipe) |
| 6 | 19,0–22,0 | « Chemises et t-shirts : cent francs la pièce. » | Une rangée de chemises et t-shirts colorés s'accroche en stagger, chacun avec une étiquette « 100 F ». | **Chemises & T-shirts · 100 F / pièce** | Spin du tambour (circular wipe) |
| 7 | 22,0–25,5 | « Et le repassage ? Seulement cent francs le complet ! » | **Moment fort** : un fer géant glisse de gauche à droite avec de la vapeur, et le texte apparaît net derrière lui. | **Repassage : 100 F le complet** (haut + bas) | Le fer « repasse » l'écran (wipe horizontal) |
| 8 | 25,5–29,5 | « Draps, jeans, shorts… tous nos tarifs sont à l'écran. » + pause musicale | **Grille complète** : un ticket de pressing se déroule ligne par ligne et reste **lisible au moins 3,5 s**. | Les 6 lignes de tarifs (voir 1.1) | **Pliage inversé** (le ticket se déplie) |
| 9 | 29,5–35,0 | « On intervient chez vous, on collecte votre linge, ou vous le déposez à Cité Benghazi. Partout dans Maradi ! » | 3 icônes rondes qui rebondissent l'une après l'autre ; la moto traverse avec un panier ; un repère « Maradi ». | Intervention à domicile · Collecte du linge à domicile · Dépôt possible à Cité Benghazi · **Partout dans Maradi** | Cloth wipe (pagne) sur « intervient » |
| 10 | 35,0–38,0 | « Vous, vous vous reposez. Nous, on s'occupe du linge. » | Écran séparé : à gauche une personne détendue (hamac, thé) ; à droite le linge qui se plie tout seul. Clin d'œil. | **Vous, vous vous reposez. Nous, on s'occupe du linge.** | Bubble pop reveal |
| 11 | 38,0–42,0 | « Appelez ou écrivez sur WhatsApp au 74 58 18 24. » | Grande pastille orange : le numéro apparaît par groupes de 2 chiffres, au rythme de la voix. Icônes appel + WhatsApp. | **74 58 18 24** (+227) · 88 57 92 90 · 89 96 71 19 en petit | **Zoom dans une bulle** de savon |
| 12 | 42,0–44,0 | « Livraisons et colis ? On s'en occupe aussi ! » | La moto traverse avec un carton (rappel de la vidéo 2). | Livraison & colis · **On s'en occupe aussi !** | Whip latéral avec la moto |
| 13 | 44,0–46,5 (+2 s) | « Allô Multi-Services Maradi. Tous vos besoins, un seul appel ! » | **Plan final** : une pile de linge plié et repassé ; le logo se pose dessus comme une étiquette, le slogan s'écrit à la main, numéro. | Logo · *Tous vos besoins, un seul appel !* · 74 58 18 24 · Maradi – Guidan Kaji | Pliage (fold) vers la pile |

Sous-titres : mot par mot, sur toute la durée, dans la zone sûre. Durée totale estimée : **voix (~46 s) + 2 s = ~48 s**.

---

## 1.3 Checklist : ce dont j'ai besoin pour la phase 2

1. **Votre voix off** — **OBLIGATOIRE**
   - *Pourquoi* : c'est elle qui commande tout le montage.
   - *Format* : M4A, MP3 (≥ 192 kb/s) ou WAV. Un mémo vocal de téléphone convient.
   - *Conseils* : pièce calme et meublée (rideaux, matelas, armoire pleine de linge, c'est parfait). Pas de ventilateur ni de climatiseur. Téléphone à 15–20 cm de la bouche, légèrement de côté. **2 s de silence au début et à la fin**. Ton souriant (on l'entend). Si vous butez, reprenez la phrase entière : je garderai la meilleure prise.
   - *Où* : `video-3-lessive-repassage/audio/` (ex. `voix-off-brute.m4a`)

2. **Le logo officiel** — **OBLIGATOIRE (une confirmation suffit)**
   - J'ai déjà un logo vectorisé (SVG) propre, issu de la vidéo 1, dans `assets/logo/`. **Confirmez simplement qu'il vous convient.** Sinon, envoyez le fichier original du graphiste (AI, PDF, SVG ou PNG transparent ≥ 2000 px).
   - *Où* : `video-3-lessive-repassage/assets/logo/`

3. **Les photos** — **OPTIONNEL**
   - Cette vidéo est entièrement en **illustration vectorielle**. Le fer, les serviettes et le panier des affiches sont trop petits : je les redessine.
   - Si vous voulez une vraie touche locale, vous pouvez fournir : 1 photo de pagnes et bazins pliés et repassés, et/ou des motifs de pagne (pour imprimer les vêtements illustrés). Format JPG HD (≥ 2000 px, lumière du jour).
   - *Où* : `video-3-lessive-repassage/assets/photos/`
   - L'affiche « Prise en charge de vos colis » manquante peut être déposée dans `affiches/`, pour que le dossier soit complet.

4. **La musique** — **OBLIGATOIRE (un choix)**
   - Soit vous fournissez un MP3 ou WAV libre de droits (`assets/music/`), soit je la choisis ou la génère. Mes 3 propositions, toutes à **104–110 BPM** :
     - **A. Afro-pop acoustique « morning »** : guitare highlife en picking clair, shaker, petites percussions (calebasse, conga), sifflement joyeux. *Mon choix recommandé.*
     - **B. Ukulélé + claps + marimba** : style pub de lessive internationale, très souriant.
     - **C. Amapiano light** : log drum doux, piano feutré, plus « jeune », pour TikTok.
   - *Source* : une piste libre de droits (Pixabay Music / licence équivalente, crédit noté dans le récap), ou une génération sur mesure.

5. **Les confirmations** — **OBLIGATOIRE**
   1. Numéro principal à l'oral et en grand : **74 58 18 24** (+227) ; les 2 autres en petit. OK ?
   2. **Collecte et retour du linge : gratuits / inclus dans le prix ?** La voix dit « vient chercher… et vous le ramène ». Si c'est payant ou selon la zone, je dois l'indiquer (ex. « collecte selon la zone »).
   3. **« Intervention à domicile »** veut-il dire qu'un agent vient laver et repasser **chez le client** ? Je le formule « On intervient chez vous ». OK ?
   4. Afficher **Maradi – Guidan Kaji** sur le plan final, en plus de « Dépôt à Cité Benghazi » ? (Je propose : oui, en petit.)
   5. Couleurs : utiliser les **valeurs échantillonnées** (`#003F76` / `#EF5403`) plutôt que celles du brief. OK ?
   6. Orthographe : « **Multi-Services** » (avec un tiret), comme sur les affiches.
   7. « 20 complets » dans l'accroche est une image, pas une offre. La grille affichera bien « 20 complets : 2 500 F ».

6. **Autres ressources** — **OPTIONNEL**
   - **Polices** : je prévois **Montserrat ExtraBold/Black** (titres et prix, gratuite) et une **manuscrite proche de l'affiche** pour le slogan. Le slogan peut aussi reprendre directement le SVG manuscrit du logo (`logo-tagline.svg`), c'est le plus fidèle. Si vous connaissez les polices exactes, dites-le-moi.
   - **Cohérence de série** : souhaitez-vous reprendre un élément des vidéos 1 et 2 (même jingle, même plan logo) ?
   - **Préférences** : pseudo TikTok ou Facebook à afficher ? Un personnage (maman, étudiant) à mettre en avant ?

**Dès que j'ai les éléments 1, 4 et 5 (obligatoires) et votre feu vert sur le logo (2), je lance la phase 2.**
