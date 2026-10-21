"""Compone y sintetiza una intro musical ORIGINAL de ~9 s estilo opening anime (metales, power chords,
bajo y batería, Re mayor) -> public/assets/sfx/intro.mp3. No usa ni imita melodías de la serie.
Requiere numpy, scipy y ffmpeg en el PATH.  Uso: python tools/build-intro.py"""
import os, subprocess, tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

SR = 44100
BPM = 152
BEAT = 60 / BPM
rng = np.random.default_rng(3)
INTRO = 1.25                       # segundos de subida antes del primer golpe
TOTAL = INTRO + 16 * BEAT + 2.0
N = int(SR * TOTAL)
mix = np.zeros(N)


def lp(x, f, o=2): b, a = butter(o, f / (SR / 2)); return lfilter(b, a, x)
def hp(x, f, o=2): b, a = butter(o, f / (SR / 2), "high"); return lfilter(b, a, x)
def hz(note):  # "A4", "F#5", "Bb3"
    names = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    s = names[note[0]] + (1 if "#" in note else -1 if "b" in note[1:] else 0)
    return 440 * 2 ** ((s + 12 * (int(note[-1]) + 1) - 69) / 12)
def adsr(n, a=0.02, d=0.1, s=0.75, r=0.12):
    e = np.full(n, s); ai, di, ri = int(SR * a), int(SR * d), int(SR * r)
    e[:ai] = np.linspace(0, 1, ai); e[ai:ai + di] = np.linspace(1, s, len(e[ai:ai + di]))
    if ri: e[-ri:] *= np.linspace(1, 0, ri)
    return e
def put(x, t):
    i = int(SR * t); j = min(N, i + len(x)); mix[i:j] += x[: j - i]


def brass(f, dur, vib=True):
    n = int(SR * dur); t = np.arange(n) / SR
    v = 1 + (0.006 * np.sin(2 * np.pi * 5.5 * t) * np.clip(t / 0.4, 0, 1) if vib else 0)
    out = np.zeros(n)
    for det in (-0.004, 0.004):
        ph = 2 * np.cumsum(np.pi * f * (1 + det) * v) / SR
        for h in range(1, 11): out += np.sin(h * ph) / h ** 1.15
    return lp(out, 3600) * adsr(n, 0.035, 0.12, 0.8, 0.1)
def power(root, dur):  # guitarra distorsionada: quinta + octava, apagado de palma en corcheas
    n = int(SR * dur); t = np.arange(n) / SR; out = np.zeros(n)
    for m in (1, 1.5, 2):
        out += ((t * root * m) % 1) * 2 - 1
    out = lp(np.tanh(out * 3.5), 2600)
    gate = np.zeros(n); step = int(SR * BEAT / 2)
    for k in range(0, n, step): gate[k:k + int(step * 0.8)] = np.exp(-np.arange(min(int(step * 0.8), n - k)) / (SR * 0.09))
    return out * gate
def bass(f, dur):
    n = int(SR * dur); t = np.arange(n) / SR; step = int(SR * BEAT / 2); out = np.zeros(n)
    w = lp(((t * f) % 1) * 2 - 1, 700)
    for k in range(0, n, step): out[k:k + step] = w[k:k + step] * np.exp(-np.arange(len(w[k:k + step])) / (SR * 0.16))
    return out
def kick():
    t = np.arange(int(SR * 0.3)) / SR; return np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-t * 30)) / SR) * np.exp(-t * 11)
def snare():
    t = np.arange(int(SR * 0.22)) / SR
    return (hp(rng.standard_normal(len(t)), 1800) * 0.8 + np.sin(2 * np.pi * 190 * t) * 0.5) * np.exp(-t * 18)
def hat():
    t = np.arange(int(SR * 0.05)) / SR; return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * 90)
def crash(d=1.8):
    t = np.arange(int(SR * d)) / SR; return hp(rng.standard_normal(len(t)), 4000) * np.exp(-t * 2.4)


# 1) subida: ruido que abre el filtro + glissando de metales + redoble
n = int(SR * INTRO); t = np.arange(n) / SR
riser = np.zeros(n); noise = rng.standard_normal(n)
for k in range(0, n, 2048):
    f = 400 + 7000 * (k / n) ** 2; riser[k:k + 2048] = hp(noise[k:k + 2048], f)
put(riser * np.linspace(0, 0.5, n), 0)
gl = np.sin(2 * np.pi * np.cumsum(np.geomspace(hz("A2"), hz("A4"), n)) / SR)
put(lp(np.tanh(gl * 3), 3000) * np.linspace(0, 0.35, n), 0)
for k in range(16): put(snare() * (0.15 + 0.6 * k / 16), INTRO - 0.9 + k * 0.9 / 16)

# 2) progresión heroica (2 tiempos por acorde): D C G D Bb C D(4)
CH = [("D3", 2), ("C3", 2), ("G2", 2), ("D3", 2), ("Bb2", 2), ("C3", 2), ("D3", 4)]
MEL = [("A4", 1), ("D5", 1), ("E5", 1), ("G5", 1), ("F#5", 1), ("E5", .5), ("D5", .5), ("A5", 2),
       ("F5", 1), ("D5", 1), ("E5", 1), ("G5", 1), ("F#5", 1), ("A5", 3)]
tt = INTRO
for root, beats in CH:
    d = beats * BEAT
    put(power(hz(root) * 2, d) * 0.28, tt)
    put(bass(hz(root), d) * 0.45, tt)
    for b in range(beats):
        put(kick() * 0.9, tt + b * BEAT)
        if b % 2: put(snare() * 0.55, tt + b * BEAT)
        for e in (0, .5): put(hat() * 0.18, tt + (b + e) * BEAT)
    tt += d
tt = INTRO
for note, beats in MEL:
    put(brass(hz(note), beats * BEAT + 0.05) * 0.32, tt)
    put(brass(hz(note) / 2, beats * BEAT + 0.05) * 0.12, tt)   # octava grave que engorda los metales
    tt += beats * BEAT
put(crash() * 0.4, INTRO)

# 3) final: acorde de Re mayor sostenido + platillo
END = INTRO + 16 * BEAT
for nn in ("D4", "F#4", "A4", "D5"): put(brass(hz(nn), 1.9) * 0.18, END)
put(power(hz("D3") * 2, 0.4) * 0.3, END); put(kick(), END); put(crash(2.0) * 0.5, END)

mix = np.tanh(mix * 1.1)
mix = mix / np.abs(mix).max() * 0.92
mix[-int(SR * 0.6):] *= np.linspace(1, 0, int(SR * 0.6))
tmp = os.path.join(tempfile.gettempdir(), "rn_intro.wav")
wavfile.write(tmp, SR, (mix * 32767).astype(np.int16))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-ac", "1", "-b:a", "112k", "public/assets/sfx/intro.mp3"], check=True)
print(f"intro.mp3 {TOTAL:.1f}s {os.path.getsize('public/assets/sfx/intro.mp3') // 1024} KB")
