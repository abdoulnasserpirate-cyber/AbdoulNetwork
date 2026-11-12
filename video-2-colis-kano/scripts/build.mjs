// Construit les deux projets HyperFrames (9:16 et 16:9) depuis la source unique src/.
// usage : node scripts/build.mjs        → build/9x16/ et build/16x9/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const tpl = rd('src/template.html');
const film = rd('src/film.js');
const mapPaths = rd('src/map-paths.svg.html');
const { pts } = JSON.parse(rd('src/map-points.json'));
const words = JSON.parse(rd('transcript.json'));
const DUR = 65.5;
const f1 = (n) => Math.round(n * 10) / 10;

// ---------- icônes (un seul style de trait, viewBox 24) ----------
const IC = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  truck: '<path d="M2.5 6.5h11v9h-11z"/><path d="M13.5 9.5h4l3.5 3.5v2.5h-7.5"/><circle cx="7" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>',
  store: '<path d="M4.5 11v9h15v-9"/><path d="M3 10.5 5 4h14l2 6.5"/><path d="M3 10.5c0 1.6 1.3 2.8 3 2.8s3-1.2 3-2.8c0 1.6 1.3 2.8 3 2.8s3-1.2 3-2.8c0 1.6 1.3 2.8 3 2.8s3-1.2 3-2.8"/><path d="M10 20v-4.5h4V20"/>',
  phone: '<path d="M5.5 3.5h3.5l2 5-2.6 1.6a11.5 11.5 0 0 0 5.5 5.5l1.6-2.6 5 2v3.5a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3.5 5.5a2 2 0 0 1 2-2z"/>',
  camera: '<path d="M3.5 7.5h3.5l2-3h6l2 3h3.5v12h-17z"/><circle cx="12" cy="13.2" r="3.6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"/>',
  check: '<path d="M5 12.5 9.5 17 19 7.5"/>',
  pin: '<path d="M12 21.5s-7-6.3-7-11.5a7 7 0 0 1 14 0c0 5.2-7 11.5-7 11.5z"/><circle cx="12" cy="10" r="2.6"/>',
  headset: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="2.8" y="13.5" width="4.4" height="6.5" rx="1.6"/><rect x="16.8" y="13.5" width="4.4" height="6.5" rx="1.6"/><path d="M19 20c0 1.6-2.2 2.2-5 2.2"/>',
  speaker: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9a4.2 4.2 0 0 1 0 6"/>',
  hang: '<g transform="rotate(135 12 12)"><path d="M5.5 3.5h3.5l2 5-2.6 1.6a11.5 11.5 0 0 0 5.5 5.5l1.6-2.6 5 2v3.5a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3.5 5.5a2 2 0 0 1 2-2z"/></g>',
  wa: '<path d="M4 20.5 5.3 16.6A8.6 8.6 0 1 1 8 19.3z"/><path d="M9.2 8.6c0 3.4 2.6 6.3 6.3 6.3l1-1.6-2.1-1-1 .9c-1.4-.6-2.4-1.6-3-3l.9-1-1-2.1z"/>',
  bus: '<rect x="4" y="3.5" width="16" height="14" rx="2.5"/><path d="M4 11h16"/><path d="M8 3.5v7.5M16 3.5v7.5"/><circle cx="8" cy="20" r="1.6"/><circle cx="16" cy="20" r="1.6"/>',
  open: '<path d="M3 8.5 12 4.5l9 4-9 4z"/><path d="M3 8.5v8l9 4 9-4v-8"/><path d="M12 12.5v8"/><path d="M3 8.5 1.5 5.5M21 8.5l1.5-3"/>',
  file: '<path d="M6 3h8.5l4 4V21H6z"/><path d="M14 3v4.5h4.5"/><path d="M9 12h6M9 16h6"/>',
};
const ic = (n, s = 30, sw = 2.2, col = 'currentColor') =>
  `<svg class="i" viewBox="0 0 24 24" width="${s}" height="${s}" style="stroke:${col};stroke-width:${sw}">${IC[n]}</svg>`;

// ---------- carton isométrique (viewBox 600) ----------
const BOX = {
  top: '300,120 510,225 300,330 90,225',
  left: '90,225 300,330 300,560 90,455',
  right: '300,330 510,225 510,455 300,560',
  tapeTop: '387.1,163.6 422.9,181.4 212.9,286.4 177.1,268.6',
  tapeLeft: '177.1,268.6 212.9,286.4 212.9,516.4 177.1,498.6',
};
function isoBox({ id = '', logo = true, lid = true } = {}) {
  const p = id ? `${id}-` : '';
  return `
  <g ${id ? `id="${p}g"` : ''}>
    <ellipse cx="300" cy="566" rx="235" ry="46" fill="rgba(11,26,79,.16)"/>
    <polygon points="${BOX.left}" fill="#D39E5E"/>
    <polygon points="${BOX.right}" fill="#BA8546"/>
    <polygon points="${BOX.tapeLeft}" fill="#F2C230" opacity=".95"/>
    <polygon points="300,330 300,560 296,558 296,332" fill="rgba(0,0,0,.08)"/>
    ${logo ? `<g transform="matrix(0.894,-0.447,0,1,300,330)"><rect x="26" y="52" width="183" height="116" rx="10" fill="#fff" opacity=".93"/><image href="assets/logo/logo-allo-trace.svg" x="35" y="62" width="165" height="89"/></g>` : ''}
    <polygon ${id ? `id="${p}inside"` : ''} points="${BOX.top}" fill="#5E3E19"/>
    <polygon points="300,150 470,235 300,320 130,235" fill="#4A3012" opacity=".55"/>
    ${lid ? `<g ${id ? `id="${p}lid"` : ''}><polygon points="${BOX.top}" fill="#E8BC7E"/><polygon points="${BOX.tapeTop}" fill="#FDCB05"/><polygon points="300,120 510,225 300,330 90,225" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/></g>` : ''}
  </g>`;
}
const heroBox = `<svg id="heroSvg" viewBox="0 0 600 600" width="600" height="600" style="overflow:visible">${isoBox({ id: 'hb', logo: true, lid: true })}</svg>`;
// miniature pour la carte : pied du carton (300,560) ramené en (0,0)
const miniBox = `<g transform="scale(0.075) translate(-300,-575)">${isoBox({ logo: true })}</g>`;
const boxPhoto = `<svg viewBox="40 80 520 520" width="200" height="200">${isoBox({ logo: true })}</svg>`;

// ---------- épingles ----------
const PIN_D = 'M0,0 C-7,-9 -18,-19 -18,-31 A18,18 0 1 1 18,-31 C18,-19 7,-9 0,0Z';
const pinClose = `<g transform="scale(0.85)" filter="url(#pinSh)"><path d="${PIN_D}" fill="#06347E" stroke="#fff" stroke-width="3"/><circle cx="0" cy="-31" r="7.5" fill="#FDCB05"/></g>`;
const pinUi = `<svg viewBox="-24 -54 48 58" width="84" height="84" style="overflow:visible"><path d="${PIN_D}" fill="#06347E" stroke="#fff" stroke-width="3"/><circle cx="0" cy="-31" r="7.5" fill="#FDCB05"/></svg>`;

// ---------- trajet Kano -> Maradi (points échantillonnés sur une courbe) ----------
const qpt = (a, c, b, t) => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
function ctrl(a, b, bend) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  return [mx - dy * bend, my + dx * bend];
}
const K = pts.kano, M = pts.maradi;
const routeC = ctrl(K, M, 0.22);
const ROUTE = `M${K[0]},${K[1]} Q${f1(routeC[0])},${f1(routeC[1])} ${M[0]},${M[1]}`;
const ROUTE_N = 26;
let routeDots = '';
const routeSamples = [];
for (let i = 0; i <= ROUTE_N; i++) {
  const [x, y] = qpt(K, routeC, M, i / ROUTE_N);
  routeSamples.push([f1(x), f1(y)]);
  if (i > 0 && i < ROUTE_N) routeDots += `<circle class="rd" cx="${f1(x)}" cy="${f1(y)}" r="2.1" fill="#FDCB05" stroke="#fff" stroke-width=".7"/>`;
}

// ---------- flèches S7 ----------
const cities = [
  ['niamey', 'Niamey'], ['zinder', 'Zinder'], ['tahoua', 'Tahoua'], ['agadez', 'Agadez'],
];
const extraCities = ['dosso', 'tillaberi', 'diffa', 'arlit', 'konni', 'bilma', 'tessaoua'];
const sub = [['sr_nigeria', 'Nigeria'], ['sr_benin', 'Bénin'], ['sr_togo', 'Togo'], ['sr_burkina', 'Burkina Faso'], ['sr_mali', 'Mali'], ['sr_tchad', 'Tchad']];
let arrows = '';
const arrowMeta = {};
function arrowPath(id, to, cls, bend) {
  const c = ctrl(M, to, bend);
  // s'arrêter un peu avant la cible
  const e = qpt(M, c, to, 0.93);
  const e2 = qpt(M, c, to, 0.90);
  const ang = Math.atan2(e[1] - e2[1], e[0] - e2[0]) * 180 / Math.PI;
  arrowMeta[id] = { end: e.map(f1), ang: f1(ang) };
  return `<path id="ar-${id}" class="${cls}" d="M${M[0]},${M[1]} Q${f1(c[0])},${f1(c[1])} ${f1(e[0])},${f1(e[1])}" pathLength="1"/>`;
}
for (const [k] of cities) {
  arrows += arrowPath(k, pts[k], 'arrow', 0.18);
  const m = arrowMeta[k];
  arrows += `<g id="ah-${k}" transform="translate(${m.end[0]},${m.end[1]}) rotate(${m.ang})"><path d="M-6,-13 L22,0 L-6,13 Z" fill="#FDCB05" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></g>`;
}
let subDots = '';
for (const [k] of sub) {
  const c = ctrl(M, pts[k], -0.16);
  const N = 18;
  for (let i = 2; i <= N; i++) {
    const [x, y] = qpt(M, c, pts[k], (i / N) * 0.94);
    subDots += `<circle class="sd sd-${k}" cx="${f1(x)}" cy="${f1(y)}" r="7" fill="#0B44B3"/>`;
  }
}
arrows = `<g id="subDots">${subDots}</g>` + arrows;

// points de toutes les villes
let cityDots = '';
for (const k of extraCities) cityDots += `<g class="xc" transform="translate(${pts[k][0]},${pts[k][1]})"><circle r="15" fill="#FDCB05" opacity=".35"/><circle r="8.5" fill="#06347E" stroke="#fff" stroke-width="3"/></g>`;

// épingles plan large (labels lisibles à l'échelle ~0.55)
const lbl = (text, fs, dy, dx = 0) => {
  const w = text.length * fs * 0.66 + fs * 1.1;
  return `<g transform="translate(${dx},${dy})"><rect x="${f1(-w / 2)}" y="${f1(-fs * 1.05)}" width="${f1(w)}" height="${f1(fs * 1.5)}" rx="${f1(fs * 0.75)}" fill="#fff" stroke="#D9E2F4" stroke-width="3" filter="url(#pinSh)"/><text class="pinLbl" x="0" y="${f1(fs * 0.04)}" font-size="${fs}" text-anchor="middle">${text}</text></g>`;
};
let widePins = '';
widePins += `<g id="wp-maradi" transform="translate(${M[0]},${M[1]})"><g class="wpS"><circle class="wpRing" r="40" fill="none" stroke="#FDCB05" stroke-width="8"/><g transform="scale(2.1)" filter="url(#pinSh)"><path d="${PIN_D}" fill="#FDCB05" stroke="#fff" stroke-width="2.5"/><circle cx="0" cy="-31" r="7.5" fill="#06347E"/></g>${lbl('MARADI', 60, -118)}</g></g>`;
const lblOff = { niamey: [-175, 22], zinder: [20, 96], tahoua: [-70, -80], agadez: [0, -76] };
for (const [k, name] of cities) {
  widePins += `<g id="wp-${k}" transform="translate(${pts[k][0]},${pts[k][1]})"><g class="wpS"><circle r="17" fill="#06347E" stroke="#fff" stroke-width="5"/>${lbl(name, 54, lblOff[k][1], lblOff[k][0])}</g></g>`;
}
for (const [k, name] of sub) {
  widePins += `<g id="wp-${k}" transform="translate(${pts[k][0]},${pts[k][1]})"><g class="wpS"><g transform="translate(0,6)"><rect x="${f1(-(name.length * 30 + 80) / 2)}" y="-44" width="${f1(name.length * 30 + 80)}" height="76" rx="38" fill="#0B44B3" filter="url(#pinSh)"/><text x="0" y="9" font-size="46" text-anchor="middle" style="font-family:Montserrat;font-weight:800;fill:#fff">${name}</text></g></g></g>`;
}

// carte miniature dans le téléphone (raccord épingle → icône de localisation)
const ms = 1.18;
const minimap = `<rect width="372" height="792" fill="#EAF0FB"/><g transform="translate(${f1(186 - M[0] * ms)},${f1(350 - M[1] * ms)}) scale(${ms})">${mapPaths.replace(/id="map-/g, 'id="mm-')}${routeDots.replace(/class="rd"/g, 'class="mrd"')}</g>`;

// ---------- traqueur ----------
const TK = [
  ['Vous nous contactez', 'Appel reçu'],
  ['Infos envoyées', 'Chauffeur · photo'],
  ['Chauffeur contacté', 'Récupération organisée'],
  ['Colis récupéré', 'Vérifié · réemballé'],
  ['Prise en charge', 'Confirmée'],
];
let tracker = '<div class="tk-line" id="tkLine"></div><div class="tk-fill" id="tkFill"></div>';
TK.forEach(([l, s], i) => {
  tracker += `<div class="tk-step" id="tk${i + 1}"><div class="tk-dot"><div class="tk-ring"></div><span>${i + 1}</span><div class="ok">${ic('check', 26, 3.2)}</div></div><div class="tk-txt"><div class="tk-lbl">${l}</div><div class="tk-st">${s}</div></div></div>`;
});

// ---------- cartes tarifs ----------
const TARIFS = [
  { id: 1, icon: 'pin', img: 'tarif-moto.jpg', t: 'Réception et livraison à Maradi', d: 'Récupération du colis auprès du chauffeur et livraison au destinataire à Maradi.', p: '1 000' },
  { id: 2, icon: 'bus', img: 'tarif-agence.jpg', t: 'Réception et expédition vers une autre ville', d: "Récupération du colis à Maradi et dépôt auprès de l'agence de transport de votre choix.", p: '1 500' },
  { id: 3, icon: 'open', img: 'tarif-ouverture.jpg', t: 'Ouverture, vérification et reconditionnement', d: 'Pour les colis nécessitant une ouverture, une vérification ou un nouvel emballage.', p: '2 000' },
];
const tarifCards = TARIFS.map((c) => `<div class="tCard" id="tc${c.id}"><div class="ph">${`<img src="assets/photos/${c.img}"/>`}</div><div class="ic">${ic(c.icon, 40, 2.4)}</div><h3>${c.t}</h3><p>${c.d}</p><div class="from">À partir de</div><div class="badge"><span class="pv">${c.p}</span><small>F CFA</small></div></div>`).join('');
const tarifMinis = TARIFS.map((c) => `<div class="mini" id="mn${c.id}"><span class="mt">${['Livraison à Maradi', 'Expédition autre ville', 'Ouverture · réemballage'][c.id - 1]}</span><span class="pr">${c.p} F</span></div>`).join('');

// ---------- SFX (pistes audio placées) ----------
const T = (txt, n = 1) => { let k = 0; for (const w of words) if (w.text === txt && ++k === n) return w.start; throw new Error('mot introuvable ' + txt + ' #' + n); };
const sfxList = [
  ['whoosh', T('Voici') - 0.25, 0.9, 0.45],
  ['pop', T('Hadiza,') - 0.02, 0.2, 0.55],
  ['whoosh', T('Alors,') - 0.3, 0.9, 0.4],
  ['bip', T('appelle') + 0.05, 0.4, 0.5],
  ['notif', T('WhatsApp,') + 0.1, 0.7, 0.55],
  ['notif', T('numéro') - 0.1, 0.7, 0.45],
  ['bip', T('numéro') + 0.2, 0.4, 0.45],
  ['notif', T('photo') - 0.05, 0.7, 0.45],
  ['whoosh', T('Notre') - 0.35, 0.9, 0.45],
  ['bip', T('appelle', 2) + 0.1, 0.4, 0.5],
  ['pop', T('Le') + 0.05, 0.2, 0.5],
  ['bip', T('récupéré,') + 0.05, 0.4, 0.5],
  ['whoosh', T('vérifié,') - 0.2, 0.9, 0.35],
  ['ruban', T('réemballé') - 0.05, 0.75, 0.55],
  ['ruban', T('Puis') - 0.35, 0.75, 0.6],
  ['whoosh', T('Puis') - 0.15, 0.9, 0.35],
  ['pop', T('livré'), 0.2, 0.45],
  ['pop', T('Niamey,'), 0.2, 0.4],
  ['pop', T('Zinder,'), 0.2, 0.4],
  ['pop', T('Tahoua,'), 0.2, 0.4],
  ['pop', T('Agadez'), 0.2, 0.4],
  ['whoosh', T('sous-région.') - 0.2, 0.9, 0.35],
  ['notif', T('confirmation :') + 0.05, 0.7, 0.6],
  ['bip', T('charge.') + 0.05, 0.4, 0.55],
  ['whoosh', T('Les') - 0.3, 0.9, 0.4],
  ['pop', T('Livraison'), 0.2, 0.45],
  ['flip', T('Expédition') - 0.05, 0.4, 0.6],
  ['flip', T('Ouverture') - 0.05, 0.4, 0.6],
  ['impression', T('facture') - 0.2, 0.8, 0.5],
  ['impact', T('Votre', 2) - 0.05, 1.2, 0.45],
  ['pop', T('74'), 0.2, 0.4], ['pop', T('58'), 0.2, 0.4], ['pop', T('18'), 0.2, 0.4], ['pop', T('24.'), 0.2, 0.4],
  ['ruban', T('Allô', 2) - 0.1, 0.75, 0.45],
  ['impact', T('Tous') - 0.05, 1.2, 0.4],
];
const sfx = sfxList.map(([n, t, d, v], i) => `<audio id="sfx${i}" src="assets/sfx/${n}.wav" data-start="${f1(Math.max(0, t) * 100) / 100}" data-duration="${d}" data-track-index="${21 + (i % 4)}" data-volume="${v}"></audio>`).join('\n  ');

// ---------- assemblage ----------
const DATA = { words, pts, routeSamples, arrowMeta, dur: DUR };
const FORMATS = [
  { fmt: 'v', dir: '9x16', W: 1080, H: 1920, label: '9:16' },
  { fmt: 'h', dir: '16x9', W: 1920, H: 1080, label: '16:9' },
];
for (const F of FORMATS) {
  const rep = {
    FMT: F.fmt, FMTLABEL: F.label, W: F.W, H: F.H, DUR, S13DUR: f1(DUR - 60.2),
    MAP_PATHS: mapPaths, ROUTE, ARROWS: arrows + `<g id="routeDots">${routeDots}</g>`, CITY_DOTS: cityDots,
    PIN_CLOSE: pinClose, PIN_UI: pinUi, MINIBOX: miniBox, WIDE_PINS: widePins, MINIMAP: minimap,
    KANO: K.join(','), MARADI: M.join(','),
    LBL_NIGER_X: pts.lbl_niger[0], LBL_NIGER_Y: pts.lbl_niger[1], LBL_NIGERIA_X: pts.lbl_nigeria[0], LBL_NIGERIA_Y: pts.lbl_nigeria[1],
    HERO_BOX: heroBox, BOX_PHOTO: boxPhoto, TRACKER: tracker, TARIF_CARDS: tarifCards, TARIF_MINIS: tarifMinis, SFX: sfx,
    I_CLOCK: ic('clock', 30), I_TRUCK: ic('truck', 30), I_STORE: ic('store', 30), I_PHONE: ic('phone', 30), I_CAMERA: ic('camera', 30),
    I_USER: ic('user', 30), I_CHECK: ic('check', 30, 3), I_PIN: ic('pin', 30), I_HEADSET: ic('headset', 120, 1.8, '#06347E'),
    I_TRUCK_BIG: ic('truck', 110, 1.8), I_SPEAKER: ic('speaker', 34, 2.2, '#fff'), I_HANG: ic('hang', 34, 2.2, '#fff'), I_WA: ic('wa', 34, 2.2, '#fff'),
    I_CHECK_BIG: ic('check', 120, 3.2),
    DATA: JSON.stringify(DATA), FILM_JS: film,
  };
  let html = tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => { if (!(k in rep)) throw new Error('placeholder ' + k); return String(rep[k]); });
  const out = path.join(ROOT, 'build', F.dir);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), html);
  // assets partagés (copiés : le rendu ne suit pas les liens hors projet)
  const A = path.join(out, 'assets');
  fs.rmSync(A, { recursive: true, force: true });
  fs.cpSync(path.join(ROOT, 'assets'), A, { recursive: true, filter: (s) => !/source\.jpg$|hadiza-large/.test(s) });
  fs.mkdirSync(path.join(A, 'audio'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'audio/voix-off.wav'), path.join(A, 'audio/voix-off.wav'));
  fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({ id: `allo-video2-colis-kano-${F.dir}`, name: `Allô · Colis Kano → Maradi (${F.label})` }, null, 2));
  fs.writeFileSync(path.join(out, 'hyperframes.json'), JSON.stringify({ $schema: 'https://hyperframes.heygen.com/schema/hyperframes.json', registry: 'https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry', paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' }, media: { autoProxy: true }, authoringSkill: 'general-video' }, null, 2));
  fs.writeFileSync(path.join(out, 'package.json'), JSON.stringify({
    name: `allo-video2-${F.dir}`, private: true, type: 'module',
    scripts: { dev: 'npx --yes hyperframes@0.9.39 preview', check: 'npx --yes hyperframes@0.9.39 check', render: 'npx --yes hyperframes@0.9.39 render' },
  }, null, 2));
  console.log('build', F.dir, (html.length / 1024).toFixed(0) + ' Ko');
}
