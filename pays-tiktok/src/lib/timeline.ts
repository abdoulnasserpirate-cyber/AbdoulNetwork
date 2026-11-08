// Timeline pilotée par JSON : episodes/jour-XX.json -> lignes, sous-titres, éléments et caméra
// en frames absolues. Les temps viennent de l'audio réel (scripts/sync.mjs) ou, en attendant
// la voix, d'une estimation automatique par nombre de mots.

export type ElementSpec = {
  type: string;
  /** déclenchement sur un mot de la voix off (estimation proportionnelle dans la ligne) */
  mot?: string;
  /** ou décalage en secondes depuis le début de la ligne */
  at?: number;
  /** l'élément reste visible jusqu'à la fin de cette ligne (id) */
  jusqua?: number;
  /** ou durée en secondes */
  duree?: number;
  [k: string]: unknown;
};

export type LineSpec = {
  id: number;
  voix: string;
  /** titre de section en haut (sous le HUD). undefined = on garde le précédent, null = on l'efface */
  titre?: string | null;
  /** narration au milieu-bas, visible pendant la ligne. "/" = retour à la ligne, *mot* = jaune */
  sous_titre?: string | null;
  /** petite ligne sous la narration */
  sous_ligne?: string;
  /** plan caméra (voir scenes/shots.ts). Absent = le plan précédent continue */
  plan?: string;
  elements?: ElementSpec[];
  /** temps réels en secondes (remplis par la synchro audio) */
  debut?: number;
  fin?: number;
};

export type EpisodeSpec = {
  jour: number;
  univers: string;
  seed: number;
  population: number;
  nom: string | null;
  /** fichier dans public/ (ex. "audio/voix-jour-01.wav"), null tant que la voix n'est pas reçue */
  voix: string | null;
  musique?: string | null;
  /** secondes ajoutées après la dernière ligne */
  queue?: number;
  lignes: LineSpec[];
};

export type Line = LineSpec & {start: number; end: number; titreActif: string | null};
export type Element = ElementSpec & {start: number; end: number; ligne: number};
export type Timeline = {
  fps: number;
  duration: number;
  lines: Line[];
  elements: Element[];
  shots: {plan: string; start: number; end: number}[];
};

const WPS = 3.2; // mots par seconde (narration énergique)
const GAP = 0.4; // silence max entre deux lignes après nettoyage

/** Durées estimées tant que l'audio n'est pas là. */
export function estimateTimes(lines: LineSpec[]): {debut: number; fin: number}[] {
  let t = 0.3;
  return lines.map((l) => {
    const words = l.voix.split(/\s+/).filter(Boolean).length;
    const pauses = (l.voix.match(/[…:.?!,]/g) || []).length * 0.12;
    const d = Math.max(1.1, words / WPS + pauses);
    const r = {debut: t, fin: t + d};
    t += d + GAP;
    return r;
  });
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Position (0..1) d'un mot dans la phrase, pondérée par le nombre de caractères. */
export function wordRatio(voix: string, mot: string) {
  const i = norm(voix).indexOf(norm(mot));
  if (i < 0) return 0;
  return i / Math.max(1, voix.length);
}

export function resolveTimeline(ep: EpisodeSpec, fps: number): Timeline {
  const est = estimateTimes(ep.lignes);
  const f = (s: number) => Math.round(s * fps);
  let titre: string | null = null;
  const lines: Line[] = ep.lignes.map((l, i) => {
    if (l.titre !== undefined) titre = l.titre;
    const debut = l.debut ?? est[i].debut;
    const fin = l.fin ?? est[i].fin;
    return {...l, start: f(debut), end: f(fin), titreActif: titre};
  });
  const byId = new Map(lines.map((l) => [l.id, l]));
  const last = lines[lines.length - 1];
  const duration = last.end + f(ep.queue ?? 1.2);

  const elements: Element[] = [];
  lines.forEach((l) => {
    (l.elements ?? []).forEach((e) => {
      const len = l.end - l.start;
      const start = l.start + (e.mot ? Math.round(wordRatio(l.voix, e.mot) * len) : f(e.at ?? 0));
      let end = l.end;
      if (e.jusqua !== undefined) end = byId.get(e.jusqua)?.end ?? l.end;
      else if (e.duree !== undefined) end = start + f(e.duree);
      elements.push({...e, start, end, ligne: l.id});
    });
  });

  // Un plan dure jusqu'au début du plan suivant (coupe franche sur la ligne).
  const shots: Timeline['shots'] = [];
  lines.forEach((l) => {
    if (l.plan) {
      if (shots.length) shots[shots.length - 1].end = l.start;
      shots.push({plan: l.plan, start: shots.length ? l.start : 0, end: duration});
    }
  });
  return {fps, duration, lines, elements, shots};
}

/** Sous-élément déclenché sur un mot (ex. icônes de la grille, étiquettes). */
export function itemStart(tl: Timeline, el: Element, item: {mot?: string; at?: number}) {
  const l = tl.lines.find((x) => x.id === el.ligne)!;
  if (item.mot) return l.start + Math.round(wordRatio(l.voix, item.mot) * (l.end - l.start));
  return el.start + Math.round((item.at ?? 0) * tl.fps);
}

export const elementsOf = (tl: Timeline, type: string) => tl.elements.filter((e) => e.type === type);
export const activeAt = (els: Element[], frame: number, pre = 0, post = 0) =>
  els.filter((e) => frame >= e.start - pre && frame <= e.end + post);
