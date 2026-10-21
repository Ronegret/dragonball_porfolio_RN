"""Genera la nebulosa de fondo de forma procedural -> public/assets/space/nebula.webp.  Uso: python tools/build-space.py"""
import os
import numpy as np
from PIL import Image

rng = np.random.default_rng(11)
os.makedirs("public/assets/space", exist_ok=True)


def fbm(h, w, octaves=6, base=3, wrap_x=False):
    """Ruido fractal: suma de rejillas aleatorias ampliadas (bicúbico). wrap_x lo hace continuo en horizontal."""
    out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for o in range(octaves):
        gh, gw = base * 2 ** o + 1, int(base * 2 ** o * w / h) + 1
        g = rng.random((gh, gw)).astype(np.float32)
        if wrap_x:  # repite la primera columna al final para que la textura cierre sin costura
            g[:, -1] = g[:, 0]
        layer = np.asarray(Image.fromarray(g).resize((w, h), Image.BICUBIC))
        out += layer * amp; tot += amp; amp *= 0.52
    out /= tot
    return (out - out.min()) / (out.max() - out.min())


def smooth(x, a, b): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


# ---------- nebulosa ----------
H, W = 1400, 2400
n1, n2, n3, dust = fbm(H, W, 7, 2), fbm(H, W, 7, 3), fbm(H, W, 6, 2), fbm(H, W, 7, 4)
img = np.zeros((H, W, 3), np.float32)
img += np.array([7, 5, 16], np.float32)                                    # negro violáceo de base
img += smooth(n1, 0.45, 0.95)[..., None] * np.array([120, 40, 190])        # violeta (Daima)
img += smooth(n2, 0.55, 0.98)[..., None] * np.array([200, 40, 120])        # magenta
img += smooth(n3, 0.60, 1.00)[..., None] * np.array([30, 90, 210])         # azul
img += (smooth(n1 * n2, 0.42, 0.8) ** 2)[..., None] * np.array([255, 150, 60]) * 0.6  # núcleos cálidos
img *= (0.35 + 0.65 * smooth(dust, 0.3, 0.75))[..., None]                  # filamentos de polvo oscuro
yy, xx = np.mgrid[0:H, 0:W]
vign = 1 - 0.55 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
img *= np.clip(vign, 0.25, 1)[..., None] * 0.62                            # tenue: el contenido debe leerse encima

# las estrellas ya no se hornean aquí: las dibuja y mueve el canvas de SpaceBackground.tsx
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save("public/assets/space/nebula.webp", quality=78, method=6)

print("nebula", os.path.getsize("public/assets/space/nebula.webp") // 1024, "KB")
