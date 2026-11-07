import json, sys, wave, numpy as np, subprocess
from faster_whisper import WhisperModel
m = WhisperModel("../model/small", device="cpu", compute_type="int8", cpu_threads=4)
d = json.load(open('edl.json')); A = {}
for k, f in [('face', 'face_clean.wav'), ('ecran', 'ecran_clean.wav')]:
    A[k] = np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-f','f32le','-ac','1','-ar','16000','-'],capture_output=True).stdout, np.float32)
only = sys.argv[1:]
for seg in d['segs']:
    if only and seg['seg'] not in only: continue
    parts = [s for s in d['subs'] if s['seg'] == seg['seg']]
    x = np.concatenate([A[p['src']][int(p['a0']*16000):int(p['a1']*16000)] for p in parts])
    x = np.concatenate([np.zeros(8000, np.float32), x, np.zeros(8000, np.float32)])
    segs, _ = m.transcribe(x, language='fr', beam_size=5, vad_filter=False, condition_on_previous_text=False)
    print(seg['seg'], '|', ' '.join(s.text.strip() for s in segs), flush=True)
