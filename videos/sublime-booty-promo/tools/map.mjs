// Build the delivery-map layers (Africa land, Niger highlight, Maradi, cities, routes) as one SVG fragment.
// Source data: Natural Earth via world-atlas@2.0.2 (countries-50m), decoded with topojson-client@3.1.0.
// Usage: node tools/map.mjs <dir containing world-atlas-2.0.2/ and topojson-client-3.1.0/>
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const dir = process.argv[2];
const topo = require(path.join(dir, "topojson-client-3.1.0"));
const world = JSON.parse(fs.readFileSync(path.join(dir, "world-atlas-2.0.2/countries-50m.json"), "utf8"));
const countries = topo.feature(world, world.objects.countries).features;

// equirectangular, 20 units per degree, origin at 20°W / 38°N
const K = 20;
const P = (lon, lat) => [(lon + 20) * K, (38 - lat) * K];
const r1 = (v) => Math.round(v * 10) / 10;

function pathOf(geom) {
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
  let d = "";
  for (const poly of polys) {
    for (const ring of poly) {
      const pts = ring.map(([lo, la]) => P(lo, la));
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      if (Math.max(...xs) < -50 || Math.min(...xs) > 1550 || Math.max(...ys) < -50 || Math.min(...ys) > 1530) continue;
      let last = null, seg = "";
      for (const [x, y] of pts) {
        const k = `${r1(x)},${r1(y)}`;
        if (k === last) continue;
        seg += (seg ? "L" : "M") + k;
        last = k;
      }
      d += seg + "Z";
    }
  }
  return d;
}

let land = "", niger = "";
for (const f of countries) {
  const d = pathOf(f.geometry);
  if (!d) continue;
  if (f.properties.name === "Niger") niger = d;
  else land += d;
}

const pt = (lon, lat) => P(lon, lat).map(r1);
const maradi = pt(7.1, 13.5);
// Niger delivery cities (regional capitals)
const cities = [
  // [name, lon, lat, label dx, label dy] — offsets keep the western cluster readable
  ["Niamey", 2.11, 13.51, -8, 6], ["Zinder", 8.99, 13.81, 8, -6], ["Agadez", 7.99, 16.97, 8, 5], ["Tahoua", 5.27, 14.89, 0, -12],
  ["Dosso", 3.19, 13.05, 0, 26], ["Tillabéri", 1.45, 14.21, -8, -8], ["Diffa", 12.61, 13.32, 0, 26],
];
// international (Africa) destinations — arcs only, no labels
const world_ = [
  [3.38, 6.52], [-4.01, 5.36], [-17.45, 14.69], [9.7, 4.05], [15.27, -4.44], [31.24, 30.04],
  [36.82, -1.29], [28.05, -26.2], [-7.59, 33.57], [38.74, 9.03], [-0.19, 5.6], [-8.0, 12.64],
];

const arrow = (x1, y1, x2, y2, bend, cls) => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
  const cx = r1(mx - dy * bend), cy = r1(my + dx * bend);
  return `<path class="${cls}" d="M${x1},${y1} Q${cx},${cy} ${x2},${y2}" marker-end="url(#head-${cls.slice(-1)})" />`;
};

let out = "";
out += `<path class="land" d="${land}" />\n`;
out += `<path class="niger" d="${niger}" />\n`;
// layer A: Maradi city — arrows to every neighbourhood
let a = "";
for (let i = 0; i < 8; i++) {
  const ang = (i / 8) * Math.PI * 2 + 0.3;
  const x2 = r1(maradi[0] + Math.cos(ang) * 9), y2 = r1(maradi[1] + Math.sin(ang) * 9);
  a += arrow(maradi[0] + r1(Math.cos(ang) * 1.6), maradi[1] + r1(Math.sin(ang) * 1.6), x2, y2, 0.12, "rt rt-a");
  a += `<circle class="qd" cx="${x2}" cy="${y2}" r="0.9" />`;
}
out += `<g class="lyr lyr-a">${a}</g>\n`;
// layer B: Niger cities
let b = "";
for (const [name, lon, lat, ldx, ldy] of cities) {
  const [x, y] = pt(lon, lat);
  b += arrow(maradi[0], maradi[1], x, y, 0.18, "rt rt-b");
  b += `<circle class="ct" cx="${x}" cy="${y}" r="4" />`;
  const anchor = ldx > 0 ? "start" : ldx < 0 ? "end" : "middle";
  b += `<text class="ct-l" x="${r1(x + ldx)}" y="${r1(y + ldy)}" text-anchor="${anchor}">${name}</text>`;
}
out += `<g class="lyr lyr-b">${b}</g>\n`;
// layer C: Africa arcs
let c = "";
for (const [lon, lat] of world_) {
  const [x, y] = pt(lon, lat);
  c += arrow(maradi[0], maradi[1], x, y, 0.22, "rt rt-c");
  c += `<circle class="wd" cx="${x}" cy="${y}" r="9" />`;
}
out += `<g class="lyr lyr-c">${c}</g>\n`;
// Maradi pin (drawn last, on top)
out += `<g class="pin" transform="translate(${maradi[0]} ${maradi[1]})"><circle class="pin-pulse" r="1" /><circle class="pin-dot" r="1" /></g>\n`;

fs.mkdirSync("assets/map", { recursive: true });
fs.writeFileSync("assets/map/layers.svg.frag", out);
fs.writeFileSync("assets/map/points.json", JSON.stringify({ maradi, K }, null, 1));
console.log("map fragment", (out.length / 1024).toFixed(0), "KB; Maradi at", maradi);
