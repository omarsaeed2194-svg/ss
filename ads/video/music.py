"""Synthesizes the ad's background music and sound effects (numpy only).

The cue times match the animation timeline in ad.html.

    python3 music.py [out.wav]
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = 30.0
N = int(SR * DUR)
BEAT = 0.5  # 120 BPM
rng = np.random.default_rng(7)

L = np.zeros(N)
R = np.zeros(N)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * gain * (1 - max(pan, 0))
    R[i:i + len(sig)] += sig * gain * (1 + min(pan, 0))


def band(sig, lo=None, hi=None):
    """Zero-phase FFT band filter with soft edges."""
    spec = np.fft.rfft(sig)
    f = np.fft.rfftfreq(len(sig), 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        g *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(spec * g, len(sig))


def hz(note):
    names = {'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}
    return 440 * 2 ** ((names[note[0]] + 12 * (int(note[-1]) - 4)) / 12)


def saw(f, t):
    return 2 * ((f * t) % 1) - 1


# ---------- instruments ----------
def kick():
    t = t_axis(0.45)
    f = 45 + 115 * np.exp(-t / 0.035)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    s[:40] += np.linspace(0.6, 0, 40)
    return s


def clap():
    t = t_axis(0.3)
    s = band(rng.standard_normal(len(t)), 900, 6000) * np.exp(-t / 0.09)
    return s / np.abs(s).max() + 0.4 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04)


def hat(decay=0.03):
    t = t_axis(0.12)
    s = band(rng.standard_normal(len(t)), 7000) * np.exp(-t / decay)
    return s / np.abs(s).max()


def bass(f, length=0.24):
    t = t_axis(length)
    env = np.minimum(t / 0.005, 1) * np.exp(-t / 0.18)
    return np.tanh(2.5 * np.sin(2 * np.pi * f * t)) * env


def pluck(f):
    t = t_axis(0.5)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t)) * np.exp(-t / 0.16) * np.minimum(t / 0.003, 1)


def pad(notes, length):
    t = t_axis(length)
    env = np.minimum(t / 0.35, 1) * np.minimum((length - t) / 0.3, 1)
    sl = sum(saw(hz(n) * 1.003, t) for n in notes)
    sr_ = sum(saw(hz(n) * 0.997, t) for n in notes)
    return band(sl, 120, 1600) * env, band(sr_, 120, 1600) * env


# ---------- sound effects ----------
def impact():
    t = t_axis(1.4)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t / 0.08)) / SR) * np.exp(-t / 0.5)
    noise = band(rng.standard_normal(len(t)), 200, 5000) * np.exp(-t / 0.12)
    return boom + 0.5 * noise / np.abs(noise).max()


def whoosh(length=0.45):
    t = t_axis(length)
    env = np.sin(np.pi * t / length) ** 2
    s = band(rng.standard_normal(len(t)), 500, 4000) * env
    return s / np.abs(s).max()


def thud(f0=70):
    t = t_axis(0.5)
    s = np.sin(2 * np.pi * np.cumsum(f0 + 50 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.13)
    n = band(rng.standard_normal(len(t)), 100, 1500) * np.exp(-t / 0.05)
    return s + 0.4 * n / np.abs(n).max()


def click():
    t = t_axis(0.06)
    return (np.sin(2 * np.pi * 2400 * t) * 0.6 + band(rng.standard_normal(len(t)), 2000) * 0.5) * np.exp(-t / 0.012)


def ding():
    t = t_axis(1.0)
    return (np.sin(2 * np.pi * 1318.5 * t) + 0.5 * np.sin(2 * np.pi * 1975.5 * t)) * np.exp(-t / 0.3) * np.minimum(t / 0.002, 1)


def pop():
    t = t_axis(0.12)
    return np.sin(2 * np.pi * np.cumsum(380 + 900 * t / 0.12) / SR) * np.exp(-t / 0.04)


def riser(length):
    t = t_axis(length)
    s = band(rng.standard_normal(len(t)), 800, 9000) * (t / length) ** 2.2
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / length) ** 2) / SR) * (t / length) ** 2 * 0.25
    return s / np.abs(s).max() + tone


# ---------- arrangement ----------
CH = {
    'Am': (['A3', 'C4', 'E4'], 'A1'),
    'F': (['F3', 'A3', 'C4'], 'F1'),
    'C': (['C4', 'E4', 'G4'], 'C2'),
    'G': (['G3', 'B3', 'D4'], 'G1'),
}
intro = ['Am', 'Am', 'F', 'G']                          # 0–8 s  (hook + problem)
main = ['C', 'G', 'Am', 'F'] * 4 + ['C', 'G', 'C']      # 8–30 s

K, CL, HT = kick(), clap(), hat()

for i, name in enumerate(intro):
    start = i * 2.0
    notes, _ = CH[name]
    pl, pr = pad(notes, 2.0)
    add(pl, start, 0.10, pan=0.3)
    add(pr, start, 0.10, pan=-0.3)
    for b in range(4):
        tb = start + b * BEAT
        if tb >= 3.0 and b % 2 == 0:
            add(K, tb, 0.45)
        if tb >= 4.0:
            add(HT, tb + BEAT / 2, 0.06, pan=0.2)

for i, name in enumerate(main):
    start = 8.0 + i * 2.0
    if start >= DUR:
        break
    notes, root = CH[name]
    pl, pr = pad(notes, 2.0)
    add(pl, start, 0.08, pan=0.3)
    add(pr, start, 0.08, pan=-0.3)
    last = start >= 28.0
    for b in range(4):
        tb = start + b * BEAT
        if last and b > 2:
            break
        add(K, tb, 0.6)
        if b % 2 == 1:
            add(CL, tb, 0.22)
        for h in range(2):
            add(HT, tb + h * BEAT / 2 + BEAT / 4, 0.07 if h else 0.05, pan=0.25)
        for e in range(2):
            add(bass(hz(root)), tb + e * BEAT / 2, 0.22)
    arp = [hz(n) * 2 for n in notes] + [hz(notes[1]) * 2]
    for s16 in range(8):
        if last and s16 > 5:
            break
        add(pluck(arp[s16 % 4]), start + s16 * BEAT / 2, 0.06, pan=-0.35 if s16 % 2 else 0.35)

# final hit on the last downbeat, then let it ring out
add(impact(), 29.5, 0.35)
add(pop(), 29.5, 0.2)

# sound effects synced to the visuals
add(impact(), 0.05, 0.55)
add(whoosh(0.4), 2.65, 0.25)
add(thud(80), 3.2, 0.25)
add(thud(55), 6.25, 0.75)
add(riser(1.5), 6.5, 0.18)
add(whoosh(0.5), 7.9, 0.35)
add(impact(), 8.45, 0.35)
add(pop(), 10.45, 0.2)
add(whoosh(0.35), 12.1, 0.15)
for tt in (14.35, 14.75, 15.05):
    add(thud(110), tt, 0.25)
add(ding(), 15.05, 0.2)
add(whoosh(0.45), 15.95, 0.3)
add(whoosh(0.45), 16.35, 0.22, pan=-0.4)
add(click(), 18.2, 0.45)
add(click(), 18.55, 0.35)
add(thud(120), 19.75, 0.25)
add(ding(), 20.3, 0.2)
for k, tt in enumerate((21.2, 21.55, 21.9)):
    add(pop(), tt, 0.14, pan=(k - 1) * 0.4)
add(click(), 23.35, 0.35)
add(click(), 23.7, 0.3)
add(whoosh(0.4), 23.95, 0.25, pan=0.4)
add(thud(100), 24.7, 0.3)
for k in range(4):
    add(ding() * 0.5, 24.85 + k * 0.12, 0.1, pan=(-1) ** k * 0.5)
add(riser(0.9), 25.1, 0.12)
add(whoosh(0.5), 25.95, 0.3)
add(impact(), 26.05, 0.35)
add(click(), 26.6, 0.3)
add(pop(), 27.25, 0.25)

# master: gentle saturation, peak normalize, short fades
mix = np.stack([L, R], axis=1)
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix *= 0.89 / np.abs(mix).max()
fade_in, fade_out = int(0.01 * SR), int(0.6 * SR)
mix[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
mix[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None]

out = sys.argv[1] if len(sys.argv) > 1 else 'music.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', out)
