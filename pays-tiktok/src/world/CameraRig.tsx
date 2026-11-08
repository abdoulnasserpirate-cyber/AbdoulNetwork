import React, {useMemo} from 'react';
import {PerspectiveCamera} from '@react-three/drei';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';
import {easeInOutCubic} from '../lib/easing';

export type V3 = [number, number, number];
export type CamKey = {
  /** frame (relative à la séquence) */
  f: number;
  pos: V3;
  target: V3;
  /** vecteur "haut" — mettre [0,0,-1] pour une vue zénithale nord en haut */
  up?: V3;
  fov?: number;
};

const v = new THREE.Vector3();
const lerpV = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export function cameraAt(keys: CamKey[], frame: number) {
  const ks = [...keys].sort((a, b) => a.f - b.f);
  let a = ks[0];
  let b = ks[0];
  for (let i = 0; i < ks.length; i++) {
    if (ks[i].f <= frame) a = ks[i];
    if (ks[i].f >= frame) {
      b = ks[i];
      break;
    }
    b = ks[i];
  }
  const t = a === b ? 0 : easeInOutCubic(Math.min(1, Math.max(0, (frame - a.f) / (b.f - a.f))));
  return {
    pos: lerpV(a.pos, b.pos, t),
    target: lerpV(a.target, b.target, t),
    up: lerpV(a.up ?? [0, 1, 0], b.up ?? [0, 1, 0], t),
    fov: (a.fov ?? 40) + ((b.fov ?? 40) - (a.fov ?? 40)) * t,
  };
}

/** Caméra drone pilotée par keyframes (easeInOutCubic), uniquement via useCurrentFrame(). */
export const CameraRig: React.FC<{keys: CamKey[]; aspect?: number}> = ({keys, aspect = 1080 / 1920}) => {
  const frame = useCurrentFrame();
  const c = cameraAt(keys, frame);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const m = new THREE.Matrix4().lookAt(
    v.set(...c.pos),
    new THREE.Vector3(...c.target),
    new THREE.Vector3(...c.up).normalize(),
  );
  quat.setFromRotationMatrix(m);
  return (
    <PerspectiveCamera
      makeDefault
      position={c.pos}
      quaternion={quat.clone()}
      fov={c.fov}
      aspect={aspect}
      near={1}
      far={4000}
    />
  );
};
