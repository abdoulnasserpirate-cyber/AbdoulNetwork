"""Karaoke captions: reference wording (correct spelling) timed by the ASR word timings.

Alignment: difflib on normalised tokens; matched words take the ASR timing, the rest are
interpolated between their timed neighbours. Lines are split at punctuation / max 7 words.
Outputs captions.json (for the composition) and baya_mahieddine.srt.
"""
import difflib
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KEYWORDS = {"baya", "mahieddine", "orpheline", "autodidacte", "1947", "paris", "breton", "picasso", "amour", "l'amour",
            "passion", "héritage", "peinture", "algérienne", "aimer", "16"}
MAX_WORDS = 7


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def align(ref_text, asr, seg_start, seg_end):
    ref = ref_text.split()
    a, b = [norm(w) for w in ref], [norm(w["asr"]) for w in asr]
    t = [None] * len(ref)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            t[blk.a + k] = (asr[blk.b + k]["s"], asr[blk.b + k]["e"])
    # fuzzy pass for near-misses ("autodights" ~ "autodidacte")
    for i, w in enumerate(a):
        if t[i] is None:
            best = max(range(len(b)), key=lambda j: difflib.SequenceMatcher(None, w, b[j]).ratio(), default=None)
            if best is not None and difflib.SequenceMatcher(None, w, b[best]).ratio() > 0.6:
                cand = (asr[best]["s"], asr[best]["e"])
                prev = next((t[k][0] for k in range(i - 1, -1, -1) if t[k]), seg_start)
                nxt = next((t[k][0] for k in range(i + 1, len(t)) if t[k]), seg_end)
                if prev <= cand[0] <= nxt:
                    t[i] = cand
    # interpolate gaps
    i = 0
    while i < len(t):
        if t[i] is None:
            j = i
            while j < len(t) and t[j] is None:
                j += 1
            s0 = t[i - 1][1] if i > 0 else seg_start + 0.05
            s1 = t[j][0] if j < len(t) else seg_end - 0.05
            step = max(0.12, (s1 - s0) / (j - i))
            for k in range(i, j):
                t[k] = (s0 + (k - i) * step, s0 + (k - i + 1) * step)
            i = j
        else:
            i += 1
    # monotonic + word ends = next start (karaoke highlight continuity)
    words = []
    for i, (w, (s, e)) in enumerate(zip(ref, t)):
        s = max(s, words[-1]["s"] + 0.06) if words else s
        words.append({"w": w, "s": round(s, 3), "e": round(e, 3)})
    for i in range(len(words) - 1):
        words[i]["e"] = round(min(max(words[i]["e"], words[i]["s"] + 0.12), words[i + 1]["s"]), 3)
    words[-1]["e"] = round(max(words[-1]["e"], words[-1]["s"] + 0.3), 3)
    for w in words:
        w["key"] = norm(w["w"]) in {norm(k) for k in KEYWORDS}
    return words


def lines_of(words):
    out, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= MAX_WORDS or re.search(r"[.,;:!?]$", w["w"]) and len(cur) >= 3:
            out.append(cur)
            cur = []
    if cur:
        if out and len(cur) <= 2 and len(out[-1]) + len(cur) <= MAX_WORDS + 2:
            out[-1] += cur
        else:
            out.append(cur)
    return out


def srt_time(x):
    h, r = divmod(x, 3600)
    m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"


def main():
    plan = json.load(open(ROOT / "edit_plan.json"))
    caps = []
    for seg in plan["segments"]:
        if seg["clip"] == "GAP":
            continue
        asr = seg["asr_words"]
        if not asr and seg["text"].startswith("Why"):
            # 0074 opening line was outside the offset Parakeet run: use the full-clip timings
            off = seg["program_start"] - seg["in"]
            asr = [{"asr": w, "s": s + off, "e": e + off} for w, s, e in
                   (("Why", 1.44, 1.92), ("this", 1.95, 2.2), ("story", 2.24, 2.72), ("matters.", 2.88, 3.7))]
        words = align(seg["text"], asr, seg["program_start"], seg["program_end"])
        for ln in lines_of(words):
            caps.append({"s": ln[0]["s"], "e": ln[-1]["e"], "words": ln})
    # each line stays until the next one starts (max +0.6 s) so captions don't flicker
    for i, c in enumerate(caps):
        nxt = caps[i + 1]["s"] if i + 1 < len(caps) else c["e"] + 0.6
        c["e"] = round(min(nxt - 0.02, c["e"] + 0.6), 3)
    json.dump(caps, open(ROOT / "captions.json", "w"), ensure_ascii=False, indent=1)
    with open(ROOT / "baya_mahieddine.srt", "w") as f:
        for i, c in enumerate(caps, 1):
            f.write(f"{i}\n{srt_time(c['s'])} --> {srt_time(c['e'])}\n{' '.join(w['w'] for w in c['words'])}\n\n")
    for c in caps:
        print(f"{c['s']:6.2f}-{c['e']:6.2f} " + " ".join(f"{w['w']}@{w['s']:.2f}" for w in c["words"]))


if __name__ == "__main__":
    main()
