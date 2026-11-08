import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {mulberry32, range} from '../lib/prng';

export type CloudSpec = {x: number; y: number; z: number; s: number};

/** Gros nuages cotonneux : chaque nuage = grappe de sphères (une seule InstancedMesh). */
export const Clouds: React.FC<{clouds: CloudSpec[]; seed: number; drift?: number; opacity?: number}> = ({
  clouds,
  seed,
  drift = 0,
  opacity = 1,
}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const puffs = useMemo(() => {
    const rng = mulberry32(seed);
    const out: {x: number; y: number; z: number; r: number}[] = [];
    clouds.forEach((c) => {
      const n = 7 + Math.floor(rng() * 6);
      for (let i = 0; i < n; i++) {
        const a = rng() * Math.PI * 2;
        const d = Math.sqrt(rng()) * 1.6;
        const r = range(rng, 0.7, 1.25) * (1.2 - d * 0.25);
        out.push({x: c.x + Math.cos(a) * d * c.s * 1.5, y: c.y + range(rng, -0.1, 0.5) * c.s, z: c.z + Math.sin(a) * d * c.s, r: r * c.s});
      }
    });
    return out;
  }, [clouds, seed]);
  const geom = useMemo(() => new THREE.IcosahedronGeometry(1, 2), []);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#eef4ff',
        emissiveIntensity: 0.35,
        roughness: 1,
        transparent: opacity < 1,
        opacity,
      }),
    [opacity],
  );
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    puffs.forEach((p, i) => {
      o.position.set(p.x + drift, p.y, p.z);
      o.scale.set(p.r, p.r * 0.8, p.r);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [puffs, drift]);
  if (!puffs.length) return null;
  return <instancedMesh ref={ref} args={[geom, mat, puffs.length]} frustumCulled={false} />;
};

/** Couches de nuages par défaut : une ceinture basse autour de l'oasis + un plafond haut pour la plongée. */
export function defaultClouds(seed: number, low = true): CloudSpec[] {
  const rng = mulberry32(seed + 3);
  const out: CloudSpec[] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + range(rng, -0.2, 0.2);
    const r = range(rng, 115, 175);
    const c = {x: Math.cos(a) * r, y: range(rng, 55, 85), z: Math.sin(a) * r, s: range(rng, 9, 15)};
    if (low) out.push(c);
  }
  for (let i = 0; i < 26; i++) {
    out.push({x: range(rng, -140, 140), y: range(rng, 460, 540), z: range(rng, -170, 170), s: range(rng, 16, 26)});
  }
  return out;
}
