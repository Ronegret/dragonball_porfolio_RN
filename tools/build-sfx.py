"""Sintetiza los efectos menores que no vienen en los mp3 del autor (scouter y zing) en public/assets/sfx.
Los demás sonidos (intro, transformación, ki, teleport, radar, Shen Long...) se procesan con tools/build-sfx-user.py."""
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


# scouter: tres pitidos cuadrados que suben (lectura de nivel de poder)
out = []
for fr in (1800, 2100, 2500):
    tt = t_(0.06); out += [np.sign(np.sin(2 * np.pi * fr * tt)) * env(len(tt), 0.002, 0.01), np.zeros(int(SR * 0.035))]
save("scouter", lp(np.concatenate(out), 5000), 0.35)

# destello al aparecer un título: campanilla metálica brillante
d = 0.45; t = t_(d); n = len(t)
z = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in ((2637, 9), (3951, 12), (5274, 16), (7040, 22)))
save("zing", (z + hp(rng.standard_normal(n), 6000) * 0.25 * np.exp(-t * 25)) * env(n, 0.003, 0.1), 0.5)
