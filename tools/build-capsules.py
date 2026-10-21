"""Genera public/assets/caps/cap01..cap16.webp a partir de los 4 renders de capsulas Capsule Corp.
 - quita fondo/sombra, endereza, borra el numero impreso, y crea 6 variantes de color.
Uso: python tools/build-capsules.py   (requiere numpy, opencv-python-headless, pillow)"""
import numpy as np, cv2, os
from PIL import Image
D="C:/Users/rodri/Desktop/personaje rod dragon ball/capsulas"
OUT="public/assets/caps"; os.makedirs(OUT,exist_ok=True)
SRC={"01":("3f61076b-e7c8-4918-9288-402f9a2cdba7.jpg",[52,57,60]),
     "02":("a5340172-381f-406c-b3c6-6c3877ec0875.jpg",[112,113]),
     "03":("9bf4ee70-d160-4546-a3db-534e70be9ae3.jpg",[134,139]),
     "04":("66d65ab9-b989-4696-bdb5-9a7a71823b33.jpg",[79,81])}   # ids de los componentes oscuros = digitos

def alpha_mask(bgr):
    gray=cv2.cvtColor(bgr,cv2.COLOR_BGR2GRAY); blur=cv2.GaussianBlur(gray,(0,0),1.2).astype(np.float32)
    gx=cv2.Sobel(blur,cv2.CV_32F,1,0); gy=cv2.Sobel(blur,cv2.CV_32F,0,1); grad=np.hypot(gx,gy)/4.0
    sat=bgr.max(2).astype(int)-bgr.min(2).astype(int)
    cand=(bgr.min(2)>150)&(sat<34)&(grad<4.0)
    walls=cv2.dilate((grad>=4.0).astype(np.uint8),np.ones((3,3),np.uint8)); cand&=(walls==0)
    n,lab=cv2.connectedComponents(cand.astype(np.uint8),connectivity=4)
    edge=np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])); edge=edge[edge>0]; es=set(edge.tolist())
    bg=np.isin(lab,edge)
    for i in range(1,n):
        if i in es: continue
        m=(lab==i)
        if m.sum()<5000 and bgr.min(2)[m].mean()>243: bg|=m
    fg=(~bg).astype(np.uint8)
    n2,l2,st,_=cv2.connectedComponentsWithStats(fg,8); big=1+np.argmax(st[1:,cv2.CC_STAT_AREA])
    fg=(l2==big).astype(np.uint8)*255
    return cv2.GaussianBlur(cv2.morphologyEx(fg,cv2.MORPH_OPEN,np.ones((3,3),np.uint8)),(0,0),0.9)

def process(fn,idx):
    bgr=cv2.imread(f"{D}/{fn}"); H,W=bgr.shape[:2]; a=alpha_mask(bgr)
    g=cv2.cvtColor(bgr,cv2.COLOR_BGR2GRAY); _,lab,_,_=cv2.connectedComponentsWithStats((g<80).astype(np.uint8),8)
    dm=np.isin(lab,idx).astype(np.uint8)*255
    ys,xs=np.where(a>127); pts=np.column_stack([xs,ys]).astype(np.float32); mean=pts.mean(0)
    _,_,vt=np.linalg.svd(pts-mean,full_matrices=False); ang=np.degrees(np.arctan2(vt[0][1],vt[0][0])); rot=ang-90 if ang>0 else ang+90
    M=cv2.getRotationMatrix2D((float(mean[0]),float(mean[1])),rot,1.0)
    rgb=cv2.warpAffine(bgr,M,(W,H),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_REPLICATE)
    al=cv2.warpAffine(a,M,(W,H),flags=cv2.INTER_CUBIC)
    dmr=cv2.dilate(cv2.warpAffine(dm,M,(W,H),flags=cv2.INTER_NEAREST),np.ones((15,15),np.uint8))
    ys,xs=np.where(dmr>0); bx0,bx1,by0,by1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
    g2=cv2.cvtColor(rgb,cv2.COLOR_BGR2GRAY); sat=rgb.max(2).astype(int)-rgb.min(2).astype(int)
    clean=(dmr==0)&(sat<30)&(g2>105)&(al>200)
    for x in range(bx0,bx1):
        up=[rgb[y,x] for y in range(max(0,by0-16),by0) if clean[y,x]]
        dn=[rgb[y,x] for y in range(by1,min(H,by1+16)) if clean[y,x]]
        if not up and not dn: continue
        cu=np.median(up,axis=0) if up else np.median(dn,axis=0); cd=np.median(dn,axis=0) if dn else cu
        for y in range(by0,by1):
            if dmr[y,x]>0:
                t=(y-by0)/max(1,by1-by0-1); rgb[y,x]=np.clip(cu*(1-t)+cd*t+np.random.randint(-2,3,3),0,255)
    soft=cv2.GaussianBlur(rgb,(0,0),1.4); m3=cv2.GaussianBlur(dmr.astype(np.float32)/255,(0,0),2.5)[...,None]
    rgb=(rgb*(1-m3)+soft*m3).astype(np.uint8)
    ys,xs=np.where(al>127); t,b=ys.min(),ys.max(); h=b-t; L=[];R=[]
    for y in range(int(t+h*.45),int(t+h*.72)):
        r=np.where(al[y]>127)[0]
        if len(r): L.append(r.min()); R.append(r.max())
    bl,br=int(np.median(L)),int(np.median(R)); cut=int(t+h*.45)
    al[cut:,:max(0,bl-3)]=0; al[cut:,br+4:]=0
    cx=(bl+br)/2; rr=(br-bl)/2; ycen=b-rr; yy,xx=np.mgrid[0:H,0:W]
    al[(yy>ycen)&(((xx-cx)**2+(yy-ycen)**2)>(rr+3)**2)]=0
    core=cv2.GaussianBlur(cv2.erode((al>200).astype(np.uint8)*255,np.ones((3,3),np.uint8),iterations=2),(0,0),0.8)
    al=np.minimum(al,core)                                   # quita el halo blanco del borde
    im=Image.fromarray(np.dstack([cv2.cvtColor(rgb,cv2.COLOR_BGR2RGB),al]),"RGBA"); im=im.crop(im.getbbox())
    arr=np.array(im); hh=arr.shape[0]
    def rs(s):
        r,gg,b2,aa=[s[...,i].astype(int) for i in range(4)]; return ((r>140)&(gg<80)&(b2<80)&(aa>200)).sum()
    if rs(arr[-int(hh*.18):])>rs(arr[:int(hh*.18)]): im=im.rotate(180,expand=True)
    r=620/im.size[1]; return np.array(im.resize((max(1,round(im.size[0]*r)),620),Image.LANCZOS))

def hue_shift(a,dh,satmin=70,desat=None,dark=None):
    hsv=cv2.cvtColor(a[...,:3],cv2.COLOR_RGB2HSV).astype(np.int32)
    m=(hsv[...,1]>satmin)&(hsv[...,2]>40)&(a[...,3]>20)
    if desat is None: hsv[...,0]=np.where(m,(hsv[...,0]+dh)%180,hsv[...,0])
    else: hsv[...,1]=np.where(m,(hsv[...,1]*desat).astype(np.int32),hsv[...,1]); hsv[...,2]=np.where(m,(hsv[...,2]*dark).astype(np.int32),hsv[...,2])
    o=a.copy(); o[...,:3]=cv2.cvtColor(np.clip(hsv,0,255).astype(np.uint8),cv2.COLOR_HSV2RGB); return o

np.random.seed(7)
base={k:process(fn,idx) for k,(fn,idx) in SRC.items()}
spec={**base,"05":hue_shift(base["02"],+36),"06":hue_shift(base["03"],-14),"07":hue_shift(base["01"],-14),
      "08":hue_shift(base["04"],+13),"09":hue_shift(base["04"],-30),"10":hue_shift(base["02"],0,desat=0.10,dark=0.42),
      "11":hue_shift(base["02"],-22),"12":hue_shift(base["01"],+8),"13":hue_shift(base["03"],+9),"14":hue_shift(base["04"],+38),"15":hue_shift(base["01"],+150),"16":hue_shift(base["03"],0,desat=0.25,dark=0.95)}
for k,a in spec.items(): Image.fromarray(a,"RGBA").save(f"{OUT}/cap{k}.webp",quality=86,method=6,alpha_quality=100)
print("ok",sorted(spec))
