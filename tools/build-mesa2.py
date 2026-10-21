"""Escena 'mesa2' del hero: recorta la oficina del vídeo (queda solo la persona, la mesa y los portátiles, con sus rayos),
elige los fotogramas necesarios según la dirección de la mirada y genera public/assets/mesa2/*.webp (con transparencia)
+ src/mesa2Gaze.ts.

Cómo se recorta (la cámara es fija):
  1. Máscara fija (camiseta, brazos, mesa, portátiles, caja, portalápices): GrabCut sobre la imagen MEDIANA de todo el vídeo
     (sin rayos ni cabeza), guiado por polígonos "seguro persona / seguro fondo" dibujados a mano para este vídeo.
  2. Cabeza: GrabCut por fotograma en una ventana alrededor de la cabeza (es lo único que se mueve), sin el resplandor del aura.
  3. Rayos fuera del cuerpo: píxeles blanco-azulados mucho más claros que el percentil 90 del vídeo (el ventanal siempre brilla,
     un rayo no); alfa suave según cuánto aclaran.
  4. Los bordes de la mesa que tocan el marco (izq., der., abajo) se desvanecen para que no haya cortes rectos.

Si cambias el vídeo hay que revisar los polígonos de static_mask() y las etiquetas de mirada (A).
Requiere ffmpeg (variable FFMPEG), opencv-python-headless, numpy y Pillow.  Uso: python tools/build-mesa2.py
"""
import math, os, subprocess, tempfile
import cv2, numpy as np
from PIL import Image

FF = os.environ.get("FFMPEG", "ffmpeg")
SRC, OUT, TS = "_source/mesa/mesa2.mp4", "public/assets/mesa2", "src/mesa2Gaze.ts"
W, H = 1280, 720
HEAD = (0.505, 0.22)          # centro de la cabeza en coordenadas normalizadas
QUALITY, ALPHA_Q = 76, 90

# ---- mirada de cada fotograma: gx -1 = IZQUIERDA de la pantalla, +1 = derecha; gy +1 = arriba (etiquetado a mano cada 4 fotogramas) ----
A = {
    1: (0, 0), 5: (0, 0), 9: (0, 0), 13: (0, 0), 17: (0, 0), 21: (0, 0), 25: (0, 0),
    29: (-0.30, 0), 33: (-0.40, 0), 37: (-0.50, 0), 41: (-0.60, 0), 45: (-0.75, 0), 49: (-0.90, 0), 53: (-1, 0), 57: (-1, 0),
    61: (-1, 0), 65: (-1, 0), 69: (-1, 0), 73: (-1, 0), 77: (-0.95, 0), 81: (-0.90, 0),
    85: (-0.70, 0.30), 89: (-0.45, 0.50), 93: (-0.10, 0.75), 97: (-0.20, 0.70), 101: (-0.10, 0.80),
    105: (0, 0.95), 109: (0, 0.90), 113: (0, 0.95), 117: (0, 0.95), 121: (0, 0.90), 125: (0, 0.90), 129: (0, 0.90),
    133: (0, 0.90), 137: (0, 0.90), 141: (0, 0.90),
    145: (0.15, 0.55), 149: (0.30, 0.40), 153: (0.50, 0.15), 157: (0.60, 0), 161: (0.70, 0), 165: (0.75, 0), 169: (0.85, 0),
    173: (0.85, 0), 177: (0.90, 0), 181: (0.90, 0), 185: (0.90, 0), 189: (0.90, 0), 193: (0.95, 0), 197: (0.95, 0),
    201: (0.95, 0), 205: (0.95, 0), 209: (0.95, 0), 213: (0.95, 0), 217: (1, 0), 221: (1, 0), 225: (1, 0), 229: (1, 0),
    233: (1, 0), 237: (1, 0), 240: (1, 0),
}
BLINK = {80, 81, 82, 180, 181, 182}       # ojos casi cerrados: no sirven como "mirar a un sitio"
KEEP = {81, 181}                          # se conservan para la animación en reposo


def gaze(f):
    ks = sorted(A)
    for a, b in zip(ks, ks[1:]):
        if a <= f <= b:
            t = (f - a) / (b - a)
            return (A[a][0] + (A[b][0] - A[a][0]) * t, A[a][1] + (A[b][1] - A[a][1]) * t)
    return A[ks[-1]]


# ---------------------------------------------------------------- recorte
FG, BG, PF, PB = cv2.GC_FGD, cv2.GC_BGD, cv2.GC_PR_FGD, cv2.GC_PR_BGD
X0, Y0, X1, Y1 = 430, 0, 870, 345         # ventana de la cabeza


def static_mask(med):
    m = np.full((H, W), PB, np.uint8)
    poly = lambda pts, v: cv2.fillPoly(m, [np.array(pts, np.int32)], v)
    poly([(340, 260), (900, 260), (1180, 420), (1280, 520), (1280, 720), (0, 720), (0, 590), (340, 500)], PF)
    poly([(0, 0), (1280, 0), (1280, 12), (0, 12)], BG)
    poly([(0, 0), (500, 0), (500, 250), (455, 330), (385, 420), (383, 505), (372, 560), (360, 584), (0, 584)], BG)          # oficina trasera
    poly([(745, 0), (1280, 0), (1280, 520), (1175, 520), (1170, 430), (900, 428), (880, 330), (840, 290), (745, 270)], BG)  # ventanal y planta
    poly([(480, 60), (545, 60), (545, 260), (480, 260)], BG)
    poly([(430, 420), (520, 345), (600, 332), (700, 328), (800, 342), (850, 430), (842, 520), (775, 598), (560, 598), (480, 565), (400, 492)], FG)  # camiseta
    poly([(385, 575), (440, 525), (545, 590), (560, 640), (450, 642), (385, 605)], FG)                                       # brazo con tatuaje
    poly([(600, 300), (690, 300), (690, 340), (600, 340)], FG)                                                                # cuello
    cv2.ellipse(m, (648, 160), (42, 70), 0, 0, 360, FG, -1)
    poly([(0, 655), (1280, 655), (1280, 720), (0, 720)], FG)                                                                  # mesa
    poly([(905, 480), (1140, 458), (1110, 640), (835, 675)], FG)                                                              # portátil grande
    poly([(118, 600), (285, 602), (470, 655), (300, 690), (125, 640)], FG)                                                    # portátil pequeño
    poly([(655, 592), (765, 592), (765, 715), (655, 715)], FG)                                                                # caja negra
    poly([(1225, 540), (1280, 540), (1280, 700), (1225, 700)], FG)                                                            # portalápices
    poly([(0, 615), (42, 612), (42, 668), (0, 668)], FG)                                                                      # libreta
    bg = np.zeros((1, 65)); fg = np.zeros((1, 65))
    cv2.grabCut(med, m, None, bg, fg, 6, cv2.GC_INIT_WITH_MASK)
    st = np.where((m == FG) | (m == PF), 255, 0).astype(np.uint8)
    body = st.copy(); body[0:300, X0:X1] = 0     # arriba de los hombros la máscara fija es una cabeza difuminada: manda la de cada fotograma
    return st, body


RIM_UNTIL = 92                                   # el resplandor del aura solo existe en la primera parte del vídeo


def head_mask(img, st, rim):
    roi = img[Y0:Y1, X0:X1].copy()
    h, w = roi.shape[:2]
    rows = np.arange(h)[:, None]
    m = np.full((h, w), PB, np.uint8)
    cx, cy = 648 - X0, 165
    cv2.ellipse(m, (cx, cy), (118, 138), 0, 0, 360, PF, -1)
    ring = np.zeros((h, w), np.uint8); cv2.ellipse(ring, (cx, cy), (150, 172), 0, 0, 360, 255, -1)
    m[ring == 0] = BG
    m[:6] = BG
    cv2.ellipse(m, (cx, cy - 5), (46, 78), 0, 0, 360, FG, -1)
    s = st[Y0:Y1, X0:X1]
    cols = np.arange(w)[None, :]
    m[(s > 0) & (rows > 300)] = FG                                              # hombros: parte fija
    m[(rows > 262) & (rows <= 300) & (cols > 175) & (cols < 260)] = FG          # cuello: solo el centro (a los lados puede haber ventanal)
    m[(s == 0) & (rows > 262) & (cols < 60)] = BG
    bg = np.zeros((1, 65)); fg = np.zeros((1, 65))
    cv2.grabCut(roi, m, None, bg, fg, 5, cv2.GC_INIT_WITH_MASK)
    hm = np.where((m == FG) | (m == PF), 255, 0).astype(np.uint8)
    # resplandor del aura (blanco crema, poco saturado) pegado al contorno: se confunde con la piel
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    band = (hm > 0) & (cv2.erode(hm, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))) == 0)
    if rim:
        hm[band & (hsv[..., 1] < 45) & (hsv[..., 2] > 235)] = 0
        hm = cv2.morphologyEx(hm, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))   # migajas del resplandor
    hm = cv2.morphologyEx(hm, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    n, lab, stt, _ = cv2.connectedComponentsWithStats(hm, 8)
    if n > 1:
        hm = np.where(lab == 1 + np.argmax(stt[1:, cv2.CC_STAT_AREA]), 255, 0).astype(np.uint8)
    cnts, _ = cv2.findContours(hm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)       # la cabeza no tiene agujeros (pupilas, pendientes)
    cv2.drawContours(hm, cnts, -1, 255, thickness=cv2.FILLED)
    hm = (cv2.GaussianBlur(hm, (0, 0), 2.4) > 150).astype(np.uint8) * 255                # silueta suave (el recorte por píxel sale dentado)
    out = np.zeros((H, W), np.uint8)
    out[Y0:Y1, X0:X1] = hm
    return out


def lightning(img, base, p90, head=None):
    f = img.astype(np.float32)
    dl = f.mean(axis=2) - p90.mean(axis=2)
    cool = (img[..., 0].astype(np.int16) - img[..., 2].astype(np.int16)) >= 8      # BGR: blanco-azulado; el borde cálido del aura no es rayo
    cand = ((dl > 40) & cool & (f.mean(axis=2) > 165)).astype(np.uint8) * 255
    near = cv2.dilate(base, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (121, 121)))
    cand = cv2.bitwise_and(cand, near)
    if head is not None:                                   # con resplandor, lo claro pegado a la cabeza es aura y no rayo
        cand[cv2.dilate(head, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (71, 71))) > 0] = 0
    cand = cv2.morphologyEx(cand, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(cand, 8)
    keep = np.zeros_like(cand)
    for i in range(1, n):
        a, bw, bh = stats[i, cv2.CC_STAT_AREA], stats[i, cv2.CC_STAT_WIDTH], stats[i, cv2.CC_STAT_HEIGHT]
        if a > 70 and bw * bh / a >= 2.0:                  # un rayo es fino y ramificado; un resto compacto (montante del ventanal) no
            keep[lab == i] = 255
    keep = cv2.dilate(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    return cv2.GaussianBlur((np.clip(dl / 120.0, 0, 1) * (keep > 0)).astype(np.float32), (0, 0), 0.8)


def edge_fade():
    ramp = lambda n: 0.5 - 0.5 * np.cos(np.pi * np.clip(np.arange(n) / (n - 1), 0, 1))
    fx = np.ones(W, np.float32); r = ramp(90)
    fx[:90] = r; fx[-90:] = r[::-1]
    fy = np.ones(H, np.float32); fy[-70:] = ramp(70)[::-1]
    return fy[:, None] * fx[None, :]


def cutout(img, f, st, body_static, p90, fade):
    rim = f <= RIM_UNTIL
    hm = head_mask(img, st, rim)
    body = cv2.bitwise_or(body_static, hm)
    body = cv2.morphologyEx(body, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    bolt = lightning(img, body, p90, hm if rim else None)
    a = cv2.GaussianBlur(body, (0, 0), 0.9).astype(np.float32) / 255
    a = np.clip((a - 0.18) / 0.75, 0, 1)                                             # come ~1 px del borde: sin halo de la oficina
    inner = cv2.erode(body, np.ones((5, 5), np.uint8))
    band = cv2.bitwise_and(cv2.dilate(body, np.ones((5, 5), np.uint8)), cv2.bitwise_not(inner))
    rgb = cv2.inpaint(img, band, 3, cv2.INPAINT_TELEA).astype(np.float32)             # el borde toma el color de dentro, no el de la oficina
    wb = bolt * (1 - a)
    bolt_col = np.array([255, 235, 215], np.float32)                                  # BGR
    out = (rgb * a[..., None] + bolt_col * wb[..., None]) / np.maximum(a + wb, 1e-3)[..., None]
    alpha = np.maximum(a, bolt) * fade
    return np.dstack([out.clip(0, 255)[..., ::-1], alpha * 255]).astype(np.uint8)    # -> RGBA


# ---------------------------------------------------------------- selección y exportación
def main():
    global chosen
    STEP, MAXGAP = 0.11, 8
    chosen, last, acc, prev = [], 0, 0.0, gaze(1)
    for f in range(1, 241):
        g = gaze(f)
        acc += math.hypot(g[0] - prev[0], g[1] - prev[1]); prev = g
        if f == 1 or f == 240 or f in KEEP or acc >= STEP or f - last >= MAXGAP:
            chosen.append(f); last = f; acc = 0.0
    print(len(chosen), "fotogramas elegidos de 240")

    tmp = tempfile.mkdtemp()
    subprocess.run([FF, "-v", "error", "-y", "-i", SRC, "-vf", f"scale={W}:-2", "-q:v", "2", os.path.join(tmp, "f%03d.jpg")], check=True)
    stack = np.stack([cv2.imread(os.path.join(tmp, f"f{i:03d}.jpg")) for i in range(1, 241, 4)])
    med = np.median(stack, axis=0).astype(np.uint8)
    p90 = np.percentile(stack, 90, axis=0).astype(np.float32)
    del stack
    st, body_static = static_mask(med)
    fade = edge_fade()

    os.makedirs(OUT, exist_ok=True)
    for old in os.listdir(OUT):
        os.remove(os.path.join(OUT, old))
    total, frames = 0, []
    for k, f in enumerate(chosen):
        rgba = cutout(cv2.imread(os.path.join(tmp, f"f{f:03d}.jpg")), f, st, body_static, p90, fade)
        p = os.path.join(OUT, f"m{k:02d}.webp")
        Image.fromarray(rgba, "RGBA").save(p, "WEBP", quality=QUALITY, alpha_quality=ALPHA_Q, method=6)
        total += os.path.getsize(p)
        g = gaze(f)
        frames.append((f, round(g[0], 2), round(g[1], 2), 1 if f in BLINK else 0))
        print(f"\r{k + 1}/{len(chosen)}", end="", flush=True)
    print(f"\n{total // 1024} KB en total, {total // len(chosen) // 1024} KB por fotograma")

    with open(TS, "w", encoding="utf-8") as fh:
        fh.write("// Generado por tools/build-mesa2.py: dirección de la mirada de cada fotograma de la escena 'mesa2' (con transparencia).\n")
        fh.write("// [fotograma del vídeo, gx (-1 izquierda … +1 derecha), gy (+1 arriba), 1 = ojos cerrados (no se usa para mirar)]\n")
        fh.write(f"export const MESA = {{ w: {W}, h: {H}, head: [{HEAD[0]}, {HEAD[1]}] as [number, number], fps: 24, frames: [\n")
        for i, fr in enumerate(frames):
            fh.write(f"  [{fr[0]}, {fr[1]}, {fr[2]}, {fr[3]}],{' // m%02d' % i if i % 10 == 0 else ''}\n")
        fh.write("] as [number, number, number, number][] };\n")
    print("ok ->", TS)


if __name__ == "__main__":
    main()
