// Screenshot every .pack element of tools/packshots.html to a transparent PNG.
// Usage: node tools/shoot.mjs  (run from the project root)
import { createRequire } from "module";
import path from "path";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || "playwright");

const root = process.cwd();
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1400, height: 900 } });
await page.goto("file://" + path.join(root, "tools/packshots.html"));
await page.waitForFunction(() => window.READY === true);
const ids = await page.$$eval(".pack", (els) => els.map((e) => e.id));
for (const id of ids) {
  const out = id.startsWith("logo") ? `assets/logos/${id === "logo" ? "sb-crown" : id.slice(5)}.png` : `assets/products/${id}.png`;
  await page.locator("#" + id).screenshot({ path: out, omitBackground: true });
  console.log("wrote", out);
}
await browser.close();
