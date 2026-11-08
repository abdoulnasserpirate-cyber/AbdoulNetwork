import React from 'react';
import {Composition, Still} from 'remotion';
import {World} from './world/World';
import type {CamKey} from './world/CameraRig';
import {Episode, episodeDuration} from './Episode';
import {Cover} from './Cover';
import type {EpisodeSpec} from './lib/timeline';
import pays from '../state/pays.json';
import jour01 from '../episodes/jour-01.json';

const W = 1080;
const H = 1920;
const FPS = 30;

// Vue zénithale de validation : toute l'oasis, nord (montagnes) en haut.
const CIEL: CamKey[] = [{f: 0, pos: [-2, 420, -14], target: [-2, 0, -18], up: [0, 0, -1], fov: 40}];
// Survol 3/4 depuis le sud, au-dessus du lac, vers les montagnes.
const TROIS_QUARTS: CamKey[] = [{f: 0, pos: [40, 120, 170], target: [-8, 0, -20], fov: 42}];

const ep01 = jour01 as unknown as EpisodeSpec;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Jour01"
      component={Episode}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={episodeDuration(ep01, FPS)}
      defaultProps={{episode: ep01}}
    />
    <Still
      id="Cover"
      component={Cover}
      width={W}
      height={H}
      defaultProps={{
        jour: 1,
        univers: pays.univers,
        seed: pays.seed,
        evenement: 'ET SI ON CRÉAIT UN *PAYS* / EN PLEIN *DÉSERT* ?',
        question: 'A OU B ?',
      }}
    />
    <Still id="MondeCiel" component={World} width={W} height={H} defaultProps={{univers: pays.univers, seed: pays.seed, camera: CIEL}} />
    <Still
      id="Monde34"
      component={World}
      width={W}
      height={H}
      defaultProps={{univers: pays.univers, seed: pays.seed, camera: TROIS_QUARTS, lowClouds: false}}
    />
  </>
);
