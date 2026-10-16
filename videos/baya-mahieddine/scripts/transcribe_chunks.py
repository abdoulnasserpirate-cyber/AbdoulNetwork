"""Pause-based chunking + per-chunk ASR (Parakeet v3 for word timings, Whisper medium for a FR/EN text check).

Code-switching (EN intro -> FR story) confuses a single long decode, so each phrase between pauses
is decoded on its own.
Usage: python3 scripts/transcribe_chunks.py work/a77.wav [...]
Writes work/<name>.chunks.json : [{"s","e","parakeet","whisper_fr","whisper_en","words":[...]}]
"""
import json
import sys
from pathlib import Path

import numpy as np
import sherpa_onnx
import soundfile as sf

PK = Path("/root/models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8")
WM = Path("/root/models/sherpa-onnx-whisper-medium")
pk = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=str(PK / "encoder.int8.onnx"), decoder=str(PK / "decoder.int8.onnx"),
    joiner=str(PK / "joiner.int8.onnx"), tokens=str(PK / "tokens.txt"),
    model_type="nemo_transducer", num_threads=4)
wh = {lang: sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=str(WM / "medium-encoder.int8.onnx"), decoder=str(WM / "medium-decoder.int8.onnx"),
    tokens=str(WM / "medium-tokens.txt"), language=lang, task="transcribe", num_threads=4)
    for lang in ("fr", "en")}


def decode(rec, sr, x):
    st = rec.create_stream()
    st.accept_waveform(sr, x)
    rec.decode_stream(st)
    return st.result


def chunks(a, sr, min_pause=0.35, hop=0.02):
    h = int(sr * hop)
    e = np.array([np.sqrt(np.mean(a[i:i + h] ** 2)) + 1e-9 for i in range(0, len(a) - h, h)])
    db = 20 * np.log10(e)
    floor = np.percentile(db, 15)
    voiced = db > floor + 9
    # close tiny gaps, then split on pauses >= min_pause
    segs, start, last = [], None, None
    for i, v in enumerate(voiced):
        t = i * hop
        if v:
            if start is None:
                start = t
            elif t - last > min_pause:
                segs.append([start, last + hop])
                start = t
            last = t
    if start is not None:
        segs.append([start, last + hop])
    segs = [s for s in segs if s[1] - s[0] > 0.25]
    # merge into phrases of max ~12 s
    out = []
    for s in segs:
        if out and s[0] - out[-1][1] < 0.6 and s[1] - out[-1][0] < 12:
            out[-1][1] = s[1]
        else:
            out.append(list(s))
    return out


for p in sys.argv[1:]:
    a, sr = sf.read(p, dtype="float32")
    res = []
    for s, e in chunks(a, sr):
        s0, e0 = max(0, s - 0.15), min(len(a) / sr, e + 0.15)
        x = a[int(s0 * sr):int(e0 * sr)]
        r = decode(pk, sr, x)
        words = []
        durs = list(getattr(r, "durations", []) or [])
        for i, (t, ts) in enumerate(zip(r.tokens, r.timestamps)):
            te = ts + (durs[i] if i < len(durs) and durs[i] > 0 else 0.08)
            if t.startswith(("▁", " ")) or not words:
                words.append({"w": t.lstrip("▁ "), "s": round(s0 + ts, 3), "e": round(s0 + te, 3)})
            else:
                words[-1]["w"] += t
                words[-1]["e"] = round(s0 + te, 3)
        item = {"s": round(s0, 2), "e": round(e0, 2), "parakeet": r.text,
                "whisper_fr": decode(wh["fr"], sr, x).text, "whisper_en": decode(wh["en"], sr, x).text,
                "words": words}
        res.append(item)
        print(f"[{s0:6.2f}-{e0:6.2f}] PK: {r.text}\n{'':16}FR: {item['whisper_fr']}\n{'':16}EN: {item['whisper_en']}", flush=True)
    Path(p).with_suffix(".chunks.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
