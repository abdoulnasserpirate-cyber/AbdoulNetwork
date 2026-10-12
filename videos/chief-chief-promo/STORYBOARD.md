---
format: 1920x1080
duration: 40s
message: "Chief-Chief vous livre partout à Maradi, dès 500 F"
arc: Hook (commande) → Valeur (on s'occupe du reste) → Preuve (suivi de livraison) → Offre (500 F, partout à Maradi, Allô Multiservices) → Désir (vrais plats) → Marque
audience: Habitants de Maradi qui veulent bien manger, livrés chez eux
mode: collaborative
language: fr
music: none
captions: skipped (référence sans sous-titres ; texte à l'écran déjà porteur)
---

## Locked

- Plan v2 et planche de croquis v2 validés par l'utilisateur (« Oui, lance l'animation et le rendu MP4 »).
- Musique : composée localement (host) — `assets/bgm/chief-chief-afro.wav`, 96 BPM, 1 mesure = 2,5 s ; chaque coupe tombe sur un premier temps (5 / 10 / 17,5 / 25 / 35 s).
- Voix : Kokoro ff_siwis, phrases recalées par plan (`assets/voice/NN.wav` = durée du plan ; bruts dans `assets/voice/raw/`). Les durées ci-dessous sont musicales, pas issues de `sync-durations`.

## Video direction

Calque du langage BlueVisa : fond crème #FBF3E6 avec halo blanc doux, ou aplat plein écran rouge/bordeaux aux changements d'acte. Une seule couleur forte (rouge #B3141C), l'or #E9B13B en touche rare. Fraunces 700 pour les titres (italique pour l'emphase), Inter pour les pastilles/cartes, JetBrains Mono pour les petites lignes en capitales. Mouvement : entrées « expo.out » rapides (0,5–0,8 s) avec léger dépassement « back.out(1.6) » sur les objets (ticket, tampon, cartes, épingles, logo) ; mots en cascade par masque (y 110 % → 0, stagger 0,1–0,15 s) ; un lent push caméra (scale 1 → 1,04) sous chaque plan pour ne jamais figer. Aucune sortie dans les plans 1–5 (les transitions font la sortie) ; le plan 6 tient jusqu'à la fin.

## Frame 1 — Commandez

- scene: Fond crème, halo. Eyebrow « VOTRE SEULE MISSION ». « Commandez / votre / plat. » en cascade, « plat. » en rouge. À droite, ticket de commande Chief-Chief tamponné « COMMANDÉ ».
- voiceover: "Une petite faim ? Votre seule mission : commander votre plat."
- duration: 5s
- poster: 4.5s
- transition_in: cut
- status: animated
- src: compositions/frames/01-commandez.html
- type: hook
- persuasion: Friction reduction
- beat: curiosity
- blueprint: kinetic-type-beats
- focal: ticket de commande
- asset_candidates: assets/logo-chief-chief.png — logo rond, en mini dans l'en-tête du ticket

Scene 1 (0.0–1.2s): le ticket glisse de la droite avec rotation −14° → −6°, expo.out 0,9 s ; l'en-tête rouge, puis les lignes se révèlent en stagger. Push lent du fond.
Scene 2 (1.2–2.3s): l'eyebrow « VOTRE SEULE MISSION » s'écrit ; léger flottement du ticket.
Scene 3 (2.3–3.4s): « Commandez » (2,3) → « votre » (2,6) → « plat. » (2,9) montent du masque, back.out ; soulignement or sous « plat. ».
Scene 4 (3.55–5.0s): le tampon « COMMANDÉ » s'écrase (scale 2,4 → 1, 0,22 s) puis micro-secousse amortie du ticket ; tient.

narrativeRole: Calque exact de l'ouverture de la référence (« Réservez votre vol » + billet tamponné) : le seul effort demandé au client, c'est de commander.
keyMessage: Vous n'avez qu'une chose à faire : commander.

## Frame 2 — On s'occupe du reste

- scene: Plein écran rouge. Trajectoire en pointillés autour de « C'EST TOUT. », puis « On s'occupe du reste. », « du reste. » dans un cadre crème qui se remplit.
- voiceover: "C'est tout. Chez Tif-Tif, on s'occupe du reste."
- duration: 5s
- poster: 4s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/02-du-reste.html
- type: product_intro
- persuasion: Risk reversal
- beat: relief
- blueprint: kinetic-type-beats
- focal: « du reste. »

Scene 1 (0.0–1.4s): fond dégradé rouge → bordeaux. « C'EST TOUT. » lettre par lettre à 0,3 s ; l'ellipse en pointillés se dessine avec une petite flèche qui suit le tracé.
Scene 2 (1.5–2.4s): « On s'occupe » monte du masque.
Scene 3 (2.4–3.2s): le cadre crème s'étend (scaleX 0 → 1, origine gauche) derrière « du reste. » en rouge.
Scene 4 (3.2–5.0s): tenue ; push lent ; l'ellipse tourne doucement.

narrativeRole: La promesse de valeur arrive au 2e temps : on prend tout en charge.
keyMessage: Chief-Chief s'occupe de tout.

## Frame 3 — Tout est déjà en route

- scene: Crème. « Restez chez vous. » / « Tout est déjà en route. » ; sac de livraison Chief-Chief au centre sur une onde ; carte unique qui se coche d'étape en étape ; compteur 1/5 → 5/5 ; « Bon appétit ! ».
- voiceover: "Votre commande est reçue, préparée maison, emballée bien chaude… puis livrée chez vous."
- duration: 7.5s
- poster: 6.8s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/03-en-route.html
- type: key_feature
- persuasion: Show-don't-tell proof
- beat: ease + control
- blueprint: agent-progress-theater
- focal: sac de livraison
- asset_candidates: assets/logo-chief-chief.png — logo sur le sac

Scene 1 (0.0–1.0s): titres en cascade ; le sac tombe avec back.out et une onde en anneau s'élargit dessous.
Scene 2 (1.0–5.6s): la carte d'étape se met à jour à chaque cue : 1,0 « Commande reçue » · 2,3 « Préparée maison » · 3,6 « Emballée bien chaude » · 4,8 « En route » · 5,6 « Livrée chez vous ». Swap interne du libellé, coche, compteur qui s'incrémente, sac qui pulse ; à 4,8 une moto traverse l'onde.
Scene 3 (5.6–7.5s): « en route. » est souligné ; à 6,3 « Bon appétit ! » apparaît ; push lent.

narrativeRole: Calque de la séquence valise + cartes de la référence : on voit le service se dérouler étape par étape.
keyMessage: Du four à votre porte, tout est géré.

## Frame 4 — Partout à Maradi, dès 500 F

- scene: Plan de Maradi stylisé, moto en pointillés, épingles. « Partout à Maradi. » ; « dès 500 F » qui compte ; pastilles « Livraison à domicile » · « Paiement à la livraison » ; badge « Livraison assurée par Allô Multiservices ».
- voiceover: "Partout à Maradi, dès cinq cents francs, avec Allô Multiservices. Et vous payez à la livraison."
- duration: 7.5s
- poster: 6.8s
- transition_in: crossfade
- status: animated
- src: compositions/frames/04-500f.html
- type: benefits
- persuasion: Value stacking
- beat: confidence
- blueprint: dataviz-countup
- focal: « 500 F »
- asset_candidates: assets/allo-multiservices.png — logo du livreur partenaire Allô Multiservices (fond bleu marine)

Scene 1 (0.0–1.45s): eyebrow + « Partout / à Maradi. » ; la carte s'ouvre, les rues se tracent, la moto parcourt le trajet et plante 3 épingles (0,55 / 0,95 / 1,35).
Scene 2 (1.45–2.9s): « 500 F » compte de 0 → 500 (1,45 → 2,55) puis rebond.
Scene 3 (2.95–4.85s): le badge Allô Multiservices glisse sous la carte.
Scene 4 (4.85–7.5s): pastilles « Livraison à domicile » (4,85) puis « Paiement à la livraison » (5,15) ; épingles qui pulsent ; push lent.

narrativeRole: L'offre concrète — prix d'appel, toute la ville, et le livreur partenaire Allô Multiservices.
keyMessage: Livré partout à Maradi, dès 500 F.

## Frame 5 — Les plats

- scene: Quatre vraies photos plein cadre à droite (moitié gauche aplat bordeaux avec titre) : Plat du Chef, riz créole, poulet croustillant, pizzas ; puis mosaïque 4 photos « Fast-food généreux, fait maison. » + « … ET BIEN D'AUTRES ».
- voiceover: "Le Plat du Chef. Le riz créole. Le poulet croustillant. Les pizzas. Et bien d'autres, faits maison."
- duration: 10s
- poster: 9.5s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/05-plats.html
- type: key_feature
- persuasion: Value stacking (variété du menu)
- beat: desire + excitement
- blueprint: grid-card-assemble
- focal: la photo du plat en cours
- asset_candidates: assets/photos/plat-du-chef.jpg — Plat du Chef : bol kraft logo Chief-Chief, riz jaune, viande, légumes, olives; assets/photos/riz-creole.jpg — riz créole aux vermicelles, œuf; assets/photos/poulet-frites.jpg — poulet frit croustillant et frites; assets/photos/pizza.jpg — pizza pepperoni, viande, poivrons

Scene 1 (0.0–2.0s): Plat du Chef — photo à droite avec Ken Burns ; à gauche eyebrow, « Le Plat / du Chef », trait or + sous-titre, compteur 01 / 04.
Scene 2 (2.0–3.6s): riz créole — la nouvelle photo pousse l'ancienne dans le panneau, le titre change par masque, compteur 02.
Scene 3 (3.6–5.2s): poulet croustillant — même swap, compteur 03.
Scene 4 (5.2–6.8s): pizzas — même swap, compteur 04.
Scene 5 (6.8–10.0s): mosaïque — les 4 tuiles arrivent en cascade ; à 7,1 « Fast-food généreux, fait maison. » ; à 8,3 « … ET BIEN D'AUTRES » ; légère dérive des photos.

narrativeRole: Calque des destinations plein écran + mosaïque « Une équipe. Trois destinations. » — vraies photos fournies par le restaurant ; on donne envie avec le menu réel.
keyMessage: Des plats généreux, faits maison — et bien d'autres.

## Frame 6 — Signature

- scene: Crème. Point rouge → cercle → logo Chief-Chief. « Le goût qui vous ramène toujours. » ; « Livraison à domicile dès 500 F · Partout à Maradi » ; ligne d'infos.
- voiceover: "Chief-Chief. Le goût qui vous ramène toujours."
- duration: 5s
- poster: 4.6s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/06-signature.html
- type: brand_outro
- persuasion: Future pacing
- beat: belonging
- blueprint: logo-assemble-lockup
- focal: logo
- asset_candidates: assets/logo-chief-chief.png — logo officiel, révélé dans le cercle; assets/allo-multiservices.png — mini mention partenaire

Scene 1 (0.0–1.0s): un point rouge pop au centre-haut, puis le cercle se trace autour pendant que le point s'efface.
Scene 2 (1.0–1.9s): le logo se révèle dans le cercle (scale 0,6→1, rotation −8°→0, back.out).
Scene 3 (1.9–3.4s): « Le goût qui vous ramène toujours. » mot par mot, « toujours. » en rouge.
Scene 4 (3.4–5.0s): l'offre monte à 3,4, la ligne d'infos à 3,75 (accord final) ; tenue, push lent.

narrativeRole: Calque de la fin BlueVisa (point → cercle → logo → slogan) : le nom et le slogan restent en tête.
keyMessage: Chief-Chief, le goût qui vous ramène toujours.
