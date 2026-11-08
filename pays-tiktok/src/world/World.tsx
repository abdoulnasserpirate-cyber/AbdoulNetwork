import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {useVideoConfig} from 'remotion';
import {getGeography} from './geography';
import {getUnivers} from './univers';
import {Terrain} from './Terrain';
import {Water} from './Water';
import {Vegetation, type Clearing} from './Vegetation';
import {Clouds, defaultClouds} from './Clouds';
import {CameraRig, type CamKey} from './CameraRig';

const SkyDome: React.FC<{top: string; bottom: string}> = ({top, bottom}) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {top: {value: new THREE.Color(top)}, bottom: {value: new THREE.Color(bottom)}},
        vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 top; uniform vec3 bottom; varying vec3 vP;
          void main(){ float t = smoothstep(-0.05, 0.45, vP.y); gl_FragColor = vec4(mix(bottom, top, t), 1.0);
          #include <colorspace_fragment>
          }`,
      }),
    [top, bottom],
  );
  return (
    <mesh material={mat} renderOrder={-1}>
      <sphereGeometry args={[3000, 32, 16]} />
    </mesh>
  );
};

export type WorldProps = {
  univers?: string;
  seed?: number;
  camera: CamKey[];
  clearings?: Clearing[];
  /** 0 = lumière normale, 1 = ambiance dramatique (conflit, « le plus liké gagne ») */
  drama?: number;
  cloudDrift?: number;
  /** ceinture de nuages bas autour de l'oasis (plans aériens) */
  lowClouds?: boolean;
  children?: React.ReactNode;
};

/** Monde 3D complet (terrain + eau + végétation + nuages + lumière) dans un ThreeCanvas Remotion. */
export const World: React.FC<WorldProps> = ({
  univers = 'oasis',
  seed = 2026,
  camera,
  clearings,
  drama = 0,
  cloudDrift = 0,
  lowClouds = true,
  children,
}) => {
  const {width, height} = useVideoConfig();
  const preset = getUnivers(univers);
  const geo = useMemo(() => getGeography(preset, seed), [preset, seed]);
  const clouds = useMemo(() => defaultClouds(seed, lowClouds), [seed, lowClouds]);
  const p = preset.palette;
  const sunI = 2.6 - drama * 1.3;
  const fogColor = new THREE.Color(p.fog).lerp(new THREE.Color('#5a4a52'), drama * 0.6);

  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows
      flat
      gl={{antialias: true, preserveDrawingBuffer: true}}
      style={{position: 'absolute', inset: 0}}
    >
      <CameraRig keys={camera} aspect={width / height} />
      <fog attach="fog" args={[fogColor, 420, 1500]} />
      <SkyDome top={'#' + new THREE.Color(p.sky).lerp(new THREE.Color('#5d6a8c'), drama).getHexString()} bottom={'#' + new THREE.Color('#fbe8c4').lerp(new THREE.Color('#b9a08a'), drama).getHexString()} />
      <hemisphereLight args={['#cfe9ff', '#e7c48a', 1.15 - drama * 0.5]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[-210, 170, 110]}
        intensity={sunI}
        color={new THREE.Color('#fff2da').lerp(new THREE.Color('#ffb070'), drama)}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-190}
        shadow-camera-right={190}
        shadow-camera-top={190}
        shadow-camera-bottom={-190}
        shadow-camera-near={10}
        shadow-camera-far={700}
        shadow-bias={-0.0006}
        shadow-normalBias={0.4}
      />
      <Terrain geo={geo} />
      <Water geo={geo} />
      <Vegetation geo={geo} seed={seed} clearings={clearings} />
      <Clouds clouds={clouds} seed={seed} drift={cloudDrift} />
      {children}
    </ThreeCanvas>
  );
};
