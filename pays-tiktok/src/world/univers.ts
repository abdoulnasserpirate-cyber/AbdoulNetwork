// Presets d'univers (Partie B1). La mécanique est identique, seul le décor change.
// Seul `oasis` est implémenté pour l'instant ; les autres presets réutiliseront
// la même structure (palette + géographie) quand on en aura besoin.

export type Vec2 = [number, number];

export type UniversPreset = {
  id: 'oasis' | 'ile' | 'vallee' | 'ciel';
  hookJour1: string;
  palette: {
    sky: string;
    fog: string;
    grass: string;
    grassDark: string;
    grassLight: string;
    sand: string;
    sandDark: string;
    sandLight: string;
    beach: string;
    rock: string;
    rockDark: string;
    rockLight: string;
    water: string;
    waterDeep: string;
  };
  /** Centre et rayon de l'oasis (unités monde). */
  oasis: {center: Vec2; radius: number};
  /** Tracé du fleuve, de la source (montagnes) jusqu'au lac. */
  river: Vec2[];
  lake: {center: Vec2; radius: number};
  /** Les montagnes commencent au nord (z négatif) à partir de cette latitude. */
  mountainsZ: number;
  /** Lieux nommés réutilisés par les épisodes (marqueurs A/B, plans au sol…). */
  lieux: Record<string, Vec2>;
};

export const OASIS: UniversPreset = {
  id: 'oasis',
  hookJour1: 'Et si on créait un pays… en plein désert ?',
  palette: {
    sky: '#8fd0f7',
    fog: '#f2dcb0',
    grass: '#6cc24a',
    grassDark: '#4f9f35',
    grassLight: '#8ad65a',
    sand: '#efc77c',
    sandDark: '#dca85e',
    sandLight: '#f7dc9c',
    beach: '#f3e2b0',
    rock: '#c97b45',
    rockDark: '#9e5631',
    rockLight: '#e09a5e',
    water: '#4aa8e8',
    waterDeep: '#2f86d0',
  },
  oasis: {center: [0, 0], radius: 60},
  river: [
    [-34, -300],
    [-26, -230],
    [-8, -170],
    [-4, -120],
    [-16, -82],
    [-26, -50],
    [-27, -22],
    [-16, 4],
    [0, 20],
    [12, 32],
  ],
  lake: {center: [16, 36], radius: 17},
  mountainsZ: -66,
  lieux: {
    // A : au bord du fleuve (terres fertiles) — B : près des dunes (commerce, caravanes)
    A: [-10, -32],
    B: [40, -14],
    drapeau: [16, 4],
    centre: [0, 0],
  },
};

export const UNIVERS: Record<string, UniversPreset> = {oasis: OASIS};

export const getUnivers = (id: string): UniversPreset => {
  const u = UNIVERS[id];
  if (!u) throw new Error(`Univers « ${id} » pas encore implémenté (disponible : ${Object.keys(UNIVERS).join(', ')})`);
  return u;
};
