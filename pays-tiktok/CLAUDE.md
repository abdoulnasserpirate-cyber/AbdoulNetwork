# ABONNIA — Dossier de production complet

## Série TikTok faceless « On crée un pays ensemble » · Jour 1, Jour 2, Jour 3…

**Destinataire : Claude Code.** Ce document contient tout ce qu'il faut pour construire le moteur vidéo et produire la série. Lis-le entièrement avant de commencer.

> Transcription Markdown fidèle du PDF « Abonnia-dossier-production-Claude-Code.pdf » (13 pages).
> Le projet vit dans `pays-tiktok/` à la racine du dépôt.

---

## PARTIE 0 — INSTRUCTIONS DE DÉMARRAGE (À EXÉCUTER MAINTENANT)

### 0.1 Ce que je te fournis

1. **Ce PDF** : ta référence pour toute la série. Recopie son contenu en Markdown dans `CLAUDE.md` à la racine du projet, pour l'avoir dans chaque session.
2. **Des vidéos de référence** (Jour 1, Jour 2 et éventuellement Jour 3 d'une autre série du même concept).

### 0.2 Utilisation des vidéos de référence

- Extrais des images avec ffmpeg (1 image par seconde, assemblées en planches de 8 avec le filtre `tile`) et étudie-les en détail.
- Analyse et reproduis **à l'identique le niveau de qualité et le style** : rendu 3D low-poly cozy, couleurs, lumière, HUD (Jour / Population / nom du pays), sous-titres (majuscules, contour noir, mot-clé en jaune), cartes de vote A vs B, cartes de commentaire avec likes animés, tampons « GAGNÉ ! / ACCORDÉ », mouvements de caméra, rythme de montage.
- **Ne copie pas** le décor (vallée enneigée), les noms (Valthria, Zeinox…) ni les textes : mon univers est **l'oasis dans le désert** et mes scripts sont fournis dans ce document.

### 0.3 Paramètres de la série

| Paramètre | Valeur |
|---|---|
| Nom du compte | **Abonnia** |
| Univers | **oasis** : oasis verte au milieu d'un désert de dunes dorées, fleuve qui descend de montagnes rocheuses ocre et se jette dans un lac, palmiers, baobabs, acacias |
| Seed | 2026 |
| Format | 1080×1920, 30 fps, MP4 H.264 |
| Langue | Français |

### 0.4 Règle de production : la vidéo se cale sur MA voix off

À **chaque** épisode, suis ces 4 étapes dans l'ordre :

1. **Script.** Tu écris le script dans `out/voix-jour-XX.txt` : une phrase par ligne, numérotée, avec pour chaque ligne le plan caméra et les éléments à l'écran. Tu me l'envoies **et tu t'arrêtes**. (Pour le Jour 1, le script est déjà validé en Partie 1 : ne le réécris pas.)
2. **Enregistrement.** J'enregistre ma voix et je t'envoie le fichier audio (souvent un .m4a d'iPhone), avec environ 1 seconde de silence entre chaque ligne. Je peux aussi t'envoyer une voix IA générée ailleurs.
3. **Synchronisation.**
   - Convertis l'audio en WAV et place-le dans `public/audio/`.
   - Détecte les silences avec `ffmpeg -af silencedetect=noise=-35dB:d=0.5` pour obtenir le début et la fin de chaque ligne. Vérifie que le nombre de segments correspond au nombre de lignes du script ; sinon, ajuste les seuils ou demande-moi.
   - Nettoie l'audio : silences raccourcis à 0,4 s maximum, légère réduction du bruit (`afftdn`), normalisation à -14 LUFS (`loudnorm`).
   - Génère automatiquement la timeline : chaque scène commence au début de sa ligne, chaque sous-titre apparaît pile sur sa phrase, chaque élément visuel tombe sur le mot-clé.
   - Ajoute la musique (environ -18 dB sous la voix, qui baisse pendant les conflits) et les SFX (whoosh, pop, tick, ding, foule).
4. **Rendu et contrôle.** Rends la vidéo, extrais une image toutes les 2 secondes et vérifie : textes lisibles, marges TikTok respectées, aucune image figée, sous-titres synchronisés. Corrige, puis livre.

### 0.5 Mission immédiate

1. Initialise le projet et construis le moteur décrit en **Partie C**.
2. **Dès que le monde existe, envoie-moi une image fixe de l'oasis vue du ciel** pour validation, avant d'aller plus loin.
3. En attendant mon audio, prépare toutes les scènes du Jour 1 (Partie 1).
4. À réception de l'audio, synchronise, rends et livre.

### 0.6 Livrables du Jour 1

1. `out/jour-01.mp4`, calé sur ma voix
2. `out/cover-jour-01.png` (1080×1920) : « JOUR 1 » + « ET SI ON CRÉAIT UN PAYS EN PLEIN DÉSERT ? » + pastille « 1 ABONNÉ = 1 HABITANT » + « A OU B ? »
3. La légende TikTok, 5 hashtags et le commentaire à épingler
4. `state/pays.json` initialisé (jour 1, population 0)

### 0.7 Contraintes techniques

- Si le téléchargement du navigateur de Remotion est bloqué, utilise le Chromium déjà installé dans l'environnement (option `browserExecutable` / `--browser-executable`).
- Si une installation de paquet échoue, signale-le et propose une alternative au lieu de bricoler en silence.

---

## PARTIE 1 — SCRIPT DU JOUR 1 (VALIDÉ)

Durée cible : environ 60 secondes. **Le texte de la colonne « Voix off » est exactement ce que j'enregistre.** Le mot-clé à colorer en jaune est entre astérisques dans la colonne sous-titre.

| # | Voix off | Sous-titre à l'écran | Plan et éléments |
|---|---|---|---|
| 1 | Et si on créait un pays… en plein désert ? | ET SI ON CRÉAIT UN \*PAYS\*… / EN PLEIN \*DÉSERT\* ? | Plongée à travers les nuages vers l'oasis vue du ciel. HUD : Jour 1, Population 0, « Pays sans nom » |
| 2 | Tous ensemble. | \*TOUS ENSEMBLE\* | La caméra continue de descendre |
| 3 | Regarde. Une oasis cachée au milieu des dunes. | UNE OASIS \*CACHÉE\* AU MILIEU DES DUNES | Vue zénithale qui se rapproche lentement |
| 4 | Des montagnes, un fleuve, et un lac. | DES MONTAGNES, UN \*FLEUVE\* ET UN LAC | Étiquettes MONTAGNES, FLEUVE, LAC qui apparaissent une par une |
| 5 | Ici, il y a la place pour des millions d'habitants. | ICI, IL Y A LA PLACE POUR DES \*MILLIONS\* D'HABITANTS | Survol en 3/4 ; des centaines d'immeubles fantômes poussent en vague |
| 6 | Mais pour l'instant… il n'y a rien. | MAIS POUR L'INSTANT… IL N'Y A \*RIEN\* | Les fantômes disparaissent ; travelling au ras du sol, palmiers et dunes au fond |
| 7 | La règle est simple : un abonné égale un habitant. | \*1 ABONNÉ\* = 1 HABITANT | Des pions tombent un par un ; le compteur monte de 1 à 8 avec le badge EXEMPLE |
| 8 | Aujourd'hui, on est zéro. Tu seras le premier ? | AUJOURD'HUI ON EST 0… TU SERAS LE \*PREMIER\* ? | Les pions disparaissent, le compteur revient à 0 ; plan au sol près du fleuve |
| 9 | Chaque jour, vous votez. | CHAQUE JOUR / \*VOUS VOTEZ\* | Survol du fleuve en plongée |
| 10 | Les constructions, les lois, les guerres, les manifs… | (titre maintenu) | Grille d'icônes CONSTRUCTIONS, LOIS, GUERRES, MANIFS qui apparaissent une par une, chacune sur son mot |
| 11 | C'est vous qui décidez de l'avenir. | C'EST VOUS QUI DÉCIDEZ DE L'\*AVENIR\* | La caméra glisse au-dessus de la palmeraie |
| 12 | Mais d'abord, le pays a besoin d'un nom et d'un drapeau. | LE PAYS A BESOIN D'UN \*NOM\* ET D'UN \*DRAPEAU\* | Plan au sol devant un drapeau blanc « ? » planté dans le sable, qui ondule au vent |
| 13 | Écris le nom en commentaire. | (titre maintenu) | Carte 1 « Nom du pays — Écris-le en commentaire » |
| 14 | Décris le drapeau : une IA le dessinera. | (titre maintenu) | Faux commentaire « Qu'il s'appelle Sahelia, drapeau orange avec un palmier vert », likes de 276 à 1 240, badge EXEMPLE ; carte 2 « Le drapeau — Décris-le : une IA le dessinera » |
| 15 | Le commentaire le plus liké gagne. | LE PLUS \*LIKÉ\* GAGNE | Lumière qui devient plus dramatique |
| 16 | Et maintenant, premier vote : où est-ce qu'on fonde le pays ? | PREMIER VOTE / OÙ \*FONDE\*-T-ON LE PAYS ? | Survol du fleuve |
| 17 | A : au bord du fleuve. De l'eau et des terres fertiles. | \*A\* · AU BORD DU FLEUVE / de l'eau et des terres fertiles | Épingle bleue A, cercle au sol ; village fantôme, moulin, champs qui poussent |
| 18 | B : près des dunes. Le commerce et les caravanes. | \*B\* · PRÈS DES DUNES / le commerce et les caravanes | Épingle orange B, cercle au sol ; maisons fantômes, marché couvert, chameaux |
| 19 | Commente A ou B, avec ton nom et ton drapeau. | COMMENTE \*A\* OU \*B\* / + NOM ET DRAPEAU | Vue zénithale avec les deux épingles ; cartes A vs B |
| 20 | Abonne-toi, et viens vivre ici. | ABONNE-TOI ET \*VIENS VIVRE ICI\* | La caméra remonte vers les nuages |
| 21 | Demain : jour 2. | DEMAIN : \*JOUR 2\* | Fondu dans les nuages blancs |

---

## PARTIE A — ANALYSE DES ÉPISODES DE RÉFÉRENCE

### A1. Jour 1 (63 s) : le lancement

Rôle : **recruter**. Le pays est vide (population 0) et la vidéo vend la règle du jeu.

| Temps | Contenu |
|---|---|
| 0–4 s | Plongée à travers les nuages vers la vallée : « ET SI ON CRÉAIT UN PAYS… TOUS ENSEMBLE ? » |
| 4–12 s | Présentation du terrain (montagnes, rivière) puis immeubles fantômes : « place pour des millions d'habitants » |
| 12–23 s | Plan au sol vide : « il n'y a rien », puis « 1 ABONNÉ = 1 HABITANT » (pions + badge EXEMPLE), puis « on est 0… tu seras le premier ? » |
| 23–31 s | « Chaque jour vous votez » : constructions, lois, guerres, manifs |
| 31–42 s | Drapeau blanc « ? » : nom et drapeau en commentaire, faux commentaire à 1 240 likes, « le plus liké gagne » |
| 42–57 s | Premier vote : A = rivière, B = lac (villages fantômes), puis cartes A vs B : « commente A ou B + nom et drapeau » |
| 57–63 s | « Abonne-toi et viens vivre ici — Demain : Jour 2 » |

### A2. Jour 2 (110 s) : la récompense, puis le drame

Rôle : **payer la promesse** (le monde change vraiment), **mettre en avant les commentateurs**, puis **créer un conflit** qui appelle au vote suivant.

| Temps | Contenu | Mécanique psychologique |
|---|---|---|
| 0–2 s | Vue du ciel : « JOUR 2 » | Rendez-vous tenu |
| 2–9 s | Plan au sol : des milliers de pions tombent, le compteur s'emballe de 0 à 6 137 : « +6 137 HABITANTS » | Preuve sociale : « tout le monde vient, toi aussi » |
| 9–15 s | « PREMIER VOTE : LE RÉSULTAT », cartes A vs B, B « GAGNÉ ! », « ×2 plus de voix » | Le vote compte vraiment |
| 15–28 s | Le port se construit (pontons, bateaux, promenade), place centrale avec mât vide, « les premières maisons », « puis les immeubles », « EN 1 JOUR : UNE VRAIE VILLE » (phare, château) | Timelapse satisfaisant de transformation |
| 28–33 s | « ET MAINTENANT… LE NOM » : carte du vrai commentaire (pseudo **Zeinox**, « Valthria », mini-drapeau), les likes défilent de 240 à 1 569, puis « 1 578 LIKES » | Le commentateur devient une star : tout le monde veut être le prochain |
| 33–35 s | « BIENVENUE À VALTHRIA » ; la pastille du HUD passe de « Pays sans nom » à « Valthria » | Identité collective |
| 35–42 s | « LE DRAPEAU » se construit couche par couche, chaque couche avec son étiquette : bleu-blanc-rouge, puis montagne enneigée, couronne de laurier, étoile dorée | Suspense visuel, satisfaction |
| 42–45 s | Plan bas : le drapeau flotte sur le château, la foule devant : « IL FLOTTE SUR LA VILLE » | Fierté |
| 45–52 s | Trône : un pion violet s'y assoit, étiquette « ZEINOX », une couronne apparaît : « AUTOPROCLAMÉ ROI DE VALTHRIA » puis « À VOIR SI SON RÈGNE VA DURER… » | Personnage + tension narrative |
| 52–59 s | « RETENEZ BIEN : LES COMMENTAIRES LES PLUS LIKÉS DÉCIDENT DE TOUT » | Règle rappelée = incitation à liker et commenter |
| 59–68 s | Terrain vide, carte du commentaire de **Qeis** (« un parc d'attractions qui se nommera Mysti Park »), parc fantôme, « MYSTI PARK ? », likes qui montent jusqu'à 718, « DEMANDE ACCEPTÉE », le parc se colore | Demandes folles exaucées |
| 68–70 s | « QEIS, GÉRANT OFFICIEL DU PARC » (panneau à son nom) | Récompense personnelle |
| 70–78 s | Commentaire d'**Abdellah** (« J'veux être kebabier de la ville »), « ACCORDÉ », « KEBAB – CHEZ ABDELLAH », « 1ER COMMERCE DE VALTHRIA », gros plan « MENU 5 € kebab frites » | Humour + mise en avant |
| 78–82 s | Retour au trône : « UN ROI NOMMÉ TOUT SEUL… ÇA NE PLAÎT PAS À TOUT LE MONDE » (pancartes « NON ! ») | Conflit |
| 82–92 s | « NOUVEAU VOTE » : A = garder le roi (Zeinox reste roi), B = élections (on vote pour un chef). « SI B GAGNE… CANDIDATS RECHERCHÉS » : 3 affiches « VOTEZ ? » + urnes, consignes 1 « présente-toi ou propose quelqu'un » et 2 « dis pourquoi » | Vote binaire + participation avancée |
| 92–100 s | « LA PREMIÈRE LOI DE VALTHRIA » : parchemin « LOI N°1 ? » avec une plume : « LA PLUS LIKÉE SERA APPLIQUÉE » | Deuxième sujet de commentaire |
| 100–104 s | « COMMENTE » : 1 A ou B, 2 ton candidat, 3 ta loi | Récapitulatif clair |
| 104–110 s | La caméra remonte : « ABONNE-TOI ET DEVIENS HABITANT DE VALTHRIA — DEMAIN : JOUR 3 » | Cliffhanger |

### A3. Les 12 leviers de la série (à reproduire à chaque épisode)

1. **S'abonner = entrer dans le jeu** (1 abonné = 1 habitant). Le compteur Population est le vrai nombre d'abonnés.
2. **Hook « Jour N » + gros chiffre** dès les 3 premières secondes.
3. **Promesse tenue visiblement** : le vote d'hier se construit à l'écran (timelapse fantôme → réel).
4. **Mise en avant des commentateurs** : pseudo réel, commentaire réel, compteur de likes animé, rôle officiel (roi, gérant, commerçant). C'est le levier n°1 des commentaires.
5. **Demandes folles exaucées** (parc, kebab, etc.), avec de l'humour.
6. **Personnages récurrents** avec un arc narratif (le roi autoproclamé, ses opposants…).
7. **Un conflit par épisode** qui débouche sur un vote A/B.
8. **Plusieurs portes d'entrée pour commenter** : A/B (facile), candidat (moyen), loi ou demande (créatif).
9. **« Le plus liké gagne »** : les gens likent les commentaires, relisent et reviennent.
10. **Monde persistant** : même géographie, la ville grandit d'épisode en épisode.
11. **Rythme** : un nouvel élément visuel ou texte toutes les 2 à 3 secondes, caméra toujours en mouvement.
12. **Cliffhanger fixe** : « Abonne-toi et deviens habitant de [NOM] — Demain : Jour N+1 ».

---

## PARTIE B — CHOIX DE L'UNIVERS ET DU NOM DE COMPTE

### B1. Univers (paramètre `univers` du moteur)

La mécanique reste identique ; seul le décor change, pour ne pas être vu comme une copie de la vidéo d'origine.

| Preset | Décor | Hook Jour 1 |
|---|---|---|
| `oasis` **(recommandé)** | Une oasis verte au milieu d'un désert de dunes dorées, un fleuve qui descend de montagnes rocheuses ocre, un lac, des palmiers, des baobabs | « Et si on créait un pays… en plein désert ? » |
| `ile` | Une île tropicale déserte au milieu de l'océan, un volcan éteint, une lagune, une plage | « Et si on créait un pays… sur une île déserte ? » |
| `vallee` | Une vallée verte dans un cratère de montagnes enneigées (identique à la référence) | « Et si on créait un pays… tous ensemble ? » |
| `ciel` | Une île flottante dans les nuages, avec des cascades qui tombent dans le vide | « Et si on créait un pays… dans le ciel ? » |

### B2. Noms de compte

Le compte de référence s'appelle **« Coms Land »** (le pays des commentaires) : c'est un nom de marque court qui décrit la mécanique, **pas** le nom du pays (Valthria). Même logique ici : le pays change de nom par vote, mais le compte garde sa marque.

| Nom affiché | @ | Pourquoi |
|---|---|---|
| **Abonnia** | @abonnia | Le pays des abonnés en un mot, sonne comme un vrai pays (recommandé) |
| Votopia | @votopia | Utopie + vote : « ici, tout se vote » |
| Likeland | @likeland.pays | Le plus liké gagne : la règle dans le nom |
| Abostan | @abostan | Drôle et mémorable, ton africain/oriental |
| Pays des Coms | @paysdescoms | Clair pour un public francophone |
| On Crée Un Pays | @oncreeunpays | Le concept est explicite en 1 seconde |
| Oasis des Abonnés | @oasisdesabonnes | Si l'univers `oasis` est choisi |

TikTok limite la fréquence des changements de @ : garde le @ fixe. Après le baptême, le nom affiché peut devenir « Abonnia · [NOM DU PAYS] ».

---

## PARTIE C — BRIEF TECHNIQUE POUR CLAUDE CODE

### C1. Rôle et objectif

Tu es un développeur créatif senior spécialisé en motion design 3D et en vidéos courtes virales. Tu construis un **moteur de vidéos réutilisable** pour cette série. Chaque épisode doit être produit en mettant à jour `state/pays.json`, en écrivant `episodes/jour-XX.json` et en lançant une seule commande de rendu.

### C2. Stack imposée

- **Remotion** + **@remotion/three** (react-three-fiber), `three`, `@react-three/drei`.
- Format **1080×1920, 30 fps, MP4 H.264**. Jour 1 : 60–65 s. Jours suivants : 90–120 s.
- Polices : **Lilita One** (sous-titres), **Montserrat** 700/800 (interface).
- 100 % procédural low-poly, sans asset externe obligatoire.
- Animation pilotée uniquement par `useCurrentFrame()`. Aucun `Math.random()` : PRNG seedé (mulberry32), seed fixe par univers, pour que la géographie soit identique d'un jour à l'autre.
- Pions et arbres en `InstancedMesh` (jusqu'à 10 000 pions sans chute de performance).

### C3. Direction artistique

**Monde** : style cozy low-poly / toon, couleurs saturées et douces, ombres légères, brouillard sur les plans larges, gros nuages cotonneux. Le décor dépend du preset `univers` (B1). Forêt ou palmeraie dense en instances, herbe haute ondulante au premier plan des plans au sol, fleurs éparses.

**Objets de jeu** (tous en composants réutilisables) :

- **Fantômes** : bâtiments en blanc translucide (opacité 0,35, contour lumineux), apparition en pop élastique. **Transition fantôme → réel** : le bâtiment se remplit de couleur de bas en haut avec un petit flash et des particules.
- **Pions** : capsule + sphère, 8 couleurs vives ; ils tombent du ciel et rebondissent. Un pion peut porter une étiquette-pseudo (pastille violette) et un accessoire (couronne, chapeau, tablier).
- **Bibliothèque de bâtiments** : maison (toit rouge, bleu ou orange), immeuble (avec panneaux solaires), château à tours bleues avec horloge, place centrale avec étoile au sol, mât de drapeau, port (pontons en bois, bateaux colorés), phare rayé, promenade avec lampadaires et bancs, moulin, champs, parc d'attractions (grande roue, montagnes russes, chapiteau, arche avec nom), commerce générique (auvent rayé, parasols, enseigne au texte paramétrable, panneau menu), trône sur estrade, affiches électorales « VOTEZ ? » avec urnes, pancartes de manifestation « NON ! », parchemin de loi avec plume.
- **Drapeau** animé par déformation sinusoïdale, texture = SVG du drapeau voté.
- **Marqueurs** A (bleu) et B (orange) avec cercle au sol ; **étiquettes** reliées à la scène par une ligne.

**Interface (HUD)** :

- En haut, permanent : carte « JOUR » + carte « POPULATION » (icône personne, nombre qui défile en roulement), pastille drapeau + nom du pays (« PAYS SANS NOM » tant qu'il n'est pas voté).
- **Carte commentaire** : avatar rond avec l'initiale, pseudo en gris, texte du commentaire, mini-drapeau optionnel, cœur rose + compteur de likes qui s'anime jusqu'à la vraie valeur.
- **Tampons** : « GAGNÉ ! », « ACCORDÉ », « DEMANDE ACCEPTÉE » (vert, incliné, effet tampon), « ×2 PLUS DE VOIX ».
- **Cartes de vote** A (bleu) / B (orange) avec une pastille jaune « VS », titre et sous-titre ; le perdant devient grisé.
- **Cartes de consignes** numérotées (pastilles 1 bleue, 2 orange, 3 verte).
- **Étiquettes de couches** (pilules blanches) sous le drapeau pendant sa construction.

**Sous-titres** : majuscules, Lilita One, blanc, contour noir épais (8–10 px) + ombre, **mot-clé en jaune #FFC83D**, 2 lignes maximum, apparition en pop. Les titres de section sont en haut sous le HUD, la narration au milieu-bas. Un nouvel élément toutes les 2 à 3 s.

**Caméra** : drone cinématique toujours en mouvement : plongée et remontée à travers les nuages, survols, travellings au ras du sol, contre-plongée sur le drapeau et le trône. Easing easeInOutCubic entre keyframes, légère profondeur de champ au sol.

**Zones de sécurité TikTok** : 120 px en haut, 380 px en bas, 140 px à droite.

### C4. Architecture du projet

```
pays-tiktok/
├─ src/
│  ├─ Root.tsx, Episode.tsx          # lit state + script, enchaîne les scènes
│  ├─ world/ (World, Terrain[univers], Vegetation, Water, Clouds, CameraRig)
│  ├─ city/  (Buildings, Ghost, BuildTransition, Port, Castle, Park, Shop, Throne, Flag, Pawns, Crowd, Props)
│  ├─ ui/    (Hud, Caption, CommentCard, Stamp, VoteCards, StepCards, LayerTags, Label, Scroll)
│  ├─ scenes/ (blocs réutilisables, voir C6)
│  └─ lib/   (prng, easing, timeline, layout)
├─ state/pays.json
├─ episodes/jour-01.json, jour-02.json…
├─ flags/drapeau.svg
├─ public/audio/ (voix, musique, sfx)
└─ out/jour-XX.mp4
```

### C5. Données persistantes — `state/pays.json`

```json
{
  "univers": "oasis",
  "seed": 2026,
  "jour": 1,
  "population": 0,
  "nom": null,
  "drapeau": { "couches": [], "svg": null },
  "capitale": null,
  "batiments": [],
  "personnages": [],
  "lois": [],
  "votes_en_cours": [],
  "historique": []
}
```

- `batiments` : `{ "type", "position", "nom", "proprietaire", "jour_construit" }`. Ils sont toujours affichés : la ville grandit visiblement.
- `personnages` : `{ "pseudo", "role", "couleur", "accessoire", "jour_apparition" }` (ex. Zeinox / roi / violet / couronne).
- `historique` : un résumé par jour (vote, résultat, événements) pour garder la continuité narrative.

### C6. Blocs de scènes réutilisables (`scenes/`)

| Bloc | Usage |
|---|---|
| `IntroJour` | Plongée du ciel, titre « JOUR N » |
| `ArriveeHabitants` | Pluie de pions, compteur de l'ancienne à la nouvelle population, « +X HABITANTS » |
| `ResultatVote` | Cartes A/B, tampon « GAGNÉ ! », bonus « ×N plus de voix » ou pourcentage |
| `Construction` | Séquence fantôme → réel, avec sous-titres étape par étape, puis plan large « EN 1 JOUR : … » |
| `RevelationCommentaire` | Carte commentaire (pseudo, texte, likes animés), tampon, conséquence à l'écran |
| `Bapteme` | « BIENVENUE À [NOM] » + mise à jour du HUD |
| `DrapeauCouches` | Construction du drapeau couche par couche avec étiquettes, puis drapeau sur le mât |
| `Personnage` | Pion sur trône ou devant un lieu, étiquette pseudo, accessoire, titre (« AUTOPROCLAMÉ ROI… ») |
| `DemandeExaucee` | Commentaire → fantôme → « DEMANDE ACCEPTÉE / ACCORDÉ » → réel → titre officiel (« GÉRANT OFFICIEL DU PARC ») |
| `Rappel` | « RETENEZ BIEN : les commentaires les plus likés décident de tout » |
| `Conflit` | Foule, pancartes, tension (lumière plus sombre, musique qui baisse) |
| `NouveauVote` | Cartes A vs B + « SI B GAGNE… » + éléments fantômes de la conséquence |
| `AppelLoi` / `AppelCandidats` | Parchemin « LOI N°X ? » ou affiches « VOTEZ ? » + consignes |
| `Recap` | « COMMENTE » + cartes de consignes 1/2/3 |
| `Outro` | Remontée dans les nuages, « ABONNE-TOI ET DEVIENS HABITANT DE [NOM] — DEMAIN : JOUR N+1 » |

### C7. Structure type d'un épisode Jour N (90–120 s)

1. **Hook** `IntroJour` + `ArriveeHabitants` (0–9 s)
2. **Paiement** `ResultatVote` + `Construction` (9–30 s)
3. **Stars du jour** : 1 à 3 `RevelationCommentaire` / `Bapteme` / `DrapeauCouches` / `Personnage` (30–55 s)
4. **Rappel** de la règle (2–4 s)
5. **Demandes exaucées** : 1 ou 2 `DemandeExaucee`, au moins une drôle (55–80 s)
6. **Conflit** né d'un personnage ou d'une décision (80–85 s)
7. **Nouveau vote** A/B + un 2ᵉ appel créatif (loi, candidat, nom d'un lieu) (85–100 s)
8. `Recap` + `Outro` (100–110 s)

Le Jour 1 suit le plan de la section A1, adapté à l'univers choisi.

### C8. Audio

- **Voix off : c'est MA voix (ou une voix IA que je fournis), enregistrée à partir de ton script.** Suis la règle de production 0.4 : la timeline se cale sur l'audio réel.
- Musique orchestrale légère et aventureuse (jeu de gestion cozy) à environ -18 dB ; elle baisse et passe en mineur pendant les conflits.
- SFX : whoosh (caméra), pop (apparitions), tick (compteurs), ding (tampons), foule qui acclame (baptême, drapeau), huées (conflit).
- Les sous-titres reprennent exactement le texte prononcé et portent le message même sans le son.

### C9. Étapes de construction (première session)

1. Initialiser Remotion et installer les dépendances.
2. Construire le terrain de l'univers choisi ; rendre une image fixe vue du dessus et la vérifier.
3. HUD + sous-titres + carte commentaire ; rendre une image de contrôle.
4. CameraRig et timeline pilotée par JSON.
5. Bibliothèque de bâtiments, pions, foule, drapeau, transition fantôme → réel.
6. Blocs de scènes de C6.
7. Écrire `episodes/jour-01.json` à partir du script de la Partie 1, synchroniser sur ma voix (règle 0.4), rendre `out/jour-01.mp4`.
8. Extraire une image toutes les 3 s, vérifier la lisibilité, les marges, la fluidité et l'absence d'image figée ; corriger ; livrer.
9. Livrer aussi la légende TikTok, 5 hashtags et le commentaire à épingler.

---

## PARTIE D — WORKFLOW QUOTIDIEN

### D1. Message à envoyer à Claude Code chaque jour

```
JOUR N
Abonnés actuels : [nombre réel]
Vote A/B d'hier : [A ou B] gagne — [nombre ou ratio de voix]
Commentaires les plus likés (captures jointes ou recopiés) :
1. @pseudo — "texte" — X likes
2. @pseudo — "texte" — X likes
3. @pseudo — "texte" — X likes
Idée de conflit ou de vote (optionnel) : ...
```

Les captures d'écran des commentaires suffisent : lis-les et extrais pseudo, texte et likes.

### D2. Ce que Claude Code fait à la réception

1. Mettre à jour `state/pays.json` : jour, population réelle, résultat du vote, nouveaux bâtiments, personnages et lois, historique.
2. Si un drapeau ou un logo a été voté : générer le SVG d'après la description, décomposé en couches nommées pour `DrapeauCouches`.
3. Écrire `episodes/jour-N.json` selon C7 en :
   - appliquant le vote gagnant de façon spectaculaire ;
   - mettant en avant 2 à 4 commentateurs réels (pseudo exact, texte exact, likes exacts) ;
   - faisant avancer l'arc des personnages existants ;
   - créant un nouveau conflit cohérent avec l'historique ;
   - proposant un vote A/B simple et un appel créatif.
4. M'envoyer d'abord le script de la voix off (règle 0.4, étape 1) et attendre mon audio ; puis synchroniser, rendre `out/jour-N.mp4`, vérifier les images, livrer.
5. Livrer la légende, les hashtags et le **commentaire épinglé** (ex. « 🗳️ VOTE DU JOUR : A (garder le roi) ou B (élections) ? Le commentaire le plus liké choisit aussi la loi n°1 »).

### D3. Banque d'idées de conflits et de votes (Jours 3 à 30)

- Élection du chef : débat entre candidats, résultats, investiture ou coup d'État.
- Première loi votée et ses conséquences (loi absurde = épisode drôle).
- Monnaie nationale : nom et visuel du billet votés.
- Hymne national : les paroles proposées en commentaire.
- Un pays voisin apparaît derrière les montagnes : alliance ou guerre ?
- Catastrophe : sécheresse, tempête ou incendie, et comment on la gère.
- Grands chantiers : aéroport, stade, université, mosquée/église/temple, hôpital.
- Équipe nationale : nom, maillot, premier match.
- Fête nationale : date et tradition votées.
- Impôts : à quoi sert l'argent ?
- Scandale : le roi ou le président a-t-il triché ?
- Exploration : on découvre une grotte, une île ou une mine d'or.
- Ambassade : un abonné devient ambassadeur dans son vrai pays.
- Recensement : records de population, quartiers nommés d'après les plus gros commentateurs.

### D4. Règles de cohérence

- La population affichée est **toujours** le vrai nombre d'abonnés.
- Un vote annoncé est **toujours** appliqué le lendemain, même si le résultat dérange l'histoire prévue.
- Pseudos, textes et likes affichés sont **exactement** ceux des vrais commentaires.
- Un épisode chaque jour, à heure fixe.

---

## PARTIE E — PROFIL DU COMPTE ET COUVERTURES

### E1. Ce que montrent les chiffres du compte de référence (Coms Land)

| Donnée | Valeur | Lecture |
|---|---|---|
| Vues Jour 1 | 341,5 K | La vidéo de lancement a explosé |
| Vues Jour 2 | 49,6 K | Normal : le Jour 2 sert surtout les abonnés déjà là |
| Abonnés | 24,5 K | Avec environ 391 K vues au total, à peu près **6 abonnés pour 100 vues**. Un compte classique tourne autour de 0,5 à 1 % : le format convertit 6 à 10 fois mieux |
| J'aime | 43,8 K | Moins de likes que d'abonnés sur les vidéos : ici, le geste principal est **s'abonner**, pas liker |
| Vidéos publiées | 2 | 24,5 K abonnés en 2 vidéos : c'est le concept qui fait le travail, pas la quantité |

Conséquences pour toi :

1. **Le Jour 1 est la vidéo la plus importante de la série.** Soigne-le au maximum ; tu peux aussi le republier plus tard en version « on recommence l'histoire » si la série grandit.
2. **Chaque Jour N doit aussi parler aux nouveaux.** Rappelle toujours « 1 ABONNÉ = 1 HABITANT » dans la vidéo et sur la couverture, car beaucoup de spectateurs découvrent la série en cours de route.
3. **Épingle le Jour 1** en tête de profil, puis le dernier épisode.

### E2. Profil

- **Nom affiché** : voir B2.
- **Bio** (2 lignes, promesse + règle) :

```
Le pays que VOUS construisez, jour après jour 🗳️
1 abonné = 1 habitant · Le com le plus liké décide
```

- **Photo de profil** : un drapeau blanc avec un « ? » planté dans le décor de ton univers. Après le baptême, remplace-la par le drapeau voté : la photo raconte l'histoire.
- Prompt à coller dans ChatGPT (univers oasis) :

```
Agis comme un designer professionnel Photoshop spécialisé en identités de marques de jeux mobiles.
Crée une photo de profil TikTok au format carré 1:1.
Sujet : un drapeau blanc qui flotte au vent avec un grand point d'interrogation noir au centre, planté sur une petite oasis verte ronde avec un lac bleu et deux palmiers, entourée de dunes dorées, sur un fond noir uni.
Style : illustration 3D low-poly cozy, couleurs vives et saturées, ombres douces, lignes nettes, aspect de jeu de gestion mobile.
Composition : sujet centré, lisible même en tout petit dans un cercle, marges suffisantes pour un recadrage circulaire.
Aucun texte, aucun logo, aucune signature.
```

### E3. Couverture de chaque vidéo (à générer par Claude Code)

Toutes les couvertures suivent le même gabarit, pour que la grille du profil ressemble à une série :

- En haut : **« JOUR N »** en jaune géant (contour noir épais).
- Sous le titre : **l'événement du jour** en 2 lignes (« BIENVENUE À VALTHRIA », « LE ROI EST RENVERSÉ », « LA GUERRE COMMENCE »).
- Au centre : **l'image clé** de l'épisode (drapeau, ville, personnage), grande et lisible.
- En bas : la pastille **« 1 ABONNÉ = 1 HABITANT »** et **la question du vote en cours** en jaune (« ROI OU ÉLECTIONS ? »).
- Fond : plan large de la ville, légèrement assombri.

Instruction pour Claude Code : à chaque épisode, créer une composition Remotion `Cover` en 1080×1920 qui réutilise le monde 3D et le HUD, la rendre avec `npx remotion still Cover out/cover-jour-N.png`, et la livrer avec la vidéo.

---

## ANNEXE — AIDE-MÉMOIRE POUR ABDUL (pas pour Claude Code)

**Ce que tu envoies à Claude Code au démarrage :** ce PDF + les vidéos de référence + la phrase « Lis le PDF joint et exécute la Partie 0. »

**Enregistrement de la voix off (iPhone) :**

- App Dictaphone, pièce calme sans écho (rideaux, vêtements autour).
- Téléphone à environ 15 cm de la bouche, légèrement de côté.
- Ton de narrateur de jeu vidéo : chaleureux, énergique, avec le sourire.
- Environ 1 seconde de silence entre chaque ligne du script.
- Si tu rates une ligne, fais une pause et relis toute la ligne, puis dis à Claude Code quelle prise garder.
- Envoie le fichier .m4a tel quel.

**Chaque jour suivant :** envoie le message de la section D1 (« JOUR N » + abonnés + résultat du vote + captures des commentaires les plus likés). Claude Code t'envoie le script, tu enregistres, tu renvoies l'audio, il livre la vidéo, la couverture, la légende et le commentaire à épingler.

**Après publication :** épingle le commentaire du vote, épingle le Jour 1 en tête du profil, réponds aux premiers commentaires dans l'heure.
