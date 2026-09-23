"""Render the "Sound and Sight — 400 recording minutes" milestone video.

Usage: python3 render.py [output.mp4]
Needs: pillow, numpy, imageio-ffmpeg (pip install pillow numpy imageio-ffmpeg)
"""
import math
import subprocess
import sys
import wave
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1920
FPS = 30
DURATION = 14.6
MILESTONE = 400
HIT = 7.0  # second at which the counter lands on 400

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "sound-and-sight-400-minutes.mp4")
WORK = OUT.parent

FONT_DIR = "/usr/share/fonts/truetype/liberation/"
BOLD = FONT_DIR + "LiberationSans-Bold.ttf"
REG = FONT_DIR + "LiberationSans-Regular.ttf"
SERIF_IT = FONT_DIR + "LiberationSerif-BoldItalic.ttf"

# brand palette (from logo.png)
YELLOW = (255, 222, 89)
AMBER = (240, 176, 30)
CHAR = (78, 85, 91)
INK = (44, 48, 53)
MUTED = (132, 137, 143)
LIGHT = (208, 210, 213)
RED = (232, 64, 64)
WHITE = (255, 255, 255)
LOGO = Path(__file__).with_name("logo.png")

_fonts = {}


def font(path, size):
    key = (path, size)
    if key not in _fonts:
        _fonts[key] = ImageFont.truetype(path, size)
    return _fonts[key]


# ---------------------------------------------------------------- easing
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def seg(t, a, b):
    return clamp((t - a) / (b - a))


def ease_out(x):
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def ease_back(x):
    c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


# ---------------------------------------------------------------- text helpers
def text_image(text, fnt, color, tracking=0):
    """Render text (with letter spacing) to a tight RGBA image."""
    widths = [fnt.getlength(c) for c in text]
    total = sum(widths) + tracking * (len(text) - 1)
    asc, desc = fnt.getmetrics()
    img = Image.new("RGBA", (int(math.ceil(total)) + 4, asc + desc + 4), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x = 2
    for c, w in zip(text, widths):
        d.text((x, 2), c, font=fnt, fill=color + (255,))
        x += w + tracking
    return img


def paste(canvas, img, cx, cy, alpha=1.0, scale=1.0):
    """Alpha-composite img centred at (cx, cy)."""
    if alpha <= 0.003 or scale <= 0.01:
        return
    if abs(scale - 1) > 1e-3:
        img = img.resize((max(1, int(img.width * scale)), max(1, int(img.height * scale))), Image.LANCZOS)
    if alpha < 1:
        a = img.getchannel("A").point(lambda v: int(v * alpha))
        img = img.copy()
        img.putalpha(a)
    canvas.alpha_composite(img, (int(round(cx - img.width / 2)), int(round(cy - img.height / 2))))


# ---------------------------------------------------------------- static assets
def build_logo():
    img = Image.open(LOGO).convert("RGBA")
    return img.crop(img.getbbox())


def pill(text_img, color, pad_x=34, pad_y=14):
    """Text on a rounded brand-coloured highlight."""
    w, h = text_img.width + 2 * pad_x, text_img.height + 2 * pad_y
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(img).rounded_rectangle((0, 0, w - 1, h - 1), radius=h // 2, fill=color + (255,))
    img.alpha_composite(text_img, (pad_x, pad_y))
    return img


def build_background():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    t = (y / H)[..., None]
    top = np.array([251, 250, 246], np.float32)
    bottom = np.array([241, 239, 233], np.float32)
    bg = top * (1 - t) + bottom * t
    r = np.sqrt((x - W / 2) ** 2 + (y - 1020) ** 2) / (W * 0.9)
    bg *= (1.0 - 0.10 * np.clip(r - 0.4, 0, 1))[..., None]  # vignette
    return bg


RING_C = (540, 1020)
RING_R = 330
RING_W = 26


def build_ring_fields():
    size = 2 * (RING_R + 60)
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    dx, dy = x - size / 2, y - size / 2
    dist = np.sqrt(dx * dx + dy * dy)
    ang = (np.arctan2(dx, -dy) / (2 * np.pi)) % 1.0  # 0 at 12 o'clock, clockwise
    band = np.clip(RING_W / 2 - np.abs(dist - RING_R) + 0.5, 0, 1)
    return size, ang, band


# ---------------------------------------------------------------- particles
rng = np.random.default_rng(400)
N_P = 170
p_ang = rng.uniform(0, 2 * np.pi, N_P)
p_spd = rng.uniform(500, 1500, N_P)
p_vx, p_vy = np.cos(p_ang) * p_spd, np.sin(p_ang) * p_spd - 350
p_size = rng.uniform(8, 20, N_P)
p_rot = rng.uniform(0, 360, N_P)
p_spin = rng.uniform(-540, 540, N_P)
p_col = [(YELLOW, AMBER, CHAR, LIGHT)[i] for i in rng.integers(0, 4, N_P)]
p_life = rng.uniform(1.8, 3.2, N_P)


def draw_particles(canvas, t):
    dt = t - HIT
    if dt <= 0 or dt > 3.3:
        return
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    drag = (1 - math.exp(-2.2 * dt)) / 2.2
    for i in range(N_P):
        if dt > p_life[i]:
            continue
        x = RING_C[0] + p_vx[i] * drag
        y = RING_C[1] + p_vy[i] * drag + 420 * dt * dt
        a = int(255 * (1 - (dt / p_life[i]) ** 2))
        s = p_size[i]
        th = math.radians(p_rot[i] + p_spin[i] * dt)
        sq = abs(math.cos(th * 1.7)) * 0.8 + 0.2  # fake 3D flip
        pts = []
        for px, py in ((-s, -s * 0.45 * sq), (s, -s * 0.45 * sq), (s, s * 0.45 * sq), (-s, s * 0.45 * sq)):
            pts.append((x + px * math.cos(th) - py * math.sin(th), y + px * math.sin(th) + py * math.cos(th)))
        d.polygon(pts, fill=p_col[i] + (a,))
    canvas.alpha_composite(layer)


# ---------------------------------------------------------------- visualiser
def bar_levels(t, n):
    i = np.arange(n)
    energy = 0.35 + 0.25 * seg(t, 3.0, 7.0) + 0.4 * math.exp(-3 * max(0, t - HIT)) * (t > HIT)
    beat = 0.0
    if 3.0 < t < 12.9:
        beat = math.exp(-((t - 3.0) % 0.6) * 7)
    v = (0.5 + 0.5 * np.sin(i * 0.55 + t * 6.1)) * (0.5 + 0.5 * np.sin(i * 0.21 - t * 3.7))
    v = v * 0.7 + 0.3 * (0.5 + 0.5 * np.sin(i * 1.3 + t * 11.0))
    shape = np.sin(np.pi * (i + 0.5) / n) ** 0.6
    return np.clip(v ** 0.6 * shape * (energy + 0.45 * beat) * 1.3, 0.06, 1)


def draw_visualiser(d, t, alpha, cy, max_h, color):
    n, bw, gap = 44, 12, 10
    x0 = (W - (n * bw + (n - 1) * gap)) / 2
    lv = bar_levels(t, n)
    for i in range(n):
        h = max(bw, lv[i] * max_h)
        x = x0 + i * (bw + gap)
        d.rounded_rectangle((x, cy - h / 2, x + bw, cy + h / 2), radius=bw // 2, fill=color + (int(255 * alpha),))


# ---------------------------------------------------------------- frame
def render_frame(t, assets):
    bg, logo, (rsize, ang, band) = assets["bg"], assets["logo"], assets["ring"]
    arr = bg.copy()

    count_p = ease_in_out(seg(t, 3.1, HIT))
    ring_in = ease_out(seg(t, 2.8, 3.6))
    ending = ease_in_out(seg(t, 12.2, 12.8))
    main_a = ring_in * (1 - ending)

    # warm glow behind the ring, swelling at the milestone
    hitglow = math.exp(-2.0 * (t - HIT)) if t > HIT else 0
    glow_amt = main_a * (0.25 + 0.5 * count_p + 0.8 * hitglow)
    arr += (np.array(YELLOW, np.float32) - arr) * assets["glow"] * 0.35 * glow_amt

    # ring (numpy, anti-aliased)
    if main_a > 0:
        ox, oy = RING_C[0] - rsize // 2, RING_C[1] - rsize // 2
        sub = arr[oy:oy + rsize, ox:ox + rsize]
        track = band * 0.10 * main_a
        sub += (np.array(CHAR, np.float32) - sub) * track[..., None]
        prog = np.clip((count_p - ang) * 600, 0, 1) * band * main_a
        mix = 0.5 - 0.5 * np.cos(2 * np.pi * ang)  # seamless around the loop
        grad = np.stack([YELLOW[c] + (AMBER[c] - YELLOW[c]) * mix for c in range(3)], -1)
        sub += (grad - sub) * prog[..., None]

    # flash at the milestone
    if HIT < t < HIT + 0.6:
        arr += (np.array(YELLOW, np.float32) - arr) * assets["glow"] * 0.7 * (1 - (t - HIT) / 0.6) ** 2

    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).convert("RGBA")
    d = ImageDraw.Draw(img)

    # ring glow (blurred copy of the progress arc)
    if main_a > 0 and count_p > 0:
        g = Image.new("RGBA", (W // 4, H // 4), (0, 0, 0, 0))
        gd = ImageDraw.Draw(g)
        cx, cy, r = RING_C[0] / 4, RING_C[1] / 4, RING_R / 4
        gd.arc((cx - r, cy - r, cx + r, cy + r), -90, -90 + 360 * count_p,
               fill=YELLOW + (int(200 * main_a * (0.6 + hitglow)),), width=8)
        g = g.filter(ImageFilter.GaussianBlur(6)).resize((W, H), Image.BILINEAR)
        img = Image.alpha_composite(img, g)
        d = ImageDraw.Draw(img)

    # tick marks (one per 10 minutes)
    if main_a > 0:
        for k in range(40):
            a = k / 40
            th = 2 * math.pi * a
            lit = count_p >= a
            r1, r2 = RING_R + 34, RING_R + (52 if k % 10 == 0 else 44)
            sx, sy = math.sin(th), -math.cos(th)
            col = AMBER if lit else LIGHT
            al = main_a
            d.line((RING_C[0] + sx * r1, RING_C[1] + sy * r1, RING_C[0] + sx * r2, RING_C[1] + sy * r2),
                   fill=col + (int(255 * al),), width=4)

    # counter
    if main_a > 0:
        value = int(round(MILESTONE * count_p))
        pulse = 1 + 0.16 * math.exp(-6 * (t - HIT)) * math.sin(min(math.pi, (t - HIT) * 9)) if t > HIT else 1
        num = assets["num_cache"].get(value)
        if num is None:
            num = assets["num_cache"][value] = text_image(str(value), font(BOLD, 250), INK, tracking=-4)
        paste(img, num, RING_C[0], RING_C[1] - 30, main_a, pulse)
        paste(img, assets["label"], RING_C[0], RING_C[1] + 125, main_a)

    # logo group: centred intro, then docked at top
    intro = ease_back(seg(t, 0.5, 1.6))
    dock = ease_in_out(seg(t, 2.4, 3.3))
    if t < 12.8:
        la = seg(t, 0.5, 1.2)
        scale = (1.15 + 0.15 * intro) * (1 - dock) + 0.5 * dock
        cy = 900 * (1 - dock) + 330 * dock
        paste(img, logo, W / 2, cy, la * (1 - ending), scale)

    # REC indicator + timecode
    hud_a = seg(t, 0.2, 0.8) * (1 - ending)
    if hud_a > 0:
        blink = 1.0 if (t % 1.0) < 0.6 else 0.25
        d.ellipse((70, 82, 100, 112), fill=RED + (int(255 * hud_a * blink),))
        paste(img, assets["rec"], 150, 97, hud_a)
        frames = int(t * FPS)
        tc = f"00:{int(t) // 60:02d}:{int(t) % 60:02d}:{frames % FPS:02d}"
        paste(img, text_image(tc, font(REG, 32), MUTED, tracking=3), W - 170, 97, hud_a)

    # messages after the milestone
    def line(key, start, y):
        p = ease_out(seg(t, start, start + 0.7))
        paste(img, assets[key], W / 2, y + 40 * (1 - p), p * (1 - ending))

    line("m1", HIT + 0.4, 1480)
    line("m2", HIT + 1.3, 1575)
    line("m3", HIT + 1.5, 1628)
    line("m4", HIT + 3.0, 1720)

    # bottom visualiser
    vis_a = seg(t, 0.0, 1.0) * (1 - seg(t, 14.0, 14.5))
    vcol = tuple(int(CHAR[i] + (AMBER[i] - CHAR[i]) * seg(t, HIT, HIT + 0.5)) for i in range(3))
    vis_y = 1830
    draw_visualiser(d, t, 0.55 * vis_a, vis_y, 150, vcol)

    draw_particles(img, t)

    # end card
    end = ease_out(seg(t, 12.7, 13.4)) * (1 - seg(t, 14.1, 14.6))
    if end > 0:
        paste(img, logo, W / 2, 780, end, 1.2 + 0.05 * seg(t, 12.7, 14.6))
        paste(img, assets["e1"], W / 2, 1270 + 30 * (1 - end), end)
        paste(img, assets["e2"], W / 2, 1365 + 30 * (1 - end), end)

    # intro fade from black
    fade_in = seg(t, 0, 0.5)
    out = 255 - (255 - np.asarray(img.convert("RGB"), np.float32)) * fade_in
    return out.astype(np.uint8)


# ---------------------------------------------------------------- audio
SR = 44100


def env_adsr(n, a, r):
    e = np.ones(n, np.float32)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def smooth(x, k):
    ker = np.ones(k, np.float32) / k
    return np.convolve(x, ker, mode="same")


def build_audio(path):
    n = int(DURATION * SR)
    out = np.zeros((n, 2), np.float32)
    tt = np.arange(n) / SR

    def add(sig, start, gain=1.0, pan=0.0):
        s = int(start * SR)
        e = min(n, s + len(sig))
        seg_ = sig[: e - s] * gain
        out[s:e, 0] += seg_ * (1 - pan) * 0.5 * 2 ** 0.5
        out[s:e, 1] += seg_ * (1 + pan) * 0.5 * 2 ** 0.5

    def hz(m):
        return 440 * 2 ** ((m - 69) / 12)

    # pad chords
    chords = [(0.0, 3.5, [57, 60, 64, 69]),   # Am
              (3.5, HIT, [53, 57, 60, 65]),   # F
              (HIT, 10.5, [48, 55, 60, 64, 67]),  # C
              (10.5, 12.9, [55, 59, 62, 67]),  # G
              (12.9, DURATION, [48, 55, 60, 64, 72])]  # C
    for s, e, notes in chords:
        m = int((e - s + 0.6) * SR)
        t_ = np.arange(m) / SR
        sig = np.zeros(m, np.float32)
        for note in notes:
            f = hz(note)
            for det in (-0.12, 0.12):
                ff = f * 2 ** (det / 12)
                sig += np.sin(2 * np.pi * ff * t_) + 0.3 * np.sin(4 * np.pi * ff * t_) + 0.12 * np.sin(6 * np.pi * ff * t_)
        sig *= env_adsr(m, 0.6, 0.8) * (1 + 0.15 * np.sin(2 * np.pi * 0.25 * t_))
        add(sig / (len(notes) * 4), s, 0.5)

    # bass
    for s, e, notes in chords:
        m = int((e - s) * SR)
        t_ = np.arange(m) / SR
        f = hz(notes[0] - 12)
        add(np.sin(2 * np.pi * f * t_) * env_adsr(m, 0.05, 0.3), s, 0.18 if s >= 3.0 else 0.0)

    # kick drum, 100 bpm
    km = int(0.45 * SR)
    kt = np.arange(km) / SR
    kick = np.sin(2 * np.pi * (45 * kt + (120 - 45) / 30 * (1 - np.exp(-30 * kt)))) * np.exp(-8 * kt)
    beat = 3.0
    while beat < 12.8:
        g = 0.55 if beat < HIT - 0.1 else 0.75
        add(kick, beat, g)
        beat += 0.6

    # hats after the milestone
    hm = int(0.08 * SR)
    noise = rng.standard_normal(hm).astype(np.float32)
    hat = (noise - smooth(noise, 6)) * np.exp(-np.arange(hm) / SR * 60)
    b = HIT + 0.3
    k = 0
    while b < 12.8:
        add(hat, b, 0.10, pan=0.4 if k % 2 else -0.4)
        b += 0.3
        k += 1

    # counter ticks (every 20 minutes)
    bm = int(0.03 * SR)
    bt = np.arange(bm) / SR
    blip = np.sin(2 * np.pi * 2400 * bt) * np.exp(-bt * 180)
    last = 0
    for i in range(int(3.1 * FPS), int(HIT * FPS) + 1):
        v = int(round(MILESTONE * ease_in_out(seg(i / FPS, 3.1, HIT))))
        if v // 20 > last // 20 and v < MILESTONE:
            add(blip, i / FPS, 0.16, pan=0.3 * math.sin(v))
        last = v

    # riser into the milestone
    rs = 1.6
    rm = int(rs * SR)
    rn = rng.standard_normal(rm).astype(np.float32)
    rn = rn - smooth(rn, 40)
    add(rn * np.linspace(0, 1, rm) ** 2.5, HIT - rs, 0.22)

    # impact: sub boom + bell chime + wash
    im = int(3.0 * SR)
    it = np.arange(im) / SR
    boom = np.sin(2 * np.pi * (35 * it + 60 / 12 * (1 - np.exp(-12 * it)))) * np.exp(-2.5 * it)
    add(boom, HIT, 0.9)
    wash = rng.standard_normal(im).astype(np.float32)
    wash = smooth(wash, 3) * np.exp(-it * 2.2)
    add(wash, HIT, 0.10)

    def bell(f0, dur, gain, start):
        m = int(dur * SR)
        t_ = np.arange(m) / SR
        s = np.zeros(m, np.float32)
        for ratio, amp, dec in ((1, 1, 1.4), (2.0, 0.5, 2.2), (3.0, 0.25, 3.5), (4.16, 0.2, 5)):
            s += amp * np.sin(2 * np.pi * f0 * ratio * t_) * np.exp(-t_ * dec)
        s *= np.minimum(1, t_ * 400)
        add(s, start, gain)

    for j, note in enumerate((72, 76, 79, 84)):
        bell(hz(note), 3.0, 0.14, HIT + j * 0.06)
    for j, note in enumerate((72, 79, 84)):
        bell(hz(note), 2.2, 0.12, 12.9 + j * 0.12)
    bell(hz(88), 1.5, 0.06, 0.6)  # logo sparkle

    # master
    out *= np.minimum(1, tt / 0.3)[:, None]
    out *= np.clip((DURATION - tt) / 0.9, 0, 1)[:, None]
    out = np.tanh(out * 1.3)
    out /= np.max(np.abs(out)) / 0.89
    pcm = (out * 32767).astype("<i2")
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())


# ---------------------------------------------------------------- main
def main():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt((x - RING_C[0]) ** 2 + (y - RING_C[1]) ** 2)
    glow = np.exp(-(r / 420) ** 2)[..., None]

    assets = {
        "bg": build_background(),
        "glow": glow,
        "logo": build_logo(),
        "ring": build_ring_fields(),
        "num_cache": {},
        "label": text_image("RECORDING MINUTES", font(BOLD, 36), MUTED, tracking=9),
        "rec": text_image("REC", font(BOLD, 32), CHAR, tracking=4),
        "m1": pill(text_image("MILESTONE REACHED", font(BOLD, 50), INK, tracking=10), YELLOW),
        "m2": text_image("Thank you to every artist & creator", font(REG, 42), CHAR),
        "m3": text_image("who pressed record with us.", font(REG, 42), CHAR),
        "m4": text_image("Here's to the next 400.", font(BOLD, 48), INK),
        "e1": pill(text_image("400 MINUTES RECORDED", font(BOLD, 48), INK, tracking=8), YELLOW),
        "e2": text_image("Thank you.", font(SERIF_IT, 56), CHAR),
    }

    audio = WORK / "_audio.wav"
    build_audio(audio)

    ff = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [ff, "-y", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-i", str(audio),
           "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(OUT)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    total = int(DURATION * FPS)
    for i in range(total):
        frame = render_frame(i / FPS, assets)
        proc.stdin.write(frame.tobytes())
        if i % 60 == 0:
            print(f"frame {i}/{total}", flush=True)
            if len(sys.argv) > 2:
                Image.fromarray(frame).save(WORK / f"_preview_{i:03d}.png")
    proc.stdin.close()
    proc.wait()
    audio.unlink()
    print("wrote", OUT)


if __name__ == "__main__":
    main()
