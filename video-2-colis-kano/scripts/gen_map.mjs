// Génère la carte stylisée (Niger + sous-région) en SVG statique, projetée une fois (aucun fetch au rendu).
// usage: node gen_map.mjs <node_modules_dir> <out_dir>
import fs from 'fs'; import path from 'path'; import { createRequire } from 'module';
const [NM, OUT] = process.argv.slice(2);
const require = createRequire(path.join(NM, 'x.js'));
const topo = require('topojson-client'); const d3 = require('d3-geo');
const world = JSON.parse(fs.readFileSync(path.join(NM, 'world-atlas/countries-50m.json')));
const all = topo.feature(world, world.objects.countries).features;
const W = 2400, H = 2000;
const bbox = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[-6, 4], [-6, 24], [21, 24], [21, 4], [-6, 4]]] } };
const proj = d3.geoMercator().fitExtent([[0, 0], [W, H]], bbox);
const gp = d3.geoPath(proj);
const ids = { '562': 'niger', '566': 'nigeria', '466': 'mali', '854': 'burkina', '204': 'benin', '148': 'tchad', '012': 'algerie', '434': 'libye', '768': 'togo', '120': 'cameroun', '288': 'ghana', '384': 'cotedivoire', '140': 'rca', '478': 'mauritanie', '324': 'guinee', '729': 'soudan', '818':'egypte' };
let paths = '';
for (const f of all) {
  const k = ids[String(f.id).padStart(3, '0')]; if (!k) continue;
  const d = gp(f); if (!d) continue;
  paths += `<path class="cty cty-${k}" id="map-${k}" d="${d.replace(/(\.\d)\d+/g, '$1')}"/>\n`;
}
const P = (lon, lat) => proj([lon, lat]).map(v => Math.round(v * 10) / 10);
const pts = {
  kano: P(8.52, 12.00), maradi: P(7.10, 13.50), niamey: P(2.11, 13.51), zinder: P(8.99, 13.81), tahoua: P(5.27, 14.89),
  agadez: P(7.99, 16.97), dosso: P(3.19, 13.05), tillaberi: P(1.45, 14.21), diffa: P(12.61, 13.32), arlit: P(7.38, 18.74),
  konni: P(5.25, 13.80), bilma: P(12.92, 18.69), tessaoua: P(7.99, 13.76),
  // pays de la sous-région (point d'arrivée des flèches)
  sr_nigeria: P(7.5, 9.6), sr_benin: P(2.4, 9.9), sr_burkina: P(-0.6, 12.5), sr_mali: P(-1.0, 16.6), sr_tchad: P(16.6, 14.6), sr_togo: P(1.1, 8.6),
  lbl_niger: P(13.0, 16.3), lbl_nigeria: P(8.0, 10.6),
};
fs.writeFileSync(path.join(OUT, 'map-paths.svg.html'), paths);
fs.writeFileSync(path.join(OUT, 'map-points.json'), JSON.stringify({ W, H, pts }, null, 1));
console.log('ok', paths.length, pts.kano, pts.maradi);
