"""Quita los huecos blancos 'encerrados' que el recorte por inundación desde los bordes no alcanza
(p. ej. el trozo entre el brazo y el torso). Convierte esas bolsas en transparencia con un borde suave.
Uso: python tools/fix-pockets.py   (se ejecuta tras tools/cutout.py sobre look-up.webp y kneel-balls.webp)"""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

# archivo -> caja (x0, y0, x1, y1) donde está la bolsa; así no se toca ningún blanco legítimo (zapatillas, logos, ojos)
JOBS = {
    "look-up": (340, 650, 470, 1010),
    "kneel-balls": (190, 420, 290, 690),
}


def fix(name, box):
    path = f"public/assets/rod/{name}.webp"
    im = Image.open(path).convert("RGBA")
    a = np.array(im).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3]
    lum = rgb.mean(-1); sat = rgb.max(-1) - rgb.min(-1)
    x0, y0, x1, y1 = box
    zone = np.zeros(lum.shape, bool); zone[y0:y1, x0:x1] = True
    white = zone & (al > 100) & (lum > 205) & (sat < 50)
    lab, n = ndi.label(white)
    if not n:
        print(name, "sin bolsas"); return
    sizes = ndi.sum(white, lab, range(1, n + 1))
    pocket = np.isin(lab, 1 + np.where(sizes > 120)[0])                  # las bolsas dentro de la caja (la caja ya excluye blancos legítimos)
    # el borde anti-aliasado es una mezcla de blanco y camisa oscura: se des-mezcla (alfa = 1 - parte de blanco)
    ring = ndi.binary_dilation(pocket, iterations=6) & ~pocket & zone
    fr = ring & (sat < 50) & (lum > 55)
    t = np.clip((lum - 40) / 195, 0, 0.97)
    out = al.copy()
    out[pocket] = 0
    out[fr] = al[fr] * (1 - t[fr])
    for c in range(3):                                                    # quita el blanco mezclado del color
        ch = rgb[..., c]
        ch[fr] = np.clip((ch[fr] - 255 * t[fr]) / (1 - t[fr]), 0, 255)
    a[..., 3] = out
    Image.fromarray(a.clip(0, 255).astype(np.uint8), "RGBA").save(path, "WEBP", quality=88, method=6, alpha_quality=100)
    print(name, "bolsa:", int(pocket.sum()), "px")


for n, b in JOBS.items():
    fix(n, b)
