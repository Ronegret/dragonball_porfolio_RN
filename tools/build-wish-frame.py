"""Marco de Shen Long para el formulario de contacto: recorta el blanco exterior e interior y mide dónde están las esferas
y el mayor rectángulo libre del hueco (para colocar el formulario dentro).
Entrada: _source/wish/frame.png (dragón sobre blanco).  Salida: public/assets/wish/frame.webp + src/wishFrame.ts
Uso: python tools/build-wish-frame.py"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

SRC, OUT, TS = "_source/wish/frame.png", "public/assets/wish/frame.webp", "src/wishFrame.ts"
im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.float32)
H, W = a.shape[:2]
lum = a.mean(-1); sat = a.max(-1) - a.min(-1)

white = (lum > 236) & (sat < 22)
lab, n = ndi.label(white)
sizes = ndi.sum(white, lab, range(1, n + 1))
bg = np.isin(lab, 1 + np.where(sizes > 1500)[0])              # fondo exterior + hueco interior; los dientes y las garras (pequeños) se quedan
outer_id = lab[0, 0]
inner_ids = [i for i in 1 + np.where(sizes > 1500)[0] if i != outer_id]
inner = np.isin(lab, inner_ids)

# borde: mezcla de contorno oscuro y blanco -> alfa según cuánto blanco hay (des-premultiplicado)
band = ndi.binary_dilation(bg, iterations=3) & ~bg
t = np.clip((lum - 120) / 125.0, 0, 0.96)
alpha = np.ones((H, W), np.float32)
alpha[bg] = 0
alpha[band] = 1 - t[band]
rgb = a.copy()
for c in range(3):
    ch = rgb[..., c]
    ch[band] = np.clip((ch[band] - 255 * t[band]) / (1 - t[band]), 0, 255)
alpha = np.where(bg, 0, alpha)
rgba = np.dstack([rgb, alpha * 255]).clip(0, 255).astype(np.uint8)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
Image.fromarray(rgba, "RGBA").save(OUT, "WEBP", quality=88, alpha_quality=95, method=6)
print(OUT, os.path.getsize(OUT) // 1024, "KB", (W, H))

# ---- esferas: componentes naranja y redondos
R, G, B = a[..., 0], a[..., 1], a[..., 2]
orange = (R > 215) & (G > 120) & (G < 215) & (B < 110)
ol, on = ndi.label(orange)
balls = []
for i in range(1, on + 1):
    ys, xs = np.where(ol == i)
    if len(ys) < 900: continue
    w, h = xs.max() - xs.min(), ys.max() - ys.min()
    if not (0.7 < w / max(h, 1) < 1.4): continue
    balls.append([round(float(xs.mean()) / W * 100, 2), round(float(ys.mean()) / H * 100, 2), round(max(w, h) / W * 100, 2)])
balls.sort(key=lambda b: (b[1], b[0]))

# ---- ojos rojos del dragón
red = (R > 200) & (G < 70) & (B < 70)
rl, rn = ndi.label(red)
eyes = []
for i in range(1, rn + 1):
    ys, xs = np.where(rl == i)
    if 25 < len(ys) < 900: eyes.append([round(float(xs.mean()) / W * 100, 2), round(float(ys.mean()) / H * 100, 2)])
eyes = [e for e in eyes if 55 < e[0] < 80 and 20 < e[1] < 35]

# ---- mayor rectángulo libre dentro del hueco interior (histograma de alturas)
mask = inner.astype(np.int32)
best, heights = (0, 0, 0, 0, 0), np.zeros(W, np.int32)
for y in range(H):
    heights = np.where(mask[y] > 0, heights + 1, 0)
    st = []
    for x in range(W + 1):
        cur = heights[x] if x < W else 0
        start = x
        while st and st[-1][1] >= cur:
            sx, sh = st.pop()
            area = sh * (x - sx)
            if area > best[0]: best = (area, sx, y - sh + 1, x - sx, sh)
            start = sx
        st.append((start, cur))
_, rx, ry, rw, rh = best
rect = dict(x=round(rx / W * 100, 1), y=round(ry / H * 100, 1), w=round(rw / W * 100, 1), h=round(rh / H * 100, 1))
print("esferas", len(balls), balls)
print("ojos", eyes, "hueco libre", rect)

with open(TS, "w", encoding="utf-8") as f:
    f.write("// Generado por tools/build-wish-frame.py (porcentajes sobre la imagen del marco)\n")
    f.write(f"export const WISH = {{ ratio: {W / H:.4f}, hole: {json.dumps(rect)}, balls: {json.dumps(balls)}, eyes: {json.dumps(eyes)} }};\n")
