// Contrôle qualité : rend des images fixes aux moments clés dans les deux formats.
// Usage : node scripts/qc.mjs [sec1 sec2 ...]
import path from "path";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const root = process.cwd();
const browserExecutable = process.env.REMOTION_CHROME || "/opt/pw-browsers/chromium";
const times = process.argv.slice(2).map(Number);
const DEFAULT = [1.0, 2.9, 4.5, 7.0, 8.8, 10.2, 11.2, 12.4, 14.2, 17.6, 19.8, 22.3, 25.0, 27.3, 30.9, 33.8, 35.6, 37.0, 40.0, 41.2, 43.0, 46.6, 49.0, 52.2, 56.5];
const list = times.length ? times : DEFAULT;

const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const puppeteerInstance = await openBrowser("chrome", { browserExecutable, chromiumOptions: { gl: "angle" } });
for (const id of ["Promo16x9", "Promo9x16"]) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable, puppeteerInstance });
  for (const t of list) {
    const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
    const output = path.join(root, "out/qc", `${id}-${t.toFixed(1)}.png`);
    await renderStill({ serveUrl, composition, frame, output, browserExecutable, puppeteerInstance, chromiumOptions: { gl: "angle" } });
    console.log(output);
  }
}
await puppeteerInstance.close({ silent: true });
