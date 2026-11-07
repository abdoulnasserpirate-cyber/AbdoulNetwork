import sys, json, wave, numpy as np
def load(p):
    w=wave.open(p); return np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
from faster_whisper import WhisperModel
m = WhisperModel("../model/small", device="cpu", compute_type="int8", cpu_threads=4)
for name in sys.argv[1:]:
    segs, info = m.transcribe(load(name), language="fr", word_timestamps=True, vad_filter=False, beam_size=5,
        initial_prompt="Euh, donc euh, bon. Comment bloquer les publicités sur son téléphone.")
    out=[]
    for s in segs:
        out.append({"start":s.start,"end":s.end,"text":s.text,"words":[{"w":w.word,"s":w.start,"e":w.end,"p":w.probability} for w in s.words]})
        print(name, f"{s.start:.2f}-{s.end:.2f}", s.text, flush=True)
    json.dump(out, open(name.replace(".wav",".json"),"w"), ensure_ascii=False, indent=1)
