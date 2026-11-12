"""Bande-son finale : voix (nettoyée, décalée de 0.9 s) + musique ducking (-20/-24 dB sous la voix) + bruitages.
Sortie : assets/audio/bande-son.wav (-14 LUFS, true peak -1 dBTP). Usage : python3 tools/mix.py"""
import subprocess, json, os
DUR = 37.5
OFFSET = 0.9
SFX = "assets/sfx/"
# (temps du film, fichier, gain dB) — chaque bruitage a une cause à l'image
CUES = [
    (0.00, "sonnerie.wav", -23),
    (3.20, "whoosh-short.mp3", -12),        # onde → circle reveal
    (3.50, "pop.mp3", -14),                 # le carton tombe
    (4.27, "whoosh.mp3", -13),              # slice COLIS
    (5.27, "click-soft.mp3", -10),          # coupe DOCUMENTS
    (5.98, "pop.mp3", -16),                 # 4 cases
    (6.21, "pop.mp3", -12),                 # REPAS
    (6.80, "whoosh-cinematic.mp3", -12),    # whip pan scooter
    (7.71, "pop.mp3", -15),                 # MARADI
    (8.74, "whoosh-short.mp3", -13),        # LESSIVE
    (9.70, "whoosh.mp3", -14),              # REPASSAGE
    (13.31, "pop.mp3", -12),                # « On s'en occupe ! »
    (14.10, "whoosh-cinematic.mp3", -11),   # zoom-through dans le ô
    (15.84, "click.mp3", -9), (15.86, "pop.mp3", -12),     # badge 500 F
    (17.18, "whoosh-short.mp3", -14),       # photo suivante
    (18.76, "click.mp3", -9), (18.78, "pop.mp3", -12),     # badge 1 000 F
    (19.52, "whoosh.mp3", -14),
    (21.30, "click.mp3", -9), (21.32, "pop.mp3", -12),     # badge 100 F
    (22.88, "whoosh-cinematic.mp3", -12),   # volet diagonal 7J/7
    (23.15, "pop.mp3", -15), (23.65, "pop.mp3", -14),
    (24.60, "click-soft.mp3", -12),         # samedi / dimanche
    (25.02, "whoosh-short.mp3", -12),       # slice → carte
    (25.38, "pop.mp3", -15),                # l'épingle tombe
    (27.00, "whoosh.mp3", -14),             # le téléphone monte
    (28.16, "pop.mp3", -15),                # morph WhatsApp
    (28.90, "key-press.mp3", -8), (29.98, "key-press.mp3", -8),
    (30.94, "key-press.mp3", -8), (31.78, "key-press.mp3", -8),
    (32.82, "whoosh-short.mp3", -12),       # onde → blanc
    (32.86, "sonnerie.wav", -26),           # sonnerie sur le logo
    (35.28, "sparkle.mp3", -16),            # slogan écrit
    (35.45, "pop.mp3", -12),                # pastille numéro
]
MUSIC_GAIN = -6.0   # musique sous la voix (avant ducking)


# --- ducking précis : enveloppe de la voix → gain de la musique (-12 dB sous la voix) ---
import numpy as np, wave
def read_wav(f):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-f", "f32le", "-ac", "2", "-ar", "44100", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()
SR = 44100
vo = read_wav("audio/voix-off-brute.mp3").mean(1)
mus = read_wav("assets/music/afro-house-122bpm.wav")
N = int(DUR * SR); mus = np.pad(mus, ((0, max(0, N - len(mus))), (0, 0)))[:N]
hop = 441; env = np.zeros(N // hop + 1)
for k in range(len(env)):
    a = int(k * hop - OFFSET * SR)
    seg = vo[max(0, a):max(0, a + hop)]
    env[k] = np.sqrt((seg ** 2).mean()) if len(seg) else 0
act = (20 * np.log10(env + 1e-9) > -38).astype(float)          # voix présente
# lissage : attaque 40 ms, relâchement 350 ms, anticipation 60 ms
g = np.zeros_like(act); state = 0.0
for k in range(len(act)):
    tgt = act[min(len(act) - 1, k + 6)]
    coef = 1 - np.exp(-1 / (4 if tgt > state else 35))
    state += (tgt - state) * coef; g[k] = state
DUCK_DB = 16.0
gain = 10 ** (-(DUCK_DB * g) / 20)
gain = np.interp(np.arange(N) / hop, np.arange(len(gain)), gain)
mus = mus * gain[:, None] * 10 ** (MUSIC_GAIN / 20)
with wave.open("audio/stem-musique-duckee.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mus, -1, 1) * 32767).astype("<i2").tobytes())

inputs = ["-i", "audio/voix-off-brute.mp3", "-i", "audio/stem-musique-duckee.wav"]
for _, f, _ in CUES:
    inputs += ["-i", SFX + f]
fc = []
# voix : passe-haut 80 Hz, légère compression, normalisation douce, décalage
fc.append(f"[0:a]aformat=sample_rates=44100:channel_layouts=stereo,highpass=f=80,"
          f"acompressor=threshold=-21dB:ratio=2.5:attack=8:release=120:makeup=2,"
          f"loudnorm=I=-16:TP=-2:LRA=7,aresample=44100,adelay={int(OFFSET*1000)}|{int(OFFSET*1000)},apad,atrim=0:{DUR}[vo]")
fc.append("[1:a]aformat=sample_rates=44100:channel_layouts=stereo[mud]")
labels = []
for i, (t, f, g) in enumerate(CUES):
    d = int(round(t * 1000))
    fc.append(f"[{i+2}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={g}dB,adelay={d}|{d}[s{i}]")
    labels.append(f"[s{i}]")
fc.append(f"[vo][mud]{''.join(labels)}amix=inputs={2+len(CUES)}:normalize=0:duration=longest,atrim=0:{DUR},"
          f"apad=whole_dur={DUR},afade=t=out:st={DUR-0.6}:d=0.6,volume=GAIN_DB,alimiter=limit=0.72:level=false:attack=2:release=60,aresample=44100[out]")
os.makedirs("assets/audio", exist_ok=True)
def run(gain):
    g = ";".join(fc).replace("GAIN_DB", f"{gain:.2f}dB")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", g, "-map", "[out]",
                    "-ar", "44100", "-c:a", "pcm_s16le", "assets/audio/bande-son.wav"], check=True)
def lufs(f):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float([l for l in r.splitlines() if l.strip().startswith("I:")][-1].split()[1])
total = 0.0
run(total)
for _ in range(4):                      # vise -14 LUFS (limiteur à -1.5 dBFS)
    g = -14.0 - lufs("assets/audio/bande-son.wav")
    if abs(g) < 0.15: break
    total += g; run(total)

# stems utiles pour vérifier / remixer
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "audio/voix-off-brute.mp3", "-af",
                f"highpass=f=80,acompressor=threshold=-21dB:ratio=2.5:attack=8:release=120:makeup=2,loudnorm=I=-16:TP=-2,aresample=44100",
                "audio/voix-off-nettoyee.wav"], check=True)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", "assets/audio/bande-son.wav", "-af", "ebur128=peak=true", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
print([l.strip() for l in r.splitlines() if l.strip().startswith(("I:", "Peak:", "LRA:"))][-3:])
