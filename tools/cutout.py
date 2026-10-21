"""Recorta ilustraciones sobre fondo blanco: el fondo conectado a los bordes pasa a transparente y las
sombras grises del suelo se convierten en sombra negra translúcida (se ve natural sobre fondos oscuros).
Uso: python tools/cutout.py entrada.jpg salida.webp [alto] [bordes]
  bordes: letras de los bordes desde los que se rellena el fondo (t=arriba l=izq r=der b=abajo). Por defecto 'tlr'
  (sin abajo, para no comerse una camiseta blanca cortada por el borde inferior)."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

src, dst = sys.argv[1], sys.argv[2]
height = int(sys.argv[3]) if len(sys.argv) > 3 else 0
edges = sys.argv[4] if len(sys.argv) > 4 else "tlr"

im = Image.open(src).convert("RGB")
if height and im.height > height:
    im = im.resize((round(im.width * height / im.height), height), Image.LANCZOS)
rgb = np.asarray(im).astype(np.float32)
lum = rgb.mean(-1); sat = rgb.max(-1) - rgb.min(-1)

light = ((lum > 200) & (sat < 40)) | (lum > 236)          # fondo blanco, viñeta suave y sombras claras
lab, _ = ndi.label(light, structure=[[0, 1, 0], [1, 1, 1], [0, 1, 0]])
border = np.zeros_like(light)
if "t" in edges: border[0, :] = True
if "b" in edges: border[-1, :] = True
if "l" in edges: border[:, 0] = True
if "r" in edges: border[:, -1] = True
ids = np.unique(lab[border & light]); ids = ids[ids > 0]
bg = np.isin(lab, ids)

alpha = np.full(lum.shape, 255.0)
shadow = np.clip((244 - lum) / 110, 0, 0.55)               # gris del suelo -> opacidad de la sombra
alpha[bg] = 255 * shadow[bg]
out = rgb.copy(); out[bg] = 0                              # la sombra es negra translúcida
# borde: suaviza la franja clara de antialias que toca el fondo
ring = ndi.binary_dilation(bg, iterations=1) & ~bg
alpha[ring] *= 0.6
res = np.dstack([out, alpha]).clip(0, 255).astype(np.uint8)
Image.fromarray(res, "RGBA").save(dst, "WEBP", quality=88, method=6, alpha_quality=95)
print(dst, im.size, f"fondo {bg.mean():.0%}")
