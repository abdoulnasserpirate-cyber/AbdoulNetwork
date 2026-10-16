"""Finds real CC-BY photos in Open Images (titles + labels), keeps only those downloadable from the
CVDF S3 mirror, downloads them and makes contact sheets for visual selection.

Usage: python3 scripts/find_photos.py <topic> '<regex on title>' [max]
Output: /root/oi/cand/<topic>/<id>.jpg, /root/oi/cand/<topic>.jpg (sheet), /root/oi/cand/<topic>.json
"""
import concurrent.futures as cf
import csv
import json
import re
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw

OI = Path("/root/oi")
topic, rx = sys.argv[1], re.compile(sys.argv[2], re.I)
mx = int(sys.argv[3]) if len(sys.argv) > 3 else 40
rows = []
LBL = sys.argv[4].split("+") if len(sys.argv) > 4 else []
if LBL:
    names = {r[1].lower(): r[0] for r in csv.reader(open(OI / "oidv7-class-descriptions.csv"))}
    need = [names[l.lower()] for l in LBL]
    lab = {}
    for line in open(OI / "box_labels.csv"):
        i, m = line.strip().split(",")
        lab.setdefault(i, set()).add(m)
    keep = {i for i, ms in lab.items() if all(n in ms for n in need)}
    for r in csv.DictReader(open(OI / "box_meta.csv")):
        if r["ImageID"] in keep and rx.search(r["Title"] or "") and "by/2.0" in r["License"]:
            r["sub"] = "train"
            rows.append(r)
for f, sub in ([] if LBL else (("train_filtered.csv", "train"), ("validation-images-with-rotation.csv", "validation"), ("test-images-with-rotation.csv", "test"))):
    for r in csv.DictReader(open(OI / f)):
        if rx.search(r["Title"]) and "by/2.0" in r["License"]:
            r["sub"] = sub
            rows.append(r)
print(len(rows), "title matches")
out = OI / "cand" / topic
out.mkdir(parents=True, exist_ok=True)


def get(r):
    p = out / f"{r['ImageID']}.jpg"
    if not p.exists():
        try:
            data = urllib.request.urlopen(f"https://s3.amazonaws.com/open-images-dataset/{r['sub']}/{r['ImageID']}.jpg", timeout=20).read()
        except Exception:
            return None
        if not data.startswith(b"\xff\xd8"):
            return None
        p.write_bytes(data)
    try:
        im = Image.open(p)
        im.load()
    except Exception:
        return None
    return r, im.size


ok = []
with cf.ThreadPoolExecutor(16) as ex:
    for res in ex.map(get, rows[:400]):
        if res:
            ok.append(res)
        if len(ok) >= mx:
            break
print(len(ok), "downloadable")
meta = [{"id": r["ImageID"], "title": r["Title"], "author": r["Author"], "license": r["License"],
         "page": r["OriginalLandingURL"], "size": s} for r, s in ok]
json.dump(meta, open(OI / "cand" / f"{topic}.json", "w"), ensure_ascii=False, indent=1)
# contact sheet, 5 per row, numbered
W, H = 320, 220
cols = 5
sheet = Image.new("RGB", (W * cols, H * ((len(ok) + cols - 1) // cols or 1)), "white")
d = ImageDraw.Draw(sheet)
for i, (r, s) in enumerate(ok):
    im = Image.open(out / f"{r['ImageID']}.jpg").convert("RGB")
    im.thumbnail((W - 6, H - 26))
    x, y = (i % cols) * W, (i // cols) * H
    sheet.paste(im, (x + 3, y + 3))
    d.rectangle([x, y + H - 22, x + W, y + H], fill="black")
    d.text((x + 4, y + H - 18), f"{i} {r['ImageID'][:6]} {s[0]}x{s[1]} {r['Title'][:26]}", fill="white")
sheet.save(OI / "cand" / f"{topic}.jpg", quality=85)
for i, m in enumerate(meta):
    print(i, m["id"], m["size"], m["title"][:80])
