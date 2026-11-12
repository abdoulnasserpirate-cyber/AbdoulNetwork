# Vidéo 2/3 — « Kano → Maradi : vos colis entre de bonnes mains » · PHASE 1

## 1.1 Vérification

**Les 5 affiches officielles sont introuvables.** Le dossier `./affiches/` n'existe pas dans le dépôt (ni sur la branche de travail, ni sur l'autre branche). La vérification ligne à ligne des données ne peut donc pas encore être faite.

Seule ressource de marque trouvée : `videos/chief-chief-promo/assets/allo-multiservices.png` (1021×977 px, logo sur fond plein). Elle présente **des écarts avec la description du brief** :

| Point | Brief | Logo trouvé |
|---|---|---|
| « Allô » | italique gras **bleu marine** | italique gras **blanc** sur fond bleu marine |
| Swoosh | orange / jaune | **or / moutarde** uniquement |
| Sous-titre | « MULTI-**SERVICES** » (avec trait d'union) | « MULTISERVICES » (sans trait d'union) |
| « MARADI » | en orange, entre deux filets | **absent** |
| Qualité | — | flou, artefacts de compression, fond non transparent : **inutilisable tel quel en HD** |

Couleurs mesurées sur ce fichier (à reconfirmer sur les affiches) :
- bleu marine `#04245D` (le brief indique ~`#1A2B6D`)
- or du swoosh `#D79810` (le brief indique un jaune ~`#FFC61A`)

→ Il existe probablement 2 versions du logo (une version « fond foncé » et la version officielle des affiches). Il faudra confirmer laquelle fait foi.

Éléments réutilisables (cartons avec logo, agent qui scotche, agente qui pointe, carte Kano → Maradi) : **impossibles à évaluer sans les affiches.** Prévu par défaut : le carton, la carte et les icônes en vectoriel (meilleur rendu que des photos détourées depuis des affiches compressées).

Choix technique : **HyperFrames**. Le dépôt l'utilise déjà (projet Chief-Chief), il gère deux layouts par format sur une seule timeline, et il fait les cartes et l'UI en SVG/GSAP.

---

## 1.2 Texte de voix off

### A) Texte brut (≈ 160 mots · ≈ 60 à 64 s à débit posé)

Votre colis arrive de Kano… mais vous n'êtes pas disponible pour aller le chercher ?

Voici Hadiza, commerçante à Maradi. Sa marchandise arrive avec un chauffeur, mais elle ne peut pas quitter sa boutique.

Alors, elle appelle Allô Multi-Services Maradi.

Sur WhatsApp, elle envoie le numéro du chauffeur et une photo du colis.

Notre équipe appelle le chauffeur et organise la récupération.

Le colis est récupéré, vérifié, et réemballé si besoin.

Puis il est livré à Maradi, ou expédié vers Niamey, Zinder, Tahoua, toutes les villes du Niger et la sous-région.

Hadiza reçoit la confirmation : son colis est pris en charge.

Les tarifs ? Livraison à Maradi dès mille francs. Expédition vers une autre ville dès mille cinq cents francs. Ouverture et réemballage dès deux mille francs. Et une facture claire à la fin.

Votre colis, on s'en occupe !

Appelez ou écrivez sur WhatsApp au soixante-quatorze, cinquante-huit, dix-huit, vingt-quatre.

Allô Multi-Services Maradi. Tous vos besoins, un seul appel !

### B) Découpage

| # | Voix | Scène / visuel | Texte à l'écran |
|---|---|---|---|
| 1 | « Votre colis arrive de Kano… mais vous n'êtes pas disponible pour aller le chercher ? » | Ouverture en mouvement sur la carte stylisée. Épingle « KANO », le carton isométrique posé dessus, et une ligne pointillée jaune qui commence à se tracer vers Maradi. | **Votre colis arrive de Kano…** puis **…mais vous n'êtes pas disponible ?** |
| 2 | « Voici Hadiza, commerçante à Maradi. Sa marchandise arrive avec un chauffeur, mais elle ne peut pas quitter sa boutique. » | **Travelling de caméra** le long du pointillé jusqu'à l'épingle Maradi. Carte-profil de Hadiza (illustration vectorielle) et horloge de boutique. | Hadiza · Commerçante · Maradi |
| 3 | « Alors, elle appelle Allô Multi-Services Maradi. » | **Zoom-out de la carte vers l'écran du téléphone** (match cut épingle → icône de localisation). Appel sortant vers « Allô Multi-Services ». Timeline : pastille **1** allumée. | ① Vous nous contactez ✓ |
| 4 | « Sur WhatsApp, elle envoie le numéro du chauffeur et une photo du colis. » | Conversation WhatsApp stylisée : bulles qui apparaissent, photo du carton, numéro **fictif masqué** (« +234 ·· ·· ·· ·· »), nom du destinataire. Pastille **2**. | ② Infos envoyées ✓ |
| 5 | « Notre équipe appelle le chauffeur et organise la récupération. » | **La pastille 3 morphe en scène plein écran** : agent au téléphone (vectoriel), icône camion « en approche ». | ③ Chauffeur contacté ✓ |
| 6 | « Le colis est récupéré, vérifié, et réemballé si besoin. » | **Zoom-through dans le carton qui s'ouvre**. Coche de vérification, puis le **ruban adhésif traverse l'écran (wipe)** et referme le carton. Pastille **4**. | ④ Colis récupéré ✓ · Vérifié ✓ · Réemballé ✓ |
| 7 | « Puis il est livré à Maradi, ou expédié vers Niamey, Zinder, Tahoua, toutes les villes du Niger et la sous-région. » | Retour sur la carte : des flèches jaunes partent de Maradi, et chaque ville s'allume quand elle est prononcée. | Niamey · Zinder · Tahoua · Toutes les villes du Niger · Sous-région |
| 8 | « Hadiza reçoit la confirmation : son colis est pris en charge. » | Notification sur le téléphone de Hadiza, puis respiration (1 s). Pastille **5**, timeline complète. | ⑤ Prise en charge confirmée ✓ |
| 9 | « Les tarifs ? Livraison à Maradi dès mille francs. Expédition… dès mille cinq cents francs. Ouverture et réemballage dès deux mille francs. » | 3 cartes arrondies qui entrent l'une après l'autre, **flip 3D** d'une carte à la suivante, avec un badge jaune pour le prix. | Réception & livraison à Maradi · **À partir de 1 000 F CFA** / Réception & expédition vers une autre ville · **À partir de 1 500 F CFA** / Ouverture, vérification & reconditionnement · **À partir de 2 000 F CFA** |
| 10 | « Et une facture claire à la fin. » | Petite facture stylisée qui s'imprime. Ligne « Montant définitif » mise en avant. | Facture claire à la fin · *Prix final selon distance, heure, volume et manipulations* |
| 11 | « Votre colis, on s'en occupe ! » | Le carton revient au centre, avec un léger rebond. | **Votre colis, on s'en occupe !** |
| 12 | « Appelez ou écrivez sur WhatsApp au 74 58 18 24. » | Bloc contact : icônes appel et WhatsApp, numéro en grand, chiffres qui apparaissent par paires. | **+227 74 58 18 24** · Appel & WhatsApp · Guidan Kaji, Maradi · 7j/7 |
| 13 | « Allô Multi-Services Maradi. Tous vos besoins, un seul appel ! » + **2 s de plan final** | Le carton se referme, le logo apparaît sur sa face et la caméra recule. | Logo · *Tous vos besoins, un seul appel !* · 74 58 18 24 |

---

## 1.3 Checklist — ce dont j'ai besoin avant la phase 2

1. **Les 5 affiches officielles** · **OBLIGATOIRE**
   - Pourquoi : vérifier les prix et les numéros, échantillonner les vraies couleurs, récupérer le logo exact et juger les photos réutilisables.
   - Format : JPG ou PNG à la meilleure résolution disponible (l'original envoyé par le graphiste, pas une capture WhatsApp).
   - Où : `./affiches/` à la racine du dépôt.

2. **Votre voix off** · **OBLIGATOIRE**
   - Format : WAV 48 kHz idéalement. Un M4A/MP3 enregistré au téléphone convient aussi (pas de compression WhatsApp).
   - Conseils : pièce calme, sans ventilateur ni climatiseur ; une pièce avec des rideaux ou des tissus évite l'écho. Téléphone à 15–20 cm de la bouche, légèrement de côté. 2 s de silence au début et à la fin. Ton posé et souriant. Le numéro se lit en groupes de 2 chiffres. Si vous vous trompez, recommencez simplement la phrase : je couperai.
   - Où : `video-2-colis-kano/audio/voix-off.wav` (ou `.m4a`).

3. **Le logo officiel en HD** · **OBLIGATOIRE** (au moins confirmer la version)
   - Format idéal : SVG ou PDF vectoriel. À défaut, PNG transparent d'au moins 2000 px de large. Si possible, une version claire et une version foncée.
   - Sinon : je le détoure depuis les affiches. Le PNG actuel du dépôt est trop flou pour du 1080p ; je vous dirai si le détourage tiré des affiches tient.
   - À confirmer : faut-il **« MARADI »** dans le logo ? **« Multi-Services »** avec ou sans trait d'union ?
   - Où : `video-2-colis-kano/assets/logo/`.

4. **Photos** · **OPTIONNEL**
   - Par défaut, j'illustre en vectoriel : carton isométrique, Hadiza, agent, carte et téléphone. C'est plus cohérent avec le style « app de suivi ».
   - Utiles si vous les avez : un vrai carton avec le logo Allô, un agent en gilet bleu qui scotche un colis, le livreur à moto. Le format idéal est un JPG haute définition, sur fond simple, pris de jour. Je vous dirai, une fois les affiches reçues, si leurs photos suffisent.
   - Où : `video-2-colis-kano/assets/photos/`.

5. **Musique** · **OPTIONNEL** (je peux m'en charger)
   - Fournie par vous : MP3/WAV libre de droits, avec la source et la licence. Où : `video-2-colis-kano/assets/musique/`.
   - Sinon, je propose l'une de ces pistes (libres de droits, 90–105 BPM, montée jusqu'au CTA) :
     - **A. Corporate tech minimal (~96 BPM)** : nappe douce, pulsation de synthé, petites percussions claires. Très « app de suivi ».
     - **B. Afro-tech léger (~100 BPM)** : base corporate avec une touche de percussions sahéliennes et de kalimba en sourdine. Plus local, toujours sobre.
     - **C. Cinématique ambient pulse (~92 BPM)** : piano et cordes légères, kick feutré qui arrive sur les tarifs. Plus émotionnel et rassurant.
   - → Dites-moi A, B ou C.

6. **Confirmations** · **OBLIGATOIRE**
   1. Numéro principal à l'écran et à l'oral : **74 58 18 24** (+227). Faut-il aussi afficher le 88 57 92 90 et le 89 96 71 19 sur le plan final ?
   2. Les 3 prix : **1 000 / 1 500 / 2 000 F CFA**, toujours « à partir de ».
   3. Adresse affichée : **Maradi – Guidan Kaji** (je ne mentionne pas Cité Benghazi, qui concerne le linge).
   4. Le prénom **Hadiza** vous convient-il ? Autres options : Aïcha, Zeinabou, Mariama.
   5. Écran : faut-il afficher la mention « Frais d'expédition à la charge du client » (envoi direct) en petit sous les tarifs ?
   6. La version du logo qui fait foi (voir point 3).

7. **Autres ressources** · **OPTIONNEL**
   - Polices : le nom exact des polices des affiches, si le graphiste le connaît (sinon : Montserrat ExtraBold pour les titres, une manuscrite proche de celle du slogan, et Inter pour l'UI). Où : `assets/polices/`.
   - Charte graphique ou codes HEX officiels du graphiste.
   - Vos préférences : sous-titres toujours visibles ou seulement sur les phrases clés ? Le nom de l'agence doit-il apparaître dans les messages WhatsApp fictifs ?

**Dès que j'ai les éléments 1, 2, 3 et 6 (obligatoires), je lance la phase 2.**
