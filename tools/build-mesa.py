"""Prepara la escena interactiva 'mesa' (hero): extrae los fotogramas del vídeo, elige los necesarios según la
dirección de la mirada y genera public/assets/mesa/*.webp + src/mesaGaze.ts.

El vídeo es un barrido de mirada: de frente (1-25) -> derecha (29-53) -> parpadeo -> izquierda (65-81) ->
arriba (89-141) -> derecha (145-189) -> de frente (193-240). La web elige el fotograma cuya mirada se parece más a la
dirección del cursor, así que aquí se anota la mirada de cada fotograma.

  gx: -1 = mira a la IZQUIERDA de la pantalla, +1 = a la DERECHA.   gy: +1 = mira ARRIBA.
Las etiquetas se hicieron a mano mirando recortes de la cabeza cada 4 fotogramas y se interpolan entre ellos.

Requiere ffmpeg (variable FFMPEG) y Pillow.  Uso: python tools/build-mesa.py   (vídeo en _source/mesa/mesa.mp4)
"""
import json, math, os, subprocess, tempfile
from PIL import Image

FF = os.environ.get("FFMPEG", "ffmpeg")
SRC = "_source/mesa/mesa.mp4"
OUT = "public/assets/mesa"
TS = "src/mesaGaze.ts"
W, H = 1280, 720
HEAD = (0.50, 0.24)          # centro de la cabeza en coordenadas normalizadas del fotograma
QUALITY = 76

# fotograma -> (gx, gy)   (todo lo no listado se interpola)
A = {
    1: (0.05, 0), 5: (0.05, 0), 9: (0.05, 0), 13: (0, 0), 17: (0.05, 0), 21: (0, 0), 25: (0.05, 0),
    29: (0.30, 0), 33: (0.50, 0), 37: (0.60, 0), 41: (0.75, 0), 45: (0.90, 0), 49: (1.0, 0),
    # tramos de movimiento rápido: etiquetados fotograma a fotograma (la interpolación fallaba ahí)
    53: (1.0, 0), 54: (0.95, 0), 55: (0.90, 0), 56: (0.80, 0), 57: (0.70, 0), 58: (0.55, 0), 59: (0.40, 0), 60: (0.10, 0), 61: (0.0, 0),
    62: (-0.30, 0), 63: (-0.40, 0), 64: (-0.45, 0), 65: (-0.50, 0), 66: (-0.55, 0), 67: (-0.80, 0), 68: (-0.85, 0), 69: (-0.90, 0),
    73: (-0.95, 0), 77: (-1.0, 0), 79: (-1.0, 0), 80: (-0.95, 0), 81: (-0.90, 0), 82: (-0.75, 0), 83: (-0.70, 0), 84: (-0.60, 0.15),
    85: (-0.50, 0.35), 86: (-0.45, 0.50), 87: (-0.35, 0.55), 88: (-0.30, 0.60), 89: (-0.25, 0.65), 90: (-0.20, 0.70), 91: (-0.10, 0.75),
    92: (-0.05, 0.80), 93: (0, 0.85), 94: (0, 0.90), 95: (0, 0.90),
    97: (0, 0.85), 101: (0, 0.90), 105: (0, 0.95), 109: (0, 0.90), 113: (0, 0.90), 117: (0, 0.95), 121: (0, 0.95), 125: (0, 0.90),
    129: (0, 0.90), 133: (0, 0.90), 139: (0, 0.90), 140: (0, 0.90), 141: (0, 0.85), 142: (0.05, 0.80), 143: (0.10, 0.60), 144: (0.20, 0.45),
    145: (0.30, 0.30), 146: (0.40, 0.15), 147: (0.50, 0.05), 148: (0.55, 0), 149: (0.60, 0),
    153: (0.65, 0), 157: (0.75, 0), 161: (0.85, 0), 165: (0.95, 0),
    169: (1.0, 0), 173: (1.0, 0), 177: (1.0, 0), 181: (1.0, 0), 185: (1.0, 0), 189: (1.0, 0), 190: (0.95, 0), 191: (0.90, 0), 192: (0.75, 0),
    193: (0.60, 0), 194: (0.45, 0), 195: (0.35, 0), 196: (0.28, 0), 197: (0.20, 0), 198: (0.15, 0), 201: (0.10, 0), 205: (0.05, 0), 209: (0.05, 0),
    213: (0, 0), 217: (0, 0), 221: (0, 0), 225: (0, 0), 229: (0, 0), 233: (0, 0), 237: (0, 0), 240: (0, 0),
}
BLINK = set(range(56, 62)) | set(range(82, 85)) | {189}   # ojos cerrados: no sirven como "mirar a un sitio"
KEEP = {58, 83, 189}                                       # el parpadeo se conserva para la animación en reposo


def gaze(f):
    ks = sorted(A)
    for a, b in zip(ks, ks[1:]):
        if a <= f <= b:
            t = (f - a) / (b - a)
            return (A[a][0] + (A[b][0] - A[a][0]) * t, A[a][1] + (A[b][1] - A[a][1]) * t)
    return A[ks[-1]]


# ---- selección: un fotograma cuando la mirada cambia lo bastante o cada 8 como máximo ----
STEP, MAXGAP = 0.11, 8
chosen, last, acc, prev = [], 0, 0.0, gaze(1)
for f in range(1, 241):
    g = gaze(f)
    acc += math.hypot(g[0] - prev[0], g[1] - prev[1]); prev = g
    if f == 1 or f == 240 or f in KEEP or acc >= STEP or f - last >= MAXGAP:
        chosen.append(f); last = f; acc = 0.0
print(len(chosen), "fotogramas elegidos de 240")

# ---- extrae y comprime ----
os.makedirs(OUT, exist_ok=True)
for old in os.listdir(OUT):
    os.remove(os.path.join(OUT, old))
tmp = tempfile.mkdtemp()
subprocess.run([FF, "-v", "error", "-y", "-i", SRC, "-vf", f"scale={W}:-2", "-q:v", "2", os.path.join(tmp, "f%03d.jpg")], check=True)
total = 0
frames = []
for k, f in enumerate(chosen):
    im = Image.open(os.path.join(tmp, f"f{f:03d}.jpg")).convert("RGB")
    p = os.path.join(OUT, f"m{k:02d}.webp")
    im.save(p, "WEBP", quality=QUALITY, method=6)
    total += os.path.getsize(p)
    g = gaze(f)
    frames.append({"f": f, "gx": round(g[0], 2), "gy": round(g[1], 2), "b": 1 if f in BLINK else 0})
print(f"{total // 1024} KB en total, {total // len(chosen) // 1024} KB por fotograma")

with open(TS, "w", encoding="utf-8") as fh:
    fh.write("// Generado por tools/build-mesa.py: dirección de la mirada de cada fotograma de la escena 'mesa'.\n")
    fh.write("// gx: -1 izquierda … +1 derecha · gy: +1 arriba · b: 1 = ojos cerrados (no se usa para mirar)\n")
    fh.write(f"export const MESA = {{ w: {W}, h: {H}, head: [{HEAD[0]}, {HEAD[1]}] as [number, number], fps: 24, frames: [\n")
    for i, fr in enumerate(frames):
        fh.write(f"  [{fr['f']}, {fr['gx']}, {fr['gy']}, {fr['b']}],{' // m%02d' % i if i % 10 == 0 else ''}\n")
    fh.write("] as [number, number, number, number][] };\n")
print("ok ->", TS)
