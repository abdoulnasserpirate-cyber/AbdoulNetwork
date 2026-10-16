"""Voice chain: DeepFilterNet3 (noise + room reduction) -> ffmpeg EQ / de-esser / compression.

Usage: PYTHONPATH=/root/stubs python3 scripts/process_voice.py
In : work/edit/voice_raw.wav (48 kHz mono, program timeline)
Out: work/audio/voice_dfn.wav (after AI denoise), work/audio/voice.wav (final voice stem, ~-16 LUFS)
"""
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from df.enhance import enhance, init_df

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "work/audio"
OUT.mkdir(parents=True, exist_ok=True)

x, sr = sf.read(ROOT / "work/edit/voice_raw.wav", dtype="float32")
assert sr == 48000
model, state, _ = init_df(model_base_dir="/root/models/df3/DeepFilterNet3")
# limit the attenuation so the voice keeps its natural room tone (no "underwater" artefacts)
y = enhance(model, state, torch.from_numpy(x)[None], atten_lim_db=22).numpy()[0]
# gentle blend of 8 % dry signal keeps consonants natural
y = 0.92 * y + 0.08 * x
sf.write(OUT / "voice_dfn.wav", y, sr)

chain = ",".join([
    "highpass=f=80:poles=2",
    "equalizer=f=320:t=o:w=1.2:g=-3.5",      # room "box" resonance
    "equalizer=f=150:t=o:w=1:g=1.5",         # a little body
    "equalizer=f=4200:t=o:w=1.4:g=2.8",      # presence
    "equalizer=f=11000:t=h:w=0.7:g=1.5",     # air
    "deesser=i=0.35:m=0.5:f=0.55",
    "acompressor=threshold=-24dB:ratio=3:attack=8:release=140:makeup=4dB:knee=4",
    "alimiter=limit=0.89:attack=3:release=60",
])
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(OUT / "voice_dfn.wav"), "-af", chain,
                "-ar", "48000", str(OUT / "voice_eq.wav")], check=True)
# normalise the stem to -16 LUFS (the final mix is normalised to -14 LUFS / -1 dBTP)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(OUT / "voice_eq.wav"), "-af",
                "loudnorm=I=-16:TP=-2:LRA=9:linear=true", "-ar", "48000", str(OUT / "voice.wav")], check=True)
print("voice ok", len(y) / sr)
