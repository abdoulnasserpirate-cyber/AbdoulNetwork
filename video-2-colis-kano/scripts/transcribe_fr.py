"""Transcription FR avec timestamps par token (sherpa-onnx, zipformer streaming FR).
usage: python3 transcribe_fr.py <model_dir> <audio.wav> <out.json>"""
import sys, json, subprocess, numpy as np, sherpa_onnx
M, A, O = sys.argv[1:4]
p = f"{M}/%s-epoch-29-avg-9-with-averaged-model.onnx"
rec = sherpa_onnx.OnlineRecognizer.from_transducer(
    tokens=f"{M}/tokens.txt", encoder=p % "encoder", decoder=p % "decoder", joiner=p % "joiner",
    num_threads=4, sample_rate=16000, feature_dim=80, decoding_method="modified_beam_search")
pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", A, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(pcm, dtype=np.float32)
s = rec.create_stream()
s.accept_waveform(16000, x)
s.accept_waveform(16000, np.zeros(16000 * 2, dtype=np.float32))
s.input_finished()
while rec.is_ready(s):
    rec.decode_stream(s)
r = rec.get_result_all(s)
toks, ts = list(r.tokens), list(r.timestamps)
words, cur = [], None
for t, tt in zip(toks, ts):
    if t.startswith(" ") or t.startswith("▁") or cur is None:
        if cur: words.append(cur)
        cur = {"text": t.lstrip("▁ "), "start": round(tt, 3)}
    else:
        cur["text"] += t
    cur["end"] = round(tt + 0.08, 3)
if cur: words.append(cur)
for i in range(len(words) - 1):
    words[i]["end"] = round(min(words[i]["end"] + 0.15, words[i + 1]["start"]), 3)
json.dump({"text": r.text, "words": words}, open(O, "w"), ensure_ascii=False, indent=1)
print(r.text)
