"""Assemble the two standalone compositions from src/:
index.html (16:9, 1920x1080) and vertical.html (9:16, 1080x1920).
Run from the project root: python3 tools/build.py"""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = root / "src"
body = (src / "body.html").read_text()
css = (src / "film.css").read_text()
js = (src / "film.js").read_text()
motion = (src / "motion.js").read_text() if (src / "motion.js").exists() else ""
map_frag = (root / "assets/map/layers.svg.frag").read_text()
# delivery map camera: Maradi close-up, whole Niger, whole Africa (viewBox per format)
MAP_A = {"land": "507 462.2 70 55.6", "port": "510 461 64 58"}

# The 9:16 cut lives in its own HyperFrames project (one root composition per project);
# vertical/assets is a symlink to the shared assets folder.
vdir = root / "vertical"
vdir.mkdir(exist_ok=True)
if not (vdir / "assets").exists():
    (vdir / "assets").symlink_to("../assets")
for f in ("hyperframes.json", "package.json"):
    (vdir / f).write_text((root / f).read_text())
(vdir / "meta.json").write_text('{\n  "id": "sublime-booty-promo-9x16",\n  "name": "sublime-booty-promo-9x16"\n}\n')

for name, fmt, w, h in (("index.html", "land", 1920, 1080), ("vertical/index.html", "port", 1080, 1920)):
    layout = (src / f"{fmt}.css").read_text()
    page = f"""<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={w}, height={h}" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
{css}
{layout}
    </style>
  </head>
  <body>
{body}
    <script>
{js.replace("/*{{MOTION}}*/", motion)}
    </script>
  </body>
</html>
"""
    page = page.replace("{{MAP}}", map_frag).replace("{{MAP_A}}", MAP_A[fmt])
    page = page.replace("{{W}}", str(w)).replace("{{H}}", str(h)).replace("{{FMT}}", fmt)
    (root / name).write_text(page)
    print("wrote", name)
