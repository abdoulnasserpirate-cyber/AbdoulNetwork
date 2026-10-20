#!/usr/bin/env python3
"""Audio build for « 5 erreurs ChatGPT » (Abdoul Network).

Produces, from assets/voice/voix-off-raw.mp3:
  assets/voice/voix-off.wav        voice: HPF 70 Hz, light compression, -15 LUFS / -1.5 dBTP
  assets/bgm/musique-lofi.wav      original lo-fi bed (90 BPM), composed here, royalty-free
  assets/bgm/musique-ducked.wav    same bed, sidechain-ducked under the voice, fades baked in
  assets/sfx/*.wav                 whoosh, pop, stamp, impact (synthesised)
  assets/mix-preview.wav           full mix (voice + ducked bed + sfx) for listening / QC

Run:  python3 scripts/build_audio.py
Everything is deterministic (fixed seeds).
"""
import json
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 44100
TOTAL = 66.0          # seconds, must match index.html data-duration
BPM = 90.0
BEAT = 60.0 / BPM
rng = np.random.default_rng(20261020)

# Scene cuts and counter checks (seconds) — mirror TIMING in index.html
CUTS = [8.05, 19.45, 28.85, 36.75, 46.25, 53.75]
CHECKS = [19.15, 28.6, 36.45, 46.05, 53.3]
STAMPS = [(33.20, 0.55), (43.92, 1.0)]       # (time, gain)
IMPACTS = [0.02, 62.05]


def write_wav(path, data):
    data = np.clip(data, -1, 1)
    if data.ndim == 1:
        data = np.stack([data, data], axis=1)
    pcm = (data * 32767).astype(np.int16)
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def read_wav(path):
    with wave.open(str(path), "rb") as w:
        n = w.getnframes()
        ch = w.getnchannels()
        raw = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32767
    return raw.reshape(-1, ch)


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def env_adsr(n, a, d, s, r, sustain_len):
    """Simple ADSR in samples."""
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    hold = max(0, int(sustain_len * SR) - a - d)
    e = np.concatenate([
        np.linspace(0, 1, max(a, 1)),
        np.linspace(1, s, max(d, 1)),
        np.full(hold, s),
        np.linspace(s, 0, max(r, 1)),
    ])
    if len(e) < n:
        e = np.concatenate([e, np.zeros(n - len(e))])
    return e[:n]


def lp_fast(x, cutoff):
    """FFT brick-ish low-pass with soft knee (fast, deterministic)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def hp_fast(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (cutoff / np.maximum(f, 1e-3)) ** 4)
    return np.fft.irfft(X, len(x))


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# ---------------------------------------------------------------- voice
def build_voice():
    raw = ROOT / "assets/voice/voix-off-raw.mp3"
    tmp = ROOT / "assets/voice/_voice_pre.wav"
    out = ROOT / "assets/voice/voix-off.wav"
    pre = "highpass=f=70:poles=2,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120:makeup=1"
    ffmpeg("-i", str(raw), "-af", pre, "-ar", "48000", str(tmp))
    # two-pass loudnorm to -15 LUFS / -1.5 dBTP
    p = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(tmp), "-af",
         "loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
        capture_output=True, text=True, check=True)
    js = p.stderr[p.stderr.rfind("{"): p.stderr.rfind("}") + 1]
    m = json.loads(js)
    ln = ("loudnorm=I=-15:TP=-1.5:LRA=11:linear=true:"
          f"measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}")
    ffmpeg("-i", str(tmp), "-af", ln, "-ar", str(SR), "-ac", "2", str(out))
    tmp.unlink()
    return out


# ---------------------------------------------------------------- music
def rhodes(freq, dur, vel=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    mod = np.sin(2 * np.pi * freq * 1.0 * t) * (1.6 * np.exp(-t * 3.0) + 0.25)
    tone = np.sin(2 * np.pi * freq * t + mod)
    tone += 0.18 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t * 2.0)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.2 * t)
    return tone * trem * env_adsr(n, 0.012, 0.9, 0.45, 0.6, dur - 0.6) * vel


def bass_note(freq, dur, vel=0.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2 * t)
    return tone * env_adsr(n, 0.01, 0.25, 0.6, 0.2, dur - 0.2) * vel


def kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 48 + 90 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) * 0.9


def snare_soft():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = hp_fast(lp_fast(noise, 5000), 900)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    return (noise * np.exp(-t * 18) * 0.35 + body * 0.3)


def hat():
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    noise = hp_fast(rng.standard_normal(n), 7000)
    return noise * np.exp(-t * 60) * 0.18


def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def build_music():
    n = int(TOTAL * SR)
    keys = np.zeros(n)
    bass = np.zeros(n)
    drums = np.zeros(n)
    # Fmaj9 – Em7 – Dm9 – Cmaj7 (warm lo-fi loop), 1 bar each (4 beats)
    prog = [
        ([53, 57, 60, 64, 67], 41),
        ([52, 55, 59, 62], 40),
        ([50, 53, 57, 60, 64], 38),
        ([48, 52, 55, 59, 62], 36),
    ]
    bar = 4 * BEAT
    nbars = int(TOTAL / bar) + 1
    for b in range(nbars):
        t0 = b * bar
        notes, root = prog[b % 4]
        for k, m in enumerate(notes):
            # slight strum, deterministic humanise
            place(keys, rhodes(midi(m), bar * 0.98, 0.16), t0 + 0.012 * k + 0.004 * ((b * 7 + k) % 3))
        # off-beat comp on beat 3.5
        for k, m in enumerate(notes[1:4]):
            place(keys, rhodes(midi(m + 12), BEAT * 0.9, 0.05), t0 + 2.5 * BEAT + 0.01 * k)
        place(bass, bass_note(midi(root), BEAT * 1.8, 0.5), t0)
        place(bass, bass_note(midi(root + 7), BEAT * 0.9, 0.35), t0 + 2.5 * BEAT)
        place(bass, bass_note(midi(root), BEAT * 0.9, 0.4), t0 + 3 * BEAT)
        # drums enter after the intro bar
        if t0 >= bar * 1 - 0.01:
            place(drums, kick(), t0, 0.8)
            place(drums, kick(), t0 + 2.5 * BEAT, 0.5)
            place(drums, snare_soft(), t0 + BEAT, 0.55)
            place(drums, snare_soft(), t0 + 3 * BEAT, 0.55)
            for h in range(8):
                swing = 0.06 * BEAT if h % 2 else 0
                place(drums, hat(), t0 + h * BEAT / 2 + swing, 0.7 if h % 2 == 0 else 0.45)
    keys = lp_fast(keys, 2600)
    drums = lp_fast(drums, 6500)       # dusty
    vinyl = lp_fast(rng.standard_normal(n), 3500) * 0.006
    crackle = np.zeros(n)
    idx = rng.integers(0, n, size=int(TOTAL * 6))
    crackle[idx] = rng.uniform(0.02, 0.06, size=len(idx)) * rng.choice([-1, 1], size=len(idx))
    crackle = lp_fast(crackle, 4000)
    mix = keys * 0.9 + bass * 0.55 + drums * 0.5 + vinyl + crackle
    # gentle stereo width: tiny delay on right
    d = int(0.011 * SR)
    left = mix
    right = np.concatenate([np.zeros(d), mix[:-d]]) * 0.97 + mix * 0.03
    st = np.stack([left, right], axis=1)
    st /= np.max(np.abs(st)) + 1e-9
    return st * 0.7


# ---------------------------------------------------------------- sfx
def sfx_whoosh(dur=0.55):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # sweeping band: crossfade between a low and a high filtered copy
    lo = lp_fast(noise, 900)
    hi = hp_fast(lp_fast(noise, 6000), 1500)
    x = t / dur
    sweep = lo * (1 - x) + hi * x
    env = np.sin(np.pi * np.clip(x, 0, 1)) ** 2
    return sweep * env * 0.5


def sfx_pop():
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    f = 520 + 900 * np.exp(-t * 40)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 26) * 0.55


def sfx_stamp():
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    f = 60 + 70 * np.exp(-t * 35)
    thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
    noise = lp_fast(rng.standard_normal(n), 2200) * np.exp(-t * 35) * 0.5
    return (thump * 0.9 + noise) * 0.8


def sfx_impact():
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    f = 42 + 60 * np.exp(-t * 18)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.5)
    air = lp_fast(rng.standard_normal(n), 1800) * np.exp(-t * 8) * 0.25
    return (boom + air) * 0.7


def main():
    voice_path = build_voice()
    voice = read_wav(voice_path)
    n = int(TOTAL * SR)

    sfx = {
        "whoosh": sfx_whoosh(), "pop": sfx_pop(), "stamp": sfx_stamp(), "impact": sfx_impact(),
    }
    for name, s in sfx.items():
        write_wav(ROOT / f"assets/sfx/{name}.wav", s / (np.max(np.abs(s)) + 1e-9) * 0.9)

    music = build_music()
    write_wav(ROOT / "assets/bgm/musique-lofi.wav", music)

    # --- sidechain duck: envelope follower on the voice
    v = np.zeros(n)
    vm = np.abs(voice[:, 0])[:n]
    v[: len(vm)] = vm
    win = int(0.05 * SR)
    kern = np.ones(win) / win
    level = np.convolve(v, kern, mode="same")
    talk = (level > 0.02).astype(float)
    # attack 60 ms / release 450 ms smoothing of the gate
    att, rel = np.exp(-1 / (0.06 * SR)), np.exp(-1 / (0.45 * SR))
    g = np.zeros(n)
    acc = 0.0
    for i in range(n):
        target = talk[i]
        c = att if target > acc else rel
        acc = c * acc + (1 - c) * target
        g[i] = acc
    duck_db = -10.0
    gain = 10 ** ((duck_db * g) / 20)
    # base bed level, fade-in 2.5 s, fade-out last 3 s (music swells a little for the logo)
    t = np.arange(n) / SR
    base = 10 ** (-5 / 20) * np.ones(n)
    base *= np.clip(t / 2.5, 0, 1) ** 1.5
    base *= np.where(t > 62.0, 1.25, 1.0)
    base *= np.clip((TOTAL - t) / 3.0, 0, 1) ** 1.2
    ducked = music[:n] * (gain * base)[:, None]
    write_wav(ROOT / "assets/bgm/musique-ducked.wav", ducked)

    # --- preview mix (the composition plays the same tracks)
    mix = ducked.copy()
    mix[: len(voice)] += voice[:n]
    for t0 in CUTS:
        place2(mix, sfx["whoosh"] * 0.22, t0 - 0.28)
    for t0 in CHECKS:
        place2(mix, sfx["pop"] * 0.3, t0)
    for t0, gn in STAMPS:
        place2(mix, sfx["stamp"] * 0.4 * gn, t0)
    for t0 in IMPACTS:
        place2(mix, sfx["impact"] * 0.3, t0)
    write_wav(ROOT / "assets/mix-preview.wav", mix)
    print("ok", voice.shape[0] / SR, "s voice")


def place2(buf, sig, t0):
    i = int(t0 * SR)
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i, None]


if __name__ == "__main__":
    main()
