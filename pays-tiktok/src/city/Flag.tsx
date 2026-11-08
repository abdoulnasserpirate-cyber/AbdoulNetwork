import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';

/** Texture du drapeau : SVG voté (string) ou drapeau blanc avec « ? ». */
function useFlagTexture(svg: string | null) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 340;
    const ctx = canvas.getContext('2d')!;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    if (svg) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 512, 340);
        tex.needsUpdate = true;
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    } else {
      ctx.fillStyle = '#f6f7f8';
      ctx.fillRect(0, 0, 512, 340);
      ctx.fillStyle = '#b9bec5';
      ctx.font = 'bold 230px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', 256, 182);
    }
    tex.needsUpdate = true;
    return tex;
  }, [svg]);
}

/**
 * Drapeau sur mât, toile animée par déformation sinusoïdale (pilotée par la frame).
 * `rise` (0..1) fait monter le drapeau en haut du mât.
 */
export const Flag: React.FC<{
  position: [number, number, number];
  frame: number;
  svg?: string | null;
  height?: number;
  width?: number;
  rotationY?: number;
  scale?: number;
}> = ({position, frame, svg = null, height = 6.5, width = 3.4, rotationY = 0, scale = 1}) => {
  const tex = useFlagTexture(svg);
  const clothH = width * (340 / 512);
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, clothH, 24, 12);
    g.translate(width / 2, 0, 0);
    return g;
  }, [width, clothH]);
  const base = useMemo(() => Float32Array.from(geom.attributes.position.array as Float32Array), [geom]);
  const ref = useRef<THREE.Mesh>(null);
  useLayoutEffect(() => {
    const pos = geom.attributes.position as THREE.BufferAttribute;
    const t = frame / 30;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const k = x / width; // 0 au mât -> 1 au bout
      const wave = Math.sin(x * 1.9 - t * 6.5 + y * 0.6) * 0.32 * k + Math.sin(x * 3.7 - t * 9.1) * 0.08 * k;
      pos.setXYZ(i, x - Math.abs(wave) * 0.15, y - k * k * 0.18, wave);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
  }, [frame, geom, base, width]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({map: tex, side: THREE.DoubleSide, roughness: 0.8}),
    [tex],
  );
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, height, 8]} />
        <meshStandardMaterial color="#8a5a32" roughness={0.7} />
      </mesh>
      <mesh position={[0, height + 0.08, 0]}>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshStandardMaterial color="#e6c15a" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh ref={ref} geometry={geom} material={mat} position={[0.05, height - clothH / 2 - 0.1, 0]} castShadow />
    </group>
  );
};
