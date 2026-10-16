"""Builds the edit decision list (edit_plan.json) and the cut presenter footage + raw voice.

- Segments = best take of each sentence (0077/0078 intro + story, 0074-0076 'why it matters').
- Inside each segment, pauses > MAX_PAUSE are tightened to KEEP_PAUSE (energy-based, words never cut).
- Each sub-range gets 15 ms audio fades (no clicks at cuts).
Outputs:
  edit_plan.json                 EDL + program timeline + word timings mapped to program time
  work/edit/voice_raw.wav        48 kHz mono voice, program timeline (silence where no speech)
  work/edit/frames/%06d.png      360x640 presenter frames for the whole program (held frames in gaps)
"""
import json
import shutil
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
RUSH = ROOT / "rushes"
WORK = ROOT / "work"
FPS = 30
SR = 48000
MAX_PAUSE, KEEP_PAUSE = 0.38, 0.18

# (clip, in, out, text as spoken, section)
SEGMENTS = [
    ("0077", 0.55, 9.97, "Hi everyone, I'm AMOUSSOU HOUNGBEDJI Marie Marthe, Beninese and student at the University Dan Dicko Dankoulodo of Maradi, at Niger.", "intro"),
    ("0077", 10.50, 14.71, "Today I'm introducing you to the story of Baya Mahieddine.", "intro"),
    ("0078", 15.95, 18.40, "I'm at ease with speaking in French.", "intro"),
    ("0078", 19.85, 22.25, "Baya Mahieddine est une jeune Algérienne.", "story"),
    ("0077", 22.90, 27.20, "Orpheline et autodidacte, elle découvre très jeune un amour intense pour la peinture.", "story"),
    ("0077", 28.02, 34.97, "Les couleurs, les fleurs, les oiseaux, les jardins deviennent son langage, sa façon de donner vie à ce qu'elle porte en elle.", "story"),
    ("0077", 37.06, 39.21, "Sans formation artistique classique,", "story"),
    ("0077", 39.85, 41.95, "elle laisse parler son imagination", "story"),
    ("0077", 42.35, 45.49, "et crée un univers aussi libre que fascinant.", "story"),
    ("0077", 47.40, 51.19, "En 1947, à seulement 16 ans,", "story"),
    ("0077", 52.07, 53.85, "ses œuvres sont exposées à Paris", "story"),
    ("0077", 54.20, 56.31, "et elle se fait remarquer par son talent.", "story"),
    ("GAP", 0, 1.6, "", "chapter"),
    ("0074", 1.30, 3.85, "Why this story matters.", "why"),
    ("0074", 4.80, 15.90, "Cette histoire est importante parce qu'elle nous montre qu'on peut aimer sans qu'il s'agisse de ça, ça, ça, ça ou encore ça.", "why"),
    ("0075", 1.52, 9.75, "L'amour, c'est aussi découvrir ce qui donne du goût à notre vie, nourrit notre esprit et nous pousse à construire notre avenir.", "why"),
    ("0076", 1.62, 7.60, "L'histoire de Baya Mahieddine nous impose une réflexion sur notre rapport avec ce que nous aimons profondément.", "why"),
    ("0076", 7.70, 16.55, "Elle nous montre comment une passion démesurée peut être canalisée pour bâtir un héritage, un héritage qui nous survivra.", "why"),
    ("0076", 16.70, 18.10, "Merci.", "why"),
]
INTRO_PAD = 2.6   # title card before the first word
OUTRO_PAD = 3.0   # end card after "Merci"
GAP_BETWEEN = 0.10  # breath between consecutive segments


def load(clip):
    p = WORK / f"src{clip}.wav"
    if not p.exists():
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(RUSH / f"VID-20261016-WA{clip}.mp4"),
                        "-ac", "1", "-ar", str(SR), str(p)], check=True)
    a, _ = sf.read(p, dtype="float32")
    return a


def subranges(a, s, e, word_starts=(), hop=0.01):
    """Split [s,e] at pauses longer than MAX_PAUSE; returns list of (s,e) voiced ranges."""
    x = a[int(s * SR):int(e * SR)]
    h = int(SR * hop)
    db = np.array([20 * np.log10(np.sqrt(np.mean(x[i:i + h] ** 2)) + 1e-9) for i in range(0, len(x) - h, h)])
    floor = np.percentile(db, 10)
    quiet = db < floor + 4
    out, cur = [], s
    i = 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            dur = (j - i) * hop
            qs, qe = s + i * hop, s + j * hop
            has_word = any(qs + 0.04 < w < qe + 0.02 for w in word_starts)
            if dur > MAX_PAUSE and i > 0 and j < len(quiet) and not has_word:
                mid_keep = KEEP_PAUSE / 2
                out.append((cur, s + i * hop + mid_keep))
                cur = s + j * hop - mid_keep
            i = j
        else:
            i += 1
    out.append((cur, e))
    return [(round(a_, 3), round(b_, 3)) for a_, b_ in out if b_ - a_ > 0.05]


def words_for(clip):
    """Word timings in source time, from the per-clip Parakeet runs."""
    m = {"0074": ("a74b.words.json", 3.9), "0075": ("a75.words.json", 0), "0076": ("a76.words.json", 0),
         "0077": ("a77.chunks.json", None), "0078": ("a78.chunks.json", None)}
    f, off = m[clip]
    d = json.loads((WORK / f).read_text())
    if off is None:
        return [w for c in d for w in c["words"]]
    return [{**w, "s": w["s"] + off, "e": w["e"] + off} for w in d]


def main():
    out_dir = WORK / "edit"
    if out_dir.exists():
        shutil.rmtree(out_dir)
    (out_dir / "frames").mkdir(parents=True)
    voice = [np.zeros(int(INTRO_PAD * SR), np.float32)]
    t = INTRO_PAD
    plan, frame_map = [], []  # frame_map: (program_frame_start, n_frames, clip, src_start)
    fade = int(0.015 * SR)
    for clip, s, e, text, section in SEGMENTS:
        if clip == "GAP":
            n = int(e * SR)
            voice.append(np.zeros(n, np.float32))
            plan.append({"clip": "GAP", "program_start": round(t, 3), "program_end": round(t + e, 3), "section": section})
            t += e
            continue
        a = load(clip)
        subs = subranges(a, s, e, [w["s"] for w in words_for(clip)])
        seg = {"clip": clip, "in": s, "out": e, "text": text, "section": section, "program_start": round(t, 3), "pieces": []}
        for (ps, pe) in subs:
            x = a[int(ps * SR):int(pe * SR)].copy()
            x[:fade] *= np.linspace(0, 1, fade)
            x[-fade:] *= np.linspace(1, 0, fade)
            voice.append(x)
            seg["pieces"].append({"src_in": ps, "src_out": pe, "program_start": round(t, 3)})
            t += len(x) / SR
        seg["program_end"] = round(t, 3)
        voice.append(np.zeros(int(GAP_BETWEEN * SR), np.float32))
        t += GAP_BETWEEN
        plan.append(seg)
    voice.append(np.zeros(int(OUTRO_PAD * SR), np.float32))
    t += OUTRO_PAD
    v = np.concatenate(voice)
    sf.write(out_dir / "voice_raw.wav", v, SR)
    total = len(v) / SR

    # map words to program time, keep only words inside kept pieces
    for seg in plan:
        if seg["clip"] == "GAP":
            continue
        ws = []
        for w in words_for(seg["clip"]):
            mid = (w["s"] + w["e"]) / 2
            for p in seg["pieces"]:
                if p["src_in"] - 0.05 <= w["s"] and mid <= p["src_out"] + 0.05:
                    off = p["program_start"] - p["src_in"]
                    ws.append({"asr": w["w"], "s": round(max(w["s"], p["src_in"]) + off, 3), "e": round(min(w["e"], p["src_out"]) + off, 3)})
                    break
        seg["asr_words"] = ws

    # presenter frames: every program frame maps to a source frame (held at segment edges / gaps)
    nfr = int(round(total * FPS))
    src_for = []
    last = ("0077", 0.55)
    pieces = [(p["program_start"], p["program_start"] + (p["src_out"] - p["src_in"]), seg["clip"], p["src_in"])
              for seg in plan if seg["clip"] != "GAP" for p in seg["pieces"]]
    for f in range(nfr):
        tt = f / FPS
        hit = None
        for ps, pe, c, si in pieces:
            if ps <= tt < pe:
                hit = (c, si + (tt - ps))
                break
        if hit is None:
            # hold nearest following piece's first frame (pre-roll) or last used frame
            nxt = [(ps, c, si) for ps, pe, c, si in pieces if ps > tt]
            hit = (nxt[0][1], nxt[0][2]) if nxt and tt < INTRO_PAD else last
        last = hit
        src_for.append(hit)
    # extract needed source frames per clip in one pass each, then copy into program order
    cache = WORK / "srcframes"
    for c in sorted({c for c, _ in src_for}):
        d = cache / c
        if not d.exists():
            d.mkdir(parents=True)
            subprocess.run(["ffmpeg", "-v", "error", "-i", str(RUSH / f"VID-20261016-WA{c}.mp4"),
                            "-vf", "fps=30", str(d / "%06d.png")], check=True)
    for f, (c, st) in enumerate(src_for):
        n = len(list((cache / c).glob("*.png"))) if f == 0 else None
        idx = min(int(round(st * FPS)) + 1, len(list((cache / c).iterdir())))
        (out_dir / "frames" / f"{f + 1:06d}.png").symlink_to(cache / c / f"{idx:06d}.png")

    json.dump({"fps": FPS, "duration": round(total, 3), "intro_pad": INTRO_PAD, "outro_pad": OUTRO_PAD,
               "segments": plan}, open(ROOT / "edit_plan.json", "w"), ensure_ascii=False, indent=1)
    print(f"program duration {total:.2f}s, {nfr} frames")


if __name__ == "__main__":
    main()
