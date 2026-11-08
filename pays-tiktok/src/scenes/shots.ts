// Bibliothèque de plans caméra (drone toujours en mouvement), exprimés en temps normalisé u ∈ [0,1]
// sur la durée du plan, à partir des lieux nommés de l'univers. Réutilisable d'un épisode à l'autre.

import * as THREE from 'three';
import type {Geography} from '../world/geography';
import {cameraAt, type CamKey, type V3} from '../world/CameraRig';
import type {Timeline} from '../lib/timeline';

type ShotKey = {u: number; pos: V3; target: V3; up?: V3; fov?: number};
type ShotFn = (geo: Geography) => ShotKey[];

const DOWN: V3 = [0, 0, -1];

export const SHOTS: Record<string, ShotFn> = {
  // Plongée à travers les nuages vers l'oasis vue du ciel
  plongee: () => [
    {u: 0, pos: [10, 980, 40], target: [6, 0, -4], up: [0.12, 0, -1], fov: 40},
    {u: 1, pos: [-2, 470, -12], target: [-2, 0, -16], up: DOWN, fov: 40},
  ],
  zenith_approche: () => [
    {u: 0, pos: [-2, 470, -12], target: [-2, 0, -16], up: DOWN, fov: 40},
    {u: 1, pos: [-2, 395, -14], target: [-2, 0, -18], up: [-0.06, 0, -1], fov: 40},
  ],
  zenith_etiquettes: () => [
    {u: 0, pos: [-2, 395, -14], target: [-2, 0, -18], up: [-0.06, 0, -1], fov: 40},
    {u: 1, pos: [-6, 360, -22], target: [-6, 0, -26], up: [-0.1, 0, -1], fov: 40},
  ],
  // Survol 3/4 pendant que la ville fantôme pousse
  survol_34: () => [
    {u: 0, pos: [95, 115, 120], target: [4, 0, -6], fov: 42},
    {u: 1, pos: [48, 92, 138], target: [-8, 0, -14], fov: 42},
  ],
  // Travelling au ras du sol, palmiers et montagnes au fond
  sol_travelling: (g) => {
    const y = (x: number, z: number, o: number) => g.height(x, z) + o;
    return [
      {u: 0, pos: [27, y(27, 22, 2.4), 22], target: [-2, 9, -60], fov: 50},
      {u: 1, pos: [20, y(20, 13, 2.1), 13], target: [-8, 9, -60], fov: 50},
    ];
  },
  sol_pions: (g) => {
    const y = (x: number, z: number, o: number) => g.height(x, z) + o;
    return [
      {u: 0, pos: [19, y(19, 11, 2.0), 11], target: [2, 5, -40], fov: 50},
      {u: 1, pos: [17.5, y(17.5, 7.5, 1.8), 7.5], target: [0, 5, -40], fov: 50},
    ];
  },
  // Plan au sol près du fleuve, compteur revenu à 0
  sol_fleuve: (g) => {
    const y = (x: number, z: number, o: number) => g.height(x, z) + o;
    return [
      {u: 0, pos: [12, y(12, 26, 2.4), 26], target: [-42, 5, -8], fov: 50},
      {u: 1, pos: [9, y(9, 20, 2.2), 20], target: [-44, 5, -16], fov: 50},
    ];
  },
  // Survol du fleuve en plongée (vers le nord)
  fleuve_plongee: () => [
    {u: 0, pos: [-8, 78, 46], target: [-20, 0, -4], fov: 42},
    {u: 1, pos: [-16, 64, 6], target: [-26, 0, -42], fov: 42},
  ],
  // La caméra glisse au-dessus de la palmeraie
  palmeraie: () => [
    {u: 0, pos: [-92, 44, 14], target: [-40, 0, -36], fov: 44},
    {u: 1, pos: [-80, 40, -18], target: [-28, 0, -62], fov: 44},
  ],
  // Plan au sol devant le drapeau blanc (contre-plongée légère, poussée lente)
  sol_drapeau: (g) => {
    const [fx, fz] = g.preset.lieux.drapeau;
    const h = g.height(fx, fz);
    return [
      {u: 0, pos: [fx + 4.5, h + 1.5, fz + 14], target: [fx + 1.2, h + 4.6, fz], fov: 46},
      {u: 1, pos: [fx + 2.2, h + 1.4, fz + 10.5], target: [fx + 1.0, h + 4.7, fz], fov: 46},
    ];
  },
  // Survol du fleuve pour l'annonce du vote
  fleuve_survol: () => [
    {u: 0, pos: [34, 52, 64], target: [-8, 0, 2], fov: 42},
    {u: 1, pos: [10, 46, 44], target: [-20, 0, -22], fov: 42},
  ],
  lieu_A: (g) => {
    const [x, z] = g.preset.lieux.A;
    return [
      {u: 0, pos: [x + 34, 48, z + 44], target: [x, 0, z - 1], fov: 42},
      {u: 1, pos: [x + 25, 40, z + 34], target: [x - 1, 0, z - 2], fov: 42},
    ];
  },
  lieu_B: (g) => {
    const [x, z] = g.preset.lieux.B;
    return [
      {u: 0, pos: [x - 36, 48, z + 42], target: [x + 2, 0, z - 1], fov: 42},
      {u: 1, pos: [x - 27, 40, z + 33], target: [x + 3, 0, z - 2], fov: 42},
    ];
  },
  // Vue zénithale avec les deux épingles (les cartes A vs B occupent le bas)
  zenith_vote: (g) => {
    const [ax, az] = g.preset.lieux.A;
    const [bx, bz] = g.preset.lieux.B;
    const cx = (ax + bx) / 2;
    const cz = (az + bz) / 2;
    return [
      {u: 0, pos: [cx, 255, cz + 40], target: [cx, 0, cz + 36], up: DOWN, fov: 40},
      {u: 1, pos: [cx, 232, cz + 38], target: [cx, 0, cz + 34], up: [0.05, 0, -1], fov: 40},
    ];
  },
  // Remontée vers les nuages
  remontee: (g) => {
    const [ax, az] = g.preset.lieux.A;
    const [bx, bz] = g.preset.lieux.B;
    const cx = (ax + bx) / 2;
    const cz = (az + bz) / 2;
    return [
      {u: 0, pos: [cx, 232, cz + 38], target: [cx, 0, cz + 34], up: [0.05, 0, -1], fov: 40},
      {u: 0.55, pos: [cx - 6, 470, cz + 24], target: [cx - 6, 0, cz + 20], up: DOWN, fov: 40},
      {u: 1, pos: [cx - 10, 700, cz + 14], target: [cx - 10, 0, cz + 10], up: [-0.1, 0, -1], fov: 40},
    ];
  },
};

/** Convertit les plans de la timeline en keyframes absolues pour le CameraRig. */
export function cameraKeys(tl: Timeline, geo: Geography): CamKey[] {
  const keys: CamKey[] = [];
  tl.shots.forEach((s) => {
    const fn = SHOTS[s.plan];
    if (!fn) throw new Error(`Plan caméra inconnu : ${s.plan}`);
    const ks = fn(geo);
    const len = Math.max(1, s.end - s.start - 1);
    ks.forEach((k) => keys.push({f: s.start + k.u * len, pos: k.pos, target: k.target, up: k.up, fov: k.fov}));
  });
  return keys;
}

const cam = new THREE.PerspectiveCamera();
const m4 = new THREE.Matrix4();
const v = new THREE.Vector3();

/** Projette un point monde en pixels écran (null s'il est derrière la caméra). */
export function project(keys: CamKey[], frame: number, p: V3, width: number, height: number) {
  const c = cameraAt(keys, frame);
  cam.fov = c.fov;
  cam.aspect = width / height;
  cam.near = 1;
  cam.far = 4000;
  cam.updateProjectionMatrix();
  cam.position.set(...c.pos);
  m4.lookAt(cam.position, new THREE.Vector3(...c.target), new THREE.Vector3(...c.up).normalize());
  cam.quaternion.setFromRotationMatrix(m4);
  cam.updateMatrixWorld(true);
  v.set(...p).project(cam);
  if (v.z > 1) return null;
  return {x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height};
}

export const cameraPosAt = (keys: CamKey[], frame: number) => cameraAt(keys, frame).pos;
