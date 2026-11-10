// Prepare les photos reelles du site (WebP + AVIF + JPG de repli).
// Source actuelle : la photo du livreur extraite de l'affiche officielle (src-assets/affiche-source.jpg).
// Quand le client fournit les photos originales en haute definition, deposez-les dans src-assets/
// et adaptez la liste PHOTOS ci-dessous.
// Usage : node scripts/optimize-images.js
const sharp = require('./node_modules/sharp');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const PHOTOS = [
  {
    // Livreur + sac isotherme : zone photo de l'affiche, sans les textes ni pictogrammes
    name: 'livreur',
    src: 'src-assets/affiche-source.jpg',
    extract: { left: 0, top: 466, width: 604, height: 362 },
    widths: [420, 604],
  },
];

(async () => {
  for (const p of PHOTOS) {
    for (const w of p.widths) {
      const base = sharp(path.join(ROOT, p.src)).extract(p.extract).resize({ width: w }).sharpen({ sigma: 0.6 });
      const out = path.join(ROOT, 'assets', 'img', `${p.name}-${w}`);
      await base.clone().webp({ quality: 80 }).toFile(out + '.webp');
      await base.clone().avif({ quality: 58 }).toFile(out + '.avif');
      await base.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(out + '.jpg');
      console.log('ok', out);
    }
  }
})();
