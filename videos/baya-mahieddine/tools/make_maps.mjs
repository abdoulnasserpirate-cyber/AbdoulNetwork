// Pre-renders the maps used in the film as static SVG (Natural Earth 50m via world-atlas, public domain).
// Usage: node tools/make_maps.mjs   (from the project root)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";

const topo = JSON.parse(
  readFileSync(new URL("./node_modules/world-atlas/countries-50m.json", import.meta.url)),
);
const countries = feature(topo, topo.objects.countries).features;
const byName = (n) => countries.find((c) => c.properties.name === n);
mkdirSync("assets/maps", { recursive: true });

// Each map: a framing box [[lon0,lat0],[lon1,lat1]], a highlighted country, and point markers.
function map({ file, W, H, box, highlight, points = [], neighbours = true }) {
  const frame = { type: "MultiPoint", coordinates: box };
  const proj = geoMercator().fitExtent([[40, 40], [W - 40, H - 40]], frame);
  const path = geoPath(proj).digits(1);
  const inView = (c) => { const [[x0, y0], [x1, y1]] = path.bounds(c); return x1 > 0 && y1 > 0 && x0 < W && y0 < H; };
  const hi = byName(highlight);
  const bg = neighbours
    ? countries
        .filter((c) => c !== hi && inView(c))
        .map((c) => `<path d="${path(c)}" class="land"/>`)
        .join("")
    : "";
  const pts = points
    .map(([lon, lat, id]) => {
      const [x, y] = proj([lon, lat]);
      return `<g id="${id}" class="pt" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle class="halo" r="34"/><circle class="dot" r="11"/></g>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><clipPath id="c-${file}"><rect width="${W}" height="${H}"/></clipPath></defs>
<g clip-path="url(#c-${file})">${bg}<path d="${path(hi)}" class="hi"/>${pts}</g></svg>`;
  writeFileSync(`assets/maps/${file}.svg`, svg);
  // also export marker positions for the composition
  return Object.fromEntries(points.map(([lon, lat, id]) => [id, proj([lon, lat]).map((v) => +(v / W).toFixed(4))]));
}

const out = {};
out.algeria = map({ file: "algeria", W: 1200, H: 1000, box: [[-12, 15], [20, 40]], highlight: "Algeria", points: [[3.06, 36.75, "pt-alger"]] });
out.niger = map({ file: "niger", W: 1200, H: 900, box: [[-2, 8], [17, 24]], highlight: "Niger", points: [[7.10, 13.50, "pt-maradi"]] });
out.france = map({ file: "france", W: 1200, H: 1000, box: [[-6, 41], [10, 52]], highlight: "France", points: [[2.35, 48.86, "pt-paris"]] });
out.africa = map({ file: "africa", W: 1200, H: 1200, box: [[-18, -35], [52, 37]], highlight: "Algeria", points: [] });
writeFileSync("assets/maps/markers.json", JSON.stringify(out, null, 1));
console.log(out);
