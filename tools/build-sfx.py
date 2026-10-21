"""Genera efectos de sonido evocadores de la serie (sintetizados, sin audio original) en public/assets/sfx.
Uso: python tools/build-sfx.py   — sustituye cualquier .wav por uno propio con el mismo nombre si lo prefieres."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

SR = 22050
rng = np.random.default_rng(7)
t_ = lambda d: np.arange(int(SR * d)) / SR


def env(n, a, r):  # ataque/relajación lineales en segundos
    e = np.ones(n); ai, ri = int(SR * a), int(SR * r)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if ri: e[-ri:] *= np.linspace(1, 0, ri)
    return e


def lp(x, f): b, a = butter(2, f / (SR / 2)); return lfilter(b, a, x)
def hp(x, f): b, a = butter(2, f / (SR / 2), "high"); return lfilter(b, a, x)
def chirp(f0, f1, d, curve=1.0):  # barrido de frecuencia con fase integrada
    t = t_(d); f = f0 + (f1 - f0) * (t / d) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR), f
def crackle(n, dens):  # chasquidos eléctricos
    x = np.zeros(n); idx = rng.random(n) < dens; x[idx] = rng.uniform(-1, 1, idx.sum()); return hp(x, 2500)


def save(name, x, peak=0.9):
    x = x / (np.abs(x).max() + 1e-9) * peak
    wavfile.write(f"public/assets/sfx/{name}.wav", SR, (x * 32767).astype(np.int16)); print(name, f"{len(x) / SR:.2f}s")


# carga de ki (hover sobre el personaje): retumbar grave + silbido que sube con vibrato + chispas
d = 1.4; t = t_(d); n = len(t)
rumble = lp(rng.standard_normal(n), 140) * 3
w, f = chirp(260, 820, d, 0.8); whine = w * (1 + 0.25 * np.sin(2 * np.pi * 7 * t))
charge = (rumble * 0.9 + whine * 0.35 + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 2) / SR) * 0.12 + crackle(n, 0.004) * 0.5) * env(n, 0.25, 0.45)
save("charge", charge, 0.75)

# transformación (clic): subida de poder con armónicos, crepitar creciente y estallido final
d = 2.0; t = t_(d); n = len(t)
w1, f = chirp(220, 1700, 1.15, 1.6); rise = np.zeros(n); k = len(w1)
rise[:k] = (w1 + 0.4 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)) * np.linspace(0.2, 1, k)
rise[:k] *= 1 + 0.3 * np.sin(2 * np.pi * 11 * t[:k])
roar = lp(rng.standard_normal(n), 400) * np.linspace(0.3, 1.4, n) * 2
boom = np.zeros(n); b0 = int(SR * 1.1); bt = t[: n - b0]
boom[b0:] = (np.sin(2 * np.pi * np.cumsum(120 * np.exp(-bt * 4) + 38) / SR) * 2.2 + lp(rng.standard_normal(len(bt)), 900) * 1.6) * np.exp(-bt * 3.2)
cr = crackle(n, 0.002 + 0.02 * (t / d)) * 0.8
save("powerup", (rise * 0.5 + roar * 0.35 + boom + cr) * env(n, 0.02, 0.5))

# teletransportación "shun!": barrido rápido hacia abajo + soplo de aire
d = 0.32; t = t_(d); n = len(t)
s, _ = chirp(2600, 280, d, 0.5)
air = hp(rng.standard_normal(n), 1800) * np.exp(-t * 14)
save("teleport", (s * np.exp(-t * 9) + air * 0.6) * env(n, 0.004, 0.08), 0.7)

# ráfaga de ki (clic en botones): "pew" corto y brillante
d = 0.2; t = t_(d); n = len(t)
s, _ = chirp(1500, 240, d, 0.6)
save("kiblast", (s + 0.35 * np.sign(s) * 0.4 + hp(rng.standard_normal(n), 3000) * 0.25 * np.exp(-t * 30)) * np.exp(-t * 14) * env(n, 0.003, 0.03), 0.45)

# scouter: tres pitidos cuadrados que suben (lectura de nivel de poder)
out = []
for fr in (1800, 2100, 2500):
    tt = t_(0.06); out += [np.sign(np.sin(2 * np.pi * fr * tt)) * env(len(tt), 0.002, 0.01), np.zeros(int(SR * 0.035))]
save("scouter", lp(np.concatenate(out), 5000), 0.35)
