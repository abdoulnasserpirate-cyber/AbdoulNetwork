import React, {useMemo} from 'react';
import * as THREE from 'three';
import {mulberry32, range} from '../lib/prng';
import type {Geography} from './geography';

/**
 * Herbe haute ondulante + fleurs éparses pour les plans au sol.
 * Brins instanciés, ondulation calculée dans le shader à partir de uTime (= frame / fps).
 */
export const Grass: React.FC<{
  geo: Geography;
  center: [number, number];
  radius: number;
  count: number;
  time: number;
  seed: number;
}> = ({geo, center, radius, count, time, seed}) => {
  const {blade, offsets, flowers} = useMemo(() => {
    const rng = mulberry32(seed);
    // brin = 2 triangles effilés
    const b = new THREE.BufferGeometry();
    b.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([-0.07, 0, 0, 0.07, 0, 0, -0.04, 0.55, 0.02, 0.04, 0.55, 0.02, 0, 1, 0.06], 3),
    );
    b.setIndex([0, 1, 2, 2, 1, 3, 2, 3, 4]);
    b.computeVertexNormals();
    const off: number[] = [];
    const fl: {x: number; y: number; z: number; c: string}[] = [];
    const cols = ['#ffffff', '#f7d84a', '#e5508a', '#a07cf2', '#ff8f3d'];
    for (let i = 0; i < count; i++) {
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * radius;
      const x = center[0] + Math.cos(a) * r;
      const z = center[1] + Math.sin(a) * r;
      const s = geo.sample(x, z);
      if (s.oasis < 0.6 || s.riverDist < s.riverHalfW + 0.8 || s.lakeDist < 1) continue;
      off.push(x, s.h - 0.05, z, range(rng, 0.6, 1.5), rng() * Math.PI * 2, rng());
      if (rng() < 0.012) fl.push({x, y: s.h + range(rng, 0.35, 0.7), z, c: cols[Math.floor(rng() * cols.length)]});
    }
    return {blade: b, offsets: new Float32Array(off), flowers: fl};
  }, [geo, center, radius, count, seed]);

  const geom = useMemo(() => {
    const g = new THREE.InstancedBufferGeometry();
    g.index = blade.index;
    g.setAttribute('position', blade.attributes.position);
    const data = new THREE.InstancedInterleavedBuffer(offsets, 6);
    g.setAttribute('aOffset', new THREE.InterleavedBufferAttribute(data, 3, 0));
    g.setAttribute('aScale', new THREE.InterleavedBufferAttribute(data, 1, 3));
    g.setAttribute('aRot', new THREE.InterleavedBufferAttribute(data, 1, 4));
    g.setAttribute('aShade', new THREE.InterleavedBufferAttribute(data, 1, 5));
    g.instanceCount = offsets.length / 6;
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(center[0], 0, center[1]), radius + 5);
    return g;
  }, [blade, offsets, center, radius]);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {uTime: {value: 0}},
        vertexShader: /* glsl */ `
          attribute vec3 aOffset; attribute float aScale; attribute float aRot; attribute float aShade;
          uniform float uTime; varying float vH; varying float vShade;
          void main(){
            vec3 p = position;
            float c = cos(aRot), s = sin(aRot);
            p.xz = mat2(c, -s, s, c) * p.xz;
            p *= vec3(1.0, aScale, 1.0) * 1.15;
            float h = position.y;
            float sway = sin(uTime * 1.8 + aOffset.x * 0.35 + aOffset.z * 0.22) * 0.22 + sin(uTime * 3.1 + aOffset.x) * 0.06;
            p.x += sway * h * h;
            p.z += sway * 0.5 * h * h;
            vH = h; vShade = aShade;
            gl_Position = projectionMatrix * viewMatrix * vec4(p + aOffset, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          varying float vH; varying float vShade;
          void main(){
            vec3 base = mix(vec3(0.025, 0.13, 0.015), vec3(0.16, 0.50, 0.06), vH);
            base *= 0.85 + vShade * 0.3;
            gl_FragColor = vec4(base, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  mat.uniforms.uTime.value = time;

  return (
    <group>
      <mesh geometry={geom} material={mat} frustumCulled={false} />
      {flowers.map((f, i) => (
        <mesh key={i} position={[f.x, f.y, f.z]}>
          <icosahedronGeometry args={[0.09, 0]} />
          <meshStandardMaterial color={f.c} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};
