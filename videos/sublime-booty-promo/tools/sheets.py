"""Contact sheets of the storyboard key frames (run from the project root after tools/keyframes.mjs)."""
from PIL import Image, ImageDraw, ImageFont

BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SHOTS = [
    ("1", "1 · Accroche (0–3,6 s)"), ("2", "2 · Marque (3,6–8,5 s)"), ("3", "3 · 01 Fessiers (8,5–20,4 s)"),
    ("4", "4 · 02 Poitrine (20,4–25,9 s)"), ("5", "5 · 03 Ventre plat (25,9–32,8 s)"), ("6", "6 · Paiement (32,8–35,9 s)"),
    ("6b-a", "7a · Livraison Maradi (≈36,0 s)"), ("6b-b", "7b · Partout au Niger (≈37,5 s)"),
    ("6b-c", "7c · International (≈38,1 s)"), ("7", "8 · Commandez (39,1–45 s)"), ("8", "9 · Fin (45–48,9 s)"),
]
BG, INK = "#8C005C", "#FFF4C4"


def sheet(tag, cols, cw, ch, size, out, guides=False):
    lab = 52
    rows = -(-len(SHOTS) // cols)
    s = Image.new("RGB", (cw * cols, (ch + lab) * rows), BG)
    d = ImageDraw.Draw(s)
    font = ImageFont.truetype(BOLD, size)
    for i, (key, name) in enumerate(SHOTS):
        x, y = (i % cols) * cw, (i // cols) * (ch + lab)
        d.text((x + 14, y + 12), name, fill=INK, font=font)
        s.paste(Image.open(f"storyboard/{tag}-s{key}.png").resize((cw - 8, ch - 8)), (x + 4, y + lab))
        if guides:  # TikTok keep-out lines at y=220 and y=1540
            k = (ch - 8) / 1920
            for yy in (220, 1540):
                d.line([(x + 4, y + lab + yy * k), (x + cw - 4, y + lab + yy * k)], fill="#25D366", width=1)
    s.save(out, quality=88)


sheet("16x9", 2, 960, 540, 30, "storyboard/planche-16x9.jpg")
sheet("9x16", 4, 480, 854, 20, "storyboard/planche-9x16.jpg", guides=True)
print("sheets written")
