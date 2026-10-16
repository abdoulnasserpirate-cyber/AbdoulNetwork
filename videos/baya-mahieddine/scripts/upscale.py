"""Real-ESRGAN x4 (realesr-general-x4v3, SRVGGNetCompact) on CPU for the presenter footage.

Blends the regular and the "weak denoise" weights (like Real-ESRGAN's -dn option) to keep skin natural.
Usage: python3 scripts/upscale.py in_dir out_dir [denoise=0.5]
Reads every PNG in in_dir, writes same names to out_dir (skips ones already done).
"""
import sys
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image


class SRVGGNetCompact(nn.Module):
    def __init__(self, num_in_ch=3, num_out_ch=3, num_feat=64, num_conv=32, upscale=4):
        super().__init__()
        self.upscale = upscale
        self.body = nn.ModuleList([nn.Conv2d(num_in_ch, num_feat, 3, 1, 1), nn.PReLU(num_parameters=num_feat)])
        for _ in range(num_conv):
            self.body.append(nn.Conv2d(num_feat, num_feat, 3, 1, 1))
            self.body.append(nn.PReLU(num_parameters=num_feat))
        self.body.append(nn.Conv2d(num_feat, num_out_ch * upscale * upscale, 3, 1, 1))
        self.upsampler = nn.PixelShuffle(upscale)

    def forward(self, x):
        out = x
        for m in self.body:
            out = m(out)
        out = self.upsampler(out)
        return out + F.interpolate(x, scale_factor=self.upscale, mode="nearest")


def load(dn):
    a = torch.load("/root/models/realesr-general-x4v3.pth", map_location="cpu")["params"]
    b = torch.load("/root/models/realesr-general-wdn-x4v3.pth", map_location="cpu")["params"]
    net = SRVGGNetCompact()
    net.load_state_dict({k: dn * b[k] + (1 - dn) * a[k] for k in a})
    return net.eval()


if __name__ == "__main__":
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    dn = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
    dst.mkdir(parents=True, exist_ok=True)
    torch.set_num_threads(4)
    net = load(dn)
    files = sorted(src.glob("*.png"))
    with torch.inference_mode():
        for i, f in enumerate(files):
            o = dst / f.name
            if o.exists():
                continue
            x = torch.from_numpy(np.asarray(Image.open(f).convert("RGB"), dtype=np.float32) / 255).permute(2, 0, 1)[None]
            y = net(x).clamp(0, 1)[0].permute(1, 2, 0).numpy()
            Image.fromarray((y * 255 + 0.5).astype(np.uint8)).save(o, compress_level=1)
            if i % 50 == 0:
                print(f"{i}/{len(files)}", flush=True)
