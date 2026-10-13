import numpy as np
from PIL import Image, ImageFilter
def smooth1d(a,k):
    ker=np.hanning(k); ker/=ker.sum()
    return np.apply_along_axis(lambda r: np.convolve(r,ker,'same'),1,a)
def stroke(W,H,seed,palette,taperL=0.08,taperR=0.25,dry=0.55,wav=0.05):
    rng=np.random.default_rng(seed)
    x=np.linspace(0,1,W)
    c=H/2+np.sin(x*np.pi*rng.uniform(0.7,1.4)+rng.uniform(0,6))*H*wav
    th=(0.40*H)*(np.clip(x/taperL,0,1)**0.45)*(np.clip((1-x)/taperR,0,1)**0.35)*(0.9+0.1*np.sin(x*17+rng.uniform(0,6)))
    th=np.maximum(th,1)
    R=500
    N=rng.random((R,W//140+2))
    N=np.array(Image.fromarray((N*255).astype(np.uint8)).resize((W,R),Image.BICUBIC)).astype(np.float32)/255
    N=smooth1d(N,9)
    N=(N-N.min())/(N.max()-N.min())
    yy=np.arange(H)[:,None].astype(np.float32)
    v=(yy-c[None,:])/th[None,:]          # -1..1 inside
    ri=np.clip(((v+1.2)/2.4*(R-1)).astype(int),0,R-1)
    n=N[ri,np.arange(W)[None,:]]
    edge=np.clip(np.abs(v),0,1.3)
    # dryness grows to the right and at edges
    dryness=dry*np.clip((x[None,:]-0.45)/0.55,0,1)**1.5 + 0.35*edge**3
    thr=0.06+dryness
    A=np.clip((n-thr)*9,0,1)
    A*=np.clip((1.18-np.abs(v))*5,0,1)
    # left start: blobby heavier paint
    A=np.maximum(A, np.clip((0.75-np.abs(v))*4,0,1)*np.clip((0.55-x[None,:])*4,0,1)*0.98)
    a=Image.fromarray((A*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    A=np.array(a).astype(np.float32)/255
    lo,base,hi=[np.array(p,np.float32) for p in palette]
    t=N[ri,np.arange(W)[None,:]][...,None]
    col=np.where(t>0.5, base+(hi-base)*(t-0.5)*2, lo+(base-lo)*t*2)
    im=Image.fromarray(np.dstack([col.clip(0,255),A*255]).astype(np.uint8),'RGBA')
    return im.crop(im.getbbox())
GOLD=([186,128,12],[232,176,28],[255,216,96])
BLACK=([6,6,6],[20,19,17],[44,40,34])
stroke(2400,400,1,GOLD).save('assets/fx/brush-gold-1.png')
stroke(2400,320,7,GOLD,taperL=0.04,taperR=0.3,dry=0.7).save('assets/fx/brush-gold-2.png')
stroke(2200,150,11,GOLD,taperL=0.15,taperR=0.3,dry=0.35,wav=0.02).save('assets/fx/brush-gold-slash.png')
stroke(2400,420,5,BLACK,dry=0.45).save('assets/fx/brush-black-1.png')
print('ok')
