"""Procesa las 16 imágenes de _source/nuevas2/ (fondo blanco) y genera los WebP de public/assets/{rod,space,scenes}.
Uso (desde la raíz del proyecto):  python tools/build-nuevas2.py [--preview CARPETA] [nombre ...]
  --preview CARPETA  guarda además composiciones sobre #0b0818 y #3a1d6e para revisar halos (fuera del proyecto)
  nombre             solo procesa esos assets (vest suit-full portrait roshi blue-suit clash team pod namek-planet earth
                     island snake-way namek-land gravity office barcelona); sin nombres procesa todos
Requiere numpy, scipy, Pillow y opencv-python-headless. Los originales viven en _source/nuevas2/ (carpeta ignorada por git).

Tratamientos (todos pensados para verse sobre un fondo muy oscuro, #0b0818, sin ningún halo blanco):
  solid   recorte por inundación desde los bordes (como tools/cutout.py) con alfa subpíxel en el contorno, color del borde
          "descontaminado" con el del interior, huecos blancos cerrados (entre brazo y cuerpo) y sombra de suelo negra
          translúcida. Rod (vest, suit-full, portrait), Roshi.
  glow    híbrido para auras y destellos (blue-suit, clash, pod, planetas, isla): el cuerpo opaco y limpio; fuera de él, la
          luz se recupera des-premultiplicando contra blanco: alpha = 1 - min(R,G,B)/255, color = (c - 255*(1-alpha))/alpha,
          con unos ajustes para que sobre oscuro la luz mantenga cuerpo (ver glow()).
  fade    desvanecido a blanco de los bordes (team) convertido en transparencia suave por "dark channel".
  scene   rectángulos: recorta la viñeta blanca (borde donde la luminosidad media baja de 240 + 2 % de margen; en viñetas
          redondeadas, el mayor 16:9 inscrito) y, si el sujeto llega al borde, el blanco residual pasa a transparencia (gravity).
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "_source" / "nuevas2"
OUT = ROOT / "public" / "assets"
CROSS = ndi.generate_binary_structure(2, 1)

FILES = {
    "snake-way": "45a67c37-005c-4608-94cc-1fe81b85000a.jpg",
    "blue-suit": "4e17afef-ebb2-43f2-998d-5cf8854b3868.jpg",
    "vest": "5a4fca9f-f3ff-43dc-9606-30589c5e9c08.jpg",
    "suit-full": "602a3d57-83e4-40c0-a5fe-94e43ca38214.jpg",
    "pod": "60c858cb-5c53-4ecd-91bd-55950a659316.jpg",
    "office": "Gemini_Generated_Image_bmsh5kbmsh5kbmsh.jpg",
    "portrait": "Gemini_Generated_Image_lh36lhlh36lhlh36.jpg",
    "barcelona": "Gemini_Generated_Image_ugar9ougar9ougar.jpg",
    "namek-land": "a3dc64df-2b43-4773-8932-1e2589974cc4.jpg",
    "namek-planet": "a8a180b7-ef59-402f-8bc4-49735dd77dcc.jpg",
    "island": "ce144a10-c449-4465-a102-7f737fc39e86.jpg",
    "earth": "ea5a7baf-041d-4c21-b8ef-1b093e2848dc.jpg",
    "clash": "eaf6c8af-74ca-46fc-9c26-d82db255c2d3.jpg",
    "team": "f7a3e9ac-2275-4e29-b609-7d9b651e6746.jpg",
    "roshi": "ff5d7d85-b6a9-4da6-8e38-0e0861766cb8.jpg",
    "gravity": "watermarked_img_14317603466659468338.jpg",
}


# ---------------------------------------------------------------- utilidades
def load(key):
    return np.asarray(Image.open(SRC / FILES[key]).convert("RGB")).astype(np.float32)


def smoothstep(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def disk(r):
    return np.hypot(*np.mgrid[-r:r + 1, -r:r + 1]) <= r


def flood(passable, edges="tlr"):
    """Componentes de `passable` (conectividad 4) que tocan los bordes indicados (t l r b)."""
    lab, _ = ndi.label(passable, structure=CROSS)
    border = np.zeros_like(passable)
    if "t" in edges: border[0, :] = True
    if "b" in edges: border[-1, :] = True
    if "l" in edges: border[:, 0] = True
    if "r" in edges: border[:, -1] = True
    ids = np.unique(lab[border & passable]); ids = ids[ids > 0]
    return np.isin(lab, ids)


def resize_rgba(rgba, size):
    """Reescala en alfa premultiplicado (sin halos en el borde)."""
    a = rgba[..., 3:4] / 255.0
    pm = np.concatenate([rgba[..., :3] * a, rgba[..., 3:4]], -1)
    pm = np.stack([np.asarray(Image.fromarray(pm[..., i]).resize(size, Image.LANCZOS)) for i in range(4)], -1).astype(np.float32)
    al = pm[..., 3:4] / 255.0
    rgb = np.where(al > 0.004, pm[..., :3] / np.maximum(al, 0.004), 0)
    return np.concatenate([rgb, pm[..., 3:4]], -1).clip(0, 255)


def fit(rgba, width=None, height=None):
    """Reescala a un ancho o alto dado manteniendo la proporción."""
    h, w = rgba.shape[:2]
    s = (width / w) if width else (height / h)
    return resize_rgba(rgba, (round(w * s), round(h * s)))


def crop_alpha(rgba, pad=4, thr=10):
    ys, xs = np.where(rgba[..., 3] > thr)
    y0, y1, x0, x1 = max(ys.min() - pad, 0), min(ys.max() + 1 + pad, rgba.shape[0]), max(xs.min() - pad, 0), min(xs.max() + 1 + pad, rgba.shape[1])
    return rgba[y0:y1, x0:x1]


def drop_specks(rgba, min_area=150, near=6, thr=25):
    """Quita escombros y chispas sueltas: se conservan los componentes de alfa > thr con al menos min_area px."""
    mask = rgba[..., 3] > thr
    lab, n = ndi.label(mask)
    area = ndi.sum(mask, lab, np.arange(1, n + 1))
    keep = ndi.binary_dilation(np.isin(lab, 1 + np.flatnonzero(area >= min_area)), iterations=near)
    out = rgba.copy(); out[..., 3] *= keep
    return out


def feather(rgba, px=24, sides="tlrb", protect=None):
    """Rampa de alfa hacia los bordes para lo semitransparente (aura, sombra, niebla): no deja un corte seco donde el borde
    toca un halo. Se respeta lo opaco (alfa >= 250, personajes cortados por el marco) o, si se da, la máscara `protect`."""
    h, w = rgba.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    ramp = np.ones((h, w), np.float32)
    if "t" in sides: ramp = np.minimum(ramp, smoothstep(yy, 0, px))
    if "b" in sides: ramp = np.minimum(ramp, smoothstep(h - 1 - yy, 0, px))
    if "l" in sides: ramp = np.minimum(ramp, smoothstep(xx, 0, px))
    if "r" in sides: ramp = np.minimum(ramp, smoothstep(w - 1 - xx, 0, px))
    out = rgba.copy()
    keep = (rgba[..., 3] >= 250) if protect is None else protect
    out[..., 3] = np.where(keep, rgba[..., 3], rgba[..., 3] * ramp)
    return out


def inpaint(rgb, mask):
    import cv2
    return cv2.inpaint(rgb.astype(np.uint8), (mask * 255).astype(np.uint8), 3, cv2.INPAINT_TELEA).astype(np.float32)


def save_webp(arr, path, budget_kb, q=84):
    """Guarda en WebP (method 6, alpha_quality 95) bajando la calidad hasta entrar en el presupuesto en KB."""
    arr = np.asarray(arr).clip(0, 255).astype(np.uint8)
    im = Image.fromarray(arr, "RGBA" if arr.shape[-1] == 4 else "RGB")
    path.parent.mkdir(parents=True, exist_ok=True)
    aq = 95
    while True:
        im.save(path, "WEBP", quality=q, method=6, alpha_quality=aq)
        kb = path.stat().st_size / 1024
        if kb <= budget_kb or q <= 40: return im.size, kb, q
        q -= 3
        if q < 70: aq = 85


# ---------------------------------------------------------------- recorte "solid"
def nearest_inner(rgb, fg, width):
    """Para cada píxel, color del píxel de interior (a más de `width` px del fondo) más cercano."""
    inner = ndi.distance_transform_edt(fg) > width
    idx = ndi.distance_transform_edt(~inner, return_distances=False, return_indices=True)
    return rgb[idx[0], idx[1]], inner


def matte_edges(rgb, bg, band_w=2.5):
    """Alfa subpíxel en la franja del contorno: C = a*F + (1-a)*255 con F = color del interior más cercano (descontamina)."""
    fg = ~bg
    F, inner = nearest_inner(rgb, fg, band_w)
    band = (fg & ~inner) | (bg & (ndi.distance_transform_edt(bg) <= band_w))
    d = 255 - F
    den = (d * d).sum(-1)
    a = np.clip(((255 - rgb) * d).sum(-1) / np.maximum(den, 1), 0, 1)
    a = np.where(den > 2500, a, fg.astype(np.float32))          # F casi blanco: no se puede resolver, se deja binario
    alpha = np.where(band, a, fg.astype(np.float32))
    color = np.where(band[..., None] & (alpha[..., None] > 0), F, rgb)
    return color, alpha


def background(rgb, edges="tlr", shadow_y=None, pockets=True):
    """Máscara del fondo: blanco (min(R,G,B) >= 226) conectado a los bordes indicados, más los huecos de fondo puro rodeados
    por el sujeto (los blancos "pintados" del sujeto son < 250) y, desde la fila shadow_y, la sombra gris del suelo."""
    lum = rgb.mean(-1); sat = rgb.max(-1) - rgb.min(-1); m = rgb.min(-1)
    light = m >= 226
    bg = flood(light, edges)
    if pockets:
        lab, n = ndi.label(light & ~bg, structure=CROSS)
        if n:
            idx = np.arange(1, n + 1)
            area = ndi.sum(np.ones_like(m), lab, idx); mean = ndi.mean(m, lab, idx)
            bg |= np.isin(lab, idx[(area >= 150) & (mean >= 250)])
    if shadow_y is not None:
        grey = (sat < 40) & (lum > 110) & ~bg
        grey[:int(shadow_y)] = False
        lab, _ = ndi.label(grey, structure=CROSS)
        ids = np.unique(lab[ndi.binary_dilation(bg, structure=CROSS) & grey]); ids = ids[ids > 0]
        bg |= np.isin(lab, ids)
    return bg


def solid(rgb, edges="tlr", shadow_y=None):
    """Recorte de un sujeto con contorno nítido: fondo transparente, alfa subpíxel, sin franja blanca y, si hay
    shadow_y, la sombra del suelo como negro translúcido (alfa = (244 - lum)/110, máx. 0.55)."""
    bg = background(rgb, edges, shadow_y)
    color, alpha = matte_edges(rgb, bg)
    alpha = alpha * 255
    if shadow_y is not None:
        sh = np.clip((244 - rgb.mean(-1)) / 110, 0, 0.55) * 255
        sh[:int(shadow_y)] = 0
        alpha = np.where(bg, np.maximum(sh, alpha), alpha)
    color = np.where((bg & (alpha > 0) & (color == rgb).all(-1))[..., None], 0, color)   # la sombra es negra
    return np.dstack([color, alpha]).clip(0, 255)


# ---------------------------------------------------------------- desvanecido a blanco (team) y viñeta (escenas)
def fade(rgb, edges="bl", zone=0.28, win=25, m0=20):
    """Desvanecido a blanco en los bordes (como una niebla blanca): transmitancia t por "dark channel" (mínimo local de
    min(R,G,B) normalizado con m0 = negro del contorno); alfa = t y color = (c - 255(1-t))/t. Solo actúa a menos de
    `zone` (fracción del lado) de los bordes indicados, para no tocar los blancos legítimos del interior."""
    h, w = rgb.shape[:2]
    t = np.clip((255 - ndi.minimum_filter(rgb.min(-1), size=win)) / (255.0 - m0), 0, 1)
    t = ndi.gaussian_filter(t, win / 4)
    yy, xx = np.mgrid[0:h, 0:w]
    wgt = np.zeros((h, w), np.float32)
    if "b" in edges: wgt = np.maximum(wgt, smoothstep(yy, h * (1 - zone), h * (1 - zone * 0.6)))
    if "t" in edges: wgt = np.maximum(wgt, 1 - smoothstep(yy, h * zone * 0.6, h * zone))
    if "l" in edges: wgt = np.maximum(wgt, 1 - smoothstep(xx, w * zone * 0.35, w * zone * 0.55))
    if "r" in edges: wgt = np.maximum(wgt, smoothstep(xx, w * (1 - zone * 0.55), w * (1 - zone * 0.35)))
    t = 1 - wgt * (1 - t)
    col = (rgb - 255 * (1 - t[..., None])) / np.maximum(t[..., None], 0.08)
    return col.clip(0, 255), t


def team():
    rgb = load("team")
    bg = background(rgb, "tlrb")
    color, alpha = matte_edges(rgb, bg)
    fcol, t = fade(color, "bl")
    out = np.dstack([np.where(((alpha > 0.99) & (t < 1))[..., None], fcol, color), alpha * 255 * t])
    return out


def vignette_box(rgb, sides="tblr", thr=240, margin=0.02):
    """Caja interior sin viñeta blanca (viñeta recta): en cada lado, primera/última fila o columna cuya luminosidad media
    baja de `thr`, más `margin` (2 % del lado) a los lados recortados."""
    lum = rgb.mean(-1); h, w = lum.shape
    rows, cols = lum.mean(1), lum.mean(0)
    y0, y1 = int(np.argmax(rows < thr)), h - int(np.argmax(rows[::-1] < thr))
    x0, x1 = int(np.argmax(cols < thr)), w - int(np.argmax(cols[::-1] < thr))
    my, mx = round(margin * h), round(margin * w)
    y0 = y0 + my if "t" in sides and y0 > 0 else 0
    y1 = y1 - my if "b" in sides and y1 < h else h
    x0 = x0 + mx if "l" in sides and x0 > 0 else 0
    x1 = x1 - mx if "r" in sides and x1 < w else w
    return x0, y0, x1, y1


def inscribed_box(rgb, aspect=16 / 9, thr=228, margin=0.02):
    """Viñeta redondeada: mayor rectángulo de proporción `aspect` (el más centrado) que no toca el blanco de la viñeta
    (luminosidad >= thr conectada a los bordes), con `margin` (2 % del lado menor) de holgura."""
    h, w = rgb.shape[:2]
    vig = ndi.binary_dilation(flood(rgb.mean(-1) >= thr, "tlrb"), iterations=max(1, round(margin * min(h, w))))
    I = np.pad(vig.astype(np.int32).cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    for rw in range(w, 100, -2):
        rh = round(rw / aspect)
        if rh > h: continue
        ys, xs = np.arange(h - rh + 1), np.arange(w - rw + 1)
        free = np.argwhere(I[np.ix_(ys + rh, xs + rw)] - I[np.ix_(ys, xs + rw)] - I[np.ix_(ys + rh, xs)] + I[np.ix_(ys, xs)] == 0)
        if len(free):
            y, x = free[np.argmin((free[:, 0] - (h - rh) / 2) ** 2 + (free[:, 1] - (w - rw) / 2) ** 2)]
            return x, y, x + rw, y + rh
    raise ValueError("sin rectángulo libre de viñeta")


def corner_fade(rgb, thr=238, band=0.16, win=9, m0=30):
    """Blanco residual de la viñeta (esquinas): píxeles casi blancos conectados al borde y a menos de `band` del lado
    pasan a transparencia suave (alfa por mínimo local, color des-premultiplicado); el resto del cuadro no se toca."""
    h, w = rgb.shape[:2]
    m = rgb.min(-1)
    yy, xx = np.mgrid[0:h, 0:w]
    near = (np.minimum(yy, h - 1 - yy) < band * h) | (np.minimum(xx, w - 1 - xx) < band * w)
    region = flood(m >= thr - 25, "tlrb") & near
    region = ndi.gaussian_filter(ndi.binary_dilation(region, iterations=6).astype(np.float32), 4)
    t = np.clip((255 - ndi.minimum_filter(m, size=win)) / (255.0 - m0), 0, 1)
    t = 1 - region * (1 - ndi.gaussian_filter(t, 1.5))
    col = (rgb - 255 * (1 - t[..., None])) / np.maximum(t[..., None], 0.08)
    return np.dstack([np.where((t < 0.999)[..., None], col, rgb), t * 255]).clip(0, 255)


# ---------------------------------------------------------------- híbrido de luz "glow" (auras, planetas, llamas)
def glow_alpha(rgb, floor=0.03):
    """alpha = 1 - min(R,G,B)/255 con suelo de ruido; color des-premultiplicado contra blanco."""
    a = 1 - rgb.min(-1) / 255.0
    a = np.clip((a - floor) / (1 - floor), 0, 1)
    col = (rgb - 255 * (1 - a[..., None])) / np.maximum(a[..., None], 0.02)
    return col.clip(0, 255), a


def align_figure(ref_rgb, ref_alpha, tgt_rgb, skip_rows=0):
    """Máscara del personaje de `tgt` a partir del recorte limpio `ref` (misma pose, p. ej. suit-full -> blue-suit):
    alineación afín ECC de OpenCV (ignora las filas de la cara, que cambia de expresión)."""
    import cv2
    g = lambda im: cv2.GaussianBlur(cv2.cvtColor(im.astype(np.uint8), cv2.COLOR_RGB2GRAY), (0, 0), 1.5).astype(np.float32)
    fig = (ref_alpha > 250).astype(np.uint8)
    use = cv2.erode(fig, np.ones((9, 9), np.uint8)); use[:skip_rows] = 0
    warp = np.eye(2, 3, dtype=np.float32)
    _, warp = cv2.findTransformECC(g(tgt_rgb), g(ref_rgb), warp, cv2.MOTION_AFFINE,
                                   (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), use, 5)
    h, w = fig.shape
    return cv2.warpAffine(fig, warp, (w, h), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP) > 0


def figure_by_outline(rgb, blackhat=60, ink_max=110, seal=2, min_area=2000):
    """Silueta a partir del contorno de tinta del dibujo: es "tinta" lo muy oscuro (max(RGB) < ink_max) o lo mucho más oscuro
    que su entorno de 5x5 (línea fina antialias); engrosada `seal` px para cerrar fisuras. Lo que NO es alcanzable desde
    el borde sin cruzar tinta es personaje (las llamas azules no cuentan: su canal máximo es alto). Se descartan restos
    de menos de `min_area` px (chispas, escombros)."""
    v = rgb.max(-1)
    ink = ((ndi.grey_closing(v, size=(5, 5)) - v) >= blackhat) | (v < ink_max)
    barrier = ndi.binary_dilation(ink, structure=CROSS, iterations=seal)
    outside = flood(~barrier, "tlrb")
    outside = outside | (ndi.binary_dilation(outside, structure=CROSS, iterations=seal) & ~ink)
    body = ~outside
    lab, n = ndi.label(body, structure=CROSS)
    area = ndi.sum(body, lab, np.arange(1, n + 1))
    return np.isin(lab, 1 + np.flatnonzero(area >= min_area))


def disc(shape, cx, cy, r, feather=1.2):
    """Disco con borde suave (planetas, nave esférica): 1 dentro, 0 fuera."""
    yy, xx = np.mgrid[0:shape[0], 0:shape[1]]
    return np.clip((r - np.hypot(xx - cx, yy - cy)) / feather + 0.5, 0, 1)


def glow(rgb, body, inset=2, floor=0.03, gain=1.2, gamma=0.7, core_sigma=16, core_lo=0.3, core_hi=0.5, core_max=0.92,
         emis_lo=0.13, emis_hi=0.4, emis_max=0.96, lights=(), neutral_cut=None):
    """Híbrido: dentro de `body` (silueta opaca, erosionada `inset` px) todo queda limpio; fuera, la luz (aura, destellos,
    polvo, sombras) conserva su color real con alfa = 1 - min(RGB)/255 (des-premultiplicado contra blanco).
    Sobre un fondo oscuro la luz necesita algo más de cuerpo que sobre blanco, así que se añaden estos ajustes:
      gain/gamma  alfa' = gain * alfa^gamma: la luz tenue pesa más sobre oscuro;
      emisiva     la luz saturada o dorada (rayos, llama celeste) queda opaca con su color pálido original (no turbia);
      núcleo      las zonas casi blancas rodeadas de aura (que por fórmula saldrían huecas) se rellenan con un tono pálido
                  del color local del aura; el halo exterior sí se desvanece por completo;
      neutral_cut (lo, hi) descarta lo gris/neutro fuera de la silueta (líneas de velocidad, polvo): alfa *= smoothstep(sat);
      lights      destellos blancos que el dibujo pinta como "nada" (choque de puños, núcleo del aura entre las piernas) se
                  devuelven como luz: lista de (x, y, rx, ry, (r, g, b), intensidad), elipse gaussiana bajo lo existente."""
    core_body = ndi.binary_erosion(body, structure=CROSS, iterations=inset) if inset else body
    col, a0 = glow_alpha(rgb, floor)
    out_a = a0 * ~body
    dens = ndi.gaussian_filter(np.maximum(a0, body), core_sigma)             # densidad de "materia" alrededor (cuerpo incluido)
    core = smoothstep(dens, core_lo, core_hi) * core_max
    tint = smoothstep(1 - rgb.min(-1) / 255.0, 0.012, 0.045)                 # 0 = blanco puro, 1 = ya tiene color
    loc = np.stack([ndi.gaussian_filter(out_a * col[..., k], 12) for k in range(3)], -1) / np.maximum(ndi.gaussian_filter(out_a, 12), 1e-3)[..., None]
    pale = 0.5 * loc + 0.5 * 255                                             # tono pálido del aura de la zona
    src = tint[..., None] * rgb + (1 - tint[..., None]) * pale              # color "emisivo" de los núcleos
    sat = (rgb.max(-1) - rgb.min(-1)) / np.maximum(rgb.max(-1), 1)
    warm = smoothstep((rgb[..., 0] + rgb[..., 1]) / 2 - rgb[..., 2], 22, 55)  # rayos dorados: núcleo casi blanco pero amarillento
    emis = np.maximum(smoothstep(sat, emis_lo, emis_hi), warm) * emis_max * (a0 > 0)
    alpha = np.maximum(np.minimum(gain * a0 ** gamma, 1), np.maximum(core * (0.6 + 0.4 * tint), emis))
    extra = np.clip(alpha - a0, 0, 1)[..., None]                             # parte emisiva añadida sobre la de la fórmula
    color = (a0[..., None] * col + extra * src) / np.maximum(a0[..., None] + extra, 1e-3)
    yy, xx = np.mgrid[0:rgb.shape[0], 0:rgb.shape[1]]
    for cx, cy, rx, ry, lc, st in lights:
        w = (st * np.exp(-1.6 * (((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)))[..., None]
        base = alpha[..., None]; w = w * (1 - base)
        color = np.where(w + base > 1e-3, (base * color + w * np.array(lc, np.float32)) / np.maximum(base + w, 1e-3), color)
        alpha = (base + w)[..., 0]
    if neutral_cut: alpha = alpha * smoothstep(sat, *neutral_cut)
    alpha = np.maximum(alpha * ~core_body, ndi.gaussian_filter(core_body.astype(np.float32), 0.6))
    color = np.where(core_body[..., None], rgb, color)
    return np.dstack([color, alpha * 255]).clip(0, 255)


def planet(key, cx, cy, r, half):
    """Planeta (disco opaco) + brillo exterior como luz translúcida, en un cuadrado de lado 2*half con desvanecido radial.
    Antes de separar la luz se rellenan (inpaint) el polvo y las lunas oscuras sueltas y los destellos blancos finos, que
    por la fórmula del alfa saldrían como muescas negras; los destellos se devuelven después como luz blanca-cian."""
    rgb = load(key)
    h, w = rgb.shape[:2]
    body = disc((h, w), cx, cy, r - 1) > 0.5
    ring = ndi.binary_dilation(body, iterations=3)
    sat = (rgb.max(-1) - rgb.min(-1)) / np.maximum(rgb.max(-1), 1)
    m = rgb.min(-1)
    top = m - ndi.maximum_filter(ndi.minimum_filter(m, size=31), size=31)             # top-hat: blanco más brillante que su entorno
    yy, xx = np.mgrid[0:h, 0:w]
    cand = (top > 8) & (m >= 235) & ~ring & (np.hypot(xx - cx, yy - cy) < r + 28)         # solo destellos pegados al limbo
    lab, n = ndi.label(cand)
    area = ndi.sum(cand, lab, np.arange(1, n + 1))
    flare = ndi.binary_dilation(np.isin(lab, 1 + np.flatnonzero((area >= 40) & (area < 3000))), iterations=2) & ~ring   # destellos, no niebla
    lab, n = ndi.label(flare)
    lights = [(xc, yc, 1.5 * np.sqrt(a / np.pi) + 10, 1.5 * np.sqrt(a / np.pi) + 10, (225, 250, 255), 0.85)
              for (yc, xc), a in zip(ndi.center_of_mass(flare, lab, range(1, n + 1)), ndi.sum(flare, lab, range(1, n + 1)))]
    dark = (rgb.mean(-1) < 150) & (sat < 0.25) & ~ring                                # polvo y lunas grises
    sun = (rgb[..., 0] >= 200) & (rgb[..., 1] >= 140) & (rgb[..., 2] < 170) & (rgb[..., 0] - rgb[..., 2] > 70) & ~ring   # soles pequeños
    lab, n = ndi.label(dark | sun)
    area = ndi.sum(dark | sun, lab, np.arange(1, n + 1))
    big = np.isin(lab, 1 + np.flatnonzero(area >= 60))                                # objetos con halo propio: relleno más amplio
    speck = ndi.binary_dilation(big, iterations=9) | ndi.binary_dilation(dark & ~big, iterations=2) | flare
    speck &= ~ring
    iy, ix = ndi.distance_transform_edt(ring, return_distances=False, return_indices=True)
    base = np.where(ring[..., None], rgb[iy, ix], rgb)                                # el planeta no contamina el relleno
    rgb = np.where(ring[..., None], rgb, inpaint(base, speck))
    out = glow(rgb, body, inset=0, lights=lights)
    a = disc((h, w), cx, cy, r - 1, 1.5)                                     # borde suave del planeta
    out[..., 3] = np.maximum(out[..., 3] * (1 - a), a * 255)
    out[..., :3] = np.where((a > 0.999)[..., None], rgb, out[..., :3])
    out[..., 3] *= 1 - smoothstep(np.hypot(xx - cx, yy - cy), half * 0.80, half * 0.99)
    x0, y0, n = int(round(cx - half)), int(round(cy - half)), 2 * int(half)
    sq = np.zeros((n, n, 4), np.float32)
    xs0, ys0, xs1, ys1 = max(x0, 0), max(y0, 0), min(x0 + n, w), min(y0 + n, h)
    sq[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0] = out[ys0:ys1, xs0:xs1]
    return sq


def fill_small_holes(mask, lum, area_max, mean_max=238):
    """Rellena los huecos pequeños y no blancos de `mask` (blancos pintados del sujeto); los blancos puros del fondo no."""
    holes = ~mask
    lab, n = ndi.label(holes)
    idx = np.arange(1, n + 1)
    area, mean = ndi.sum(holes, lab, idx), ndi.mean(lum, lab, idx)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
    return mask | np.isin(lab, [i for i in idx if area[i - 1] < area_max and mean[i - 1] < mean_max and i not in edge])


# ---------------------------------------------------------------- assets
# Cada builder devuelve (array RGBA/RGB float, ruta relativa a public/assets, presupuesto en KB)
def b_vest():
    return crop_alpha(solid(load("vest"), "tlr")), "rod/vest.webp", 260        # busto cortado abajo: no se inunda desde abajo


def b_suit_full():
    return feather(crop_alpha(solid(load("suit-full"), "tlrb", shadow_y=880), thr=14), 30, "lrb"), "rod/suit-full.webp", 260


def b_portrait():
    return fit(crop_alpha(solid(load("portrait"), "tlr")), height=1700), "rod/portrait.webp", 260


def b_roshi():
    return feather(crop_alpha(solid(load("roshi"), "tlrb", shadow_y=850), thr=14), 30, "lrb"), "rod/roshi.webp", 260


def b_blue_suit():
    """Misma pose que suit-full: su recorte limpio, alineado por ECC, da la silueta opaca; el aura va como luz."""
    ref = load("suit-full"); tgt = load("blue-suit")
    body = align_figure(ref, solid(ref, "tlrb", shadow_y=880)[..., 3], tgt, skip_rows=210)
    out = glow(tgt, body, inset=2, lights=[(386, 830, 52, 150, (190, 232, 255), 0.8)])   # núcleo blanco entre las piernas
    return crop_alpha(feather(out, 28, protect=body), pad=4, thr=8), "rod/blue-suit.webp", 260


def b_clash():
    rgb = load("clash")
    body = figure_by_outline(rgb)
    out = glow(rgb, body, inset=1, lights=[(550, 235, 48, 100, (255, 238, 190), 0.9)])   # destello del choque
    return crop_alpha(feather(out, 24, protect=body), pad=4, thr=8), "rod/clash.webp", 260


def b_team():
    return feather(crop_alpha(team(), pad=2, thr=8), 36, "bl"), "rod/team.webp", 260


def b_pod():
    rgb = load("pod")
    body = disc(rgb.shape[:2], 534, 281, 152, 1.5) > 0.5                      # la nave es una esfera: círculo ajustado a mano
    sat = (rgb.max(-1) - rgb.min(-1)) / np.maximum(rgb.max(-1), 1)
    dark = (rgb.mean(-1) < 120) & (sat < 0.4) & ~ndi.binary_dilation(body, iterations=3)           # escombros oscuros sueltos
    rgb = np.where(body[..., None], rgb, inpaint(rgb, ndi.binary_dilation(dark, iterations=2) & ~body))
    out = glow(rgb, body, inset=0, neutral_cut=(0.07, 0.2), core_lo=0.15, core_hi=0.35)
    a = disc(rgb.shape[:2], 534, 281, 152, 1.6)
    out[..., 3] = np.maximum(out[..., 3] * (1 - a), a * 255)
    out[..., :3] = np.where((a > 0.999)[..., None], rgb, out[..., :3])
    smoke = (1 - smoothstep(out[..., :3].mean(-1), 50, 110)) * (1 - disc(rgb.shape[:2], 534, 281, 166, 8))   # humo oscuro tras la nave
    out[..., 3] *= 1 - 0.7 * smoke                                           # se aclara para que no parezcan manchas negras
    out = crop_alpha(drop_specks(out), pad=6, thr=30)                         # líneas de velocidad y escombros fuera
    return fit(out, width=700), "space/pod.webp", 260


def b_namek_planet():
    return fit(planet("namek-planet", 512, 290, 190, 262), width=900), "space/namek-planet.webp", 260


def b_earth():
    return fit(planet("earth", 513, 217, 196, 217), width=800), "space/earth.webp", 260


def b_island():
    """Cuerpo = isla + árbol (mayor componente oscuro, con flores rosas de la copa) y rocas oscuras; la niebla rosa y el
    anillo de polvo claro quedan como luz translúcida."""
    rgb = load("island")
    m = rgb.min(-1)
    big = ndi.binary_opening(m < 178, structure=disk(3))
    lab, n = ndi.label(big)
    big = lab == 1 + np.argmax(ndi.sum(big, lab, np.arange(1, n + 1)))
    big = fill_small_holes(ndi.binary_closing(big, structure=disk(6)), m, 1500)
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    rows = np.mgrid[0:rgb.shape[0], 0:rgb.shape[1]][0]
    pink = (R >= 200) & (R - G >= 30) & (B >= 140) & (ndi.distance_transform_edt(~big) <= 16) & (rows < 185)   # flores de la copa
    big = fill_small_holes(ndi.binary_closing(big | pink, structure=disk(3)), m, 1500)
    rocks = ndi.binary_opening(m < 130, structure=disk(1))
    lab, n = ndi.label(rocks)
    rocks = np.isin(lab, 1 + np.flatnonzero(ndi.sum(rocks, lab, np.arange(1, n + 1)) >= 25))
    out = glow(rgb, big | rocks, inset=1, core_max=0)
    return fit(crop_alpha(out, pad=6, thr=20), width=900), "space/island.webp", 260


def scene(key, sides, fade_corners, budget=220, inscribed=False):
    rgb = load(key)
    x0, y0, x1, y1 = inscribed_box(rgb) if inscribed else vignette_box(rgb, sides)
    rgb = rgb[y0:y1, x0:x1]
    if rgb.shape[1] > 1600:
        rgb = np.asarray(Image.fromarray(rgb.astype(np.uint8)).resize((1600, round(rgb.shape[0] * 1600 / rgb.shape[1])), Image.LANCZOS)).astype(np.float32)
    return (corner_fade(rgb) if fade_corners else rgb), budget


def b_snake_way():
    out, kb = scene("snake-way", "tl", False)                                # cielo blanco de arriba y borde izquierdo; el resto son nubes (contenido)
    return out, "scenes/snake-way.webp", kb


def b_namek_land():
    out, kb = scene("namek-land", "", False, inscribed=True)               # viñeta redondeada: rectángulo 16:9 inscrito
    return out, "scenes/namek-land.webp", kb


def b_gravity():
    # viñeta demasiado cerrada (los pies de Rod rozan el borde inferior): se recortan solo los laterales y el resto del
    # blanco pasa a transparencia suave
    out, kb = scene("gravity", "lr", True)                                   # solo laterales: arriba y abajo hay contenido hasta el borde
    return out, "scenes/gravity.webp", kb


def wide(key, name):
    rgb = load(key)
    out = np.asarray(Image.fromarray(rgb.astype(np.uint8)).resize((1800, round(rgb.shape[0] * 1800 / rgb.shape[1])), Image.LANCZOS))
    return out, f"scenes/{name}.webp", 220


BUILDERS = {
    "vest": b_vest, "suit-full": b_suit_full, "portrait": b_portrait, "roshi": b_roshi, "blue-suit": b_blue_suit,
    "clash": b_clash, "team": b_team, "pod": b_pod, "namek-planet": b_namek_planet, "earth": b_earth, "island": b_island,
    "snake-way": b_snake_way, "namek-land": b_namek_land, "gravity": b_gravity,
    "office": lambda: wide("office", "office"), "barcelona": lambda: wide("barcelona", "barcelona"),
}


def preview(arr, path, maxw=760):
    """Composición sobre #0b0818 y #3a1d6e (esta última delata los halos) lado a lado."""
    a = arr[..., 3:4] / 255.0 if arr.shape[-1] == 4 else np.ones(arr.shape[:2] + (1,), np.float32)
    tiles = [(arr[..., :3] * a + np.array(bg, np.float32) * (1 - a)) for bg in ((11, 8, 24), (58, 29, 110))]
    im = Image.fromarray(np.concatenate(tiles, 1).clip(0, 255).astype(np.uint8))
    s = min(1, 2 * maxw / im.width)
    im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS).save(path)


def main(argv):
    prev = None
    if "--preview" in argv:
        i = argv.index("--preview"); prev = Path(argv[i + 1]); prev.mkdir(parents=True, exist_ok=True)
        argv = argv[:i] + argv[i + 2:]
    names = argv or list(BUILDERS)
    print(f"{'archivo':28} {'px':>11} {'KB':>7} {'q':>3}")
    for name in names:
        arr, rel, budget = BUILDERS[name]()
        size, kb, q = save_webp(arr, OUT / rel, budget)
        print(f"{rel:28} {size[0]:>5}x{size[1]:<5} {kb:7.1f} {q:>3}" + ("" if kb <= budget else "  ¡sobre presupuesto!"))
        if prev: preview(arr, prev / f"{name}.png")


if __name__ == "__main__":
    main(sys.argv[1:])
