import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {mulberry32, range} from '../lib/prng';
import {clamp01, easeOutElastic, smoothstep} from '../lib/easing';
import type {Geography} from '../world/geography';

// ---------- Matériau fantôme : blanc translucide (opacité ~0,35) + contour lumineux

export function makeGhostMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {uOpacity: {value: 1}},
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){
        vUv = uv;
        mat4 m = modelMatrix;
        #ifdef USE_INSTANCING
          m = modelMatrix * instanceMatrix;
        #endif
        vec4 wp = m * vec4(position, 1.0);
        vN = normalize(mat3(m) * normal);
        vV = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){
        float e = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        float edge = 1.0 - smoothstep(0.02, 0.07, e);
        float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
        vec3 base = mix(vec3(0.93, 0.97, 1.0), vec3(0.75, 0.9, 1.0), rim);
        float a = 0.33 + rim * 0.25 + edge * 0.55;
        gl_FragColor = vec4(mix(base, vec3(1.0), edge), a * uOpacity);
      }`,
  });
}

// ---------- Géométries de bâtiments (UV par face -> contour sur chaque arête)

export function houseGeometry() {
  const body = new THREE.BoxGeometry(1, 0.8, 1);
  body.translate(0, 0.4, 0);
  const roof = new THREE.CylinderGeometry(0, 0.82, 0.55, 4, 1);
  roof.rotateY(Math.PI / 4);
  roof.scale(1.05, 1, 1.05);
  roof.translate(0, 1.07, 0);
  return mergeGeometries([body, roof])!;
}

export function towerGeometry() {
  const g = new THREE.BoxGeometry(1, 1, 1);
  g.translate(0, 0.5, 0);
  return g;
}

export function millGeometry() {
  const tower = new THREE.CylinderGeometry(0.5, 0.8, 2.6, 8);
  tower.translate(0, 1.3, 0);
  const cap = new THREE.ConeGeometry(0.65, 0.7, 8);
  cap.translate(0, 2.95, 0);
  const parts: THREE.BufferGeometry[] = [tower, cap];
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.BoxGeometry(0.28, 1.9, 0.05);
    blade.translate(0, 1.0, 0);
    blade.rotateZ((i * Math.PI) / 2 + 0.3);
    blade.translate(0, 2.6, 0.75);
    parts.push(blade);
  }
  return mergeGeometries(parts.map((p) => p.toNonIndexed()))!;
}

export function marketGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  for (const [x, z] of [
    [-1.4, -0.9],
    [1.4, -0.9],
    [-1.4, 0.9],
    [1.4, 0.9],
  ]) {
    const post = new THREE.BoxGeometry(0.15, 1.3, 0.15);
    post.translate(x, 0.65, z);
    parts.push(post);
  }
  const roof = new THREE.CylinderGeometry(0.2, 2.2, 0.9, 4, 1);
  roof.rotateY(Math.PI / 4);
  roof.scale(1.15, 1, 0.75);
  roof.translate(0, 1.75, 0);
  parts.push(roof);
  const stall = new THREE.BoxGeometry(2.4, 0.5, 0.5);
  stall.translate(0, 0.25, 0);
  parts.push(stall);
  return mergeGeometries(parts.map((p) => p.toNonIndexed()))!;
}

export function fieldGeometry() {
  const g = new THREE.BoxGeometry(1, 0.12, 1);
  g.translate(0, 0.06, 0);
  return g;
}

// ---------- Rendu instancié générique avec pop élastique décalé

export type GhostItem = {x: number; y: number; z: number; sx: number; sy: number; sz: number; ry: number; delay: number};

export const GhostInstances: React.FC<{
  geometry: THREE.BufferGeometry;
  items: GhostItem[];
  /** frames écoulées depuis l'apparition */
  t: number;
  /** 1 = visible, 0 = disparu (sortie) */
  presence: number;
  popFrames?: number;
}> = ({geometry, items, t, presence, popFrames = 18}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => makeGhostMaterial(), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    items.forEach((it, i) => {
      const k = easeOutElastic(clamp01((t - it.delay) / popFrames)) * presence;
      o.position.set(it.x, it.y, it.z);
      o.rotation.set(0, it.ry, 0);
      o.scale.set(Math.max(1e-3, it.sx * (0.4 + 0.6 * k) * (k > 0 ? 1 : 0)), Math.max(1e-3, it.sy * k), Math.max(1e-3, it.sz * (0.4 + 0.6 * k) * (k > 0 ? 1 : 0)));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    mat.uniforms.uOpacity.value = presence;
  }, [items, t, presence, popFrames, mat]);
  if (!items.length) return null;
  return <instancedMesh ref={ref} args={[geometry, mat, items.length]} frustumCulled={false} renderOrder={2} />;
};

// ---------- Ville fantôme (ligne 5) : des centaines d'immeubles qui poussent en vague

export function ghostCityItems(geo: Geography, seed: number, fps: number): GhostItem[] {
  const rng = mulberry32(seed + 55);
  const R = geo.preset.oasis.radius;
  const items: GhostItem[] = [];
  const origin = {x: 20, z: 30};
  for (let i = 0; i < 3000 && items.length < 520; i++) {
    const x = range(rng, -R, R);
    const z = range(rng, -R, R);
    const s = geo.sample(x, z);
    if (s.oasis < 0.85 || s.riverDist < s.riverHalfW + 2 || s.lakeDist < 3) continue;
    if (items.some((b) => Math.abs(b.x - x) < 4.2 && Math.abs(b.z - z) < 4.2)) continue;
    const d = Math.hypot(x - origin.x, z - origin.z);
    const center = smoothstep(R, 0, Math.hypot(x, z));
    const w = range(rng, 2.4, 3.6);
    items.push({
      x,
      y: s.h,
      z,
      sx: w,
      sy: range(rng, 4, 9) + center * range(rng, 6, 22),
      sz: w * range(rng, 0.8, 1.2),
      ry: Math.round(rng() * 4) * (Math.PI / 2) + 0.12,
      delay: (d / (R * 2)) * fps * 1.6 + rng() * 6,
    });
  }
  return items;
}

// ---------- Villages fantômes des lieux A et B (lignes 17-18)

export type Village = {houses: GhostItem[]; extra: GhostItem[]; extraKind: 'mill' | 'market'; fields: GhostItem[]};

export function villageItems(geo: Geography, lieu: 'A' | 'B', seed: number): Village {
  const [cx, cz] = geo.preset.lieux[lieu];
  const rng = mulberry32(seed + (lieu === 'A' ? 11 : 23));
  const houses: GhostItem[] = [];
  const fields: GhostItem[] = [];
  let n = 0;
  for (let i = 0; i < 400 && houses.length < 13; i++) {
    const a = rng() * Math.PI * 2;
    const r = 2.5 + Math.sqrt(rng()) * 9.5;
    const x = cx + Math.cos(a) * r;
    const z = cz + Math.sin(a) * r;
    if (houses.some((h) => Math.hypot(h.x - x, h.z - z) < 3.2)) continue;
    if (lieu === 'A' && x < cx - 4 && z > cz - 2) continue; // champs à l'ouest, vers le fleuve
    const s = geo.sample(x, z);
    if (s.riverDist < s.riverHalfW + 1.5 || s.lakeDist < 2) continue;
    const sz = range(rng, 1.8, 2.4);
    houses.push({x, y: s.h, z, sx: sz, sy: sz * range(rng, 0.9, 1.3), sz: sz * 1.15, ry: rng() * Math.PI, delay: n++ * 2.2});
  }
  const extraPos: [number, number] = lieu === 'A' ? [cx - 3, cz + 10] : [cx + 1, cz + 1];
  const es = geo.sample(extraPos[0], extraPos[1]);
  const extra: GhostItem[] = [
    {x: extraPos[0], y: es.h, z: extraPos[1], sx: 1.8, sy: 1.8, sz: 1.8, ry: lieu === 'A' ? 0.6 : 0.2, delay: n * 2.2 + 4},
  ];
  if (lieu === 'A') {
    for (let k = 0; k < 4; k++) {
      const x = cx - 9 + (k % 2) * 7.5;
      const z = cz + 6 + Math.floor(k / 2) * 7.5;
      const s = geo.sample(x, z);
      fields.push({x, y: s.h, z, sx: 6.5, sy: 1, sz: 6.5, ry: 0.15, delay: 10 + k * 3});
    }
  }
  return {houses, extra, extraKind: lieu === 'A' ? 'mill' : 'market', fields};
}
