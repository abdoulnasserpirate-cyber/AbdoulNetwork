# Synthesise simple SFX (whoosh, impact, riser, sparkle) as 44.1k stereo WAV.
import numpy as np, wave, os
SR = 44100
rng = np.random.default_rng(7)
out = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
os.makedirs(out, exist_ok=True)

def lp(x, a):  # one-pole low-pass, a may be an array
    y = np.zeros_like(x); s = 0.0
    a = np.broadcast_to(a, x.shape)
    for i in range(len(x)):
        s += a[i] * (x[i] - s); y[i] = s
    return y

def save(name, x, width=0.0):
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    l = x; r = np.roll(x, int(width * SR / 1000))
    st = (np.stack([l, r], 1) * 32767).astype(np.int16)
    with wave.open(os.path.join(out, name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())

def whoosh(d=0.55):
    n = int(d * SR); t = np.linspace(0, 1, n)
    env = np.sin(np.pi * t) ** 2
    cut = 0.02 + 0.35 * np.sin(np.pi * t) ** 3
    noise = rng.standard_normal(n)
    return (lp(noise, cut) - lp(noise, cut * 0.15)) * env

def impact(d=1.1):
    n = int(d * SR); t = np.arange(n) / SR
    f = 38 + 90 * np.exp(-t * 18)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    crack = lp(rng.standard_normal(n), 0.5) * np.exp(-t * 28)
    return sub * 1.0 + crack * 0.45

def riser(d=1.6):
    n = int(d * SR); t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    x = lp(noise, 0.02 + 0.5 * t ** 2) * t ** 2
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * t ** 2) / SR) * t ** 3 * 0.3
    return x + tone

def sparkle(d=0.9):
    n = int(d * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for k in range(14):
        s = int(rng.uniform(0, 0.5) * SR); f = rng.uniform(2500, 7000)
        tt = t[: n - s]
        x[s:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 14) * rng.uniform(0.3, 1)
    return x

save("whoosh.wav", whoosh(), 3)
save("impact.wav", impact(), 1)
save("riser.wav", riser(), 5)
save("sparkle.wav", sparkle(), 7)
