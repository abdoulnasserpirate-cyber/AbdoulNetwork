import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {clamp01} from '../lib/easing';

export const PAWN_COLORS = ['#e8423f', '#f5b42a', '#2fbf71', '#8a4fd8', '#2c8ef0', '#ff7a2f', '#1fc2c2', '#ff5fa2'];

/** Pion = capsule + sphère (hauteur ~1,7). */
export function pawnGeometry() {
  const body = new THREE.CapsuleGeometry(0.42, 0.7, 4, 12);
  body.translate(0, 0.78, 0);
  const head = new THREE.SphereGeometry(0.36, 16, 12);
  head.translate(0, 1.72, 0);
  return mergeGeometries([body.toNonIndexed(), head.toNonIndexed()])!;
}

/** Chute depuis le ciel + rebond (sortie : rétrécissement). */
export function fallY(t: number, fall: number) {
  if (t < 0) return null;
  if (t < fall) {
    const k = t / fall;
    return (1 - k * k) * 1; // 1 -> 0 (accélération)
  }
  const b = (t - fall) / (fall * 0.7);
  if (b < 1) return Math.sin(b * Math.PI) * 0.12; // petit rebond
  return 0;
}

export type PawnDrop = {x: number; y: number; z: number; color: string; delay: number};

/** Pions instanciés (jusqu'à 10 000) qui tombent et rebondissent. */
export const Pawns: React.FC<{
  pawns: PawnDrop[];
  t: number;
  fallFrames?: number;
  height?: number;
  presence?: number;
}> = ({pawns, t, fallFrames = 12, height = 30, presence = 1}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geom = useMemo(() => pawnGeometry(), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({roughness: 0.45, metalness: 0}), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    pawns.forEach((p, i) => {
      const lt = t - p.delay;
      const fy = fallY(lt, fallFrames);
      const vis = fy !== null && presence > 0;
      // écrasement au contact du sol
      const land = lt - fallFrames;
      const squash = land >= 0 && land < 6 ? 1 - Math.sin((land / 6) * Math.PI) * 0.22 : 1;
      o.position.set(p.x, p.y + (fy ?? 0) * height, p.z);
      const s = vis ? presence : 0.0001;
      o.scale.set(s * (2 - squash), s * squash, s * (2 - squash));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(p.color));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [pawns, t, fallFrames, height, presence]);
  if (!pawns.length) return null;
  return <instancedMesh ref={ref} args={[geom, mat, pawns.length]} castShadow frustumCulled={false} />;
};

/** Nombre de pions posés au temps t (pour le compteur Population), lissé pour le roulement. */
export function landedCount(pawns: PawnDrop[], t: number, fallFrames = 12) {
  return pawns.reduce((acc, p) => acc + clamp01((t - p.delay - fallFrames + 3) / 5), 0);
}
