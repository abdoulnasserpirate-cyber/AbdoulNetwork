"""Synthesise the royalty-free sound effects used by the video.

Writes public/sfx/{impact,whoosh,click,riser,glitch}.wav (44.1 kHz, 16-bit mono).
Run: python3 scripts/make_sfx.py
"""
import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
rng = np.random.default_rng(7)


def write(name, x):
    x = np.asarray(x, dtype=np.float64)
    peak = np.max(np.abs(x)) or 1.0
    x = x / peak * 0.9
    data = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def t(dur):
    return np.arange(int(SR * dur)) / SR


def lowpass(x, alpha):
    y = np.zeros_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += alpha * (v - acc)
        y[i] = acc
    return y


def impact():
    tt = t(1.4)
    # Sub drop: pitch sweeps 120 Hz -> 38 Hz
    freq = 38 + 82 * np.exp(-tt * 9)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    sub = np.sin(phase) * np.exp(-tt * 2.6)
    # Transient crack: filtered noise burst
    noise = rng.standard_normal(len(tt))
    crack = lowpass(noise, 0.35) * np.exp(-tt * 38)
    # Short body thump
    body = np.sin(2 * np.pi * 70 * tt) * np.exp(-tt * 14)
    x = 1.0 * sub + 0.55 * crack + 0.5 * body
    return np.tanh(x * 1.6)


def whoosh():
    tt = t(0.55)
    noise = rng.standard_normal(len(tt))
    env = np.sin(np.pi * np.clip(tt / 0.55, 0, 1)) ** 2
    # Sweep the low-pass cutoff up then down for movement
    out = np.zeros_like(noise)
    acc = 0.0
    for i, v in enumerate(noise):
        a = 0.03 + 0.25 * env[i]
        acc += a * (v - acc)
        out[i] = acc
    return out * env


def click():
    tt = t(0.09)
    tone = np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 90)
    tick = rng.standard_normal(len(tt)) * np.exp(-tt * 400) * 0.4
    return tone + tick


def riser():
    tt = t(1.0)
    freq = 200 + 1400 * (tt / 1.0) ** 2
    phase = 2 * np.pi * np.cumsum(freq) / SR
    tone = np.sin(phase) * 0.4 + lowpass(rng.standard_normal(len(tt)), 0.2) * 0.6
    return tone * (tt / 1.0) ** 1.5


def glitch():
    tt = t(0.25)
    sq = np.sign(np.sin(2 * np.pi * 180 * tt)) * 0.5
    gate = (np.floor(tt * 60) % 2 == 0).astype(float)
    noise = rng.standard_normal(len(tt)) * 0.5
    return (sq + noise) * gate * np.exp(-tt * 8)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    write("impact", impact())
    write("whoosh", whoosh())
    write("click", click())
    write("riser", riser())
    write("glitch", glitch())
    print("sfx written to", os.path.abspath(OUT))
