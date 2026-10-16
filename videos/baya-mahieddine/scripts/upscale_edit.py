"""Upscales (Real-ESRGAN x4 via onnxruntime) every distinct source frame used by the edit.

Keyed by source frame so a re-edit only processes new frames.
Usage: python3 scripts/upscale_edit.py   -> work/up/<clip>/<idx>.png (1440x2560)
Requires /root/models/esr.onnx (exported from scripts/upscale.py weights, denoise 0.5).
"""
import os
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
frames = sorted((ROOT / "work/edit/frames").iterdir())
srcs = sorted({os.path.realpath(f) for f in frames})
so = ort.SessionOptions()
so.intra_op_num_threads = int(os.environ.get("THREADS", "4"))
sess = ort.InferenceSession("/root/models/esr.onnx", so)
todo = []
for s in srcs:
    p = Path(s)
    o = ROOT / "work/up" / p.parent.name / (p.stem + ".jpg")
    if not o.exists():
        todo.append((p, o))
print(f"{len(srcs)} distinct frames, {len(todo)} to do", flush=True)
for i, (p, o) in enumerate(todo):
    o.parent.mkdir(parents=True, exist_ok=True)
    x = (np.asarray(Image.open(p).convert("RGB"), dtype=np.float32) / 255).transpose(2, 0, 1)[None]
    y = np.clip(sess.run(None, {"x": x})[0][0], 0, 1).transpose(1, 2, 0)
    tmp = o.with_suffix(".tmp.jpg")
    Image.fromarray((y * 255 + 0.5).astype(np.uint8)).save(tmp, quality=95, subsampling=0)
    tmp.rename(o)
    if i % 25 == 0:
        print(f"{i}/{len(todo)}", flush=True)
print("DONE", flush=True)
