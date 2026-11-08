import React from 'react';
import {Composition, Still} from 'remotion';
import {World} from './world/World';
import type {CamKey} from './world/CameraRig';
import pays from '../state/pays.json';

const W = 1080;
const H = 1920;

// Vue zénithale de validation : toute l'oasis, nord (montagnes) en haut.
const CIEL: CamKey[] = [{f: 0, pos: [-2, 420, -14], target: [-2, 0, -18], up: [0, 0, -1], fov: 40}];
// Survol 3/4 depuis le sud, au-dessus du lac, vers les montagnes.
const TROIS_QUARTS: CamKey[] = [{f: 0, pos: [40, 120, 170], target: [-8, 0, -20], fov: 42}];

export const RemotionRoot: React.FC = () => (
  <>
    <Still id="MondeCiel" component={World} width={W} height={H} defaultProps={{univers: pays.univers, seed: pays.seed, camera: CIEL}} />
    <Still id="Monde34" component={World} width={W} height={H} defaultProps={{univers: pays.univers, seed: pays.seed, camera: TROIS_QUARTS, lowClouds: false}} />
  </>
);
