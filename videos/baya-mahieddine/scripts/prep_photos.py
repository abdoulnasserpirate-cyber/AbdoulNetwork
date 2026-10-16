"""Crops photochrom borders/captions, upscales every photo x4 (Real-ESRGAN, onnxruntime) and caps
the long side at 3840 px. assets/photos/raw/*.jpg -> assets/photos/*.jpg
Usage: THREADS=2 python3 scripts/prep_photos.py
"""
import os
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PHOTOCHROM = {"algiers_terrace", "embroidery_school", "constantine", "biskra_market", "algiers_group", "algiers_harbour"}
so = ort.SessionOptions()
so.intra_op_num_threads = int(os.environ.get("THREADS", "2"))
sess = ort.InferenceSession("/root/models/esr.onnx", so)
for p in sorted((ROOT / "assets/photos/raw").glob("*.jpg")):
    o = ROOT / "assets/photos" / p.name
    if o.exists():
        continue
    im = Image.open(p).convert("RGB")
    if p.stem in PHOTOCHROM:
        w, h = im.size
        im = im.crop((int(w * 0.034), int(h * 0.036), int(w * 0.975), int(h * 0.92)))
    x = (np.asarray(im, dtype=np.float32) / 255).transpose(2, 0, 1)[None]
    y = np.clip(sess.run(None, {"x": x})[0][0], 0, 1).transpose(1, 2, 0)
    up = Image.fromarray((y * 255 + 0.5).astype(np.uint8))
    up.thumbnail((3840, 3840), Image.LANCZOS)
    up.save(o, quality=92, subsampling=0)
    print(p.stem, up.size, flush=True)
