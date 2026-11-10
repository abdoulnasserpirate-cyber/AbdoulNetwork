// Detoure le logo fourni (fond bleu marine) et produit :
//  - logo-light.png : version d'origine (blanc + orange) sur fond transparent
//  - logo-dark.png  : meme logo, le blanc passe en bleu marine (version de l'affiche officielle)
//  - logo-mark-*.png : uniquement la partie "Allo" + combine (pour les icones)
// Usage : node scripts/prepare-logo.js
const sharp = require('./node_modules/sharp');
const path = require('path');
const SRC = path.join(__dirname, '..', 'src-assets', 'logo-source.jpg');
const OUT = path.join(__dirname, '..', 'assets', 'logo');
const BG = [0, 35, 91];
const NAVY = [0x0a, 0x1f, 0x4d];

(async () => {
  const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const light = Buffer.alloc(W * H * 4);
  const dark = Buffer.alloc(W * H * 4);
  const ref = Math.hypot(255 - BG[0], 255 - BG[1], 255 - BG[2]) * 0.55;
  for (let i = 0, j = 0; i < W * H * 3; i += 3, j += 4) {
    const p = [data[i], data[i + 1], data[i + 2]];
    const d = Math.hypot(p[0] - BG[0], p[1] - BG[1], p[2] - BG[2]);
    let a = Math.max(0, Math.min(1, (d - 22) / ref));
    const u = [0, 1, 2].map(k => a > 0 ? Math.max(0, Math.min(255, BG[k] + (p[k] - BG[k]) / Math.max(a, 0.35))) : 0);
    light[j] = u[0]; light[j + 1] = u[1]; light[j + 2] = u[2]; light[j + 3] = Math.round(a * 255);
    // blanc -> marine, orange conserve
    const whiteness = Math.max(0, Math.min(1, (u[2] - 110) / 110));
    for (let k = 0; k < 3; k++) dark[j + k] = Math.round(u[k] * (1 - whiteness) + NAVY[k] * whiteness);
    dark[j + 3] = light[j + 3];
  }
  // zone de bruit en bas a droite (petit point) : on l'efface
  const clear = (buf) => { for (let y = H - 260; y < H; y++) for (let x = W - 260; x < W; x++) buf[(y * W + x) * 4 + 3] = 0; };
  clear(light); clear(dark);

  // boite englobante + separation "Allo" / "MULTISERVICES"
  const rows = new Array(H).fill(0); let minX = W, maxX = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (light[(y * W + x) * 4 + 3] > 140) { rows[y]++; if (x < minX) minX = x; if (x > maxX) maxX = x; }
  }
  const top = rows.findIndex(r => r > 4);
  let bottom = H - 1; while (rows[bottom] <= 4) bottom--;
  // plus grand creux entre 60 % et 90 % de la hauteur utile = separation
  let gapStart = -1, best = 0, cur = 0, curStart = 0;
  for (let y = top + Math.round((bottom - top) * 0.55); y < bottom; y++) {
    if (rows[y] <= 4) { if (!cur) curStart = y; cur++; if (cur > best) { best = cur; gapStart = curStart; } } else cur = 0;
  }
  console.log({ W, H, top, bottom, minX, maxX, gapStart, best });
  const raw = { raw: { width: W, height: H, channels: 4 } };
  const pad = 40;
  const full = { left: Math.max(0, minX - pad), top: Math.max(0, top - pad), width: Math.min(W, maxX + pad) - Math.max(0, minX - pad), height: Math.min(H, bottom + pad) - Math.max(0, top - pad) };
  for (const [name, buf] of [['logo-light', light], ['logo-dark', dark]]) {
    await sharp(buf, raw).extract(full).resize({ width: 1200 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, name + '.png'));
    await sharp(buf, raw).extract(full).resize({ width: 360 }).webp({ quality: 88, alphaQuality: 90 }).toFile(path.join(OUT, name + '.webp'));
  }
  // marque seule : de top a gapStart, recadree sur ses propres bords
  const markBottom = gapStart > 0 ? gapStart : bottom;
  let mMin = W, mMax = 0;
  for (let y = top; y < markBottom; y++) for (let x = 0; x < W; x++) if (light[(y * W + x) * 4 + 3] > 140) { if (x < mMin) mMin = x; if (x > mMax) mMax = x; }
  const mark = { left: mMin, top, width: mMax - mMin + 1, height: markBottom - top };
  console.log('mark', mark);
  await sharp(dark, raw).extract(mark).resize({ width: 1400 }).png().toFile(path.join(__dirname, '..', 'src-assets', 'logo-mark-dark.png'));
  await sharp(light, raw).extract(mark).resize({ width: 1400 }).png().toFile(path.join(__dirname, '..', 'src-assets', 'logo-mark-light.png'));
})();
