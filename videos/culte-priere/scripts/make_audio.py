"""Synthesise the worship music bed + SFX and build the final mix.

Deterministic (seeded RNG). numpy only. Usage:
  python3 scripts/make_audio.py            (from the project root)
Outputs:
  assets/music/bed.wav       music bed alone (gospel / louange, 100 BPM)
  assets/audio/mix.wav       voice + ducked music + SFX (pre-loudnorm)
"""
import json, os, subprocess, wave
import numpy as np

SR = 48000
DUR = 33.6            # composition length (s)
VO_OFFSET = 0.5       # voice starts at 0.5 s in the video
BPM = 100.0
BEAT = 60.0 / BPM     # 0.6 s
BAR = 4 * BEAT        # 2.4 s -> 14 bars = 33.6 s
N = int(SR * DUR)
rng = np.random.default_rng(122)
t_all = np.arange(N) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def env_adsr(n, a=0.005, d=0.3, s=0.0, r=0.05, sustain_len=None):
    a_n = max(1, int(a * SR))
    e = np.ones(n)
    e[:a_n] = np.linspace(0, 1, a_n)
    rest = np.arange(n - a_n) / SR
    e[a_n:] = s + (1 - s) * np.exp(-rest / max(d, 1e-3))
    r_n = min(n, int(r * SR))
    e[-r_n:] *= np.linspace(1, 0, r_n)
    return e


def add(buf, sig, start):
    i = int(round(start * SR))
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def onepole_lp(x, fc):
    # vectorised-ish one-pole low-pass via cumulative trick in chunks
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    prev = 0.0
    for k in range(0, len(x), 4096):
        seg = x[k:k + 4096]
        out = np.empty_like(seg)
        p = prev
        for i, v in enumerate(seg):
            p = (1 - a) * v + a * p
            out[i] = p
        y[k:k + 4096] = out
        prev = p
    return y


# ---------------------------------------------------------------- instruments
def piano_note(f, length, vel=1.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for k, amp in enumerate([1.0, 0.55, 0.32, 0.18, 0.1, 0.06], start=1):
        fk = f * k * (1 + 0.0004 * k * k)
        sig += amp * np.sin(2 * np.pi * fk * t) * np.exp(-t * (1.6 + 0.9 * k))
    hammer = rng.standard_normal(n) * np.exp(-t * 180) * 0.04
    sig = (sig + hammer) * env_adsr(n, a=0.003, d=10, s=1, r=0.08)
    return sig * vel


def organ_chord(freqs, length):
    n = int(length * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 5.6 * t)
    for f in freqs:
        for k, amp in [(1, 1.0), (2, 0.5), (3, 0.28), (4, 0.18), (6, 0.06)]:
            sig += amp * np.sin(2 * np.pi * f * k * t + k)
    sig *= trem
    e = np.minimum(1, t / 0.35) * np.minimum(1, (length - t) / 0.35)
    return sig * e / len(freqs)


def pad_chord(freqs, length):
    n = int(length * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for f in freqs:
        for det in (-0.006, 0.0, 0.0065):
            fd = f * (1 + det)
            for k in range(1, 7):
                sig += (1 / k) * np.sin(2 * np.pi * fd * k * t + det * 300 * k)
    e = np.minimum(1, t / 0.8) * np.minimum(1, (length - t) / 0.6)
    return sig * e / (len(freqs) * 3)


def bass_note(f, length):
    n = int(length * SR)
    t = np.arange(n) / SR
    sig = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    return sig * env_adsr(n, a=0.008, d=0.9, s=0.35, r=0.06)


def kick():
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    f = 45 + 85 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) + 0.15 * rng.standard_normal(n) * np.exp(-t * 300)


def hp(x):
    return np.diff(np.concatenate([[0.0], x]))


def clap():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    noise = hp(hp(rng.standard_normal(n)))
    e = np.zeros(n)
    for off in (0.0, 0.011, 0.022):
        i = int(off * SR)
        e[i:] += np.exp(-(t[: n - i]) * 70)
    e += 0.6 * np.exp(-t * 14)
    return onepole_lp(noise * e, 6000) * 0.22


def shaker():
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    noise = hp(hp(hp(rng.standard_normal(n))))
    return noise * np.sin(np.pi * t / t[-1]) ** 2 * 0.035


# ---------------------------------------------------------------- music bed
D, Fs, A, B, E, G, Cs = 62, 66, 69, 71, 64, 67, 73
progression = [
    ([D, Fs, A, Cs + 12 - 12, E + 12], 38),      # Dmaj9
    ([B - 12, D, Fs, A], 35),                     # Bm7
    ([G - 12, B - 12, D, Fs], 31),                # Gmaj7
    ([A - 12, D, E, A], 33),                      # Asus4
]
nbars = int(round(DUR / BAR))
piano = np.zeros(N); organ = np.zeros(N); pad = np.zeros(N); bass = np.zeros(N); drums = np.zeros(N)
for bar in range(nbars):
    notes, root = progression[bar % 4]
    if bar % 4 == 3:
        notes_b = [A - 12, Cs, E, A]   # resolve sus4 -> A on beat 3
    else:
        notes_b = notes
    t0 = bar * BAR
    freqs = [midi(n) for n in notes]
    pad_len = BAR + 0.5
    add(pad, pad_chord(freqs, min(pad_len, DUR - t0)), t0)
    add(organ, organ_chord(freqs, min(pad_len, DUR - t0)), t0)
    # gospel piano comping: 1, &2, 4 (+ resolution on 3 for the sus bar)
    hits = [(0.0, notes, 1.0), (1.5, notes, 0.7), (3.0, notes_b, 0.85)]
    for beat, nn, v in hits:
        for k, n_ in enumerate(nn):
            add(piano, piano_note(midi(n_ + 12), 1.6, v * 0.24), t0 + beat * BEAT + k * 0.012)
    # sparkly upper arpeggio on 8ths (quiet)
    arp = [notes[-1] + 12, notes[-2] + 12, notes[1] + 24, notes[-2] + 12]
    for i in range(8):
        add(piano, piano_note(midi(arp[i % 4]), 0.6, 0.07), t0 + i * BEAT / 2 + 0.3)
    # bass
    add(bass, bass_note(midi(root), BEAT * 1.4), t0)
    add(bass, bass_note(midi(root), BEAT * 0.9), t0 + 1.5 * BEAT)
    add(bass, bass_note(midi(root + (2 if bar % 4 == 3 else 0)), BEAT * 1.4), t0 + 2.5 * BEAT)
    # drums: in from bar 1, out on the last 2 bars (outro breathes)
    if 1 <= bar <= nbars - 3:
        for b in (0, 2):
            add(drums, kick() * 0.55, t0 + b * BEAT)
        add(drums, kick() * 0.3, t0 + 2.5 * BEAT)
        for b in (1, 3):
            add(drums, clap(), t0 + b * BEAT)
        for i in range(8):
            add(drums, shaker() * (1.0 if i % 2 else 0.6), t0 + i * BEAT / 2)

pad = onepole_lp(pad, 1800)
organ = onepole_lp(organ, 2400)
music = 0.9 * piano + 0.35 * organ + 0.45 * pad + 0.55 * bass + 0.8 * drums
# master fade in on the pad (riser) and 1.5 s fade out
fade_in = np.minimum(1, t_all / 0.4)
fade_out = np.clip((DUR - t_all) / 1.5, 0, 1)
music *= fade_in * fade_out


# ---------------------------------------------------------------- SFX
def whoosh(length=0.55, up=True):
    n = int(length * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    fc0, fc1 = (400, 5000) if up else (5000, 400)
    out = np.zeros(n)
    # time-varying lowpass approximated by crossfading 6 filtered copies
    bands = [onepole_lp(noise, f) for f in np.geomspace(fc0, fc1, 6)]
    pos = t / t[-1] * 5
    for i, b in enumerate(bands):
        w = np.clip(1 - abs(pos - i), 0, 1)
        out += b * w
    e = np.sin(np.pi * t / t[-1]) ** 1.5
    return out * e * 0.9


def impact():
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = 32 + 70 * np.exp(-t * 7)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    crack = onepole_lp(rng.standard_normal(n), 1800) * np.exp(-t * 22) * 2.2
    return (body + crack) * 0.9


def riser(length=0.6):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = 300 * (6 ** (t / t[-1]))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    noise = hp(rng.standard_normal(n)) * 0.35
    return (tone + noise) * (t / t[-1]) ** 2


def tick():
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 3200 * t) + 0.5 * hp(rng.standard_normal(n))) * np.exp(-t * 160) * 0.5


def ding():
    n = int(2.0 * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for ratio, amp, dec in [(1, 1, 1.6), (2.76, 0.4, 3), (5.4, 0.2, 5), (2.0, 0.25, 2)]:
        s += amp * np.sin(2 * np.pi * 1320 * ratio * t) * np.exp(-t * dec)
    return s * env_adsr(n, a=0.002, d=50, s=1, r=0.05) * 0.35


def ring(length=0.8):
    n = int(length * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 1400 * t) + np.sin(2 * np.pi * 1750 * t)
    gate = (np.sin(2 * np.pi * 22 * t) > 0).astype(float)
    gate = onepole_lp(gate, 300)
    burst = ((t % 0.4) < 0.3).astype(float)
    return tone * gate * burst * np.minimum(1, (length - t) / 0.05) * 0.18


def sparkle(length=1.0, count=14):
    n = int(length * SR)
    s = np.zeros(n)
    for _ in range(count):
        st = rng.uniform(0, length * 0.7)
        f = rng.uniform(2800, 6500)
        ln = 0.25
        m = int(ln * SR)
        tt = np.arange(m) / SR
        add(s, np.sin(2 * np.pi * f * tt) * np.exp(-tt * 18) * rng.uniform(0.3, 1), st)
    return s * 0.12


def pop():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    f = 900 * np.exp(-t * 30) + 300
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40) * 0.5


def thump():
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 60 + 90 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10) * 0.8


sfx = np.zeros(N)
events = [
    (0.0, riser(0.55), 0.9),
    (0.0, sparkle(0.9, 10), 0.8),
    (0.55, impact(), 0.85),          # CE DIMANCHE
    (2.2, whoosh(0.5), 0.45),        # whip pan vertical
    (2.75, sparkle(0.8, 8), 0.6),    # phone screen glow
    (4.5, whoosh(0.5), 0.45),        # zoom-through
    (6.85, whoosh(0.55), 0.5),       # brush wipe
    (7.6, sparkle(1.2, 16), 0.7),    # gold particles
    (8.65, whoosh(0.6, False), 0.4), # cloud curtain
    (10.3, sparkle(0.8, 8), 0.45),   # psalm reveal
    (17.35, whoosh(0.5), 0.45),      # whip pan horizontal
    (17.98, thump(), 0.6),           # pin lands
    (20.36, impact(), 0.75),         # MARADI
    (21.0, whoosh(0.5), 0.4),        # circular reveal
    (22.8, ring(0.85), 0.55),        # phone rings
    (28.05, riser(0.3), 0.5),
    (28.1, sparkle(1.2, 16), 0.6),   # final card flash
    (32.85, sparkle(0.8, 10), 0.5),
]
# clock: fast ticks while hands spin, ding on 9h00 and 11h30
for i in range(7):
    events.append((4.82 + i * 0.055, tick(), 0.5))
events.append((5.0, ding(), 0.5))
for i in range(6):
    events.append((5.5 + i * 0.05, tick(), 0.45))
events.append((5.72, ding(), 0.45))
for tt in (24.11, 25.25, 26.25, 27.26):  # number pairs roll in
    events.append((tt, pop(), 0.35))
for st, sig, g in events:
    add(sfx, sig * g, st)


# ---------------------------------------------------------------- voice + ducking
def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


voice_src = load("assets/voice/voiceover.mp3")
voice = np.zeros(N)
add(voice, voice_src, VO_OFFSET)


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)


# voice envelope (speech presence) -> music gain: -20 dB under voice, -10 dB in gaps/intro/outro
win = int(0.05 * SR)
env = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
speaking = (20 * np.log10(env + 1e-9) > -42).astype(float)
# hold speech state through short gaps (<0.7 s) so the bed does not pump between words
hold = int(0.7 * SR)
sp = np.convolve(speaking, np.ones(hold), mode="same") > 0
target_db = np.where(sp, -20.0, -10.0)
# smooth (attack ~0.12 s, release ~0.5 s) using a cheap two-pass moving average
k = int(0.25 * SR)
target_db = np.convolve(target_db, np.ones(k) / k, mode="same")
target_db[: int(0.3 * SR)] = -10.0

voice_level = rms_db(voice_src[np.abs(voice_src) > 1e-3])
music_level = rms_db(music[np.abs(music) > 1e-4])
music_gain = 10 ** ((voice_level - music_level + target_db) / 20)
music_mix = music * music_gain
sfx_gain = 10 ** ((voice_level - rms_db(sfx[np.abs(sfx) > 1e-4]) - 8) / 20)

mix = voice + music_mix + sfx * sfx_gain
mix = np.stack([mix, mix], axis=1)
# subtle stereo width for the bed
mix[:, 0] += 0.0
peak = np.max(np.abs(mix))
mix = mix / peak * 0.89


def write(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if data.ndim == 1:
        data = np.stack([data, data], axis=1)
    pcm = (np.clip(data, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())


write("assets/music/bed.wav", music / np.max(np.abs(music)) * 0.8)
write("assets/audio/mix.wav", mix)
print(json.dumps({"voice_db": round(voice_level, 1), "music_db": round(music_level, 1), "dur": DUR}))
