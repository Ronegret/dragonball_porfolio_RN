"""Limpia las 7 esferas del dragón (public/assets/db/ball1..7.webp): el render original traía una media luna
blanca/gris pegada debajo (resto de la base/reflejo) que se veía como una mancha fuera de la esfera.
La silueta real es una elipse ajustada al arco SUPERIOR de la esfera (la parte naranja/roja, muy
saturada, lejos de la peana de abajo) y todo lo de fuera —la peana de cristal incluida— se hace transparente con borde suave.
Los originales quedan en _source/db-backup; el script parte de ellos, así que se puede ejecutar varias veces.
Uso: python tools/clean-balls.py"""
import cv2, numpy as np
from PIL import Image

for n in range(1, 8):
    p, src = f"public/assets/db/ball{n}.webp", f"_source/db-backup/ball{n}.webp"
    im = np.asarray(Image.open(src).convert("RGBA")).copy()
    rgb = im[..., :3].astype(int); al = im[..., 3]
    sat = rgb.max(-1) - rgb.min(-1)
    core = ((al > 200) & (sat > 70)).astype(np.uint8)
    core = cv2.morphologyEx(core, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n_lab, lab, st, _ = cv2.connectedComponentsWithStats(core, 8)
    core = (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)          # solo la esfera (con algo de peana)
    cnts, _ = cv2.findContours(core, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    pts = max(cnts, key=len).reshape(-1, 2).astype(np.float64)
    ys = pts[:, 1]
    top = pts[ys < ys.min() + 0.62 * (ys.max() - ys.min())]                            # arco superior: lejos de la peana
    (cx, cy), (w, h), ang = cv2.fitEllipse(top.astype(np.float32))                      # la esfera es algo más ancha que alta
    yy, xx = np.mgrid[0:al.shape[0], 0:al.shape[1]]
    t = np.deg2rad(ang); dx, dy = xx - cx, yy - cy
    u = (dx * np.cos(t) + dy * np.sin(t)) / (w / 2); v = (-dx * np.sin(t) + dy * np.cos(t)) / (h / 2)
    dist = (np.hypot(u, v) - 1.0) * min(w, h) / 2                                        # distancia aprox. al borde en px
    soft = np.clip(0.8 - dist, 0, 1).astype(np.float32)                                  # 1 px de margen y borde suave
    out = im.copy()
    out[..., 3] = (al.astype(np.float32) * soft).astype(np.uint8)
    removed = int(((al > 40) & (soft == 0)).sum())
    Image.fromarray(out, "RGBA").save(p, "WEBP", quality=90, method=6, alpha_quality=100)
    print(f"ball{n}: elipse c=({cx:.0f},{cy:.0f}) ejes={w:.0f}x{h:.0f}, {removed} px opacos fuera eliminados")
