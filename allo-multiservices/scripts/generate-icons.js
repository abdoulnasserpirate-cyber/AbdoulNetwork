// Genere toutes les icones PWA / favicons a partir de la partie "Allo" du logo fourni.
// Prerequis : node scripts/prepare-logo.js (produit src-assets/logo-mark-dark.png)
// Usage : node scripts/generate-icons.js
const sharp = require('./node_modules/sharp');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const MARK = path.join(ROOT, 'src-assets', 'logo-mark-dark.png');
const OUT = path.join(ROOT, 'assets', 'icons');
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

// symbole a ratio% de la largeur, centre optiquement (legerement remonte)
async function square(size, ratio) {
  const markW = Math.round(size * ratio);
  const mark = await sharp(MARK).resize({ width: markW }).png().toBuffer();
  const { height: markH } = await sharp(mark).metadata();
  const left = Math.round((size - markW) / 2);
  const top = Math.round((size - markH) / 2 - size * 0.01);
  return sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
    .composite([{ input: mark, left, top }])
    .flatten({ background: WHITE })
    .png({ compressionLevel: 9 });
}

function buildIco(pngs) {
  // ICO avec images PNG embarquees
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach(({ size, buf }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o); dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2); dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4); dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(buf.length, o + 8); dir.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([header, dir, ...pngs.map(p => p.buf)]);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const src1024 = await (await square(1024, 0.70)).toBuffer();
  fs.writeFileSync(path.join(ROOT, 'src-assets', 'icon-source-1024.png'), src1024);
  const mask1024 = await (await square(1024, 0.60)).toBuffer();

  const jobs = [
    ['icon-192.png', src1024, 192],
    ['icon-512.png', src1024, 512],
    ['icon-maskable-512.png', mask1024, 512],
    ['apple-touch-icon.png', src1024, 180],
  ];
  for (const [name, buf, size] of jobs) {
    await sharp(buf).resize(size, size).flatten({ background: WHITE }).png({ compressionLevel: 9 }).toFile(path.join(OUT, name));
  }
  // favicons : le symbole occupe plus de place pour rester lisible en tout petit
  const fav = await (await square(256, 0.92)).toBuffer();
  const f32 = await sharp(fav).resize(32, 32).png().toBuffer();
  const f16 = await sharp(fav).resize(16, 16).png().toBuffer();
  const f48 = await sharp(fav).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(OUT, 'favicon-32.png'), f32);
  fs.writeFileSync(path.join(OUT, 'favicon-16.png'), f16);
  fs.writeFileSync(path.join(ROOT, 'favicon.ico'), buildIco([{ size: 16, buf: f16 }, { size: 32, buf: f32 }, { size: 48, buf: f48 }]));
  console.log('Icones generees dans assets/icons/ + favicon.ico');
  // Le logo fourni est un JPG : pas de favicon.svg (il faudrait un logo vectoriel).

  // Apercu : 512 px + simulation 60 px en carre arrondi et en cercle
  const prev = [];
  const r512 = await sharp(src1024).resize(512, 512).toBuffer();
  const m512 = await sharp(mask1024).resize(512, 512).toBuffer();
  const small = await sharp(src1024).resize(120, 120).toBuffer();
  const smallMask = await sharp(mask1024).resize(120, 120).toBuffer();
  const roundRect = Buffer.from('<svg width="120" height="120"><rect width="120" height="120" rx="27" fill="#fff"/></svg>');
  const circle = Buffer.from('<svg width="120" height="120"><circle cx="60" cy="60" r="60" fill="#fff"/></svg>');
  const rr = await sharp(small).composite([{ input: roundRect, blend: 'dest-in' }]).png().toBuffer();
  const cc = await sharp(smallMask).composite([{ input: circle, blend: 'dest-in' }]).png().toBuffer();
  await sharp({ create: { width: 1300, height: 600, channels: 4, background: '#5B6679' } })
    .composite([
      { input: r512, left: 40, top: 44 },
      { input: m512, left: 600, top: 44 },
      { input: rr, left: 1150, top: 150 },
      { input: cc, left: 1150, top: 330 },
    ])
    .png().toFile(path.join(ROOT, 'src-assets', 'apercu-icones.png'));
})();
