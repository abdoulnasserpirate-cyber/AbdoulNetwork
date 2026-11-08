import React, {useMemo} from 'react';
import * as THREE from 'three';
import type {Geography} from './geography';

/** Lac (plan d'eau global au niveau 0) + ruban du fleuve qui descend des montagnes. */
export const Water: React.FC<{geo: Geography}> = ({geo}) => {
  const p = geo.preset.palette;
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({color: p.water, roughness: 0.35, metalness: 0.05}),
    [p.water],
  );
  const ribbon = useMemo(() => {
    const pts = geo.riverPts;
    const verts: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(pts.length - 1, i + 1)];
      let tx = b.x - a.x;
      let tz = b.z - a.z;
      const l = Math.hypot(tx, tz) || 1;
      tx /= l;
      tz /= l;
      const w = pts[i].halfW + 0.7;
      const y = pts[i].y + 0.04;
      verts.push(pts[i].x - tz * w, y, pts[i].z + tx * w, pts[i].x + tz * w, y, pts[i].z - tx * w);
      if (i > 0) {
        const k = i * 2;
        idx.push(k - 2, k, k - 1, k - 1, k, k + 1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [geo]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, geo.waterLevel - 0.02, 0]} material={mat} receiveShadow>
        <planeGeometry args={[560, 560]} />
      </mesh>
      <mesh geometry={ribbon} material={mat} receiveShadow />
    </group>
  );
};
