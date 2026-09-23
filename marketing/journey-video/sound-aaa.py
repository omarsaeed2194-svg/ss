"""Synthesizes the soundtrack for case-aaa.html: an original cinematic game score in
D Hijaz with sound effects locked to the on-screen events. Writes dist/audio-aaa.wav.

All timings mirror the scene/animation times in case-aaa.html; keep them in sync.
Usage: python3 sound-aaa.py   (requires numpy + scipy)
"""
import pathlib
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
DUR = 49.0
BEAT = 0.5          # 120 bpm
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)
send_l = np.zeros(N)   # reverb send
send_r = np.zeros(N)

# ---------- helpers ----------
def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)

def tt(n):
    return np.arange(n) / SR

def lp(x, fc, order=2):
    b, a = signal.butter(order, min(fc, SR / 2 - 100) / (SR / 2), "low")
    return signal.lfilter(b, a, x)

def hp(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), "high")
    return signal.lfilter(b, a, x)

def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], "band")
    return signal.lfilter(b, a, x)

def saw(f, n, phase=0.0):
    ph = (np.cumsum(np.full(n, f) if np.isscalar(f) else f) / SR + phase) % 1.0
    return 2 * ph - 1

def adsr(n, a=0.01, d=0.1, s=0.7, r=0.2):
    e = np.full(n, float(s))
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = max(1, min(na, n)); e[:na] = np.linspace(0, 1, na)
    nd = max(1, min(nd, n - na)); e[na:na + nd] = np.linspace(1, s, nd)
    nr = max(1, min(nr, n)); e[-nr:] *= np.linspace(1, 0, nr)
    return e

def add(x, at, gain=1.0, pan=0.0, rev=0.0):
    """Mix mono x at time `at` (s) with equal-power pan (-1..1) and reverb send."""
    i = int(at * SR)
    if i >= N:
        return
    x = x[: N - i] * gain
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(x)] += x * gl
    R[i:i + len(x)] += x * gr
    if rev:
        send_l[i:i + len(x)] += x * gl * rev
        send_r[i:i + len(x)] += x * gr * rev

# ---------- instruments ----------
def pad(notes, length, gain):
    n = int(length * SR)
    x = np.zeros(n)
    for m in notes:
        for det in (-0.08, 0.0, 0.08):
            x += saw(midi(m + det), n, rng.random())
    t = tt(n)
    x = lp(x, 1800) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.25 * t))
    return x / (len(notes) * 3) * adsr(n, a=0.8, d=0.5, s=0.9, r=0.9) * gain

def kick(gain=1.0):
    n = int(0.45 * SR); t = tt(n)
    f = 45 + 110 * np.exp(-t * 30)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    click = hp(rng.standard_normal(n), 2000) * np.exp(-t * 300) * 0.3
    return (x + click) * gain

def snare(gain=1.0):
    n = int(0.3 * SR); t = tt(n)
    noise = bp(rng.standard_normal(n), 900, 7000) * np.exp(-t * 18)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25) * 0.5
    return (noise * 0.8 + body) * gain

def hat(gain=1.0, length=0.05):
    n = int(length * SR); t = tt(n)
    return hp(rng.standard_normal(n), 7000) * np.exp(-t * 90) * gain

def bass_note(m, length, gain):
    n = int(length * SR); t = tt(n)
    x = saw(midi(m), n) * 0.6 + np.sin(2 * np.pi * midi(m) * t) * 0.8
    return lp(x, 380) * adsr(n, a=0.005, d=0.08, s=0.6, r=0.06) * gain

def pluck(m, gain, length=0.35, bright=4000):
    n = int(length * SR); t = tt(n)
    x = saw(midi(m), n) + 0.5 * saw(midi(m) * 1.005, n, 0.3)
    x = lp(x, bright) * np.exp(-t * 9)
    return x * adsr(n, a=0.002, d=0.05, s=1, r=0.05) * gain

def bell(m, gain, length=1.6):
    n = int(length * SR); t = tt(n)
    f = midi(m)
    x = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 3)
         + 0.2 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 5))
    return x * np.exp(-t * 2.6) * adsr(n, a=0.003, d=0.02, s=1, r=0.1) * gain

def whoosh(length, lo, hi, gain, rising=True):
    n = int(length * SR); t = tt(n)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    seg = 1024
    for k in range(0, n, seg):
        p = k / n if rising else 1 - k / n
        c = lo * (hi / lo) ** p
        out[k:k + seg] = bp(x[max(0, k - 2048):k + seg], c * 0.7, min(c * 1.4, SR / 2 - 200), 1)[-len(out[k:k + seg]):]
    env = np.sin(np.pi * np.clip(t / length, 0, 1)) ** 1.5
    return out * env * gain

def boom(gain):
    n = int(2.5 * SR); t = tt(n)
    f = 30 + 60 * np.exp(-t * 6)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    crack = bp(rng.standard_normal(n), 200, 5000) * np.exp(-t * 12) * 0.35
    return lp(x + crack, 6000) * gain

def blip(f0, f1, gain, length=0.07):
    n = int(length * SR); t = tt(n)
    f = np.linspace(f0, f1, n)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))
    return lp(x, 6000) * adsr(n, a=0.002, d=0.02, s=0.8, r=0.03) * gain

def riser(length, gain):
    n = int(length * SR); t = tt(n)
    f = 200 * (8 ** (t / length))
    tone = saw(f, n) * 0.25
    return (whoosh(length, 300, 9000, 1.0) + lp(tone, 5000)) * (t / length) ** 2 * gain

# ---------- harmony (D Hijaz: D Eb F# G A Bb C) ----------
D, Eb, Fs, G, A, Bb, C = 50, 51, 54, 55, 57, 58, 60      # octave 3
CHORDS = [  # (root, pad notes, arp notes) cycling every 4 s from 5.6 s
    (D,  [38, 50, 53, 57],  [62, 63, 66, 69, 66, 63]),     # Dm-ish with Hijaz colour
    (Bb, [34, 46, 50, 53],  [58, 62, 65, 62, 66, 65]),     # Bb
    (C,  [36, 48, 52, 55],  [60, 64, 67, 63, 62, 60]),     # C
    (A,  [33, 45, 49, 52],  [57, 61, 64, 63, 61, 58]),     # A (dominant)
]

def section_chord(t):
    return CHORDS[int((t - 5.6) // 4) % 4]

# ---------- score ----------
# Intro: drone + riser into the title hit, scan sweep
add(pad([38, 50, 57], 6.2, 0.55), 0.0, rev=0.4)
add(riser(0.6, 0.35), 0.0)
add(boom(0.9), 0.6, rev=0.5)
add(whoosh(1.4, 600, 6000, 0.12), 0.2, pan=-0.3)
add(bell(74, 0.10, 2.5), 0.65, pan=0.2, rev=0.8)
add(bell(69, 0.08, 2.5), 1.5, pan=-0.2, rev=0.8)   # under the Arabic line

# Main body 5.6 - 37.4
t = 5.6
while t < 37.4 - 0.01:
    root, notes, _ = section_chord(t)
    add(pad(notes, 4.3, 0.45 if t < 19.2 else 0.55), t, rev=0.35)
    t += 4

beat = 0
t = 5.6
while t < 36.4:
    root = section_chord(t)[0]
    # kick: half-time until 12.4, then every beat
    if t >= 12.4 or beat % 2 == 0:
        add(kick(0.9), t)
    # bass eighths, ducked on the kick
    for k in range(2):
        add(bass_note(root - 12, 0.22, 0.55 if k else 0.35), t + k * 0.25)
    if t >= 12.4:
        add(hat(0.18), t + 0.25, pan=0.25)
    if t >= 19.2:
        if beat % 2 == 1:
            add(snare(0.45), t, rev=0.25)
        add(hat(0.08), t + 0.125, pan=-0.25)
        add(hat(0.08), t + 0.375, pan=-0.25)
    beat += 1
    t += BEAT

# Hijaz arpeggio lead 19.2 - 36.4 (sixteenths)
t, k = 19.2, 0
while t < 36.4:
    arp = section_chord(t)[2]
    add(pluck(arp[k % len(arp)], 0.16, bright=2500 + 1500 * ((t - 19.2) / 17)), t,
        pan=0.35 * np.sin(k * 0.7), rev=0.3)
    k += 1
    t += 0.125

# Riser into the achievement
add(riser(3.0, 0.4), 34.4)

# Triumph 37.4 - 43.6: D major, bigger drums
for i, notes in enumerate([[38, 50, 54, 57], [34, 46, 50, 53], [36, 48, 52, 55], [38, 50, 54, 57, 62]]):
    add(pad(notes, 1.75, 0.6), 37.4 + i * 1.55, rev=0.4)
t, beat = 37.4, 0
while t < 43.4:
    add(kick(1.0), t)
    add(bass_note([D, Bb, C, D][min(3, int((t - 37.4) // 1.55))] - 12, 0.4, 0.5), t)
    if beat % 2 == 1:
        add(snare(0.5), t, rev=0.3)
    add(hat(0.15), t + 0.25, pan=0.2)
    beat += 1
    t += BEAT
t, k = 37.9, 0
major = [62, 66, 69, 74, 69, 66]
while t < 43.4:
    add(pluck(major[k % 6], 0.13, bright=5000), t, pan=0.3 * np.sin(k), rev=0.35)
    k += 1
    t += 0.125

# Outro 43.6 - 49: final chord, logo impact, fade
add(pad([38, 50, 54, 57, 62, 66], 5.4, 0.6), 43.6, rev=0.5)
add(boom(0.8), 43.8, rev=0.6)
for i, m in enumerate([62, 66, 69, 74]):
    add(bell(m, 0.12, 3.0), 43.85 + i * 0.09, pan=-0.3 + i * 0.2, rev=0.7)
add(blip(900, 1400, 0.10, 0.09), 45.0, rev=0.3)          # URL pill pops in

# ---------- sound effects locked to animation ----------
for s in (5.6, 12.4, 19.2, 30.4):                          # scene transitions
    add(whoosh(0.7, 400, 5000, 0.22), s - 0.35, pan=-0.2, rev=0.3)
for i in range(12):                                        # MENA market chips light up
    add(blip(900 + i * 60, 1300 + i * 60, 0.09), 5.6 + 2.2 + i * 0.12, pan=-0.5 + (i % 3) * 0.5, rev=0.2)
for i in range(6):                                         # asset tiles flip EN -> AR
    at = 12.4 + 2.6 + i * 0.35
    add(whoosh(0.18, 2000, 8000, 0.10), at, pan=-0.4 + (i % 3) * 0.4)
    add(blip(1600, 1100, 0.07, 0.05), at + 0.3, pan=-0.4 + (i % 3) * 0.4)
for i in range(4):                                         # solution pillars power on
    at = 19.2 + 2.2 + i * 2
    add(blip(500, 1000, 0.12, 0.18), at, pan=-0.45 + i * 0.3, rev=0.3)
    add(bell(74 + i * 2, 0.06, 1.0), at + 0.05, pan=-0.45 + i * 0.3, rev=0.5)
for i, m in enumerate([62, 66, 69, 74]):                   # all pillars on, XP bar full
    add(bell(m + 12, 0.05, 1.2), 29.2 + i * 0.06, rev=0.6)
# In-game LTR -> RTL sweep with a small glitch
sw = whoosh(1.1, 500, 7000, 0.28)
n = len(sw); pan_ramp = np.linspace(-1, 1, n)
i0 = int(33.0 * SR)
L[i0:i0 + n] += sw * np.cos((pan_ramp + 1) * np.pi / 4)
R[i0:i0 + n] += sw * np.sin((pan_ramp + 1) * np.pi / 4)
for g in range(5):
    add(blip(2400 - g * 300, 1800 - g * 200, 0.05, 0.03), 33.3 + g * 0.04, pan=0.6)
add(blip(700, 1200, 0.10, 0.12), 33.5, rev=0.3)
# Achievement unlocked: drop, chime, burst, stat ticks
add(whoosh(0.5, 3000, 300, 0.2, rising=False), 37.6)
add(boom(0.5), 38.0, rev=0.5)
for i, m in enumerate([74, 78, 81, 86]):
    add(bell(m, 0.16, 2.2), 38.0 + i * 0.1, pan=-0.2 + i * 0.13, rev=0.7)
for i in range(3):
    add(blip(1200, 1700, 0.09, 0.06), 37.4 + 1.4 + i * 0.3, pan=-0.5 + i * 0.5, rev=0.3)

# ---------- master ----------
ir_n = int(2.2 * SR)
ir_t = tt(ir_n)
ir_l = rng.standard_normal(ir_n) * np.exp(-ir_t * 2.8)
ir_r = rng.standard_normal(ir_n) * np.exp(-ir_t * 2.8)
ir_l, ir_r = lp(ir_l, 6000), lp(ir_r, 6000)
L += signal.fftconvolve(send_l, ir_l)[:N] * 0.06
R += signal.fftconvolve(send_r, ir_r)[:N] * 0.06

mix = np.stack([L, R], axis=1)
mix = hp(mix.T, 30).T
# tame the sub/low end (~-5 dB below 120 Hz) and add presence so it
# still reads on phone and laptop speakers
mix = mix - 0.45 * lp(mix.T, 120).T
mix = mix + 0.35 * bp(mix.T, 1500, 6000).T
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.6) / np.tanh(1.6)                  # gentle saturation / limiting
fade_in, fade_out = int(0.02 * SR), int(1.8 * SR)
mix[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
mix[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None]
mix *= 0.89                                              # about -1 dBFS peak

out = pathlib.Path(__file__).parent / "dist" / "audio-aaa.wav"
out.parent.mkdir(exist_ok=True)
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print("wrote", out, f"{DUR}s")
