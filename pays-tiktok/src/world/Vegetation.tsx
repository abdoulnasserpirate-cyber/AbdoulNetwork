import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {mulberry32, range} from '../lib/prng';
import {smoothstep} from '../lib/easing';
import type {Geography} from './geography';

// ---------- Géométries low-poly (une géométrie fusionnée + couleurs par sommet par espèce)

function colored(g: THREE.BufferGeometry, hex: string) {
  const ng = g.index ? g.toNonIndexed() : g;
  ng.deleteAttribute('uv');
  const c = new THREE.Color(hex);
  const arr = new Float32Array(ng.attributes.position.count * 3);
  for (let i = 0; i < arr.length; i += 3) {
    arr[i] = c.r;
    arr[i + 1] = c.g;
    arr[i + 2] = c.b;
  }
  ng.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return ng;
}

export function palmGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  // tronc légèrement courbé en 3 tronçons
  let x = 0;
  for (let i = 0; i < 3; i++) {
    const seg = new THREE.CylinderGeometry(0.17 - i * 0.03, 0.22 - i * 0.03, 1.4, 6);
    seg.rotateZ(-0.08 * (i + 1));
    seg.translate(x, 0.7 + i * 1.3, 0);
    x += 0.1 * (i + 1);
    parts.push(colored(seg, i % 2 ? '#8b5a32' : '#9c6a3c'));
  }
  const top = new THREE.Vector3(x, 4, 0);
  const leaves = 8;
  for (let i = 0; i < leaves; i++) {
    const leaf = new THREE.ConeGeometry(0.4, 2.1, 4, 1);
    leaf.scale(1, 1, 0.25);
    leaf.translate(0, 1.05, 0);
    leaf.rotateX(Math.PI / 2 + (i % 2 ? 0.3 : -0.2)); // palmes qui retombent vers l'extérieur
    leaf.rotateY((i / leaves) * Math.PI * 2 + (i % 2) * 0.3);
    leaf.translate(top.x, top.y, top.z);
    parts.push(colored(leaf, i % 2 ? '#3f9b3a' : '#5bb847'));
  }
  const nuts = new THREE.IcosahedronGeometry(0.28, 0);
  nuts.translate(top.x, top.y - 0.2, top.z);
  parts.push(colored(nuts, '#6b4a24'));
  return mergeGeometries(parts)!;
}

export function baobabGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const trunk = new THREE.CylinderGeometry(0.7, 1.05, 3.6, 7);
  trunk.translate(0, 1.8, 0);
  parts.push(colored(trunk, '#a88a6c'));
  const dirs = [0, 1.3, 2.6, 3.9, 5.2];
  dirs.forEach((a, i) => {
    const br = new THREE.CylinderGeometry(0.14, 0.28, 1.8, 5);
    br.translate(0, 0.9, 0);
    br.rotateZ(0.7);
    br.rotateY(a);
    br.translate(0, 3.4, 0);
    parts.push(colored(br, '#9c7e60'));
    const crown = new THREE.IcosahedronGeometry(1.0 + (i % 2) * 0.2, 0);
    crown.scale(1.2, 0.55, 1.2);
    crown.translate(Math.cos(-a) * 1.4, 4.6, Math.sin(-a) * 1.4);
    parts.push(colored(crown, i % 2 ? '#5d9a3a' : '#6fae44'));
  });
  return mergeGeometries(parts)!;
}

export function acaciaGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const trunk = new THREE.CylinderGeometry(0.1, 0.16, 2.4, 5);
  trunk.rotateZ(0.12);
  trunk.translate(-0.12, 1.2, 0);
  parts.push(colored(trunk, '#7a5430'));
  const crown = new THREE.CylinderGeometry(1.8, 1.3, 0.45, 8);
  crown.translate(-0.25, 2.55, 0);
  parts.push(colored(crown, '#7fa83c'));
  const crown2 = new THREE.CylinderGeometry(1.1, 0.9, 0.35, 7);
  crown2.translate(0.4, 2.9, 0.2);
  parts.push(colored(crown2, '#90b847'));
  return mergeGeometries(parts)!;
}

export function bushGeometry() {
  const a = new THREE.IcosahedronGeometry(0.8, 0);
  a.scale(1, 0.75, 1);
  a.translate(0, 0.45, 0);
  const b = new THREE.IcosahedronGeometry(0.55, 0);
  b.translate(0.6, 0.35, 0.2);
  return mergeGeometries([colored(a, '#4f9e37'), colored(b, '#5fae40')])!;
}

export function rockGeometry() {
  const a = new THREE.DodecahedronGeometry(1, 0);
  a.scale(1.2, 0.7, 1);
  a.translate(0, 0.3, 0);
  return mergeGeometries([colored(a, '#b8865a')])!;
}

// ---------- Placement déterministe

export type Clearing = {x: number; z: number; r: number};
type Inst = {x: number; y: number; z: number; s: number; ry: number; tilt: number; tint: number};

function scatter(geo: Geography, seed: number, clearings: Clearing[]) {
  const rng = mulberry32(seed);
  const palms: Inst[] = [];
  const baobabs: Inst[] = [];
  const acacias: Inst[] = [];
  const bushes: Inst[] = [];
  const rocks: Inst[] = [];
  const R = geo.preset.oasis.radius;
  const [ocx, ocz] = geo.preset.oasis.center;
  const cleared = (x: number, z: number) => clearings.some((c) => Math.hypot(x - c.x, z - c.z) < c.r);
  const mk = (x: number, z: number, h: number, s: number): Inst => ({
    x,
    y: h - 0.15,
    z,
    s,
    ry: rng() * Math.PI * 2,
    tilt: range(rng, -0.12, 0.12),
    tint: range(rng, 0.82, 1.12),
  });

  // Palmeraie de l'oasis : anneau dense au bord + rives du fleuve et du lac
  for (let i = 0; i < 12000; i++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * (R + 14);
    const x = ocx + Math.cos(a) * r;
    const z = ocz + Math.sin(a) * r;
    const s = geo.sample(x, z);
    if (s.oasis < 0.55 || s.h < 0.35) continue;
    if (s.riverDist < s.riverHalfW + 1.4 || s.lakeDist < 2.2) continue;
    if (cleared(x, z)) continue;
    const d = Math.hypot(x - ocx, z - ocz);
    const ring = smoothstep(R - 24, R - 6, d);
    const bank = smoothstep(s.riverHalfW + 9, s.riverHalfW + 2, s.riverDist) + smoothstep(9, 3, s.lakeDist);
    const grove = smoothstep(0.35, 0.65, (Math.sin(x * 0.11) * Math.cos(z * 0.09) + 1) / 2) * 0.12;
    const p = 0.004 + ring * ring * 0.6 + bank * 0.35 + grove * 0.5;
    if (rng() > p) continue;
    if (rng() < 0.84) palms.push(mk(x, z, s.h, range(rng, 0.85, 1.35)));
    else bushes.push(mk(x, z, s.h, range(rng, 0.9, 1.6)));
  }
  // Quelques baobabs majestueux dans les prairies
  for (let i = 0; i < 400 && baobabs.length < 14; i++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * (R - 14);
    const x = ocx + Math.cos(a) * r;
    const z = ocz + Math.sin(a) * r;
    const s = geo.sample(x, z);
    if (s.oasis < 0.9 || s.riverDist < s.riverHalfW + 5 || s.lakeDist < 5 || cleared(x, z)) continue;
    if (baobabs.some((b) => Math.hypot(b.x - x, b.z - z) < 14)) continue;
    baobabs.push(mk(x, z, s.h, range(rng, 1.1, 1.5)));
  }
  // Acacias et rochers dans le désert, ruban vert le long du fleuve
  for (let i = 0; i < 9000; i++) {
    const x = range(rng, -270, 270);
    const z = range(rng, -270, 270);
    const s = geo.sample(x, z);
    if (s.oasis > 0.4 || s.h < 0.3 || cleared(x, z)) continue;
    const riparian = smoothstep(s.riverHalfW + 9, s.riverHalfW + 1.6, s.riverDist);
    // Pas de végétation sur les falaises (évite les objets qui flottent sur les pentes raides)
    if (s.mountain > 0.35) continue;
    if (riparian > 0.2) {
      if (rng() < 0.75) palms.push(mk(x, z, s.h, range(rng, 0.8, 1.2)));
      continue;
    }
    if (rng() < 0.03) acacias.push(mk(x, z, s.h, range(rng, 0.9, 1.5)));
    else if (rng() < 0.015) rocks.push(mk(x, z, s.h, range(rng, 0.8, 2.2)));
  }
  return {palms, baobabs, acacias, bushes, rocks};
}

// ---------- Rendu instancié

const Instances: React.FC<{geometry: THREE.BufferGeometry; items: Inst[]; castShadow?: boolean}> = ({
  geometry,
  items,
  castShadow = true,
}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({vertexColors: true, flatShading: true, roughness: 0.9}), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    items.forEach((it, i) => {
      o.position.set(it.x, it.y, it.z);
      o.rotation.set(it.tilt, it.ry, it.tilt * 0.5);
      o.scale.setScalar(it.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.setScalar(it.tint));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  if (!items.length) return null;
  return <instancedMesh ref={ref} args={[geometry, mat, items.length]} castShadow={castShadow} receiveShadow />;
};

export const Vegetation: React.FC<{geo: Geography; seed: number; clearings?: Clearing[]}> = ({
  geo,
  seed,
  clearings = [],
}) => {
  const key = JSON.stringify(clearings);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const set = useMemo(() => scatter(geo, seed + 7, clearings), [geo, seed, key]);
  const g = useMemo(
    () => ({
      palm: palmGeometry(),
      baobab: baobabGeometry(),
      acacia: acaciaGeometry(),
      bush: bushGeometry(),
      rock: rockGeometry(),
    }),
    [],
  );
  return (
    <group>
      <Instances geometry={g.palm} items={set.palms} />
      <Instances geometry={g.baobab} items={set.baobabs} />
      <Instances geometry={g.acacia} items={set.acacias} />
      <Instances geometry={g.bush} items={set.bushes} />
      <Instances geometry={g.rock} items={set.rocks} />
    </group>
  );
};
