// Remplace l'adresse du site dans tous les fichiers (balises Open Graph, canonical, sitemap...).
// Usage : node scripts/set-domain.js https://allomultiservice.netlify.app
// La premiere fois, la valeur remplacee est https://DOMAINE. Ensuite, le script
// retient l'adresse courante dans scripts/.site-url et peut la changer a nouveau.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const STATE = path.join(__dirname, '.site-url');

const next = (process.argv[2] || '').replace(/\/+$/, '');
if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(next)) {
  console.error('Adresse invalide. Exemple : node scripts/set-domain.js https://allomultiservice.netlify.app');
  process.exit(1);
}
const SITE_URL = fs.existsSync(STATE) ? fs.readFileSync(STATE, 'utf8').trim() : 'https://DOMAINE';
const FILES = ['index.html', 'a-propos.html', 'contact.html', 'offline.html', 'sitemap.xml', 'robots.txt'];
let total = 0;
for (const f of FILES) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  const src = fs.readFileSync(p, 'utf8');
  const count = src.split(SITE_URL).length - 1;
  if (count) { fs.writeFileSync(p, src.split(SITE_URL).join(next)); total += count; console.log(`${f} : ${count} remplacement(s)`); }
}
fs.writeFileSync(STATE, next + '\n');
console.log(`Termine : ${SITE_URL} -> ${next} (${total} remplacements).`);
