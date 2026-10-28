// Calage sur la voix off : chaque repère pointe sur un mot exact de la
// transcription Whisper (src/captions.json), retrouvé à partir d'un temps minimal.
import rawCaptions from "./captions.json";

export type Word = { text: string; startMs: number; endMs: number };

const RAW = rawCaptions as Word[];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

// Premier mot `word` qui commence après `afterSec` (fallback = afterSec).
const at = (word: string, afterSec: number, nth = 0): number => {
  const target = norm(word);
  const hits = RAW.filter((w) => w.startMs / 1000 >= afterSec && norm(w.text) === target);
  const hit = hits[nth];
  return hit ? hit.startMs / 1000 : afterSec;
};

export const VOICE_END = RAW.length ? RAW[RAW.length - 1].endMs / 1000 : 55;

// Repères en secondes.
export const CUES = {
  // 1 — accroche
  regarde: 0,
  merites: at("tu", 0.5),
  tetes: at("tetes", 2),
  // 2 — marque + promo
  sublime: at("sublime", 3),
  grande: at("grande", 4),
  du: at("du", 6),
  seulement: at("seulement", 7.5),
  // 3 — mots-chocs
  fesses: at("des", 9),
  hanches: at("hanches", 10),
  poitrine: at("une", 11),
  corps: at("ton", 12.5),
  // 4 — kits fessier
  kit1: at("kit", 15),
  prix1: at("18", 16),
  kit2: at("kit", 17.9),
  prix2: at("43", 18.5),
  kit3: at("kit", 20),
  prix3: at("70", 21),
  // 5 — vedette
  star: at("et", 22.5),
  amaria: at("kit", 23.5),
  prixAmaria: at("100", 25),
  auLieu: at("au", 26),
  // 6 — seins / minceur
  pourPoitrine: at("pour", 27.3),
  prixLolo: at("25", 30),
  pourVentre: at("pour", 31),
  prixVentre: at("20", 33),
  // 7 — tirage
  pasTout: at("et", 34),
  fin: at("a", 35),
  tirage: at("grand", 36),
  gagne: at("gagne", 37),
  min: at("50", 38.5),
  max: at("200", 39.2),
  frais: at("tout", 40.3),
  // 8 — paiement / livraison
  paie: at("pepare", 41.5),
  nita: at("nita", 41.9),
  amana: at("amana", 42.5),
  wave: at("wave", 43.2),
  western: at("western", 43.8),
  ria: at("ria", 44.6),
  livraison: at("livraison", 45.2),
  // 9 — WhatsApp + fin
  ecris: at("ecrine", 47.3),
  numero: at("92", 49),
  n48: at("48", 49.5),
  n56: at("56", 50.4),
  n12: at("12", 51.3),
  marque: at("sublime", 52),
  royaume: at("ton", 54),
};

export type CueKey = keyof typeof CUES;

// ---------------------------------------------------------------------------
// Sous-titres : corrections des petites erreurs de reconnaissance + pagination.
const FIXES: [string[], string[]][] = [
  [["Pépare"], ["Paie", "par"]],
  [["Écrine", "-nous"], ["Écris-nous"]],
  [["t", "'es", "crème,"], ["thé", "et", "crème,"]],
  [["tout", "frais", "payé."], ["tous", "frais", "payés."]],
  [["1er"], ["1er"]],
];

const fixWords = (words: Word[]): Word[] => {
  const out: Word[] = [];
  for (let i = 0; i < words.length; i++) {
    const fix = FIXES.find(([from]) =>
      from.every((f, k) => words[i + k] && words[i + k].text.trim() === f),
    );
    if (fix) {
      const [from, to] = fix;
      const start = words[i].startMs;
      const end = words[i + from.length - 1].endMs;
      const step = (end - start) / to.length;
      to.forEach((t, k) =>
        out.push({ text: t, startMs: start + k * step, endMs: start + (k + 1) * step }),
      );
      i += from.length - 1;
      continue;
    }
    const t = words[i].text.trim();
    // élisions (d'une, n'est) et traits d'union : on colle au mot précédent
    if ((t.startsWith("'") || t.startsWith("-")) && out.length) {
      const prev = out[out.length - 1];
      out[out.length - 1] = { ...prev, text: prev.text + t, endMs: words[i].endMs };
      continue;
    }
    // "18" "000" -> "18 000"
    if (t.replace(/[.,]/g, "") === "000" && out.length && /^\d+$/.test(out[out.length - 1].text)) {
      const prev = out[out.length - 1];
      out[out.length - 1] = { ...prev, text: `${prev.text} ${t}`, endMs: words[i].endMs };
      continue;
    }
    out.push({ text: t, startMs: words[i].startMs, endMs: words[i].endMs });
  }
  return out;
};

export const WORDS = fixWords(RAW);

export type Page = { startMs: number; endMs: number; words: Word[] };

// Pages de 4 mots max, coupées sur la ponctuation ou les silences.
export const PAGES: Page[] = (() => {
  const pages: Page[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (!cur.length) return;
    pages.push({ startMs: cur[0].startMs, endMs: cur[cur.length - 1].endMs, words: cur });
    cur = [];
  };
  WORDS.forEach((w, i) => {
    const prev = WORDS[i - 1];
    if (cur.length && (cur.length >= 4 || (prev && w.startMs - prev.endMs > 350))) flush();
    cur.push(w);
    if (/[.,!?]$/.test(w.text) && cur.length >= 2) flush();
  });
  flush();
  // chaque page reste affichée jusqu'à la suivante (max +400 ms)
  return pages.map((p, i) => ({
    ...p,
    endMs: Math.min(p.endMs + 400, pages[i + 1]?.startMs ?? p.endMs + 400),
  }));
})();

// Activité vocale (pour le ducking d'une éventuelle musique séparée).
export const isSpeaking = (ms: number) =>
  WORDS.some((w) => ms >= w.startMs - 150 && ms <= w.endMs + 250);
