# Builds index.html (16:9) and vertical/index.html (9:16) from shared sources.
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
body = (root / "src/body.html").read_text(); anim = (root / "src/anim.js").read_text(); common = (root / "src/common.css").read_text()
TPL = """<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={w}, height={h}" />
    <title>Chief-Chief — Explosion du goût {fmt}</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <link rel="stylesheet" href="assets/theme.css" />
    <style>
{common}
{css}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="40.72" data-fps="30" data-width="{w}" data-height="{h}">
{body}
    </div>
    <script>
{anim}
    </script>
  </body>
</html>
"""
for name, w, h, css, fmt in [("index.html", 1920, 1080, "layout-16x9.css", "16:9"), ("vertical/index.html", 1080, 1920, "layout-9x16.css", "9:16")]:
    (root / name).write_text(TPL.format(w=w, h=h, common=common, css=(root / "src" / css).read_text(), body=body, anim=anim, fmt=fmt))
print("built")
