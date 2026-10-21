"""Genera el fondo espacial realista (nebulosa + estrellas) y la textura del planeta Namek, de forma procedural.
Salida: public/assets/space/nebula.webp y public/assets/space/namek.webp.  Uso: python tools/build-space.py"""
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

# estrellas: muchas pequeñas + unas pocas brillantes con halo y destellos en cruz
def add_star(x, y, b, col, r=1.0, spikes=False):
    x0, x1, y0, y1 = max(0, int(x - 40)), min(W, int(x + 41)), max(0, int(y - 40)), min(H, int(y + 41))
    gy, gx = np.mgrid[y0:y1, x0:x1]; d2 = (gx - x) ** 2 + (gy - y) ** 2
    s = b * (np.exp(-d2 / (2 * (0.7 * r) ** 2)) + 0.18 * np.exp(-d2 / (2 * (4 * r) ** 2)))
    if spikes:
        s += b * 0.5 * (np.exp(-((gy - y) ** 2) / 0.8) * np.exp(-np.abs(gx - x) / 14) + np.exp(-((gx - x) ** 2) / 0.8) * np.exp(-np.abs(gy - y) / 14))
    img[y0:y1, x0:x1] += s[..., None] * np.array(col)
for _ in range(2600):
    add_star(rng.random() * W, rng.random() * H, rng.uniform(40, 200), rng.choice([[1, 1, 1], [0.8, 0.9, 1], [1, 0.9, 0.75]]), rng.uniform(0.6, 1.1))
for _ in range(26):
    add_star(rng.random() * W, rng.random() * H, rng.uniform(220, 255), rng.choice([[1, 1, 1], [0.75, 0.85, 1], [1, 0.85, 0.7]]), rng.uniform(1.4, 2.2), spikes=True)
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save("public/assets/space/nebula.webp", quality=78, method=6)

# ---------- textura de Namek (equirectangular 2:1, continua en horizontal) ----------
th, tw = 512, 1024
land = fbm(th, tw, 6, 3, wrap_x=True); tone = fbm(th, tw, 5, 6, wrap_x=True)
lat = np.abs(np.linspace(-1, 1, th))[:, None]
sea = np.array([66, 190, 160]) * (0.85 + 0.15 * tone[..., None]) * (1 - 0.25 * lat[..., None])
grass = np.array([60, 150, 80]) * (0.75 + 0.45 * tone[..., None])
coast = smooth(land, 0.52, 0.56)[..., None]
tex = sea * (1 - coast) + grass * coast
tex += smooth(land, 0.70, 0.85)[..., None] * np.array([40, 50, 10])          # mesetas más claras
tex = tex * (1 - smooth(lat, 0.82, 1)[..., None] * 0.3) + smooth(lat, 0.86, 1)[..., None] * np.array([90, 110, 100])  # casquetes
Image.fromarray(np.clip(tex, 0, 255).astype(np.uint8)).save("public/assets/space/namek.webp", quality=82, method=6)

for f in ("nebula", "namek"):
    print(f, os.path.getsize(f"public/assets/space/{f}.webp") // 1024, "KB")
