// Render key frames (seconds given as args) into out/stills/ using a single bundle.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const times = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const composition = await selectComposition({serveUrl, id: 'Classico', browserExecutable});
for (const s of times) {
  const frame = Math.round(s * 30);
  await renderStill({composition, serveUrl, frame, output: `out/stills/${String(frame).padStart(4, '0')}.png`, browserExecutable});
  console.log('ok', s);
}
