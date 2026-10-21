"""Extra deterministic SFX: digital glitch, keyboard click, low impact."""
import numpy as np, wave
SR = 44100; rng = np.random.default_rng(3)
def save(name, x):
    x = np.clip(x, -1, 1); x = np.stack([x, x], 1)
    with wave.open(f"assets/sfx/{name}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
# glitch: bit-crushed square bursts + noise stutter
n = int(0.32 * SR); t = np.arange(n) / SR; g = np.zeros(n)
for k in range(6):
    a, b = int(k * 0.05 * SR), int((k * 0.05 + 0.035) * SR)
    f = [220, 880, 330, 1760, 440, 660][k]
    seg = np.sign(np.sin(2 * np.pi * f * t[a:b])) * 0.35 + rng.standard_normal(b - a) * 0.25
    g[a:b] = np.round(seg * 6) / 6
save("glitch", g * np.exp(-t * 3) * 0.8)
# keyboard click
n = int(0.05 * SR); t = np.arange(n) / SR; nz = rng.standard_normal(n)
c = (nz * np.exp(-t * 400) * 0.5 + np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 300) * 0.3)
save("key", c)
# impact: low boom + noise thump
n = int(0.9 * SR); t = np.arange(n) / SR
f = 40 + 80 * np.exp(-t * 18)
boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5) + rng.standard_normal(n) * np.exp(-t * 40) * 0.4
save("impact", np.tanh(boom * 1.5) * 0.9)
print("ok")
