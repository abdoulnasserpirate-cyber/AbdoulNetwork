import sys, numpy as np, subprocess
from faster_whisper import WhisperModel
m = WhisperModel("../model/small", device="cpu", compute_type="int8", cpu_threads=4)
A = {}
for k, f in [('face', 'face_clean.wav'), ('ecran', 'ecran_clean.wav')]:
    A[k] = np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-f','f32le','-ac','1','-ar','16000','-'],capture_output=True).stdout, np.float32)
for spec in sys.argv[1:]:
    src, a, b = spec.split(':'); a = float(a); b = float(b)
    x = np.concatenate([np.zeros(8000, np.float32), A[src][int(a*16000):int(b*16000)], np.zeros(8000, np.float32)])
    segs, _ = m.transcribe(x, language='fr', beam_size=5, condition_on_previous_text=False)
    print(spec, '|', ' '.join(s.text.strip() for s in segs), flush=True)
