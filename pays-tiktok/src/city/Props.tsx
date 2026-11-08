import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {clamp01, easeOutBack} from '../lib/easing';

/** Cercle au sol (marqueurs A/B, zones) — anneau blanc lumineux qui s'ouvre. */
export const GroundRing: React.FC<{position: [number, number, number]; radius: number; progress: number; color?: string}> = ({
  position,
  radius,
  progress,
  color = '#ffffff',
}) => {
  const k = easeOutBack(clamp01(progress));
  if (k <= 0.001) return null;
  return (
    <group position={[position[0], position[1] + 0.25, position[2]]} scale={[k, 1, k]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
        <ringGeometry args={[radius - 0.45, radius, 96]} />
        <meshBasicMaterial color={color} transparent opacity={0.85 * clamp01(progress * 2)} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <circleGeometry args={[radius - 0.45, 96]} />
        <meshBasicMaterial color={color} transparent opacity={0.12 * clamp01(progress * 2)} depthWrite={false} />
      </mesh>
    </group>
  );
};

function colored(g: THREE.BufferGeometry, hex: string) {
  const ng = g.index ? g.toNonIndexed() : g;
  ng.deleteAttribute('uv');
  const c = new THREE.Color(hex);
  const arr = new Float32Array(ng.attributes.position.count * 3);
  for (let i = 0; i < arr.length; i += 3) [arr[i], arr[i + 1], arr[i + 2]] = [c.r, c.g, c.b];
  ng.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return ng;
}

/** Chameau low-poly (une géométrie fusionnée, couleurs par sommet). */
export function camelGeometry() {
  const fur = '#c99a5e';
  const dark = '#a8783f';
  const p: THREE.BufferGeometry[] = [];
  const body = new THREE.BoxGeometry(1.6, 0.7, 0.7);
  body.translate(0, 1.5, 0);
  p.push(colored(body, fur));
  const hump = new THREE.IcosahedronGeometry(0.45, 0);
  hump.scale(1.1, 0.9, 0.9);
  hump.translate(-0.1, 1.95, 0);
  p.push(colored(hump, dark));
  const neck = new THREE.BoxGeometry(0.28, 0.9, 0.3);
  neck.rotateZ(-0.5);
  neck.translate(0.95, 2.0, 0);
  p.push(colored(neck, fur));
  const head = new THREE.BoxGeometry(0.55, 0.28, 0.3);
  head.translate(1.35, 2.45, 0);
  p.push(colored(head, fur));
  for (const [x, z] of [
    [-0.6, -0.22],
    [-0.6, 0.22],
    [0.6, -0.22],
    [0.6, 0.22],
  ]) {
    const leg = new THREE.BoxGeometry(0.16, 1.2, 0.16);
    leg.translate(x, 0.6, z);
    p.push(colored(leg, dark));
  }
  const blanket = new THREE.BoxGeometry(0.9, 0.08, 0.76);
  blanket.translate(-0.1, 1.86, 0);
  p.push(colored(blanket, '#d8443a'));
  return mergeGeometries(p)!;
}

export type Placed = {x: number; y: number; z: number; ry: number; delay: number; s?: number};

/** Objets instanciés qui apparaissent en pop (chameaux, etc.). */
export const PopInstances: React.FC<{geometry: THREE.BufferGeometry; items: Placed[]; t: number; presence?: number}> = ({
  geometry,
  items,
  t,
  presence = 1,
}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({vertexColors: true, flatShading: true, roughness: 0.85}), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    items.forEach((it, i) => {
      const k = Math.max(1e-4, easeOutBack(clamp01((t - it.delay) / 10)) * presence) * (it.s ?? 1);
      o.position.set(it.x, it.y, it.z);
      o.rotation.set(0, it.ry, 0);
      o.scale.setScalar(k);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [items, t, presence]);
  if (!items.length) return null;
  return <instancedMesh ref={ref} args={[geometry, mat, items.length]} castShadow frustumCulled={false} />;
};
