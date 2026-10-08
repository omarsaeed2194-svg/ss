"""Procedural, royalty-free background music and SFX for the ads.

Everything is synthesized with numpy, so there is nothing to license:
an upbeat four-chord pop loop (kick, clap, hats, bass, plucks) plus a whoosh
for scene changes and a pop for the call-to-action.
"""

import numpy as np

SR = 44100


def _env(n, attack=0.005, decay=0.2):
    t = np.arange(n) / SR
    return np.minimum(t / max(attack, 1e-4), 1.0) * np.exp(-t / decay)


def _kick(n):
    t = np.arange(n) / SR
    freq = 50 + 90 * np.exp(-t * 30)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(phase) * np.exp(-t * 9)


def _noise(n, rng):
    return rng.uniform(-1, 1, n)


def _hp(x, a=0.85):
    """One-pole high-pass, cheap and good enough for hats."""
    y = np.empty_like(x)
    prev_x = prev_y = 0.0
    for i, v in enumerate(x):
        prev_y = a * (prev_y + v - prev_x)
        prev_x = v
        y[i] = prev_y
    return y


def _note(freq, n, kind="pluck"):
    t = np.arange(n) / SR
    if kind == "bass":
        wave = 0.6 * np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(4 * np.pi * freq * t)
        return wave * _env(n, 0.004, 0.35)
    # pluck: a few soft harmonics with fast decay
    wave = (np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(4 * np.pi * freq * t)
            + 0.15 * np.sin(6 * np.pi * freq * t))
    return wave * _env(n, 0.003, 0.18)


def _hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def music_bed(seconds: float, bpm: float = 118, seed: int = 7) -> np.ndarray:
    rng = np.random.default_rng(seed)
    beat = 60.0 / bpm
    n = int(seconds * SR) + SR
    out = np.zeros(n)
    kick = _kick(int(0.35 * SR))
    clap_src = _noise(int(0.18 * SR), rng)
    clap = _hp(clap_src, 0.6) * _env(len(clap_src), 0.002, 0.05)
    hat_src = _noise(int(0.05 * SR), rng)
    hat = _hp(hat_src, 0.95) * _env(len(hat_src), 0.001, 0.012)

    # C major pop progression: C - G - Am - F (one bar each)
    chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
    bass_roots = [36, 43, 45, 41]
    # Arp pattern over 8 eighth notes per bar
    arp = [0, 1, 2, 1, 0, 2, 1, 2]

    def add(sig, start_s, gain):
        i = int(start_s * SR)
        if i >= n:
            return
        j = min(n, i + len(sig))
        out[i:j] += sig[: j - i] * gain

    bars = int(np.ceil(seconds / (4 * beat))) + 1
    for bar in range(bars):
        t0 = bar * 4 * beat
        ch = chords[bar % 4]
        for b in range(4):
            add(kick, t0 + b * beat, 0.9)
            if b in (1, 3):
                add(clap, t0 + b * beat, 0.35)
        for e in range(8):
            add(hat, t0 + e * beat / 2 + beat / 4, 0.18 if e % 2 else 0.12)
            note = ch[arp[e]] + 12
            add(_note(_hz(note), int(beat * 0.5 * SR)), t0 + e * beat / 2, 0.12)
        for b in (0, 1.5, 2, 3.5):
            add(_note(_hz(bass_roots[bar % 4]), int(beat * 0.5 * SR), "bass"), t0 + b * beat, 0.42)

    out = out[: int(seconds * SR)]
    # gentle fade in/out
    fade = int(0.4 * SR)
    out[:fade] *= np.linspace(0, 1, fade)
    out[-int(1.2 * SR):] *= np.linspace(1, 0, int(1.2 * SR))
    return out / (np.max(np.abs(out)) + 1e-9)


def whoosh(seconds: float = 0.4, seed: int = 3) -> np.ndarray:
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    x = _noise(n, rng)
    # sweep a resonant band-pass upward by mixing progressively brighter noise
    t = np.linspace(0, 1, n)
    bright = _hp(x, 0.97)
    dark = np.convolve(x, np.ones(24) / 24, mode="same")
    sig = dark * (1 - t) + bright * t
    env = np.sin(np.pi * t) ** 2
    return sig * env / (np.max(np.abs(sig * env)) + 1e-9)


def pop(seconds: float = 0.18) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / SR
    freq = 900 + 900 * np.exp(-t * 40)
    sig = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 28)
    return sig / np.max(np.abs(sig))
