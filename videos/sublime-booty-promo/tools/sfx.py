"""Synthesize the two discreet sound-design cues (deterministic, no downloads).
whoosh.wav: band-swept noise with a soft swell; shimmer.wav: airy high partials that sparkle and fade."""
import numpy as np, wave

SR = 44100
rng = np.random.default_rng(7)


def write(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    st = np.stack([x, np.roll(x, 90)], 1)  # tiny inter-channel delay for width
    with wave.open(f"assets/sfx/{name}", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())


# whoosh: 0.9 s, noise through a one-pole low-pass whose cutoff sweeps up then down
n = int(0.9 * SR); t = np.arange(n) / SR
noise = rng.standard_normal(n)
cut = 300 + 5200 * np.sin(np.pi * t / 0.9) ** 2
a = np.exp(-2 * np.pi * cut / SR)
y = np.zeros(n); prev = 0.0
for i in range(n):
    prev = (1 - a[i]) * noise[i] + a[i] * prev
    y[i] = prev
env = np.sin(np.pi * np.clip(t / 0.9, 0, 1)) ** 1.6
write("whoosh.wav", y * env)

# shimmer: 1.6 s, stacked bell partials with tremolo and exponential decay
n = int(1.6 * SR); t = np.arange(n) / SR
x = np.zeros(n)
for k, f in enumerate([2093, 2637, 3136, 3951, 4699, 5274]):
    start = k * 0.05
    tt = np.clip(t - start, 0, None)
    x += (t >= start) * np.sin(2 * np.pi * f * tt) * np.exp(-tt * 2.6) * (0.8 ** k)
x *= 0.75 + 0.25 * np.sin(2 * np.pi * 9 * t)
x *= np.minimum(1, t / 0.02)
write("shimmer.wav", x)
print("sfx written")
