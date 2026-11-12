"""Génère les 2 racines (16:9 = index.html, 9:16 = vertical.html) à partir d'UNE liste de scènes.
Toute modification de timing se fait ici, puis : python3 tools/build_roots.py"""
DUR = 37.5
SCENES = [  # id, début, durée (secondes du film)
    ("s1-hook", 0.0, 3.6),
    ("s2-avalanche", 3.25, 7.5),
    ("s3-nom", 10.6, 1.5),
    ("s4-marque", 11.94, 2.81),
    ("s5-prix", 14.55, 8.55),
    ("s6-semaine", 22.9, 4.35),
    ("s7-appel", 27.0, 6.1),
    ("s8-final", 32.85, 4.65),
]
FORMATS = {"index.html": (1920, 1080, "h"), "format-9x16/index.html": (1080, 1920, "v")}  # 9:16 = sous-projet (liens vers compositions/ et assets/)
for fname, (w, h, fmt) in FORMATS.items():
    hosts = "\n".join(
        f'      <div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" '
        f'data-start="{st}" data-duration="{d}" data-track-index="{i+1}" data-track-kind="graphics" '
        f'data-width="{w}" data-height="{h}" style="z-index:{i+1}"></div>'
        for i, (sid, st, d) in enumerate(SCENES))
    html = f'''<!doctype html>
<html lang="fr" data-fmt="{fmt}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={w}, height={h}" />
    <!-- Fichier généré par tools/build_roots.py : modifier les scènes dans compositions/ -->
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/vendor/MorphSVGPlugin.min.js"></script>
    <script src="assets/vendor/CustomEase.min.js"></script>
    <script>gsap.registerPlugin(MorphSVGPlugin, CustomEase);</script>
    <script src="assets/fx.js"></script>
    <link rel="stylesheet" href="assets/brand.css" />
    <style>html, body {{ width: {w}px; height: {h}px; }}</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="{w}" data-height="{h}">
{hosts}
      <!-- sous-titres retirés à la demande du client (compositions/captions.html conservé, non monté) -->
      <audio id="bande-son" class="clip" src="assets/audio/bande-son.wav" data-start="0" data-duration="{DUR}" data-track-index="30" data-volume="1"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
'''
    open(fname, "w").write(html)
print("ok")
