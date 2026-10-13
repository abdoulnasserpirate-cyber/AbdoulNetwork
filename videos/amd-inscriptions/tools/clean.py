from PIL import Image, ImageDraw, ImageFilter
import numpy as np
# name: (erase rects, color zones, fade start, fade end)
R={
 'fitwoman':([(0,0,0.07,1)],[(0.3,0.3,0.8,0.7)],0.52,0.70),
 'kid':([(0.9,0,1,1),(0,0,0.03,1)],[],0.80,1.0),
 'hijab':([(0.95,0,1,1)],[],0.80,1.0),
 'kungfu':([(0,0,0.22,0.47),(0,0,0.06,1)],[(0,0.25,0.35,0.6)],0.80,1.0),
 'muscle':([(0,0.84,0.2,1)],[(0,0.55,0.35,1)],0.78,1.0),
}
for name,(rects,zones,fs,fe) in R.items():
    im=Image.open(f'/tmp/claude-0/up/{name}-rgba.png').convert('RGBA'); W,H=im.size
    a=im.getchannel('A'); d=ImageDraw.Draw(a)
    for x0,y0,x1,y1 in rects: d.rectangle([x0*W,y0*H,x1*W,y1*H],fill=0)
    A=np.array(a).astype(np.float32)
    rgb=np.array(im.convert('RGB')).astype(np.int32); r,g,b=rgb[...,0],rgb[...,1],rgb[...,2]
    bad=((r>150)&(g>0.78*r)&(b<0.55*g))|((b>r+35)&(b>g+5))
    for x0,y0,x1,y1 in zones:
        z=np.zeros_like(bad); z[int(y0*H):int(y1*H),int(x0*W):int(x1*W)]=True
        A[bad&z]=0
    A[A<40]=0
    a=Image.fromarray(A.astype(np.uint8)).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.6))
    A=np.array(a).astype(np.float32)
    fade=np.ones(H,np.float32); s,e=int(H*fs),int(H*fe); fade[s:e]=np.linspace(1,0,e-s)**1.3; fade[e:]=0
    A*=fade[:,None]
    im.putalpha(Image.fromarray(A.clip(0,255).astype(np.uint8)))
    im=im.crop(im.getbbox()); im.save(f'assets/people/{name}.png',optimize=True); print(name, im.size)
