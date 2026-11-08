# Abonnia — moteur vidéo

La bible de production complète est dans `CLAUDE.md`. Ce fichier ne liste que les commandes.

## Installation

```bash
npm install
python3 scripts/audio_gen.py      # SFX + musiques procéduraux -> public/audio/ (8 s, non versionnés)
```

Le rendu utilise le Chromium déjà présent dans `/opt/pw-browsers` et un WebGL logiciel (`swangle`), comme le règle `remotion.config.ts`.

## Produire un épisode

1. Écrire `episodes/jour-XX.json` : les lignes du script, et pour chacune le plan caméra et les éléments à l'écran.
2. Synchroniser sur la voix reçue (règle 0.4) :
   ```bash
   node scripts/sync.mjs ~/voix.m4a 1                # écrit debut/fin de chaque ligne + "voix"
   node scripts/sync.mjs ~/voix.m4a 1 --prises 3:2   # la ligne 3 a 2 prises, on garde la 2e
   ```
3. Images de contrôle (une par ligne) : `node scripts/controle.mjs Jour01` -> `out/controle/`
4. Rendu final : `npx remotion render src/index.ts Jour01 out/jour-01.mp4` (environ 35 min pour 60 s)
5. Couverture : `npx remotion still src/index.ts Cover out/cover-jour-01.png`

Tant que `debut`/`fin` sont absents du JSON, la timeline est estimée à partir du nombre de mots.

## Format d'une ligne (`episodes/jour-XX.json`)

| Champ | Rôle |
|---|---|
| `voix` | texte exact enregistré (sert aussi à placer les éléments sur leur mot) |
| `sous_titre` | narration au milieu-bas, `/` = retour à la ligne, `*mot*` = jaune |
| `sous_ligne` | petite ligne sous la narration |
| `titre` | titre de section en haut. Absent : on garde le précédent ; `null` : on l'efface |
| `plan` | plan caméra (`src/scenes/shots.ts`). Absent : le plan précédent continue |
| `elements` | `{type, mot? \| at?, jusqua? \| duree?, ...}` |

Types d'éléments disponibles pour le Jour 1 : `etiquettes`, `ville_fantome`, `pions`, `grille_icones`, `drapeau_blanc`, `consigne`, `commentaire`, `drame`, `epingle`, `village_fantome`, `chameaux`, `cartes_vote`, `fondu_blanc`.

## Architecture

- `src/world/` : terrain, eau, végétation, nuages, herbe, caméra, presets d'univers
- `src/city/` : fantômes, pions, drapeau, anneaux, chameaux
- `src/ui/` : HUD, sous-titres, cartes, étiquettes, épingles
- `src/scenes/shots.ts` : bibliothèque de plans caméra
- `src/lib/` : PRNG seedé, easing, timeline JSON
- `src/Episode.tsx`, `src/Cover.tsx`, `src/Root.tsx`
