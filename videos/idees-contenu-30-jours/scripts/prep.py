"""Stage 1: build the restored 1080×1920 base clip and the cleaned voice track.

Uses src/original.mp4 when present (full-quality camera file), otherwise the
compressed upload. Image: denoise → Lanczos upscale → sharpen → tone curve, then a
soft "power window" that lifts the shadows the cap throws on the face.
Voice: declip, rumble cut, denoise, de-mud/presence EQ, compression, −16 LUFS.
"""
import os
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from common import BASE, H, ROOT, VOICE, W, Reader  # noqa: E402

src = os.path.join(ROOT, "src", "original.mp4")
if not os.path.exists(src):
    src = os.path.join(ROOT, "src", "source_compressed.mp4")
os.makedirs(os.path.join(ROOT, "build"), exist_ok=True)
print("source:", src)

# Stronger denoise for the compressed upload, lighter for the camera original.
dn = "hqdn3d=2:1.5:4:3" if "compressed" in src else "hqdn3d=1:1:2:2"
vf = (f"{dn},scale={W}:{H}:flags=lanczos,unsharp=5:5:0.8:5:5:0,"
      "curves=master='0/0 0.12/0.155 0.3/0.36 0.6/0.65 1/0.98',eq=contrast=1.03:saturation=1.08,fps=30")
tmp = os.path.join(ROOT, "build", "enh.mkv")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", vf, "-c:v", "libx264", "-crf", "8",
                "-preset", "fast", "-pix_fmt", "yuv420p", "-an", tmp], check=True)

# Face power window: elliptical mask around the face, lifts only dark pixels.
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
mask = np.exp(-(((xx - 495) / 260) ** 2 + ((yy - 1000) / 330) ** 2))[..., None]
rd = Reader(tmp)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                        "-r", "30", "-i", "-", "-c:v", "libx264", "-crf", "9", "-preset", "medium",
                        "-pix_fmt", "yuv420p", BASE], stdin=subprocess.PIPE)
prev = None
while True:
    f = rd.next()
    if f is None or f is prev:
        break
    prev = f
    x = f.astype(np.float32)
    lum = (x @ np.array([0.299, 0.587, 0.114], np.float32))[..., None] / 255
    w = np.clip(1 - lum / 0.55, 0, 1) ** 1.5
    x *= 1 + 0.65 * mask * w
    enc.stdin.write(np.clip(x, 0, 255).astype(np.uint8).tobytes())
enc.stdin.close()
enc.wait()
os.remove(tmp)

subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vn", "-af",
                "adeclip,highpass=f=85,afftdn=nf=-30:nr=10,equalizer=f=250:t=q:w=1.2:g=-2.5,"
                "equalizer=f=3200:t=q:w=1.0:g=2.5,equalizer=f=11000:t=h:w=0.7:g=2,"
                "acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=1,loudnorm=I=-16:TP=-2:LRA=7",
                "-ar", "48000", "-ac", "2", VOICE], check=True)
print("ok")
