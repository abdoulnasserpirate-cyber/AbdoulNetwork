// Genere l'image de partage assets/og/og-image.jpg (1200 x 630, JPG < 300 Ko)
// Rendu HTML avec Playwright, compression avec sharp.
// Les elements importants restent dans le carre central de 630 x 630 px
// (WhatsApp recadre parfois l'apercu en carre).
// Usage : node scripts/generate-og.js
const path = require('path');
const fs = require('fs');
const sharp = require('./node_modules/sharp');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright est requis : npm i -D playwright'); process.exit(1); }

const ROOT = path.join(__dirname, '..');
const logo = fs.readFileSync(path.join(ROOT, 'assets/logo/logo-light.png')).toString('base64');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@112,800&family=Manrope:wght@600;700&display=block" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0}
  body{width:1200px;height:630px;overflow:hidden;background:#0A1F4D;font-family:Manrope,sans-serif;color:#fff;position:relative}
  .glow{position:absolute;width:900px;height:900px;right:-320px;top:-420px;background:radial-gradient(closest-side,rgba(30,74,158,.75),transparent)}
  .glow2{position:absolute;width:700px;height:700px;left:-300px;bottom:-460px;background:radial-gradient(closest-side,rgba(19,48,110,.9),transparent)}
  .grain{position:absolute;inset:0;opacity:.07;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
  .arc{position:absolute;left:0;top:0;width:1200px;height:630px}
  .arc path{fill:none;stroke:#F7941D;stroke-width:6;stroke-linecap:round}
  .block{position:absolute;left:285px;top:0;width:630px;height:630px;display:flex;flex-direction:column;justify-content:center;gap:34px;padding:0 6px}
  .logo{width:300px}
  h1{font-family:Archivo,sans-serif;font-stretch:112%;font-weight:800;font-size:60px;line-height:.98;letter-spacing:-.02em}
  h1 span{color:#F7941D}
  .info{display:flex;gap:18px;align-items:center;font-weight:700;font-size:30px;font-variant-numeric:tabular-nums}
  .info i{width:2px;height:24px;background:rgba(255,255,255,.3)}
  .info b{color:#F7941D}
</style></head><body>
<div class="glow"></div><div class="glow2"></div><div class="grain"></div>
<svg class="arc" viewBox="0 0 1200 630"><path d="M-20 560 C 300 640, 800 610, 1220 470"/></svg>
<div class="block">
  <img class="logo" src="data:image/png;base64,${logo}">
  <h1>Livraison express<br>dans tout <span>Maradi</span></h1>
  <div class="info"><span>7j/7</span><i></i><span>Dès 500 F</span><i></i><b>74 58 18 24</b></div>
</div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: 'png' });
  await browser.close();
  fs.mkdirSync(path.join(ROOT, 'assets/og'), { recursive: true });
  const out = path.join(ROOT, 'assets/og/og-image.jpg');
  let q = 86, buf;
  do { buf = await sharp(png).jpeg({ quality: q, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer(); q -= 6; } while (buf.length > 280 * 1024 && q > 40);
  fs.writeFileSync(out, buf);
  console.log(`og-image.jpg : ${(buf.length / 1024).toFixed(0)} Ko`);
})();
