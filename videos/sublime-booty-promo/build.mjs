// Builds both cuts of the promo from one set of frame sources.
//   src/frames/<id>.html  -> compositions/land/<id>.html (1920x1080)
//                         -> compositions/port/<id>.html (1080x1920)
//   src/timeline.json     -> index.html for one format (only one root file may exist)
// Re-run after editing src/: `node build.mjs land` or `node build.mjs port`
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const tl = JSON.parse(fs.readFileSync(path.join(ROOT, "src/timeline.json"), "utf8"));
const FORMATS = {
  land: { W: 1920, H: 1080 },
  port: { W: 1080, H: 1920 },
};
const TARGET = process.argv[2] || "land";
if (!FORMATS[TARGET]) throw new Error(`unknown format ${TARGET} (land|port)`);

const FONTS = `
@font-face{font-family:'Playfair Display';font-style:normal;font-weight:700 900;font-display:block;src:url('assets/fonts/PlayfairDisplay-normal-700_900.woff2') format('woff2');}
@font-face{font-family:'Playfair Display';font-style:italic;font-weight:400 900;font-display:block;src:url('assets/fonts/PlayfairDisplay-italic-400_900.woff2') format('woff2');}
@font-face{font-family:'Great Vibes';font-style:normal;font-weight:400;font-display:block;src:url('assets/fonts/GreatVibes-400.woff2') format('woff2');}
@font-face{font-family:'Montserrat';font-style:normal;font-weight:400 800;font-display:block;src:url('assets/fonts/Montserrat-normal-400_800.woff2') format('woff2');}`;

const COMMON = fs.readFileSync(path.join(ROOT, "src/common.css"), "utf8");
const HELPERS = fs.readFileSync(path.join(ROOT, "src/helpers.js"), "utf8");

const durOf = (f) => {
  const cache = (durOf.c ||= {});
  if (!(f in cache)) {
    const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(ROOT, f)]);
    cache[f] = Math.round(parseFloat(out.toString()) * 1000) / 1000;
  }
  return cache[f];
};
const r3 = (x) => Math.round(x * 1000) / 1000;

function renderFrame(src, scene, o) {
  const { W, H } = FORMATS[o];
  const other = o === "land" ? "port" : "land";
  let s = src
    .replace(new RegExp(`<!--IF:${other}-->[\\s\\S]*?<!--/IF-->`, "g"), "")
    .replace(new RegExp(`<!--IF:${o}-->|<!--/IF-->`, "g"), "")
    .replace(new RegExp(`/\\*IF:${other}\\*/[\\s\\S]*?/\\*/IF\\*/`, "g"), "")
    .replace(new RegExp(`/\\*IF:${o}\\*/|/\\*/IF\\*/`, "g"), "");
  const vars = {
    W, H, O: o, ID: scene.id,
    DUR: r3(scene.dur + (scene.tail || 0)),
    CUES: JSON.stringify(scene.cues),
    FONTS, COMMON, HELPERS,
  };
  return s.replace(/%(W|H|O|ID|DUR|CUES|FONTS|COMMON|HELPERS)%/g, (_, k) => String(vars[k]));
}

function renderIndex(o) {
  const { W, H } = FORMATS[o];
  const lines = [];
  let track = 0;
  tl.scenes.forEach((sc, i) => {
    const d = r3(sc.dur + (sc.tail || 0));
    lines.push(`      <div id="el-${sc.id}" class="scene clip" data-composition-id="${sc.id}" data-composition-src="compositions/${o}/${sc.id}.html" data-start="${sc.start}" data-duration="${d}" data-track-index="${i % 2}" data-width="${W}" data-height="${H}"></div>`);
    if (sc.voice) {
      lines.push(`      <audio id="el-${sc.id}-voice" src="${sc.voice.src}" data-start="${r3(sc.start + sc.voice.at)}" data-duration="${sc.voice.dur}" data-track-index="10" data-volume="1"></audio>`);
    }
  });
  lines.push(`      <audio id="el-bgm" src="${tl.bgm.src}" data-start="0" data-duration="${tl.total}" data-track-index="11" data-volume="${tl.bgm.volume}"></audio>`);
  let n = 0;
  tl.scenes.forEach((sc) => {
    (sc.sfx || []).forEach(([name, t, vol]) => {
      const f = `assets/sfx/${name}.wav`;
      lines.push(`      <audio id="el-sfx-${n}" src="${f}" data-start="${r3(sc.start + t)}" data-duration="${durOf(f)}" data-track-index="${20 + (n % 6)}" data-volume="${vol}"></audio>`);
      n++;
    });
  });
  track = 0;

  // transitions on the root timeline
  const T = [];
  const axis = o === "land" ? "x" : "y";
  const span = o === "land" ? W : H;
  let firstSweep = true;
  tl.transitions.forEach((tr) => {
    const at = tr.at;
    const outgoing = tl.scenes.find((s) => Math.abs(s.start + s.dur - at) < 1e-6);
    const incoming = tl.scenes.find((s) => Math.abs(s.start - at) < 1e-6);
    if (tr.type === "sweep") {
      // main magenta panel is centred on the cut; the pink and gold edges lead it
      const d = 1.1;
      [["#wp-a", 0.16], ["#wp-b", 0.08], ["#wp-c", 0]].forEach(([sel, lead]) => {
        const sign = o === "land" ? 1 : -1;
        T.push(`tl.fromTo("${sel}", { ${axis}: ${sign * -1.7 * span} }, { ${axis}: ${sign * 1.7 * span}, duration: ${d}, ease: "sine.inOut"${firstSweep ? "" : ", immediateRender: false"} }, ${r3(at - d / 2 - lead)});`);
      });
      firstSweep = false;
      T.push(`tl.fromTo("#el-${incoming.id}", { scale: 1.08 }, { scale: 1, duration: 0.9, ease: "power3.out", immediateRender: false }, ${at});`);
    } else if (tr.type === "zoom") {
      T.push(`tl.to("#el-${outgoing.id}", { scale: 1.7, opacity: 0, filter: "blur(10px)", duration: 0.45, ease: "power3.in" }, ${at});`);
      T.push(`tl.fromTo("#el-${incoming.id}", { scale: 0.6, opacity: 0, filter: "blur(10px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "power3.out", immediateRender: false }, ${at});`);
    } else if (tr.type === "iris") {
      T.push(`tl.fromTo("#el-${incoming.id}", { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 0.7, ease: "power3.inOut", immediateRender: false }, ${at});`);
      T.push(`tl.fromTo("#iris-ring", { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: "power3.inOut", immediateRender: false }, ${at});`);
    }
  });
  T.push(`tl.to({}, { duration: ${tl.total} }, 0);`);
  const ringSize = Math.ceil(Math.hypot(W, H) * 1.5);

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #FF2E93; }
      .scene { position: absolute; inset: 0; width: 100%; height: 100%; }
      #wipe { position: absolute; inset: 0; z-index: 50; pointer-events: none; overflow: hidden; }
      .wp { position: absolute; ${o === "land" ? "top: -30%; height: 160%; left: -60%; width: 220%; border-radius: 50% / 50%;" : "left: -30%; width: 160%; top: -60%; height: 220%; border-radius: 50% / 50%;"} }
      #wp-a { background: linear-gradient(${o === "land" ? "90deg" : "180deg"}, #F6D58E, #E8B964); }
      #wp-b { background: linear-gradient(${o === "land" ? "90deg" : "180deg"}, #FF6EB5, #FF2E93); }
      #wp-c { background: linear-gradient(${o === "land" ? "90deg" : "180deg"}, #FF2E93, #C2106B); }
      #iris-ring { position: absolute; left: 50%; top: 50%; width: ${ringSize}px; height: ${ringSize}px; margin: ${-ringSize / 2}px 0 0 ${-ringSize / 2}px; border-radius: 50%; opacity: 0; border: 14px solid #F6D58E; box-shadow: 0 0 40px rgba(255,255,255,.6); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${tl.total}" data-width="${W}" data-height="${H}">
${lines.join("\n")}
      <div id="wipe"><div class="wp" id="wp-a" data-layout-allow-overflow></div><div class="wp" id="wp-b" data-layout-allow-overflow></div><div class="wp" id="wp-c" data-layout-allow-overflow></div><div id="iris-ring"></div></div>
    </div>
    <script>
      (function () {
        var tl = gsap.timeline({ paused: true });
        ${T.join("\n        ")}
        window.__timelines["main"] = tl;
      })();
    </script>
  </body>
</html>
`;
}

for (const o of Object.keys(FORMATS)) {
  const dir = path.join(ROOT, "compositions", o);
  fs.mkdirSync(dir, { recursive: true });
  for (const sc of tl.scenes) {
    const src = fs.readFileSync(path.join(ROOT, "src/frames", `${sc.id}.html`), "utf8");
    fs.writeFileSync(path.join(dir, `${sc.id}.html`), renderFrame(src, sc, o));
  }
}
fs.writeFileSync(path.join(ROOT, "index.html"), renderIndex(TARGET));
console.log(`built frames for land + port; index.html = ${TARGET} (${FORMATS[TARGET].W}x${FORMATS[TARGET].H})`);
