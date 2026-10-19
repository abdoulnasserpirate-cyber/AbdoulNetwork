// Static storyboard key frames: one PNG per scene and format, layouts at their key moment.
// Usage: node tools/keyframes.mjs  (run from the project root; needs PW_PATH or a resolvable playwright)
import { createRequire } from "module";
import path from "path";
import fs from "fs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || "playwright");

const root = process.cwd();
fs.mkdirSync(path.join(root, "storyboard"), { recursive: true });
const browser = await chromium.launch();
for (const [file, tag, width, height] of [["index.html", "16x9", 1920, 1080], ["vertical/index.html", "9x16", 1080, 1920]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("file://" + path.join(root, file));
  await page.evaluate(() => document.fonts.ready);
  const shots = ["1", "2", "3", "4", "5", "6", "6b-a", "6b-b", "6b-c", "7", "8"];
  for (const shot of shots) {
    const [i, state] = shot.split("-");
    await page.evaluate(([n, st]) => {
      document.querySelectorAll(".scene").forEach((s) => (s.style.display = s.id === "s" + n ? "block" : "none"));
      if (st) {
        document.getElementById("s6b").dataset.state = st;
        document.getElementById("map").setAttribute("viewBox", window.MAPVB[st]);
      }
      document.querySelectorAll("#s3 .prod:not(.key), #s3 .info:not(.key)").forEach((e) => (e.style.display = "none"));
      const roll = document.querySelector("#s3 .c-roll");
      if (roll) roll.scrollTop = 0, (roll.firstElementChild.style.marginTop = "-1.2em");
    }, [i, state]);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(root, `storyboard/${tag}-s${shot}.png`) });
  }
  await page.close();
}
await browser.close();
console.log("key frames written to storyboard/");
