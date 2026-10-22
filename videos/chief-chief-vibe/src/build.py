# Builds index.html (16:9) and vertical.html (9:16) from the shared body/animation.
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
body = (root / "src/body.html").read_text()
anim = (root / "src/anim.js").read_text()
# always-centred text blocks
for i in ["s1-lead", "s1-big", "s2-lead", "s2-big", "s2-lead2", "s2-big2", "s6-lead", "s6-big", "s7-lead", "s10-lead", "s13-lead", "s13-big", "s13-pill", "s13-info"]:
    body = body.replace(f'id="{i}" class="abs', f'id="{i}" class="abs ctr')
TPL = """<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={w}, height={h}" />
    <title>Chief-Chief — pub vibe motion {fmt}</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <link rel="stylesheet" href="assets/theme.css" />
    <style>
{css}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="36.96" data-fps="30" data-width="{w}" data-height="{h}">
{body}
    </div>
    <script>
{anim}
    </script>
  </body>
</html>
"""
for name, w, h, css, fmt in [("index.html", 1920, 1080, "layout-16x9.css", "16:9"), ("vertical/index.html", 1080, 1920, "layout-9x16.css", "9:16")]:
    c = (root / "src" / css).read_text()
    (root / name).write_text(TPL.format(w=w, h=h, css=c, body=body, anim=anim, fmt=fmt))
print("built")
