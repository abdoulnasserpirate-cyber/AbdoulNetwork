---
format: 1080x1920 + 1920x1080
duration: 56s
message: "Claude peut retrouver toutes tes photos sur Internet — et t'aider à les faire retirer"
arc: Accroche → Preuve → Étape 1 → Astuce → Étape 2 → Résultat → Bonus → Abonnement
audience: Public d'Afrique francophone (Niger), curieux d'IA pratique, TikTok / Reels / YouTube
mode: collaborative
---

# Storyboard v1 — « Claude retrouve tes photos » (3D) · Abdoul Network

**Deux livrables** : vertical 1080×1920 (TikTok/Reels) et paysage 1920×1080 (YouTube/Facebook), 60 fps, même voix, mêmes timings.
**Voix** : enregistrement d'Abdul, nettoyé, −14 LUFS, 53,4 s (0,25 s d'attaque ajoutée). Timings ci-dessous = temps vidéo, calés au mot (transcription horodatée `assets/voice/transcript-words.json`).
**Durée** : 56,0 s (voix jusqu'à 53,3 s + tenue de la carte de fin).

## Analyse de la référence (Phase 0, résumé)

1. 57 s, 10 scènes : accroche scan → preuve 9 → étape 1 → description → astuce Chrome → étape 2 → navigateur → choc → bonus → outro.
2. Un changement visuel toutes les 1–2 s ; le titre du haut ne change qu'aux changements de scène.
3. Titres sans-serif gras blanc + mot-clé rouge ; compteurs bas rouges très gras (scènes 1, 2, 8, 9).
4. Interfaces Claude sombres en légère perspective, pastilles numérotées sous le champ.
5. Cartons glitch « L'ASTUCE » / « LE BONUS » < 0,5 s. Fond noir + trame de points.
6. À dépasser : interfaces plates, coupes visibles, portrait statique, fin générique (carte TikTok de la plateforme).
7. On ne reprend rien de visible (texte, visage, pseudo, filigrane, images) ni le « RGPD art. 17 ».

## Décisions

- **Fil conducteur (spine)** : un seul espace 3D continu ; le **mur LED du visage d'Abdul** ouvre, revient au choc (scène 8, rappel de la scène 1-2) et se miniaturise dans la carte de fin.
- **Palette** : noir #050505 (fond) · rouge #FF2A2A (accent unique, mots-clés, compteurs, halos) · blanc #F5F5F5 (texte) · UI Claude #262624 / #30302E / texte #C2C0B6, accent étoile Claude #D97757 (seulement sur le logo étoile).
- **Typo** : Inter 900 (titres, compteurs, cartons) · Inter 400–600 (UI) · Source Serif 4 (« Bonjour, Abdul », comme l'app) · JetBrains Mono (document de retrait).
- **Mise en page vertical** : titre centré top 170 px, largeur 860 ; scène 3D au centre ; compteur base 1480 px ; rien à droite au-delà de 940 px.
- **Mise en page paysage** : titre centré top 70 px, largeur 1500 ; scène 3D au centre, sujets en deux colonnes quand il y a deux éléments (visage à gauche / grille à droite) ; compteur base 1000 px.
- **Interdits** : pas de coupe sèche (la caméra voyage), pas de diaporama (chaque scène = la caméra qui avance dans le même espace), pas d'économiseur d'écran (chaque mouvement suit un mot), pas de logo TikTok/Google, pas d'URL complète, pas de visage modifié.
- **Image tenue** : scène 8, au mot « peur » : tout s'arrête 0,4 s sur la grille + « 9 ENDROITS ».
- **Vérité** : interface Claude recréée (pas une capture) ; les 9 endroits sont les vrais espaces d'Abdul, liens tronqués/floutés ; vignettes floutées.

## Still open

- Chemin exact « Paramètres → Connecteurs → Claude in Chrome » et libellé du bouton (« Installer » ou « Connecter ») dans l'app d'Abdul.
- Logo Abdoul Network : pas de fichier fourni → mot-symbole typographique en attendant.

## Frame 1 — Accroche

- scene: Mur LED 3D du visage, laser de scan, coins de cadre qui se verrouillent, « ? PHOTOS »
- duration: 3.55s
- poster: 2.2s
- transition_in: cut
- status: built
- voiceover: "Combien de photos de toi traînent sur Internet ? Tu n'en as aucune idée."
- time: 0.00–3.55
- title: Claude peut retrouver **toutes tes photos**
- counter: ? PHOTOS

Mur de sphères qui s'allume de bas en haut (relief = luminance), laser rouge volumétrique qui descend puis remonte, 4 coins 3D qui se verrouillent au mot « idée ». Caméra : dolly-in −8 %, orbite −12° → +6°. SFX : bips de scan, nappe qui monte, clic de verrouillage.

## Frame 2 — Preuve

- scene: 9 lignes lumineuses → 9 cartes floutées en grille 3×3, compteur 1 → 9 ENDROITS
- duration: 3.25s
- poster: 2.6s
- transition_in: camera-pullback
- status: built
- voiceover: "J'ai testé sur moi-même, Claude m'a retrouvé à neuf endroits différents."
- time: 3.55–6.80
- title: J'ai testé sur moi : **9 endroits**
- counter: 1 → 9 ENDROITS (9 tombe sur « neuf » à 5.67)

Le visage recule (vertical : en haut ; paysage : à gauche), les cartes jaillissent le long de lignes à particules et se rangent avec ±40 de profondeur. « Tic » par carte.

## Frame 3 — Étape 1 : selfie + prompt

- scene: Panneau Claude flottant « Bonjour, Abdul », ajout du selfie, prompt tapé en direct, pastilles 1-2-3
- duration: 6.80s
- poster: 5.5s
- transition_in: camera-pan-right
- status: built
- voiceover: "Étape une. Ouvre Claude. Ajoute un selfie et demande-lui de décrire chaque détail qui te rend reconnaissable."
- time: 6.80–13.60
- title: Étape 1 : **un selfie + un prompt**

Clic « + » (halo rouge) à « Ajoute » (8.89), miniature glisse ; frappe 9.9–12.9 : « Analyse cette photo et liste chaque détail précis qui me rend reconnaissable, pour que tu puisses m'identifier n'importe où en ligne. » Pastilles ① Ajoute ton selfie (9.3) ② Décris chaque détail (10.9) ③ Ce qui te rend reconnaissable (12.4). Caméra : 3/4 → face, zoom sur le champ.

## Frame 4 — Claude décrit le visage

- scene: Réponse « Description visuelle détaillée » qui s'écrit, ligne Barbe surlignée en rouge
- duration: 4.15s
- poster: 3.4s
- transition_in: scroll-up
- status: built
- voiceover: "Il analyse tout. Ton visage, tes yeux, ta barbe, tes vêtements."
- time: 13.60–17.75
- title: Claude décrit **ton visage**

Rubriques qui s'allument sur les mots : Visage (14.9) · Yeux (15.65) · Barbe (16.35, surlignage rouge) · Vêtements (17.0). Travelling vertical qui suit le texte.

## Frame 5 — L'astuce : connecteur Chrome

- scene: Carton 3D « L'ASTUCE » glitch, puis Paramètres → Connecteurs → « Chrome » → Installer
- duration: 6.40s
- poster: 5.6s
- transition_in: glitch-card
- status: built
- voiceover: "Maintenant, l'astuce : va dans Paramètres, puis Connecteurs, cherche Chrome et installe Claude in Chrome."
- time: 17.75–24.15
- title: L'astuce : **le connecteur Chrome**

Carton à « l'astuce » (18.5, 0,6 s). Le panneau pivote de 90° : clic Paramètres (19.5), Connecteurs (20.55), « Chrome » se tape (21.6), clic Installer (22.3) → coche (23.3). Zoom caméra sur chaque cible.

## Frame 6 — Étape 2 : visage + nom

- scene: Retour au chat, deuxième prompt tapé en direct, pastilles 1-2-3
- duration: 8.05s
- poster: 7.2s
- transition_in: panel-flip
- status: built
- voiceover: "Étape deux. Renvoie ton selfie avec ton nom. Demande une recherche d'image inversée, chaque endroit où tu apparais, et tous les liens."
- time: 24.15–32.20
- title: Étape 2 : **ton visage + ton nom**

Frappe 25.1–31.7 : « Voici mon selfie, je m'appelle Abdoul Nasser Oumarou. Utilise Chrome pour faire une recherche d'image inversée de mon visage, trouve chaque endroit où j'apparais en ligne et donne-moi le lien de chacun. » Pastilles ① Selfie + nom (26.5) ② Recherche d'image inversée (28.5) ③ Chaque endroit + le lien (31.7).

## Frame 7 — Claude ouvre son navigateur

- scene: Éventail 3D de fenêtres de navigateur traversé par la caméra, 4 étapes cochées, liste des 9 endroits
- duration: 4.80s
- poster: 4.2s
- transition_in: dolly-through
- status: built
- voiceover: "Là, Claude ouvre son propre navigateur et cherche à ta place, site après site."
- time: 32.20–37.00
- title: Claude ouvre **son propre navigateur**

Fenêtres à « navigateur » (33.9) ; pilules Selfie + nom ✓ (34.0) Chrome ✓ (34.8) Endroits ✓ (35.7) Liens ✓ (36.45) ; liste « J'ai trouvé 9 endroits où tu apparais » : Facebook Abdoul Network · TikTok @abdoulnetwork · Instagram · LinkedIn · YouTube · Chaîne WhatsApp AbdoulNetwork Lab · Portfolio Abdoul Network · Digital Abdoul Academy · Boutique Chariow (liens tronqués/floutés).

## Frame 8 — Choc

- scene: Retour au mur LED + grille de 9, « 9 ENDROITS » claque, image tenue
- duration: 2.65s
- poster: 2.0s
- transition_in: fly-back
- status: built
- voiceover: "Et franchement, le résultat fait peur."
- time: 37.00–39.65
- title: Le résultat fait **vraiment peur**
- counter: 9 ENDROITS

Rappel des scènes 1-2. Punch-in 6 % à « peur » (38.75), puis tout se fige 0,4 s.

## Frame 9 — Le bonus : une demande de retrait par site

- scene: Carton « LE BONUS », prompt, document « Demandes de retrait 3/9 », 9 enveloppes 3D en grille
- duration: 10.00s
- poster: 9.0s
- transition_in: glitch-card
- status: built
- voiceover: "Le bonus : fais-lui rédiger une demande de retrait personnalisée pour chaque site où tu ne veux plus apparaître, au nom de la protection de tes données. Une par site, prête à envoyer."
- time: 39.65–49.65
- title: Le bonus : **une demande de retrait** par site
- counter: 1 → 9 DEMANDES (47.6–48.9)

Carton à « bonus » (39.6). Frappe 40.6–44.6 : « Maintenant, rédige une demande de retrait personnalisée pour chaque site où je ne veux plus apparaître. » Document 45.6–47.4 (objet, demande polie de retrait des photos, « Cordialement, Abdoul Nasser Oumarou », aucun article de loi). Enveloppes 47.6–48.9 avec rebond, « swoosh » à « envoyer » (48.9).

## Frame 10 — Abonne-toi

- scene: Mot-symbole Abdoul Network 3D, barre de recherche « @abdoulnetwork » tapée, mini-portrait LED
- duration: 6.35s
- poster: 4.5s
- transition_in: dive
- status: built
- voiceover: "Abonne-toi à Abdoul Network pour plus d'astuces IA comme celle-ci."
- time: 49.65–56.00
- title: Abonne-toi pour **plus d'astuces IA**

Mot-symbole à « Abdoul Network » (50.35), « @abdoulnetwork » se tape 50.6–51.8, ding final 53.3, la caméra ralentit jusqu'à l'arrêt.
