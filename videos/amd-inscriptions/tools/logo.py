from PIL import Image, ImageFilter
import numpy as np
im=np.array(Image.open('/tmp/claude-0/up/logo.png').convert('RGB')).astype(np.float32)
r,g,b=im[...,0],im[...,1],im[...,2]
mn=im.min(-1)
A=np.clip((235-mn)/90,0,1)
gold=(r>110)&((r-b)>55)
out=np.zeros_like(im)
out[...]=[250,248,242]
gc=im.copy(); 
# normalize gold to brand gold with its own shading
out[gold]=np.clip(gc[gold]*1.08,0,255)
# semi-transparent fringe near gold: color gold
Aim=Image.fromarray((A*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
o=Image.fromarray(np.dstack([out.astype(np.uint8),np.array(Aim)]),'RGBA')
o=o.crop(o.getbbox()); o.save('assets/logo-on-dark.png'); print(o.size)
o2=Image.open('/tmp/claude-0/up/logo.png').convert('RGB'); o2.putalpha(Aim); o2=o2.crop(o2.getbbox()); o2.save('assets/logo-original.png')
