"""Copies the chosen Open Images photos into assets/photos/raw/<name>.jpg and writes credits.

All photos: Open Images Dataset (Google), each image under CC BY 2.0 by its Flickr author.
Usage: python3 scripts/select_photos.py
"""
import glob
import html
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CHOSEN = {  # name: image-id prefix
    "algiers_terrace": "db55e4", "constantine": "fe3cc8", "embroidery_school": "697256", "biskra_market": "952045",
    "algiers_group": "1da906", "algiers_harbour": "6e4dd5",
    "breton_1938": "25327e", "breton_book": "974e32", "picasso_selfportrait": "2eb145", "musee_picasso": "ad8e4b",
    "paris_1950_eiffel": "8c651e", "paris_vintage_street": "302f8b", "paris_1950": "2c76db",
    "gallery_wall": "0f0f6f", "museum_visitor": "ab3f96", "kelvingrove": "8d3b70", "museum_hall": "dbb960",
    "paint_bottles": "cf7226", "flowers_oil": "acb925", "delacroix_flowers": "e06d1d", "matisse_anemones": "e966a8",
    "girls_flower_paintings": "b9cdb7", "child_painting": "76613c", "kid_paints_floor": "6a706a",
    "hoopoe": "ef4302", "kingfisher": "12b4e7", "bulbul": "8e0a73", "king_parrot": "00882d", "stork_kingfisher": "3eb4fa",
    "rose_garden": "1bd53c", "garden_spring": "5cbecc", "lavender": "bd238f", "rose_macro": "a38217",
    "classroom_archive": "f42a88",
    "couple_hands": "d3ae35", "bridal_roses": "0ff5a1", "candle_love": "0e637c", "wedding_bw": "df5289", "candle_table": "c59f5f",
    "book_achebe": "51f15f", "students_campus": "58c818", "lecture_hall": "fae53b", "library_cozy": "dfb02b",
    "ouidah_museum": "2a1d55", "niamey": "eebb0c", "niger_well": "eed695",
}


def main():
    idx = {}
    for f in glob.glob("/root/oi/cand/*.json"):
        for m in json.load(open(f)):
            idx[m["id"]] = (Path(f).stem, m)
    out = ROOT / "assets/photos/raw"
    out.mkdir(parents=True, exist_ok=True)
    credits = []
    for name, pre in CHOSEN.items():
        hits = [(k, v) for k, v in idx.items() if k.startswith(pre)]
        assert len(hits) == 1, (name, pre, len(hits))
        k, (topic, m) = hits[0]
        shutil.copy(f"/root/oi/cand/{topic}/{k}.jpg", out / f"{name}.jpg")
        credits.append({"file": f"assets/photos/{name}.jpg", "title": html.unescape(m["title"]),
                        "author": html.unescape(m["author"]), "license": m["license"], "source": m["page"],
                        "open_images_id": k})
    json.dump(credits, open(ROOT / "assets/photos/credits.json", "w"), ensure_ascii=False, indent=1)
    print(len(credits), "photos")


if __name__ == "__main__":
    main()
