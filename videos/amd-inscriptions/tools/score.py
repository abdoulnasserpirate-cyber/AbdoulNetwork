import numpy as np, subprocess, wave
from scipy import signal
SR=48000; DUR=44.225
N=int(SR*DUR)+1
rng=np.random.default_rng(42)
def t_(d): return np.arange(int(SR*d))/SR
def place(buf,x,at,g=1.0):
    i=int(at*SR); 
    if i>=len(buf): return
    n=min(len(x),len(buf)-i); buf[i:i+n]+=x[:n]*g
def lp(x,f,o=2): b,a=signal.butter(o,f/(SR/2),'low'); return signal.lfilter(b,a,x)
def hp(x,f,o=2): b,a=signal.butter(o,f/(SR/2),'high'); return signal.lfilter(b,a,x)
def bp(x,f1,f2,o=2): b,a=signal.butter(o,[f1/(SR/2),f2/(SR/2)],'band'); return signal.lfilter(b,a,x)
def env(t,a,d): return (1-np.exp(-t/max(a,1e-4)))*np.exp(-t/d)
# ---------- instruments ----------
def taiko(f0=120,f1=50,d=0.7,g=1.0):
    t=t_(d*3); f=f1+(f0-f1)*np.exp(-t/0.06); ph=2*np.pi*np.cumsum(f)/SR
    body=np.sin(ph)*env(t,0.002,d*0.45)
    skin=lp(rng.standard_normal(len(t)),1800)*env(t,0.001,0.04)*0.6
    return (body+skin)*g
def tom(f0=220,f1=140,d=0.35): return taiko(f0,f1,d)*0.6
def rim(d=0.05):
    t=t_(d); return bp(rng.standard_normal(len(t)),2000,6000)*env(t,0.0005,0.012)*0.5
def shaker(d=0.09):
    t=t_(d); return hp(rng.standard_normal(len(t)),6000)*env(t,0.01,0.03)*0.25
def impact(big=1.0):
    t=t_(1.8)
    f=40+90*np.exp(-t/0.05); sub=np.sin(2*np.pi*np.cumsum(f)/SR)*env(t,0.001,0.35*big)
    crack=hp(rng.standard_normal(len(t)),900)*env(t,0.0005,0.03)*0.8
    body=lp(rng.standard_normal(len(t)),500)*env(t,0.001,0.12)*1.2
    tail=lp(rng.standard_normal(len(t)),2500)*env(t,0.01,0.5)*0.12*big
    return (sub*1.3+crack+body+tail)*0.8*big
def punch():
    t=t_(0.4); f=70+120*np.exp(-t/0.02)
    thud=np.sin(2*np.pi*np.cumsum(f)/SR)*env(t,0.0008,0.09)
    slap=bp(rng.standard_normal(len(t)),700,4000)*env(t,0.0004,0.02)
    return (thud*1.1+slap*0.9)*0.9
def whoosh(d=0.55, up=True):
    n=int(SR*d); x=rng.standard_normal(n); out=np.zeros(n)
    # time-varying bandpass via chunked filtering with crossfade
    k=24; edges=np.linspace(0,n,k+1).astype(int)
    for j in range(k):
        p=j/(k-1); fc=(300+5000*p**1.6) if up else (5300-5000*p**0.8)
        seg=bp(x,max(fc*0.6,60),min(fc*1.6,20000),2)
        w=np.zeros(n); a,b=edges[j],edges[j+1]; pad=(b-a)//2
        w[max(a-pad,0):min(b+pad,n)]=np.hanning(min(b+pad,n)-max(a-pad,0))
        out+=seg*w
    shape=np.sin(np.pi*np.linspace(0,1,n))**2 if up else np.exp(-np.linspace(0,4,n))*np.clip(np.linspace(0,40,n),0,1)
    return out*shape*0.55
def swish():
    t=t_(0.22); x=bp(rng.standard_normal(len(t)),1500,9000)
    e=np.clip(t/0.04,0,1)*np.exp(-np.clip(t-0.04,0,None)/0.05); return x*e*0.7
def gong(f0=98,d=6.0,g=1.0):
    t=t_(d); out=np.zeros(len(t))
    for r,a,dec in [(1,1,3.5),(1.48,0.6,2.6),(1.97,0.5,2.2),(2.53,0.35,1.8),(3.11,0.3,1.5),(4.17,0.2,1.1),(5.43,0.15,0.8),(6.8,0.1,0.6)]:
        vib=1+0.003*np.sin(2*np.pi*(0.7+r*0.1)*t)
        out+=a*np.sin(2*np.pi*f0*r*np.cumsum(vib)/SR)*np.exp(-t/dec)
    out*=np.clip(t/0.04,0,1)*(1+0.6*np.clip(1-t/0.6,0,1))
    out+=lp(rng.standard_normal(len(t)),3000)*env(t,0.001,0.15)*0.5
    return out*0.35*g
def whistle(d=0.45):
    t=t_(d); f=2900+120*np.sign(np.sin(2*np.pi*28*t)); ph=2*np.pi*np.cumsum(f)/SR
    e=np.clip(t/0.02,0,1)*np.clip((d-t)/0.05,0,1)
    return (np.sin(ph)+0.15*hp(rng.standard_normal(len(t)),3000))*e*0.18
def riser(d=1.6):
    t=t_(d); f=200*2**(t/d*3); s=np.sin(2*np.pi*np.cumsum(f)/SR)*0.3
    nz=hp(rng.standard_normal(len(t)),1500)*0.5
    return (s+nz)*(t/d)**2.2*0.5
def sparkle():
    t=t_(1.2); out=np.zeros(len(t))
    for i,f in enumerate([2093,2637,3136,4186]):
        tt=np.clip(t-i*0.05,0,None); out+=np.sin(2*np.pi*f*tt)*np.exp(-tt/0.35)*(t>=i*0.05)
    return out*0.06
# ---------- pad / drone ----------
def saw(f,t): return 2*(f*t%1)-1
def pad_chord(freqs,d):
    t=t_(d); x=np.zeros(len(t))
    for f in freqs:
        for det in (-0.12,0,0.11): x+=saw(f*2**(det/12),t)
    x=lp(x,900,2)/len(freqs)/3
    e=np.clip(t/0.6,0,1)*np.clip((d-t)/0.6,0,1)
    return x*e
NOTE=lambda n: 440*2**((n-69)/12)
music=np.zeros(N); sfx=np.zeros(N)
# drone D1/D2 whole piece with swells
t=np.arange(N)/SR
drone=(np.sin(2*np.pi*NOTE(38)*t)*0.6+lp(saw(NOTE(26),t),200)*0.5)
dr_env=np.interp(t,[0,3.0,3.1,6.2,21.9,30.2,40.6,40.8,44.2],[0.25,0.6,0.35,0.6,0.5,0.6,0.85,0.4,0.0])
music+=drone*dr_env*0.35
# pads from 3.06
chords=[[50,53,57],[46,50,53],[48,52,55],[45,49,52]]
pt=3.06; ci=0
while pt<40.75:
    d=4.8; place(music,pad_chord([NOTE(n) for n in chords[ci%4]],d+0.6),pt,0.55); pt+=d; ci+=1
place(music,pad_chord([NOTE(n) for n in [50,53,57,62]],3.6),40.75,0.6)
# groove
B=0.6; S=B/4
def groove(t0,t1,inten=1.0,drive=False):
    bar=0; tt=t0
    while tt<t1-0.01:
        for s in range(16):
            at=tt+s*S
            if at>=t1: break
            if s in (0,8): place(music,taiko(),at,0.9*inten)
            if s==6 or (s==14 and bar%2==1): place(music,taiko(105,48,0.5),at,0.6*inten)
            if s in (12,13) or (drive and s in (4,10,15)): place(music,tom(),at,0.5*inten)
            if s%2==1: place(music,rim(),at,0.25*inten)
            place(music,shaker(),at,(0.5 if s%4==2 else 0.25)*inten)
        tt+=16*S; bar+=1
# intro: heartbeat taikos
for at in [0.0,0.85,1.39,2.02]: place(music,taiko(90,40,0.9),at,1.0)
groove(3.06,6.28,0.55)
groove(6.28,21.93,1.0)
groove(21.93,30.25,0.8)
groove(30.25,35.89,1.0,drive=True)
groove(35.89,40.4,1.0,drive=True)
# tom roll into the call
for i in range(12): place(music,tom(240,150,0.25),34.6+i*0.1,0.25+0.04*i)
# ---------- SFX cues ----------
IMP=[(0.0,1.3),(0.85,1.0),(1.39,1.0),(2.02,1.2),(4.45,1.0),(6.28,0.8),(6.9,0.7),(7.76,0.8),(8.46,1.0),(9.23,1.0),(9.78,1.1),(10.91,1.0),(13.11,1.0),(15.27,0.9),(16.49,1.0),(20.07,0.7),(20.85,1.1),(21.93,0.6),(23.03,0.6),(23.85,0.6),(24.46,0.9),(25.48,0.7),(27.65,1.0),(30.25,1.0),(32.41,1.0),(33.30,1.2),(34.49,1.0),(35.89,0.9),(37.25,0.7),(37.92,0.7),(38.89,0.7),(39.83,0.9),(43.9,1.3)]
for at,g in IMP: place(sfx,impact(g),at,0.55)
PUNCH=[0.05,1.40,2.03,11.64,12.16,14.41,17.90,18.40,19.05,26.95,28.46,29.2,30.9,5.29,24.95]
for at in PUNCH: place(sfx,punch(),at,0.45)
WH=[2.75,5.95,6.05,10.6,12.85,15.0,16.25,19.8,21.65,26.7,30.0,35.6,40.45]
for at in WH: place(sfx,whoosh(0.5),at-0.15,0.5)
SW=[0.82,7.7,11.6,12.1,13.05,15.22,16.45,17.85,18.35,19.0,22.95,23.8,42.3]
for at in SW: place(sfx,swish(),at,0.5)
place(sfx,gong(98,6,1.0),3.06,1.0)
place(sfx,gong(73.4,4.5,1.3),40.75,1.0)
place(sfx,gong(130,3,0.5),27.65,0.6)
place(sfx,whistle(),20.2,1.0)
place(sfx,riser(1.4),39.35,0.9)
place(sfx,riser(0.9),2.15,0.6)
for at in [3.2,32.41,33.3,41.0,42.35]: place(sfx,sparkle(),at,1.0)
# ---------- voice-driven ducking ----------
v=subprocess.run(['ffmpeg','-v','error','-i','assets/voice/voiceover.mp3','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
vo=np.frombuffer(v,np.float32); vo=np.pad(vo,(0,max(0,N-len(vo))))[:N]
e=np.sqrt(lp(vo**2,8,1).clip(0)); e=e/np.percentile(e,99)
duck=1-0.55*np.clip(e*3,0,1)
duck=lp(duck,6,1)
mus=music*duck
# master: music + sfx (sfx ducked lighter)
mix=mus*0.42+sfx*(1-0.25*np.clip(e*3,0,1))
fade=np.clip((DUR-t)/0.35,0,1); mix*=fade
mix=np.tanh(mix*1.2)/1.2
mix/=np.abs(mix).max()/0.7
st=np.stack([mix,mix],1)
# tiny stereo width on music
st[:,0]+=0.04*np.roll(mus,240); st[:,1]-=0.04*np.roll(mus,240)
st=np.clip(st,-0.98,0.98)
with wave.open('assets/audio/score-sfx.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype(np.int16).tobytes())
print('written',len(st)/SR)
