// Rend les maquettes HTML en couverture WebP + aperçu MP4 (boucle de 8 s).
//
//   node mockups/render.mjs                 → toutes les maquettes
//   node mockups/render.mjs app-boutiko     → une seule
//   node mockups/render.mjs app-boutiko --cover   → couverture uniquement
//
// Nécessite Playwright (Chromium) et ffmpeg. Chemin de Playwright : variable PLAYWRIGHT_MODULE
// (par défaut le paquet « playwright » installé). Les animations sont pilotées image par image
// via document.getAnimations(), le rendu est donc net et parfaitement bouclé.
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

/** name → { cover: instant (s) de la couverture, video: aperçu animé ?, out: nom de fichier (défaut concept-<name>) } */
const mockups = {
  'app-boutiko': { cover: 4.2, video: true },
  'ia-assistant': { cover: 5.2, video: true },
  'web-academie': { cover: 0.6, video: true },
  'montage-studio': { cover: 3.1, video: true },
  'tiktok-contenu': { cover: 2.6, video: true },
  'tiktok-monetisable': { cover: 0, video: false, out: 'tiktok-monetisable-cover' },
}

const args = process.argv.slice(2)
const coverOnly = args.includes('--cover')
const names = args.filter((a) => !a.startsWith('--'))
const list = names.length ? names : Object.keys(mockups)

const FPS = 30
const DURATION = 8

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })

async function seek(t) {
  await page.evaluate((ms) => {
    for (const a of document.getAnimations()) {
      a.pause()
      a.currentTime = ms
    }
  }, t * 1000)
}

for (const name of list) {
  const conf = mockups[name]
  if (!conf) throw new Error(`Maquette inconnue : ${name}`)
  const file = join(here, `${name}.html`)
  await page.goto('file://' + file, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)

  await seek(conf.cover)
  const png = join(tmpdir(), `${name}-cover.png`)
  await page.screenshot({ path: png })
  const base = conf.out || `concept-${name}`
  const cover = join(root, 'public/images', `${base}.webp`)
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-c:v', 'libwebp', '-quality', '80', cover])
  console.log('✓ couverture', cover)

  if (!conf.video || coverOnly) continue
  const dir = mkdtempSync(join(tmpdir(), `${name}-`))
  const frames = FPS * DURATION
  for (let i = 0; i < frames; i++) {
    await seek(i / FPS)
    await page.screenshot({ path: join(dir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 })
  }
  const out = join(root, 'public/videos', `${base}.mp4`)
  execFileSync('ffmpeg', [
    '-v', 'error', '-y', '-framerate', String(FPS), '-i', join(dir, 'f%04d.jpg'),
    '-vf', 'scale=1280:-2', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out,
  ])
  rmSync(dir, { recursive: true, force: true })
  console.log('✓ vidéo', out, existsSync(out))
}

await browser.close()
