"""Transcription mot par mot de public/audio/voix.mp3 -> src/captions.json
(format Caption de @remotion/captions). Fallback quand le modèle whisper.cpp
ne peut pas être téléchargé : faster-whisper + modèle Whisper CTranslate2.

Usage : python3 scripts/transcribe_faster.py <dossier_modele>
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

root = Path(__file__).resolve().parent.parent
model = WhisperModel(sys.argv[1], device="cpu", compute_type="int8")
with wave.open(str(root / "scripts" / "voix16k.wav")) as wf:
    pcm = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16)
audio = pcm.astype(np.float32) / 32768.0
segments, _ = model.transcribe(
    audio,
    language="fr",
    word_timestamps=True,
    beam_size=5,
    vad_filter=False,
    initial_prompt=(
        "Sublime Booty by Chris, grande promo, Kit Sexy Lady, Kit Curves, "
        "Kit Booster Ultra Dosé, Kit Spécial Amaria, Kit Gros Lolo Luxe, "
        "NITA, Amana, Wave, Western Union, Ria, WhatsApp."
    ),
)

captions = []
for seg in segments:
    for w in seg.words:
        captions.append(
            {
                "text": " " + w.word.strip(),
                "startMs": round(w.start * 1000),
                "endMs": round(w.end * 1000),
                "timestampMs": round((w.start + w.end) / 2 * 1000),
                "confidence": round(w.probability, 3),
            }
        )

(root / "src" / "captions.json").write_text(
    json.dumps(captions, ensure_ascii=False, indent=2)
)
for c in captions:
    print(f"{c['startMs']/1000:6.2f} {c['endMs']/1000:6.2f} {c['text']}")
