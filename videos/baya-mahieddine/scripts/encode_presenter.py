"""Encodes the presenter program track (edit order) with the documentary grade.

Usage: python3 scripts/encode_presenter.py proxy   # fast: lanczos from 360x640 (for layout work)
       python3 scripts/encode_presenter.py final   # Real-ESRGAN frames (work/up) -> 1440x2560
Out: assets/video/presenter.mp4 (silent; the voice lives in assets/audio/mix.wav)
"""
import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
mode = sys.argv[1] if len(sys.argv) > 1 else "proxy"
frames = sorted((ROOT / "work/edit/frames").iterdir())
GRADE = ",".join([
    "eq=contrast=1.06:brightness=0.012:saturation=1.08:gamma=0.98",
    "colorbalance=rs=0.035:bs=-0.03:rm=0.02:bm=-0.02",   # gentle warmth, natural skin
    "vignette=angle=PI/6",
    "unsharp=5:5:0.45",
])
with tempfile.TemporaryDirectory() as td:
    lst = Path(td) / "list.txt"
    with open(lst, "w") as f:
        for fr in frames:
            src = os.path.realpath(fr)
            if mode == "final":
                p = Path(src)
                src = ROOT / "work/up" / p.parent.name / (p.stem + ".jpg")
                assert src.exists(), src
            f.write(f"file '{src}'\nduration {1/30:.6f}\n")
    scale = "scale=1440:2560:flags=lanczos" if mode == "proxy" else "null"
    (ROOT / "assets/video").mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
                    "-vf", f"{scale},{GRADE},fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "slow",
                    "-crf", "14" if mode == "final" else "20", "-g", "30", "-movflags", "+faststart", "-an",
                    str(ROOT / "assets/video/presenter.mp4")], check=True)
print("presenter", mode, len(frames), "frames")
