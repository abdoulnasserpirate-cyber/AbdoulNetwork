// Géographie procédurale : hauteur du terrain + masques (oasis, fleuve, lac, montagnes).
// Fonction pure et déterministe (seed + preset) : la carte est identique chaque jour.

import {fbm, makeNoise2D, ridged} from '../lib/prng';
import {lerp, smoothstep} from '../lib/easing';
import type {UniversPreset, Vec2} from './univers';

export type Sample = {
  h: number;
  oasis: number; // 0..1
  mountain: number; // 0..1
  riverDist: number; // distance au centre du fleuve
  riverT: number; // 0 = source, 1 = lac
  riverHalfW: number;
  lakeDist: number; // < 0 dans le lac
};

export type Geography = {
  preset: UniversPreset;
  sample: (x: number, z: number) => Sample;
  height: (x: number, z: number) => number;
  /** Polyligne échantillonnée du fleuve, avec niveau d'eau. */
  riverPts: {x: number; z: number; t: number; y: number; halfW: number}[];
  waterLevel: number;
};

const cache = new Map<string, Geography>();

function catmull(points: Vec2[], perSeg: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    for (let s = 0; s < perSeg; s++) {
      const t = s / perSeg;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

export function getGeography(preset: UniversPreset, seed: number): Geography {
  const key = `${preset.id}:${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const n1 = makeNoise2D(seed);
  const n2 = makeNoise2D(seed + 17);
  const n3 = makeNoise2D(seed + 101);
  const [ocx, ocz] = preset.oasis.center;
  const R = preset.oasis.radius;
  const [lcx, lcz] = preset.lake.center;
  const LR = preset.lake.radius;
  const MZ = preset.mountainsZ;
  const WATER = 0;

  // --- Fleuve : polyligne + niveau d'eau qui descend des montagnes.
  const raw = catmull(preset.river, 14);
  let total = 0;
  const lens = [0];
  for (let i = 1; i < raw.length; i++) {
    total += Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]);
    lens.push(total);
  }
  const waterYAtZ = (z: number) => (z < MZ + 4 ? (MZ + 4 - z) * 0.2 : 0) + WATER;
  const riverPts = raw.map(([x, z], i) => {
    const t = lens[i] / total;
    return {x, z, t, y: waterYAtZ(z), halfW: lerp(2.6, 4.6, smoothstep(0, 0.75, t))};
  });

  const mountainMask = (x: number, z: number) =>
    smoothstep(MZ, MZ - 60, z - Math.min(Math.abs(x), 160) * 0.42 + fbm(n2, x * 0.01, 0.37, 3) * 30);

  const sample = (x: number, z: number): Sample => {
    // Désert : dunes en crêtes orientées + ondulations
    const warp = fbm(n1, x * 0.006, z * 0.006, 3) * 60;
    const ridge = Math.sin((x * 0.55 + z * 0.84 + warp) * 0.085);
    const dune = Math.pow(ridge * 0.5 + 0.5, 2.2) * 13;
    let h = 4 + dune + fbm(n1, x * 0.018 + 40, z * 0.018, 4) * 3.5;

    // Montagnes rocheuses ocre au nord
    const mtn = mountainMask(x, z);
    h += mtn * (18 + 70 * ridged(n3, x * 0.011, z * 0.011, 5));

    // Fleuve : distance à la polyligne
    let best = Infinity;
    let bt = 0;
    let by = 0;
    let bw = 3;
    for (let i = 0; i < riverPts.length - 1; i++) {
      const a = riverPts[i];
      const b = riverPts[i + 1];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const l2 = dx * dx + dz * dz;
      let u = ((x - a.x) * dx + (z - a.z) * dz) / l2;
      u = u < 0 ? 0 : u > 1 ? 1 : u;
      const px = a.x + dx * u - x;
      const pz = a.z + dz * u - z;
      const d = px * px + pz * pz;
      if (d < best) {
        best = d;
        bt = lerp(a.t, b.t, u);
        by = lerp(a.y, b.y, u);
        bw = lerp(a.halfW, b.halfW, u);
      }
    }
    const riverDist = Math.sqrt(best);

    // Oasis : cuvette verte au bord irrégulier
    const d = Math.hypot(x - ocx, z - ocz) + fbm(n2, x * 0.03, z * 0.03, 3) * 12;
    const oasis = smoothstep(R + 16, R - 4, d);
    const floor = 0.7 + fbm(n1, x * 0.05, z * 0.05, 3) * 0.7;
    h = lerp(h, floor, oasis);

    // Lit du fleuve creusé dans le terrain ; gorge plus raide en montagne
    const slope = lerp(0.3, 1.5, mtn) + (1 - oasis) * 0.25;
    const riverSurf =
      riverDist < bw
        ? lerp(by - 1.8, by - 0.25, Math.pow(riverDist / bw, 2))
        : by + 0.25 + (riverDist - bw) * slope;
    h = Math.min(h, riverSurf);

    // Lac + plage
    const ang = Math.atan2(z - lcz, x - lcx);
    const lr = LR + 3 * Math.sin(ang * 3 + 1) + 1.6 * Math.sin(ang * 5 + 2);
    const lakeDist = Math.hypot(x - lcx, z - lcz) - lr;
    const lakeSurf = lakeDist < 0 ? lerp(-0.25, -2.6, smoothstep(0, -6, lakeDist)) : 0.25 + lakeDist * 0.22;
    h = Math.min(h, lakeSurf);

    return {h, oasis, mountain: mtn, riverDist, riverT: bt, riverHalfW: bw, lakeDist};
  };

  const geo: Geography = {
    preset,
    sample,
    height: (x, z) => sample(x, z).h,
    riverPts,
    waterLevel: WATER,
  };
  cache.set(key, geo);
  return geo;
}
