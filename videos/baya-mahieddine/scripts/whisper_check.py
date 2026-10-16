"""Second-opinion transcript with Whisper medium (sherpa-onnx) to cross-check Parakeet's words."""
import sys
from pathlib import Path

import sherpa_onnx
import soundfile as sf

import os
LANGS = os.environ.get("LANGS", "fr").split(",")
M = Path("/root/models/sherpa-onnx-whisper-medium")
for p in sys.argv[1:]:
    audio, sr = sf.read(p, dtype="float32")
    for lang in LANGS:
        rec = sherpa_onnx.OfflineRecognizer.from_whisper(
            encoder=str(M / "medium-encoder.int8.onnx"),
            decoder=str(M / "medium-decoder.int8.onnx"),
            tokens=str(M / "medium-tokens.txt"),
            language=lang, task="transcribe", num_threads=4,
        )
        st = rec.create_stream()
        st.accept_waveform(sr, audio)
        rec.decode_stream(st)
        print(f"== {p} [{lang}] {st.result.text}")
