"""Write index.html for one format: python3 src/build.py v|h  (v = 1080x1920, h = 1920x1080).

The scene code (src/scene.js) is inlined so the composition is a single self-describing entry file.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
fmt = sys.argv[1] if len(sys.argv) > 1 else "v"
w, h = (1080, 1920) if fmt == "v" else (1920, 1080)
js = (ROOT / "src/scene.js").read_text().replace('"../assets/', '"./assets/')
label = "vertical" if fmt == "v" else "paysage"
(ROOT / "index.html").write_text(f"""<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={w}, height={h}" />
    <title>Claude retrouve tes photos — {label}</title>
    <link rel="stylesheet" href="src/style.css" />
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/data/led-points.js"></script>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="56" data-fps="60" data-width="{w}" data-height="{h}">
      <canvas id="gl" class="layer" width="{w}" height="{h}"></canvas>
      <div id="bgdots" class="layer"></div>
      <div id="css3d" class="layer"></div>
      <div id="vignette" class="layer"></div>
      <div id="overlay" class="layer">
        <div id="glitch"></div>
      </div>
      <div id="flash" class="layer"></div>
      <audio id="mix" src="assets/audio/mix.wav" data-start="0" data-duration="56" data-track-index="10" data-volume="1"></audio>
    </div>
    <script type="module">
{js}
    </script>
  </body>
</html>
""")
print(f"index.html -> {label} {w}x{h}")
