import json, subprocess, numpy as np
SR = 48000
def load(f):
    return np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-f','f32le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout, np.float32).copy()
E = json.load(open('edl.json')); P = json.load(open('plan.json'))
SRC = {'face': load('face_clean.wav') * 10**(4.1/20), 'ecran': load('ecran_clean.wav')}
SFX = {n: load(f'/home/user/AbdoulNetwork/videos/chief-chief-promo/assets/sfx/{n}.wav') for n in ['whoosh','pop','tick','ding']}
N = int(P['dur'] * SR) + SR
voice = np.zeros(N, np.float32); fx = np.zeros(N, np.float32)
fade = int(0.006 * SR)
for s in E['subs']:
    a = SRC[s['src']][int(round(s['a0']*SR)):int(round(s['a1']*SR))].copy()
    r = np.linspace(0, 1, fade); a[:fade] *= r; a[-fade:] *= r[::-1]
    i = int(round(s['t0']*SR)); voice[i:i+len(a)] += a
for t, n, g in P['events']:
    x = SFX[n] * 10**(g/20); i = max(0, int(t*SR)); fx[i:i+len(x)] += x[:N-i]
# keep SFX below the voice: duck sfx by 6 dB where voice is active (50 ms env)
env = np.sqrt(np.convolve(voice**2, np.ones(2400)/2400, 'same'))
fx *= np.where(env > 0.01, 0.5, 1.0)
mix = (voice + fx)[:int(P['dur']*SR)]
import wave
w = wave.open('mix_raw.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(mix, -1, 1)*32767).astype(np.int16).tobytes()); w.close()
print('ok', len(mix)/SR)
