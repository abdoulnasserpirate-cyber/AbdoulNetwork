"""Transcription mot à mot de public/voix.mp3 — repli hors Hugging Face.

1. Texte : Whisper "medium" (poids ONNX publiés par sherpa-onnx sur GitHub),
   langue française, appliqué phrase par phrase (découpe sur les pauses).
2. Horodatage : modèle transducteur français (zipformer) qui fournit l'instant
   de chaque token ; chaque mot Whisper est aligné sur ces instants.

Sortie : src/data/captions.json au format Caption de Remotion
(text, startMs, endMs, timestampMs, confidence) — le même que toCaptions().

Usage : python3 scripts/transcribe_sherpa.py <dossier_whisper_medium> <dossier_zipformer_fr>
"""
import difflib
import json
import os
import re
import subprocess
import sys
import unicodedata
import wave

import numpy as np
import sherpa_onnx

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SR = 16000


def load_audio():
    raw = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", os.path.join(ROOT, "public", "voix.mp3"),
         "-ar", str(SR), "-ac", "1", "-f", "s16le", "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0


def speech_segments(audio, thresh_db=-35, min_sil=0.25, pad=0.12):
    """Segments de parole (s), séparés par des silences d'au moins min_sil."""
    hop = int(0.01 * SR)
    frames = len(audio) // hop
    rms = np.array([np.sqrt(np.mean(audio[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(frames)])
    voiced = 20 * np.log10(rms) > thresh_db
    segs, start, sil = [], None, 0
    for i, v in enumerate(voiced):
        if v:
            if start is None:
                start = i
            sil = 0
        elif start is not None:
            sil += 1
            if sil * 0.01 >= min_sil:
                segs.append((start * 0.01, (i - sil + 1) * 0.01))
                start, sil = None, 0
    if start is not None:
        segs.append((start * 0.01, frames * 0.01))
    total = len(audio) / SR
    return [(max(0, a - pad), min(total, b + pad)) for a, b in segs if b - a > 0.08]


# Corrections des noms propres / mots mal reconnus (même nombre de mots,
# les horodatages sont conservés).
CORRECTIONS = [
    (["Abdul", "Netw"], ["Abdoul", "Network"]),
    (["Abdul", "Network"], ["Abdoul", "Network"]),
    (["Espère", "à", "venir."], ["Expert", "en", "IA"]),
]


def apply_corrections(caps):
    # Ponctuation isolée (« ! ») rattachée au mot précédent.
    merged = []
    for c in caps:
        if merged and not norm(c["text"]):
            merged[-1]["text"] += c["text"].strip()
            merged[-1]["endMs"] = c["endMs"]
        else:
            merged.append(c)
    texts = [c["text"].strip() for c in merged]
    for wrong, right in CORRECTIONS:
        for i in range(len(texts) - len(wrong) + 1):
            if texts[i:i + len(wrong)] == wrong:
                for k, r in enumerate(right):
                    merged[i + k]["text"] = (" " if i + k else "") + r
                    texts[i + k] = r
    return merged


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)


def whisper_text(model_dir, audio, segs):
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=os.path.join(model_dir, "medium-encoder.onnx"),
        decoder=os.path.join(model_dir, "medium-decoder.onnx"),
        tokens=os.path.join(model_dir, "medium-tokens.txt"),
        language="fr",
        task="transcribe",
        num_threads=4,
    )
    out = []
    for a, b in segs:
        s = rec.create_stream()
        s.accept_waveform(SR, audio[int(a * SR):int(b * SR)])
        rec.decode_stream(s)
        text = s.result.text.strip()
        print(f"[{a:6.2f}-{b:6.2f}] {text}", flush=True)
        out.append((a, b, text))
    return out


def transducer_tokens(model_dir, audio):
    def f(name):
        return os.path.join(model_dir, name)
    rec = sherpa_onnx.OnlineRecognizer.from_transducer(
        tokens=f("tokens.txt"),
        encoder=f("encoder-epoch-29-avg-9-with-averaged-model.onnx"),
        decoder=f("decoder-epoch-29-avg-9-with-averaged-model.onnx"),
        joiner=f("joiner-epoch-29-avg-9-with-averaged-model.onnx"),
        num_threads=4,
        sample_rate=SR,
        decoding_method="greedy_search",
    )
    s = rec.create_stream()
    s.accept_waveform(SR, audio)
    s.accept_waveform(SR, np.zeros(int(1.0 * SR), dtype=np.float32))
    s.input_finished()
    while rec.is_ready(s):
        rec.decode_stream(s)
    r = rec.get_result_all(s)
    # Regroupe les tokens BPE (« ▁ » = début de mot) en mots horodatés.
    words = []
    for tok, ts in zip(r.tokens, r.timestamps):
        if tok.startswith("▁") or not words:
            words.append([tok.lstrip("▁"), ts])
        else:
            words[-1][0] += tok
    return [(w, t) for w, t in words if w]


def main():
    whisper_dir, zip_dir = sys.argv[1], sys.argv[2]
    audio = load_audio()
    total = len(audio) / SR
    segs = speech_segments(audio)
    phrases = whisper_text(whisper_dir, audio, segs)
    ref = transducer_tokens(zip_dir, audio)
    print("transducteur :", " ".join(w for w, _ in ref))

    words = []  # (texte, segment_a, segment_b, index_phrase)
    for pi, (a, b, text) in enumerate(phrases):
        for w in text.split():
            words.append([w, a, b, pi])

    # Alignement des mots Whisper sur les mots horodatés du transducteur.
    sm = difflib.SequenceMatcher(a=[norm(w[0]) for w in words], b=[norm(w) for w, _ in ref], autojunk=False)
    start = [None] * len(words)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            start[blk.a + k] = ref[blk.b + k][1]
    # Correspondances approximatives (mots mal reconnus par le transducteur).
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "replace":
            for k in range(i2 - i1):
                j = j1 + int(k * (j2 - j1) / max(1, i2 - i1))
                if j < j2:
                    start[i1 + k] = ref[j][1]

    # Garde-fous : chaque mot reste dans son segment de parole, ordre croissant ;
    # les mots sans ancre sont interpolés au prorata du nombre de lettres.
    for i, w in enumerate(words):
        if start[i] is not None and not (w[1] - 0.15 <= start[i] <= w[2]):
            start[i] = None
    for pi, (a, b, _) in enumerate(phrases):
        idx = [i for i, w in enumerate(words) if w[3] == pi]
        if not idx:
            continue
        if start[idx[0]] is None:
            start[idx[0]] = a + 0.1
        known = [i for i in idx if start[i] is not None]
        for i in idx:
            if start[i] is not None:
                continue
            prev = max(k for k in known if k < i)
            nxt = [k for k in known if k > i]
            end_t = start[nxt[0]] if nxt else b - 0.1
            span = idx[idx.index(prev):(idx.index(nxt[0]) if nxt else len(idx))]
            lens = [max(1, len(norm(words[k][0]))) for k in span]
            pos = sum(lens[: span.index(i)]) / sum(lens)
            start[i] = start[prev] + (end_t - start[prev]) * pos
        for i in idx[1:]:
            start[i] = max(start[i], start[i - 1] + 0.06)

    captions = []
    for i, w in enumerate(words):
        nxt_same = i + 1 < len(words) and words[i + 1][3] == w[3]
        end = start[i + 1] if nxt_same else min(w[2], total)
        end = max(end, start[i] + 0.12)
        captions.append({
            "text": (" " if i else "") + w[0],
            "startMs": round(start[i] * 1000),
            "endMs": round(end * 1000),
            "timestampMs": round((start[i] + end) * 500),
            "confidence": None,
        })

    captions = apply_corrections(captions)
    out = os.path.join(ROOT, "src", "data", "captions.json")
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(captions, fh, ensure_ascii=False, indent=2)
    for c in captions:
        print(f"{c['startMs']/1000:6.2f} {c['text']}")
    print(len(captions), "mots ->", out)


if __name__ == "__main__":
    main()
