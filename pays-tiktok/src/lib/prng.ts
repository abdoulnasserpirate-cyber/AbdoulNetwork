// PRNG seedé (mulberry32) + bruit de Perlin 2D déterministe.
// Règle du moteur : jamais de Math.random(). Tout passe par ici.

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const range = (rng: Rng, min: number, max: number) => min + (max - min) * rng();
export const pick = <T>(rng: Rng, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];

export type Noise2D = (x: number, y: number) => number;

/** Bruit de Perlin 2D, sortie ~[-1, 1]. */
export function makeNoise2D(seed: number): Noise2D {
  const rng = mulberry32(seed);
  const p = Array.from({length: 256}, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const gx = [1, -1, 1, -1, 1.4142, -1.4142, 0, 0];
  const gy = [1, 1, -1, -1, 0, 0, 1.4142, -1.4142];
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const grad = (h: number, x: number, y: number) => {
    const g = h & 7;
    return gx[g] * x + gy[g] * y;
  };
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[X] + Y];
    const ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y];
    const bb = perm[perm[X + 1] + Y + 1];
    const x1 = grad(aa, xf, yf) + u * (grad(ba, xf - 1, yf) - grad(aa, xf, yf));
    const x2 = grad(ab, xf, yf - 1) + u * (grad(bb, xf - 1, yf - 1) - grad(ab, xf, yf - 1));
    return (x1 + v * (x2 - x1)) * 0.7071;
  };
}

export function fbm(n: Noise2D, x: number, y: number, octaves = 4, lac = 2, gain = 0.5) {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * n(x * freq, y * freq);
    norm += amp;
    amp *= gain;
    freq *= lac;
  }
  return sum / norm;
}

/** Bruit "ridged" pour des crêtes de montagnes, sortie [0, 1]. */
export function ridged(n: Noise2D, x: number, y: number, octaves = 5) {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let prev = 1;
  for (let i = 0; i < octaves; i++) {
    let v = 1 - Math.abs(n(x * freq, y * freq));
    v *= v;
    sum += v * amp * prev;
    prev = v;
    amp *= 0.5;
    freq *= 2.1;
  }
  return Math.min(1, sum);
}
