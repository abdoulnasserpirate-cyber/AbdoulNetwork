const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const out = process.argv[2];
const only = process.argv[3];
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); });
}).listen(8765);

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1400 } });
  page.on('console', m => console.log('console:', m.text()));
  page.on('pageerror', e => console.log('pageerror:', e.message));
  const list = only ? [only] : ['kit-sexy-lady', 'kit-curves', 'kit-booster-ultra-dose', 'creme-imperiale', 'kit-gros-lolo-luxe', 'gamme-pure-glow'];
  for (const p of list) {
    await page.goto(`http://127.0.0.1:8765/mockup.html?p=${p}`);
    await page.waitForFunction(() => window.__done === true, null, { timeout: 180000 });
    await page.locator('canvas').screenshot({ path: path.join(out, `${p}.png`), omitBackground: true });
    console.log('ok', p);
  }
  await browser.close();
  server.close();
})();
