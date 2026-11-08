import React, {useMemo} from 'react';
import * as THREE from 'three';
import {fbm, makeNoise2D} from '../lib/prng';
import {clamp01, smoothstep} from '../lib/easing';
import type {Geography} from './geography';

const INNER = 560; // zone détaillée (oasis + fleuve + montagnes proches)
const INNER_SEG = 320;
const OUTER = 3200; // désert lointain jusqu'à l'horizon
const OUTER_SEG = 160;

const mix = (out: THREE.Color, a: THREE.Color, b: THREE.Color, t: number) => out.copy(a).lerp(b, clamp01(t));

function buildTerrain(geo: Geography, size: number, seg: number, outer: boolean) {
  const g = new THREE.PlaneGeometry(size, size, seg, seg);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const samples = new Array(pos.count);
  const half = INNER / 2 - 12;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const s = geo.sample(x, z);
    samples[i] = s;
    let y = s.h;
    // Le maillage lointain passe sous le maillage détaillé pour ne jamais le recouvrir.
    if (outer && Math.abs(x) < half && Math.abs(z) < half) y -= 40;
    pos.setY(i, y);
  }
  g.computeVertexNormals();
  const nrm = g.attributes.normal as THREE.BufferAttribute;

  const p = geo.preset.palette;
  const C = (hex: string) => new THREE.Color(hex);
  const grass = C(p.grass);
  const grassDark = C(p.grassDark);
  const grassLight = C(p.grassLight);
  const sand = C(p.sand);
  const sandDark = C(p.sandDark);
  const sandLight = C(p.sandLight);
  const beach = C(p.beach);
  const rock = C(p.rock);
  const rockDark = C(p.rockDark);
  const rockLight = C(p.rockLight);
  const noise = makeNoise2D(4242);

  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const tmp = new THREE.Color();
  const tmp2 = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const s = samples[i];
    const ny = nrm.getY(i);
    const v = fbm(noise, x * 0.04, z * 0.04, 3);

    // Sable des dunes (côtés au vent plus clairs)
    mix(c, sandDark, sandLight, 0.55 + v * 0.8 + nrm.getX(i) * 0.6);
    c.lerp(sand, 0.35);

    // Roche ocre stratifiée
    const strata = 0.5 + 0.5 * Math.sin(s.h * 0.32 + v * 2.2);
    mix(tmp, rockDark, rock, strata * 1.4);
    if (strata > 0.7) tmp.lerp(rockLight, (strata - 0.7) * 2.5);
    tmp.lerp(rockDark, smoothstep(0.75, 0.45, ny) * 0.5);
    c.lerp(tmp, smoothstep(0.15, 0.55, s.mountain + (1 - ny) * 0.4 * s.mountain));

    // Ruban vert le long du fleuve dans le désert
    const riparian = smoothstep(s.riverHalfW + 9, s.riverHalfW + 2, s.riverDist) * smoothstep(0.7, 0.9, ny);
    // Herbe de l'oasis
    const green = Math.max(s.oasis, riparian * 0.9);
    mix(tmp2, grassDark, grassLight, 0.5 + v * 1.3);
    tmp2.lerp(grass, 0.4);
    c.lerp(tmp2, smoothstep(0.35, 0.75, green));

    // Plages claires au bord de l'eau
    const nearRiver = smoothstep(s.riverHalfW + 2.4, s.riverHalfW + 0.6, s.riverDist);
    const nearLake = smoothstep(4.5, 1.2, s.lakeDist);
    const wet = Math.max(nearRiver, nearLake) * (1 - s.mountain) * smoothstep(1.4, 0.6, s.h);
    c.lerp(beach, wet);
    if (s.h < -0.2) c.lerp(sandDark, 0.6);

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return g;
}

export const Terrain: React.FC<{geo: Geography}> = ({geo}) => {
  const inner = useMemo(() => buildTerrain(geo, INNER, INNER_SEG, false), [geo]);
  const outer = useMemo(() => buildTerrain(geo, OUTER, OUTER_SEG, true), [geo]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({vertexColors: true, flatShading: false, roughness: 1, metalness: 0}),
    [],
  );
  return (
    <group>
      <mesh geometry={inner} material={mat} receiveShadow castShadow />
      <mesh geometry={outer} material={mat} receiveShadow />
    </group>
  );
};
