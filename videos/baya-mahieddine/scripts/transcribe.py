"""Word-level transcription of the rushes with Parakeet TDT 0.6B v3 (sherpa-onnx, multilingual FR/EN).

Usage: python3 scripts/transcribe.py work/a74.wav work/a75.wav work/a76.wav
Writes work/<name>.words.json  ->  [{"w": word, "s": start, "e": end}, ...]
"""
import json
import sys
from pathlib import Path

import sherpa_onnx
import soundfile as sf

M = Path("/root/models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8")
rec = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=str(M / "encoder.int8.onnx"),
    decoder=str(M / "decoder.int8.onnx"),
    joiner=str(M / "joiner.int8.onnx"),
    tokens=str(M / "tokens.txt"),
    model_type="nemo_transducer",
    num_threads=4,
)

for p in sys.argv[1:]:
    audio, sr = sf.read(p, dtype="float32")
    st = rec.create_stream()
    st.accept_waveform(sr, audio)
    rec.decode_stream(st)
    r = st.result
    toks, ts = list(r.tokens), list(r.timestamps)
    durs = list(getattr(r, "durations", []) or [])
    # merge sentencepiece tokens into words ("▁" marks a word start)
    words = []
    for i, (t, s) in enumerate(zip(toks, ts)):
        e = s + (durs[i] if i < len(durs) and durs[i] > 0 else 0.08)
        if t.startswith("▁") or t.startswith(" ") or not words:
            words.append({"w": t.lstrip("▁ "), "s": round(s, 3), "e": round(e, 3)})
        else:
            words[-1]["w"] += t
            words[-1]["e"] = round(e, 3)
    out = Path(p).with_suffix(".words.json")
    out.write_text(json.dumps(words, ensure_ascii=False, indent=0))
    print(f"== {p} ({len(audio)/sr:.2f}s)\n{r.text}\n")
