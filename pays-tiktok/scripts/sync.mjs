// Synchronisation sur la voix off (règle de production 0.4, étape 3).
//
//   node scripts/sync.mjs <fichier audio (.m4a/.mp3/.wav)> <jour> [--prises 3:2,7:1]
//
// 1. convertit l'audio en WAV mono 48 kHz dans public/audio/
// 2. détecte les silences (silencedetect noise=-35dB d=0.5) -> un segment par ligne du script
//    (essaie d'autres seuils si le compte ne tombe pas juste ; sinon s'arrête et liste les segments)
// 3. nettoie : silences ramenés à 0,4 s max, réduction de bruit légère (afftdn), loudnorm -14 LUFS
// 4. écrit les temps réels (debut/fin de chaque ligne) et le chemin de la voix dans episodes/jour-XX.json
//
// --prises : si une ligne a été relue (prise ratée), indique quel segment garder.
//   ex. "--prises 3:2" = pour la ligne 3, garder la 2e prise. Les autres prises de cette ligne sont jetées.

import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [input, jourArg] = process.argv.slice(2);
if (!input || !jourArg) {
  console.error('Usage : node scripts/sync.mjs <audio> <jour> [--prises ligne:prise,...]');
  process.exit(1);
}
const pi = process.argv.indexOf('--prises');
const prises = new Map(
  pi > 0
    ? process.argv[pi + 1].split(',').map((p) => p.split(':').map(Number))
    : [],
);

const jj = String(jourArg).padStart(2, '0');
const epPath = `episodes/jour-${jj}.json`;
const ep = JSON.parse(fs.readFileSync(epPath, 'utf8'));
const nLines = ep.lignes.length;
fs.mkdirSync('public/audio', {recursive: true});
const raw = `public/audio/voix-jour-${jj}-brut.wav`;
const clean = `public/audio/voix-jour-${jj}.wav`;

execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', input, '-ac', '1', '-ar', '48000', raw]);
const duration = Number(
  execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', raw]).toString().trim(),
);

function detect(noise, d) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', raw, '-af', `silencedetect=noise=${noise}dB:d=${d}`, '-f', 'null', '-'], {encoding: 'utf8'});
  const log = r.stderr;
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  // segments de parole = intervalles entre silences
  const segs = [];
  let cursor = 0;
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] - cursor > 0.15) segs.push([cursor, starts[i]]);
    cursor = ends[i] ?? duration;
  }
  if (duration - cursor > 0.15) segs.push([cursor, duration]);
  return segs;
}

// nombre de segments attendu = lignes + prises supplémentaires annoncées
const extra = [...prises.values()].reduce((a, p) => a + (p - 1), 0);
const expected = nLines + extra;
const tries = [
  [-35, 0.5],
  [-30, 0.5],
  [-40, 0.5],
  [-35, 0.4],
  [-35, 0.7],
  [-32, 0.6],
  [-38, 0.6],
  [-45, 0.5],
];
let segs = null;
let used = null;
for (const [n, d] of tries) {
  const s = detect(n, d);
  console.log(`silencedetect noise=${n}dB d=${d} -> ${s.length} segments (attendu ${expected})`);
  if (s.length === expected) {
    segs = s;
    used = [n, d];
    break;
  }
}
if (!segs && prises.size === 0) {
  // Pauses trop courtes entre les lignes (voix IA, débit rapide) : alignement texte <-> pauses
  console.log('\nPauses courtes : alignement par durées de phrases (scripts/align.py)…');
  const out = execFileSync('python3', ['scripts/align.py', raw, epPath]).toString().trim().split('\n');
  out.slice(0, -1).forEach((l) => console.log('  ' + l));
  segs = JSON.parse(out[out.length - 1]);
  used = ['align', 'pauses ≥ 0,15 s'];
}
if (!segs) {
  const s = detect(-35, 0.5);
  console.error('\nLe nombre de segments ne correspond pas au script. Segments détectés (-35 dB, 0,5 s) :');
  s.forEach(([a, b], i) => console.error(`  ${String(i + 1).padStart(2)}  ${a.toFixed(2)} -> ${b.toFixed(2)}  (${(b - a).toFixed(2)} s)`));
  console.error('Ajuste avec --prises ou réenregistre avec ~1 s de silence entre les lignes.');
  process.exit(2);
}

// Prises multiples : la ligne k occupe p segments consécutifs, on garde celui demandé (par défaut le dernier)
const keep = [];
let si = 0;
for (let k = 1; k <= nLines; k++) {
  const count = prises.has(k) ? Math.max(prises.get(k), 1) : 1;
  const chosen = prises.has(k) ? prises.get(k) - 1 : 0;
  keep.push(segs[si + chosen]);
  si += count;
}

// Montage nettoyé : 0,3 s d'attaque, marges de 0,06 s, silences ramenés à 0,4 s max
const LEAD = 0.3;
const PAD = 0.06;
const GAP = 0.4;
const parts = [];
const times = [];
let t = LEAD;
keep.forEach(([a, b], i) => {
  const s = Math.max(0, a - PAD);
  const e = Math.min(duration, b + PAD);
  const next = keep[i + 1];
  const origGap = next ? Math.max(0, next[0] - PAD - e) : 0.6;
  const gap = Math.min(GAP, origGap);
  parts.push({s, e, gap});
  times.push({debut: +(t + (a - s)).toFixed(3), fin: +(t + (a - s) + (b - a)).toFixed(3)});
  t += e - s + gap;
});

const filters = parts.map(
  (p, i) => `[0:a]atrim=start=${p.s.toFixed(3)}:end=${p.e.toFixed(3)},asetpts=PTS-STARTPTS,apad=pad_dur=${p.gap.toFixed(3)}[s${i}]`,
);
const fc =
  `aevalsrc=0:d=${LEAD}:s=48000[lead];` +
  filters.join(';') +
  `;[lead]${parts.map((_, i) => `[s${i}]`).join('')}concat=n=${parts.length + 1}:v=0:a=1,` +
  'afftdn=nf=-25,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[out]';
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-filter_complex', fc, '-map', '[out]', '-ac', '1', clean]);

ep.voix = `audio/voix-jour-${jj}.wav`;
ep.lignes.forEach((l, i) => Object.assign(l, times[i]));
fs.writeFileSync(epPath, JSON.stringify(ep, null, 2) + '\n');

const outDur = Number(
  execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', clean]).toString().trim(),
);
console.log(`\nSeuils retenus : ${used[0]} dB / ${used[1]} s`);
console.log(`Voix nettoyée : ${clean} (${outDur.toFixed(2)} s, -14 LUFS)`);
ep.lignes.forEach((l) => console.log(`  ${String(l.id).padStart(2)}  ${l.debut.toFixed(2)} -> ${l.fin.toFixed(2)}  ${l.voix}`));
console.log(`\n${epPath} mis à jour. Rendu : npx remotion render src/index.ts Jour${jj} out/jour-${jj}.mp4`);
