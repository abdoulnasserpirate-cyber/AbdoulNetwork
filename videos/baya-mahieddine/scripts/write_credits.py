"""Writes credits.txt from assets/photos/credits.json (only photos actually used in timeline.py)."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from timeline import SHOTS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
used = set()
for s in SHOTS:
    if s.get("photo"):
        used.add(s["photo"])
    used.update(s.get("mosaic", []))
cr = [c for c in json.load(open(ROOT / "assets/photos/credits.json")) if Path(c["file"]).stem in used]
lines = [
    "L'HISTOIRE DE BAYA MAHIEDDINE — CRÉDITS",
    "",
    "Narration : AMOUSSOU HOUNGBEDJI Marie Marthe (Université Dan Dicko Dankoulodo de Maradi, Niger)",
    "Rushes : 5 vidéos smartphone fournies (VID-20261016-WA0074 à WA0078).",
    "",
    "MUSIQUE ET SONS",
    "Musique originale et design sonore synthétisés pour ce film (scripts/make_audio.py) —",
    "aucun échantillon tiers, aucun droit à céder.",
    "",
    "CARTE",
    "Natural Earth (domaine public), via le paquet npm world-atlas.",
    "",
    "PHOTOGRAPHIES",
    "Toutes issues de l'Open Images Dataset (Google) ; chaque image est sous licence",
    "Creative Commons Attribution 2.0 (CC BY 2.0) par son auteur Flickr. Les photochromes",
    "d'Algérie (vers 1895-1899) proviennent de la collection Photochrom de la Library of Congress",
    "(œuvres du domaine public), republiées sur Flickr par les auteurs indiqués.",
    "Les œuvres photographiées (Picasso, Delacroix, Matisse, Van Gogh) restent la propriété",
    "de leurs ayants droit ; elles apparaissent ici à titre d'illustration documentaire.",
    "",
]
for c in sorted(cr, key=lambda c: c["file"]):
    lines.append(f"- {Path(c['file']).stem}: « {c['title']} » — {c['author']} — {c['license']} — {c['source']}")
lines += ["", "Montage, étalonnage, upscale IA (Real-ESRGAN), débruitage (DeepFilterNet3), sous-titres :",
          "pipeline open source documenté dans scripts/ ; composition HyperFrames (index.html)."]
(ROOT / "credits.txt").write_text("\n".join(lines) + "\n")
print(len(cr), "photo credits")
