// Rend une image de contrôle au milieu de chaque ligne (ou aux frames données) :
//   node scripts/controle.mjs [Jour01] [frame1,frame2,...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const id = process.argv[2] ?? 'Jour01';
const explicit = process.argv[3]?.split(',').map(Number);
const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const outDir = path.resolve('out/controle');
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const chromiumOptions = {gl: 'swangle'};
const comp = await selectComposition({serveUrl, id, browserExecutable: BROWSER, chromiumOptions});

let frames = explicit;
if (!frames) {
  // même estimation que src/lib/timeline.ts (ou temps réels si présents)
  const ep = JSON.parse(fs.readFileSync(`episodes/jour-${id.slice(-2)}.json`, 'utf8'));
  let t = 0.3;
  frames = ep.lignes.map((l) => {
    const words = l.voix.split(/\s+/).filter(Boolean).length;
    const d = Math.max(1.1, words / 3.2 + (l.voix.match(/[…:.?!,]/g) || []).length * 0.12);
    const debut = l.debut ?? t;
    const fin = l.fin ?? t + d;
    t += d + 0.4;
    return Math.round(((debut + fin) / 2) * comp.fps);
  });
}
for (const [i, frame] of frames.entries()) {
  const t0 = Date.now();
  const output = path.join(outDir, `${id}-${String(i + 1).padStart(2, '0')}-f${frame}.jpg`);
  await renderStill({composition: comp, serveUrl, frame, output, imageFormat: 'jpeg', jpegQuality: 85, browserExecutable: BROWSER, chromiumOptions});
  console.log(`${path.basename(output)}  ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
