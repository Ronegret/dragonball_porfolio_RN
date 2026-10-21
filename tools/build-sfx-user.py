"""Procesa los sonidos aportados por el autor (carpeta _source/sfx) -> public/assets/sfx/*.mp3
 - normaliza el pico a -2 dBFS (varios venían 15 dB más bajos que otros)
 - recorta silencios/colas largas y añade un fundido final para que no corten en seco
Requiere ffmpeg en el PATH (o variable FFMPEG).  Uso: python tools/build-sfx-user.py"""
import os, shutil, subprocess

FF = os.environ.get("FFMPEG", "ffmpeg")
_d, _f = os.path.split(FF)
FFPROBE = os.path.join(_d, _f.replace("ffmpeg", "ffprobe"))   # solo cambia el nombre del ejecutable, no la carpeta
SRC, OUT = "_source/sfx", "public/assets/sfx"

# destino: (archivo origen, inicio s, duración máx s, fundido final s, ganancia manual dB o None = normalizar)
JOBS = {
    "intro":    ("intro.mp3",                 0,    None, 0,   0),          # 60 s de música; el fundido lo hace el código
    "powerup":  ("evolucion.mp3",             0,    4.6,  0.9, None),       # transformación al pulsar al personaje
    "charge":   ("ki.mp3",                    0,    3.4,  0.6, None),       # carga de ki al pasar el ratón
    "teleport": ("dbz_teleport.mp3",          0.12, None, 0.1, None),       # salto instantáneo entre secciones
    "kiblast":  ("dragon-ball-gt-salto.mp3",  0,    0.95, 0.25, None),      # clic en botones
    "radar":    ("dragonball-radar.mp3",      0,    None, 0,   None),       # esfera encontrada / sonido del radar
    "shenlong": ("shenlong_effect.mp3",       0,    None, 0.5, None),       # invocación de Shen Long
}

def peak_db(path):
    r = subprocess.run([FF, "-hide_banner", "-nostats", "-i", path, "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr
    for line in r.splitlines():
        if "max_volume" in line:
            return float(line.split("max_volume:")[1].split("dB")[0])
    return 0.0

os.makedirs(OUT, exist_ok=True)
for name, (src, start, dur, fade, gain) in JOBS.items():
    p = os.path.join(SRC, src)
    g = gain if gain is not None else (-2.0 - peak_db(p))
    af = [f"volume={g:.1f}dB"]
    length = dur
    if fade:
        # el fundido necesita conocer la duración final: la medimos si no hay recorte
        if length is None:
            out = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", p], capture_output=True, text=True).stdout
            length = float(out) - start
        af.append(f"afade=t=out:st={max(0, length - fade):.2f}:d={fade}")
    if g == 0 and not fade and not dur and not start:     # sin cambios: copia tal cual (no recomprimir)
        shutil.copy(p, os.path.join(OUT, f"{name}.mp3"))
        print(f"{name}.mp3  {os.path.getsize(os.path.join(OUT, name + '.mp3')) // 1024} KB  (copia)")
        continue
    cmd = [FF, "-y", "-loglevel", "error", "-ss", str(start), "-i", p]
    if dur: cmd += ["-t", str(dur)]
    if g != 0: cmd += ["-af", ",".join(af)]
    elif fade: cmd += ["-af", ",".join(af)]
    cmd += ["-b:a", "128k", os.path.join(OUT, f"{name}.mp3")]
    subprocess.run(cmd, check=True)
    print(f"{name}.mp3  {os.path.getsize(os.path.join(OUT, name + '.mp3')) // 1024} KB  (ganancia {g:+.1f} dB)")
