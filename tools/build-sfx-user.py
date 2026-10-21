"""Procesa los sonidos aportados por el autor (carpeta _source/sfx) -> public/assets/sfx/*.mp3
 - recorta cada efecto a su parte útil y añade fundidos (no cortan en seco)
 - ajusta el nivel por PICO objetivo (dBFS): los efectos de interfaz quedan ~10 dB por debajo de la música de la intro;
   antes se normalizaban todos a -2 dBFS y los suaves (ki, teleport) subían +15 dB y sonaban muy fuertes
Requiere ffmpeg: variable FFMPEG con la ruta del ejecutable (o en el PATH).  Uso: python tools/build-sfx-user.py"""
import os, shutil, subprocess

FF = os.environ.get("FFMPEG", "ffmpeg")
_d, _f = os.path.split(FF)
FFPROBE = os.path.join(_d, _f.replace("ffmpeg", "ffprobe"))   # solo cambia el nombre del ejecutable, no la carpeta
SRC, OUT = "_source/sfx", "public/assets/sfx"

# destino: (origen, inicio s, duración máx s o None, fundido de entrada s, fundido de salida s, pico objetivo dBFS o None = copiar)
JOBS = {
    "intro":    ("intro.mp3",                0,    None, 0,    0,   None),   # música de apertura: tal cual
    "powerup":  ("evolucion.mp3",            0,    2.6,  0.15, 1.1, -14),    # clic sobre el personaje: transformación breve
    "teleport": ("dbz_teleport.mp3",         0.12, None, 0.02, 0.15, -17),   # salto de sección
    "radar":    ("dragonball-radar.mp3",     0,    None, 0,    0,   -18),    # esfera encontrada
    "shenlong": ("shenlong_effect.mp3",      0,    None, 0.05, 0.6, -12),    # invocación de Shen Long
}


def probe(path, *extra):
    r = subprocess.run([FF, "-hide_banner", "-nostats", *extra, "-i", path, "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr
    for line in r.splitlines():
        if "max_volume" in line:
            return float(line.split("max_volume:")[1].split("dB")[0])
    return 0.0


def duration(path):
    out = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path], capture_output=True, text=True).stdout
    return float(out)


os.makedirs(OUT, exist_ok=True)
for name, (src, start, dur, fin, fout, peak) in JOBS.items():
    p, dst = os.path.join(SRC, src), os.path.join(OUT, f"{name}.mp3")
    if peak is None:
        shutil.copy(p, dst)
        print(f"{name}.mp3  {os.path.getsize(dst) // 1024} KB  (copia)")
        continue
    length = dur if dur else duration(p) - start
    seg = [] if not dur else ["-t", str(dur)]
    g = peak - probe(p, "-ss", str(start), *seg)                   # ganancia para llegar al pico objetivo en el tramo usado
    af = [f"volume={g:.1f}dB"]
    if fin: af.append(f"afade=t=in:st=0:d={fin}")
    if fout: af.append(f"afade=t=out:st={max(0, length - fout):.2f}:d={fout}")
    subprocess.run([FF, "-y", "-loglevel", "error", "-ss", str(start), "-i", p, *seg, "-af", ",".join(af), "-b:a", "128k", dst], check=True)
    print(f"{name}.mp3  {os.path.getsize(dst) // 1024} KB  ({length:.1f} s, ganancia {g:+.1f} dB, pico {peak} dBFS)")
