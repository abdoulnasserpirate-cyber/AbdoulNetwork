---
format: 1080x1920 (+ version 1920x1080 générée par ../make-horizontal.sh)
duration: 40.15s
message: "Sublime Booty ByChris : des produits pour des formes sublimes, commandés en 3 étapes sur WhatsApp, livrés partout"
arc: Accroche → Marque → 5 gammes produits → Commander c'est facile → 3 étapes → Livraison (carte) → Fin + numéro
audience: Femmes de Maradi, du Niger et de la diaspora qui suivent la marque sur les réseaux
mode: collaborative
language: fr
music: à confirmer (bed afro/amapiano sous la voix off à ~0,14)
captions: non (les titres à l'écran portent le message en muet)
---

## Locked

- Voix off fournie par l'utilisateur : `assets/voice/voix-off.mp3` (40,15 s). Elle est l'horloge : chaque plan démarre sur sa phrase (timings mesurés par détection des pauses + transcription Whisper locale).
- Couleurs : rose vif #FF1A8C (principale), noir #0B0508, rose profond #C4006A, rose pâle #FFD6EA ; or #E2B14A seulement pour Royal Skin / Crème Impériale.
- Typo : Playfair Display 900 (proche du logo) + Poppins 700/800.
- Silhouette de fond = la silhouette du logo, vectorisée (`assets/logos/silhouette.svg`).
- Produits 3D procéduraux (Three.js, `assets/js/sb3d.js`) étiquetés avec les vrais noms des affiches.
- Carte : frontières Natural Earth (les tuiles satellite sont bloquées par le réseau de l'environnement).

## Frame 1 — Accroche

- scene: Fond rose vif, grande silhouette noire avec double décalé rose foncé (glitch RGB). « Vous rêvez de / formes / sublimes ? »
- voiceover: "Vous rêvez de formes sublimes ?"
- duration: 1.65s
- poster: 1.3
- transition_in: cut
- status: built
- src: compositions/s01-hook.html
- reads: "formes sublimes ?" (0.0-1.65s)
- sound: voix seule + impact glitch à 0,0
- act: Accroche

Les mots tombent un par un (pop + flou), la silhouette monte du bas avec un tremblement glitch de 3 images.

## Frame 2 — La marque

- scene: Fond noir, logo Sublime Booty ByChris, « DÉCOUVREZ », lignes de coupe rose/blanche, signature.
- voiceover: "Découvrez Sublime Booty ByChris !"
- duration: 2.4s
- poster: 1.95
- transition_in: glitch (shader registry `glitch`)
- status: built
- src: compositions/s02-logo.html
- reads: logo (1.65-4.05s)
- sound: whoosh + riser court sur le logo
- act: Marque

La silhouette géante de la scène 1 rétrécit et se pose exactement sur la silhouette du logo (raccord), puis le texte du logo se révèle par tranches glitch.

## Frame 3 — Kits fessiers

- scene: Studio noir, podium rose : Crème Impériale, Céréales Booty Gain, Sirop Sexy Lady en 3D ; étiquettes ; bandeau défilant des kits.
- voiceover: "Nos kits fessiers, pour des courbes qui font tourner les têtes."
- duration: 2.85s
- poster: 2.45
- transition_in: whip (registry `whip-pan`)
- status: built
- src: compositions/s03-fessiers.html
- reads: "FESSIERS" (4.05-5.0s); noms des produits (5.0-6.9s)
- sound: 3 « pops » quand les produits tombent
- act: Produits

## Frame 4 — Kits seins

- scene: Fond rose : Kit Gros Lolo Luxe (2 sirops + crème seins), Kit Raffermissant Luxe (thé Caolin + huile).
- voiceover: "Nos kits seins, pour une poitrine ferme et généreuse."
- duration: 2.95s
- poster: 2.6
- transition_in: colour flood (noir → rose)
- status: built
- src: compositions/s04-seins.html
- reads: "SEINS" (6.9-7.8s); noms des kits (7.8-9.85s)
- sound: swoosh rotation 3D
- act: Produits

## Frame 5 — Ventre plat

- scene: Studio noir : Thé ventre plat, Crème ventre plat, Thé perte de poids ; mètre ruban rose qui se resserre.
- voiceover: "Notre gamme ventre plat, pour une taille affinée."
- duration: 2.65s
- poster: 2.35
- transition_in: zoom à travers le couvercle du pot
- status: built
- src: compositions/s05-ventre.html
- reads: "VENTRE PLAT" (9.85-10.9s); produits (10.9-12.5s)
- sound: « zip » du mètre ruban
- act: Produits

## Frame 6 — Gaines

- scene: Fond rose : la silhouette enfile une gaine noire (révélation de bas en haut) ; boîtes 3D Gaine BBL et Gaine Culotte.
- voiceover: "Nos gaines, pour une silhouette parfaite."
- duration: 2.3s
- poster: 2.1
- transition_in: iris depuis la taille de la silhouette
- status: built
- src: compositions/s06-gaines.html
- reads: "GAINES" (12.5-13.3s); boîtes (13.3-14.8s)
- sound: « snap » élastique
- act: Produits

## Frame 7 — Gammes teint

- scene: Diagonale noir/rose pâle : Royal Skin (noir & or) en haut, Pure Glow (blanc & rose) en bas, reflet brillant qui balaie.
- voiceover: "Et nos gammes teint, Royal Skin et Pure Glow, pour une peau éclatante."
- duration: 4.7s
- poster: 4.3
- transition_in: wipe diagonal
- status: built
- src: compositions/s07-teint.html
- reads: "Royal Skin" (15.9-16.8s); "Pure Glow" (16.8-17.6s); éclat (17.6-19.5s)
- sound: scintillement sur le reflet
- act: Produits

## Frame 8 — Commander, c'est très facile

- scene: Noir : « COMMANDER, / C'EST / très facile ! » sur une bande rose penchée.
- voiceover: "Commander, c'est très facile !"
- duration: 1.8s
- poster: 1.5
- transition_in: glitch
- status: built
- src: compositions/s08-commander.html
- reads: la phrase entière (19.5-21.3s)
- sound: impact sur « facile »
- act: Commande

## Frame 9 — Étape 1

- scene: Rose : « 1 Choisissez votre produit », téléphone avec la boutique ; la carte Céréales Booty Gain se sélectionne.
- voiceover: "Un : choisissez votre produit."
- duration: 2.1s
- poster: 1.8
- transition_in: le téléphone monte du bas
- status: built
- src: compositions/s09-etape1.html
- reads: "1 Choisissez votre produit" (21.3-23.4s)
- sound: tap
- act: Commande

## Frame 10 — Étape 2 : WhatsApp

- scene: Noir : « 2 Écrivez-nous sur WhatsApp », numéro +227 92 48 56 12 ; conversation WhatsApp qui s'écrit.
- voiceover: "Deux : écrivez-nous directement sur WhatsApp au 92 48 56 12."
- duration: 6.55s
- poster: 6.2
- transition_in: le téléphone glisse et passe de la boutique à WhatsApp
- status: built
- src: compositions/s10-whatsapp.html
- reads: "Écrivez-nous" (23.4-25.0s); chaque groupe du numéro apparaît quand il est dit (26.9 / 27.2 / 28.1 / 29.1s)
- sound: son d'envoi de message, « pop » par groupe de chiffres
- act: Commande

## Frame 11 — Étape 3 : paiement et livraison

- scene: Rose : « 3 Payez en toute simplicité », logos NITA, AMANA, Wave, Western Union, Ria ; colis Sublime Booty « On vous livre ! ».
- voiceover: "Trois : faites votre paiement… et on vous livre !"
- duration: 3.05s
- poster: 2.75
- transition_in: whip
- status: built
- src: compositions/s11-paiement.html
- reads: logos (30.0-31.6s); "On vous livre !" (31.9-33.0s)
- sound: 5 pops pour les logos, whoosh du colis
- act: Commande

## Frame 12 — Carte : Maradi

- scene: Carte zoomée, épingle sur Maradi.
- voiceover: "À Maradi,"
- duration: 0.95s
- poster: 0.6
- transition_in: le colis vole et « tombe » sur l'épingle de Maradi
- status: built
- src: compositions/s12-carte.html
- reads: "À MARADI" (33.0-33.85s)
- sound: impact de l'épingle
- act: Livraison

## Frame 13 — Carte : Niger

- scene: Dézoom, le Niger s'allume en rose.
- voiceover: "partout au Niger,"
- duration: 1.0s
- poster: 1.6
- transition_in: dézoom continu (même plan)
- status: built
- src: compositions/s12-carte.html
- reads: "PARTOUT AU NIGER" (33.95-34.9s)
- sound: whoosh de caméra
- act: Livraison

## Frame 14 — Carte : le monde

- scene: Dézoom jusqu'au monde, arcs vers Paris, Londres, New York, Abidjan, Dubaï, Djeddah.
- voiceover: "et dans le monde entier !"
- duration: 1.15s
- poster: 2.95
- transition_in: dézoom continu (même plan)
- status: built
- src: compositions/s12-carte.html
- reads: "DANS LE MONDE" (35.0-36.1s)
- sound: whoosh des arcs
- act: Livraison

## Frame 15 — Fin

- scene: Logo sur noir, « Beauté • Confiance • Bien-être », bande rose « Commandez sur WhatsApp +227 92 48 56 12 », livraison.
- voiceover: "Sublime Booty ByChris. Beauté, confiance, bien-être."
- duration: 4.05s
- poster: 3.5
- transition_in: la Terre rétrécit en point rose qui devient le cœur du logo
- status: built
- src: compositions/s13-fin.html
- reads: logo (36.1-37.5s); numéro (37.5-40.15s)
- sound: riser vers l'impact du logo, fin de musique
- act: Fin
