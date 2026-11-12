# Allô Multi-Services Maradi · Vidéo 1/3 « UN SEUL APPEL » · PHASE 1

## 1.1 Vérification

**Les affiches sont absentes.** Le dossier `./affiches/` n'existe pas dans le dépôt (je l'ai créé vide). Je n'ai donc pas pu vérifier les données contre les 5 affiches officielles, ni échantillonner leurs couleurs. Les données du prompt servent de référence en attendant.

**Seule ressource de marque trouvée :** `videos/chief-chief-promo/assets/allo-multiservices.png`, reprise d'un ancien projet. Elle présente plusieurs écarts avec la description du prompt :

| Point | Prompt | Logo trouvé dans le dépôt |
|---|---|---|
| Texte | « MULTI-SERVICES » + « MARADI » orange entre deux filets | « MULTISERVICES » (sans trait d'union), **pas de « MARADI »** |
| Swoosh | orange / jaune | **or / moutarde, une seule teinte : `#D8980C`** |
| Bleu marine | ~`#1A2B6D` | **`#002058`** (plus profond, plus saturé) |
| « Allô » | bleu marine | **blanc** sur fond marine |
| Qualité | — | 1021×977 mais agrandi depuis une petite image (flou), **fond marine opaque, aucune transparence** → inutilisable en l'état pour un logo net en 1080p |

Il s'agit sans doute d'une ancienne version du logo, ou d'une version simplifiée. **Dites-moi laquelle fait foi.**

Ce qui reste ambigu dans les données :
- **Livraison « à partir de 500 F, selon la zone »** : à l'écran, j'afficherai « dès 500 F » avec une petite mention « selon la zone ».
- **« Colis dès 1 000 F »** : ce tarif concerne la réception et la livraison **à Maradi**. L'envoi vers une autre ville commence à 1 500 F. La voix dit simplement « vos colis, dès 1 000 F ». C'est exact, mais je le signale.
- **Orthographe** : « Multi-Services » (prompt) ou « Multiservices » (logo) ? J'utiliserai « Multi-Services » partout, sauf avis contraire.

**Éléments réutilisables :** je ne peux pas les évaluer sans les affiches (livreur à moto, sac isotherme, agents en uniforme). Si le détourage n'est pas propre, je les illustrerai en vectoriel.

**Moteur : HyperFrames.** Le dépôt l'utilise déjà (projet Chief-Chief), et il gère une timeline unique avec des layouts par format.

---

## 1.2 Texte de voix off

### A) Texte BRUT (≈ 86 mots, environ 32 à 36 s)

> Et si un seul appel suffisait pour tout régler ?
>
> Un colis à livrer ? Des courses ? Des documents ? Un repas ? Un colis venu du Nigeria ? La lessive ? Le repassage ?
>
> Un seul nom : Allô Multi-Services Maradi. On s'en occupe !
>
> La livraison, dès cinq cents francs. Vos colis, dès mille francs. Le repassage, cent francs le complet.
>
> Sept jours sur sept, même le week-end, dans tout Maradi et ses environs.
>
> Appelez ou écrivez sur WhatsApp au soixante-quatorze, cinquante-huit, dix-huit, vingt-quatre.
>
> Tous vos besoins, un seul appel !

### B) Découpage (les timecodes sont des estimations ; l'audio réel commandera le montage)

| # | ~Temps | Voix | Scène | Texte à l'écran | Transition d'entrée |
|---|---|---|---|---|---|
| 1 | 0,0–2,4 | *(sonnerie)* « Et si un seul appel suffisait pour tout régler ? » | Combiné du logo qui vibre, ondes concentriques orange | **UN SEUL APPEL ?** | Première frame déjà en mouvement (combiné qui tremble) |
| 2 | 2,4–3,6 | « Un colis à livrer ? » | Carton qui tombe et s'écrase | **COLIS** (XXL) | Onde de sonnerie → circle reveal |
| 3 | 3,6–4,6 | « Des courses ? » | Sac de courses | **COURSES** | Slice : « COLIS » se fend |
| 4 | 4,6–5,6 | « Des documents ? » | Enveloppe / feuilles | **DOCUMENTS** | Coupe nette sur le beat, typo étirée |
| 5 | 5,6–6,8 | « Un repas ? » | Split-screen 4 cases : colis · courses · documents · repas | **REPAS** + 4 icônes | Split-screen 4 cases |
| 6 | 6,8–8,8 | « Un colis venu du Nigeria ? » | Ligne Kano → Maradi, carton qui voyage | **KANO → MARADI** | Whip pan : la moto traverse l'écran |
| 7 | 8,8–9,8 | « La lessive ? » | Linge, bulles | **LESSIVE** | Masque typographique |
| 8 | 9,8–10,8 | « Le repassage ? » | Fer qui glisse, chemise nette | **REPASSAGE** | Coupe nette (fin de l'avalanche, silence d'un temps) |
| 9 | 10,8–14,0 | « Un seul nom : Allô Multi-Services Maradi. On s'en occupe ! » | **Drop musical**, le logo explose plein écran | **ALLÔ MULTI-SERVICES MARADI** · « On s'en occupe ! » | Zoom-through dans le « O » de « Allô » |
| 10 | 14,0–15,8 | « La livraison, dès cinq cents francs. » | Livreur à moto | Badge jaune **DÈS 500 F** · *selon la zone* | Morph : combiné → moto |
| 11 | 15,8–17,6 | « Vos colis, dès mille francs. » | Carton scellé | Badge **DÈS 1 000 F** | Morph : moto → carton |
| 12 | 17,6–19,8 | « Le repassage, cent francs le complet. » | Complet repassé (haut + bas) | Badge **100 F / COMPLET** | Onde de sonnerie |
| 13 | 19,8–23,6 | « Sept jours sur sept, même le week-end, dans tout Maradi et ses environs. » | Calendrier dont les 7 jours s'allument, puis carte stylisée de Maradi | **7J/7** (XXL) · MÊME LE WEEK-END · TOUT MARADI + ENVIRONS | Slice : « 7J/7 » s'ouvre sur la carte |
| 14 | 23,6–29,5 | « Appelez ou écrivez sur WhatsApp au 74 58 18 24. » | Téléphone stylisé : appel entrant « Allô Multi-Services », numéro composé chiffre par chiffre, bouton vert qui pulse | **74 58 18 24** · +227 · petits : 88 57 92 90 · 89 96 71 19 · icône WhatsApp | Morph : combiné → bulle WhatsApp (tempo ralenti) |
| 15 | 29,5–31,5 | « Tous vos besoins, un seul appel ! » | Slogan en manuscrit | **Tous vos besoins, un seul appel !** | Onde de sonnerie finale |
| 16 | +2 s | *(sonnerie stylisée, musique)* | Swoosh qui se dessine, logo qui se construit, slogan, numéro | Logo + slogan + 74 58 18 24 | — |

---

## 1.3 Checklist — ce qu'il me faut pour la phase 2

1. **Votre voix off** — **OBLIGATOIRE**
   - C'est elle qui commande tout le montage.
   - Formats : **WAV** (idéal), M4A ou MP3 à 192 kb/s ou plus.
   - Où la déposer : `video-1-un-seul-appel/audio/voix-off.wav`
   - Conseils d'enregistrement :
     - pièce calme, avec des rideaux ou des coussins (pas de carrelage nu, ventilateur et climatiseur éteints) ;
     - téléphone à **15–20 cm** de la bouche, légèrement de côté ;
     - **2 s de silence** au début et à la fin ;
     - voix énergique et souriante ;
     - lire le numéro en groupes de deux, avec une petite pause entre chaque groupe ;
     - si vous ratez une phrase, refaites-la en entier. Je garderai la meilleure prise.

2. **Les 5 affiches officielles** — **OBLIGATOIRE**
   - Elles servent à vérifier les données, à relever les couleurs HEX exactes et à extraire les photos.
   - Format : JPG ou PNG en pleine résolution (pas une capture WhatsApp compressée).
   - Où les déposer : `affiches/`

3. **Le logo officiel en haute définition** — **OBLIGATOIRE** (au moins une décision)
   - Idéal : **SVG** ou **PNG transparent** d'au moins 2000 px de large, dans sa version complète (avec « MARADI »).
   - Où le déposer : `video-1-un-seul-appel/assets/logo/`
   - Sinon, deux solutions :
     - je le détoure depuis les affiches. La qualité suffira si l'affiche est en haute définition ;
     - je le **redessine en vectoriel**, fidèlement, sans le modifier. C'est l'option recommandée vu la qualité du PNG actuel.
   - **Précisez aussi quelle version fait foi** (voir le tableau des écarts plus haut).

4. **Les photos** — **OPTIONNEL** (mais elles font beaucoup pour le côté « vrai »)
   - Ce qui peut sans doute venir des affiches : livreur à moto, sac isotherme, agents en uniforme. À confirmer quand je les aurai vues.
   - Ce que je vous recommande d'envoyer en meilleure qualité :
     - livreur sur sa moto **de profil**, pour le whip pan ;
     - agent en gilet et casquette **de face**, sur fond simple ;
     - cartons ou colis ;
     - linge plié ou repassé (bazin, pagne).
   - Format : **JPG haute définition** pris au téléphone, en plein jour, sur un fond dégagé.
   - Où les déposer : `video-1-un-seul-appel/assets/photos/`
   - Sans photos, j'illustre en vectoriel, dans un seul style de trait.

5. **La musique** — **OBLIGATOIRE : choisissez une option**
   - Option A : vous me fournissez un morceau (MP3 ou WAV) dont vous avez les droits, déposé dans `video-1-un-seul-appel/assets/music/`.
   - Option B : je m'en charge, dans l'un de ces styles :
     - **Afro-house 124 BPM** : kick sec, shaker, log drum, drop net sur « Allô Multi-Services Maradi ». *(mon choix recommandé)*
     - **Afrobeats 118 BPM** : percussions talking drum, guitare highlife en boucle, plus chaleureux.
     - **Afro-tech / amapiano 120 BPM** : log drum profond, synthé plus moderne, ambiance « night premium ».
   - Avec l'option B, je génère ou sélectionne une piste libre de droits et j'en indique la source dans le récapitulatif.

6. **Vos confirmations** — **OBLIGATOIRE**
   1. Numéro principal : **74 58 18 24** (+227) ; secondaires : 88 57 92 90 et 89 96 71 19. Les trois numéros sont-ils tous sur WhatsApp ?
   2. Prix : dès 500 F (livraison), dès 1 000 F (colis à Maradi), 100 F le complet (repassage). OK ?
   3. Adresse : Maradi – Guidan Kaji. Je ne l'affiche pas, pour garder une vidéo de notoriété épurée. OK, ou voulez-vous l'afficher en petit sur le plan final ?
   4. Le logo qui fait foi, et l'orthographe « Multi-Services » ou « Multiservices ».
   5. La mention « selon la zone » sous le prix de la livraison : OK ?

7. **Autres éléments** — **OPTIONNEL**
   - **Polices** : je prévois **Montserrat ExtraBold/Black** pour les titres et **Caveat Brush**, ou une manuscrite proche de l'affiche, pour le slogan. Toutes deux sont gratuites. Si vous connaissez la police exacte des affiches, dites-le-moi.
   - **Charte graphique** : codes couleur officiels de l'imprimeur ou du graphiste, s'ils existent.
   - **Préférences** : comptes TikTok, Facebook ou WhatsApp à afficher, une voix secondaire pour « On s'en occupe ! », etc.

---

**Dès que j'ai les éléments 1, 2, 5 et 6 (obligatoires), avec une décision sur le 3, je lance la phase 2.**

⛔ Aucune vidéo ne sera créée avant la réception de votre enregistrement dans `video-1-un-seul-appel/audio/`.
