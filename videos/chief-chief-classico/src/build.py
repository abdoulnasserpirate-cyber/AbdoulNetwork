# Builds index.html (16:9) from the shared body / layout / animation sources.
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
body = (root / "src/body.html").read_text()
anim = (root / "src/anim.js").read_text()
css = (root / "src/layout.css").read_text()
html = f"""<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Chief-Chief — Soirée Classico</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <link rel="stylesheet" href="assets/theme.css" />
    <style>
{css}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="45.94" data-fps="30" data-width="1920" data-height="1080">
{body}
    </div>
    <script>
{anim}
    </script>
  </body>
</html>
"""
(root / "index.html").write_text(html)
print("built")
