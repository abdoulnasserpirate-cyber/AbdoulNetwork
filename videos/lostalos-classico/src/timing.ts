// All times in seconds, measured on the recorded voice-over (scripts/words.json).
export const FPS = 30;
export const DURATION = 42.45;
export const BPM = 129.5;
export const BEAT_OFFSET = 0.28;

export const SCENES = {
  hook: [0, 2.85],
  rivalry: [2.85, 7.6],
  title: [7.6, 10.8],
  date: [10.8, 13.7],
  vibe: [13.7, 19.4],
  djs: [19.4, 23.7],
  vip: [23.7, 27.9],
  dress: [27.9, 32.7],
  cta: [32.7, DURATION],
} as const;

export type SceneKey = keyof typeof SCENES;

// Word onsets used as animation cues.
export const W = {
  samedi: 0.0, classico1: 0.68, commence: 1.16, avant: 1.44, envoi: 2.0,
  real: 2.92, vs: 3.52, barca: 3.82, rivalite: 4.68, seuleNuit: 6.2,
  lostalos: 7.7, presente: 8.68, soiree: 9.56, classico2: 9.98,
  samedi2: 10.9, d24: 11.36, octobre: 11.56, aPartir: 12.46, h23: 12.92,
  lumieres: 13.98, foule: 14.9, bouteilles: 15.72, brillent: 16.26,
  ambiance: 17.08, folie: 17.68, jusquau: 18.0,
  platines: 19.52, djulon: 20.58, papzer: 21.52, vibes: 22.76,
  tables: 23.8, reg: 24.08, vip: 24.44, vvip: 25.54, entree: 26.3, prix: 26.96,
  madrilene: 27.94, maillotReal: 29.22, barcelonais: 30.28, maillotBarca: 31.68,
  reserve: 32.76, maintenant: 33.84, n1: 34.86, n2: 35.96, n3: 37.04, n4: 38.04,
  lostalos2: 39.02, attend: 40.42,
};

// Moments that get a camera kick + flash. Strength 0..1.
export const HITS: [number, number][] = [
  [W.samedi, 0.6], [W.classico1, 0.8], [W.avant, 0.6],
  [W.real, 0.7], [W.vs, 1], [W.barca, 0.7], [W.rivalite, 0.4], [W.seuleNuit, 0.4],
  [SCENES.title[0], 0.9], [W.soiree, 0.6], [W.classico2, 1],
  [W.samedi2, 0.5], [W.d24, 0.7], [W.h23, 0.8],
  [W.lumieres, 0.7], [W.foule, 0.7], [W.bouteilles, 0.7], [W.folie, 1], [W.jusquau, 0.4],
  [W.platines, 0.6], [W.djulon, 0.8], [W.papzer, 0.8], [W.vibes, 0.9],
  [W.tables, 0.5], [W.reg, 0.4], [W.vip, 0.5], [W.vvip, 0.8], [W.prix, 0.9],
  [W.madrilene, 0.7], [W.maillotReal, 0.5], [W.barcelonais, 0.7], [W.maillotBarca, 0.5],
  [W.reserve, 0.9], [W.n1, 0.5], [W.n2, 0.4], [W.n3, 0.4], [W.n4, 0.6],
  [W.lostalos2, 1], [W.attend, 0.7],
];

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const beatPos = (t: number) => (t - BEAT_OFFSET) / (60 / BPM);
// 1 right on the beat, decaying to 0 before the next one.
export const beatPulse = (t: number, sharp = 6) => {
  const b = beatPos(t);
  const ph = b - Math.floor(b);
  return Math.exp(-ph * sharp);
};

export const hitEnvelope = (t: number, decay = 9) => {
  let v = 0;
  for (const [h, s] of HITS) {
    const d = t - h;
    if (d >= 0 && d < 1) v = Math.max(v, s * Math.exp(-d * decay));
  }
  return v;
};

// Ease-out-expo style 0..1 progress from `start` over `dur` seconds.
export const prog = (t: number, start: number, dur = 0.4) => {
  const x = clamp((t - start) / dur);
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
};

export const sceneAt = (t: number): SceneKey => {
  for (const k of Object.keys(SCENES) as SceneKey[]) {
    const [a, b] = SCENES[k];
    if (t >= a && t < b) return k;
  }
  return 'cta';
};
