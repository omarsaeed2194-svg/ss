#!/usr/bin/env python3
"""Render the Facebook / Instagram video ads for the Jeep laptop-bag set.

  python3 build.py                          # all ads, all formats, offline voice
  python3 build.py --ads v2_short --formats 9x16
  python3 build.py --tts edge               # Egyptian neural voice (needs internet)
  AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=... python3 build.py --tts azure

Content (voice-over lines, captions, titles, store info) lives in ads.json.
Outputs land in out/: <ad>_<format>.mp4, a cover .jpg and an Arabic .srt.
"""

import argparse
import asyncio
import hashlib
import json
import math
import os
import subprocess
import tarfile
import urllib.request
import wave
from fractions import Fraction
from multiprocessing import Pool
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy.signal import resample_poly

import music

HERE = Path(__file__).resolve().parent
ASSETS = HERE / "assets"
CACHE = HERE / ".cache"
OUT = HERE / "out"
FPS = 30
SR = music.SR

CAIRO_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo%5Bslnt,wght%5D.ttf"
PIPER_URL = ("https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/"
             "vits-piper-ar_JO-kareem-medium.tar.bz2")
EMOJI_FONT = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"

NAVY = (30, 42, 94)
WHITE = (255, 255, 255)
ORANGE = (228, 87, 46)
GREEN = (46, 173, 91)
BG_TOP = (255, 226, 138)
BG_BOTTOM = (245, 178, 40)

# Every format is 1080 wide, so pixel sizes are shared. `prod` is the product
# stage: (center x, center y, width, height). Reels/Stories keep the bottom
# ~320px clear for the platform UI.
FORMATS = {
    "9x16": dict(W=1080, H=1920, title_cy=400, prod=(540, 990, 980, 820), cap_cy=1530,
                 title_size=84, cap_size=56),
    "4x5": dict(W=1080, H=1350, title_cy=160, prod=(540, 650, 900, 640), cap_cy=1170,
                title_size=72, cap_size=50),
    "1x1": dict(W=1080, H=1080, title_cy=135, prod=(540, 530, 860, 530), cap_cy=950,
                title_size=58, cap_size=46),
}

CHIP_EMOJI = {"المكتب": "💼", "الشغل": "💼", "الجامعة": "🎓", "الكافيه": "☕",
              "المذاكرة": "📚", "السفر": "✈️"}


# --------------------------------------------------------------------------
# Downloads
# --------------------------------------------------------------------------

def ensure_font() -> Path:
    path = CACHE / "fonts" / "Cairo.ttf"
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(CAIRO_URL, path)
    return path


def ensure_piper() -> Path:
    model = CACHE / "voices" / "vits-piper-ar_JO-kareem-medium" / "ar_JO-kareem-medium.onnx"
    if not model.exists():
        model.parent.parent.mkdir(parents=True, exist_ok=True)
        tmp = CACHE / "voices" / "voice.tar.bz2"
        urllib.request.urlretrieve(PIPER_URL, tmp)
        with tarfile.open(tmp) as tar:
            tar.extractall(model.parent.parent, filter="data")
        tmp.unlink()
    return model


# --------------------------------------------------------------------------
# Voice-over
# --------------------------------------------------------------------------

def _resample(audio: np.ndarray, sr: int) -> np.ndarray:
    if sr == SR:
        return audio
    f = Fraction(SR, sr)
    return resample_poly(audio, f.numerator, f.denominator).astype(np.float32)


def _read_audio(path: Path) -> np.ndarray:
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR),
                          "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).copy()


def _trim(audio: np.ndarray, thresh: float = 0.01) -> np.ndarray:
    idx = np.where(np.abs(audio) > thresh * (np.max(np.abs(audio)) or 1))[0]
    if len(idx) == 0:
        return audio
    a, b = max(0, idx[0] - int(0.02 * SR)), min(len(audio), idx[-1] + int(0.06 * SR))
    return audio[a:b]


class Voice:
    def __init__(self, backend: str, voice: str, rate: str):
        self.backend, self.voice, self.rate = backend, voice, rate
        self.dir = CACHE / "tts" / f"{backend}-{voice}-{rate}"
        self.dir.mkdir(parents=True, exist_ok=True)
        self._piper_voice = None

    def line(self, line: dict) -> np.ndarray:
        text = line["franco"] if self.backend == "piper" else line.get("say", line["text"])
        key = hashlib.sha1(text.encode()).hexdigest()[:16]
        wav = self.dir / f"{key}.wav"
        if not wav.exists():
            getattr(self, "_" + self.backend)(text, wav)
        audio = _trim(_read_audio(wav))
        rms = np.sqrt(np.mean(audio ** 2)) or 1.0
        return audio * (0.12 / rms)

    def _piper(self, text, wav):
        from tts_offline import PiperVoice, write_wav
        if self._piper_voice is None:
            self._piper_voice = PiperVoice(str(ensure_piper()))
        write_wav(wav, self._piper_voice.synth(text), self._piper_voice.sample_rate)
        # pitch-preserving speed-up; the voice gets mushy if sped up in the model
        tempo = 1.0 + float(self.rate.strip("%")) / 100
        if abs(tempo - 1) > 1e-3:
            fast = wav.with_name(wav.stem + "_fast.wav")
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-af", f"atempo={tempo}",
                            str(fast)], check=True)
            fast.replace(wav)

    def _edge(self, text, wav):
        import ssl

        import certifi
        import edge_tts
        from edge_tts import communicate
        # edge-tts pins certifi's CA list; also trust SSL_CERT_FILE so it works
        # behind TLS-inspecting proxies (sandboxes, corporate networks).
        ctx = ssl.create_default_context(cafile=certifi.where())
        if os.environ.get("SSL_CERT_FILE"):
            ctx.load_verify_locations(os.environ["SSL_CERT_FILE"])
        communicate._SSL_CTX = ctx
        proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
        mp3 = wav.with_suffix(".mp3")
        asyncio.run(edge_tts.Communicate(text, self.voice, rate=self.rate, proxy=proxy).save(str(mp3)))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp3), str(wav)], check=True)
        mp3.unlink()

    def _azure(self, text, wav):
        key, region = os.environ["AZURE_SPEECH_KEY"], os.environ["AZURE_SPEECH_REGION"]
        ssml = (f"<speak version='1.0' xml:lang='ar-EG'><voice name='{self.voice}'>"
                f"<prosody rate='{self.rate}'>{text}</prosody></voice></speak>")
        req = urllib.request.Request(
            f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1",
            data=ssml.encode(), method="POST",
            headers={"Ocp-Apim-Subscription-Key": key, "Content-Type": "application/ssml+xml",
                     "X-Microsoft-OutputFormat": "riff-24khz-16bit-mono-pcm",
                     "User-Agent": "ad-builder"})
        wav.write_bytes(urllib.request.urlopen(req).read())


# --------------------------------------------------------------------------
# Timeline
# --------------------------------------------------------------------------

def plan_ad(ad: dict, voice: Voice):
    """Lay scenes and lines on a timeline driven by the voice-over lengths."""
    t, scenes, captions, clips = 0.0, [], [], []
    last = len(ad["scenes"]) - 1
    for si, sc in enumerate(ad["scenes"]):
        start = t
        t += 0.12 if si == 0 else 0.22
        line_times = []
        for line in sc["lines"]:
            audio = voice.line(line)
            dur = len(audio) / SR
            clips.append((t, audio))
            captions.append({"start": t - 0.05, "end": t + dur + 0.1, "text": line["text"]})
            line_times.append((t - start, dur))
            t += dur + 0.1
        t += 0.18 + (1.6 if si == last else 0.0)
        scenes.append({**sc, "start": start, "end": t, "lines_t": line_times})
    for c in captions:
        c["end"] = min(c["end"], next((s["end"] for s in scenes if s["start"] <= c["start"] < s["end"]), t))
    return {"scenes": scenes, "captions": captions, "clips": clips, "duration": t}


# --------------------------------------------------------------------------
# Drawing helpers
# --------------------------------------------------------------------------

def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease_out_back(p, s=1.7):
    p = clamp(p) - 1
    return p * p * ((s + 1) * p + s) + 1


def ease_out_cubic(p):
    return 1 - (1 - clamp(p)) ** 3


def ease_in_out(p):
    p = clamp(p)
    return 3 * p * p - 2 * p * p * p


_fonts = {}


def font(size, weight="Black"):
    key = (size, weight)
    if key not in _fonts:
        f = ImageFont.truetype(str(ensure_font()), size, layout_engine=ImageFont.Layout.RAQM)
        f.set_variation_by_name(weight)
        _fonts[key] = f
    return _fonts[key]


def _text_w(text, f):
    b = f.getbbox(text, direction="rtl", language="ar")
    return b[2] - b[0]


def wrap(text, f, max_w):
    lines = []
    for para in text.split("\n"):
        cur = ""
        for word in para.split():
            cand = (cur + " " + word).strip()
            if cur and _text_w(cand, f) > max_w:
                lines.append(cur)
                cur = word
            else:
                cur = cand
        lines.append(cur)
    return lines


def text_block(text, size, color, weight="Black", max_w=980, spacing=1.32):
    f = font(size, weight)
    lines = wrap(text, f, max_w)
    lh = int(size * spacing)
    w = max(_text_w(l, f) for l in lines) + 8
    h = lh * len(lines)
    img = Image.new("RGBA", (w + 8, h + int(size * 0.35)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i, l in enumerate(lines):
        d.text((img.width / 2, lh * i + lh / 2 + size * 0.12), l, font=f, fill=color,
               anchor="mm", direction="rtl", language="ar")
    return img.crop(img.getbbox())


def shadowed(img, blur=14, offset=8, opacity=70):
    pad = blur * 2
    out = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2 + offset), (0, 0, 0, 0))
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sh.putalpha(img.getchannel("A").point(lambda v: v * opacity // 255))
    out.alpha_composite(sh, (pad, pad + offset))
    out = out.filter(ImageFilter.GaussianBlur(blur))
    out.alpha_composite(img, (pad, pad))
    return out


def pill(content, bg, pad_x=40, pad_y=22, radius=None, icon=None, gap=18):
    """Rounded box around a sprite, with an optional icon on the (RTL) right."""
    cw = content.width + (icon.width + gap if icon else 0)
    w, h = cw + pad_x * 2, max(content.height, icon.height if icon else 0) + pad_y * 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(img).rounded_rectangle((0, 0, w - 1, h - 1), radius=radius or h // 2, fill=bg)
    img.alpha_composite(content, (pad_x, (h - content.height) // 2))
    if icon:
        img.alpha_composite(icon, (pad_x + content.width + gap, (h - icon.height) // 2))
    return shadowed(img)


def emoji(ch, size):
    f = ImageFont.truetype(EMOJI_FONT, 109)
    img = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((10, 10), ch, font=f, embedded_color=True)
    img = img.crop(img.getbbox())
    return img.resize((size, int(size * img.height / img.width)), Image.LANCZOS)


def check_icon(size, color=GREEN):
    s = size * 4
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((0, 0, s - 1, s - 1), fill=color)
    d.line([(s * 0.27, s * 0.52), (s * 0.44, s * 0.69), (s * 0.74, s * 0.34)], fill=WHITE,
           width=int(s * 0.11), joint="curve")
    return img.resize((size, size), Image.LANCZOS)


def plus_icon(size):
    s = size * 4
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((0, 0, s - 1, s - 1), fill=NAVY)
    w = int(s * 0.12)
    d.rounded_rectangle((s * 0.26, s / 2 - w / 2, s * 0.74, s / 2 + w / 2), radius=w // 2, fill=WHITE)
    d.rounded_rectangle((s / 2 - w / 2, s * 0.26, s / 2 + w / 2, s * 0.74), radius=w // 2, fill=WHITE)
    return shadowed(img.resize((size, size), Image.LANCZOS), blur=8, offset=4)


def arrow_up(size, color=NAVY):
    s = size * 4
    img = Image.new("RGBA", (s, int(s * 1.2)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(s / 2, 0), (s, s * 0.5), (s * 0.68, s * 0.5), (s * 0.68, s * 1.2),
               (s * 0.32, s * 1.2), (s * 0.32, s * 0.5), (0, s * 0.5)], fill=color)
    return img.resize((size, int(size * 1.2)), Image.LANCZOS)


def gift_icon(size):
    s = size * 3
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    gold = (255, 211, 77)
    d.rounded_rectangle((s * 0.12, s * 0.42, s * 0.88, s * 0.98), radius=int(s * 0.04), fill=ORANGE)
    d.rounded_rectangle((s * 0.06, s * 0.30, s * 0.94, s * 0.46), radius=int(s * 0.04), fill=(196, 64, 30))
    d.rectangle((s * 0.44, s * 0.30, s * 0.56, s * 0.98), fill=gold)
    d.ellipse((s * 0.18, s * 0.06, s * 0.50, s * 0.32), outline=gold, width=int(s * 0.07))
    d.ellipse((s * 0.50, s * 0.06, s * 0.82, s * 0.32), outline=gold, width=int(s * 0.07))
    d.ellipse((s * 0.43, s * 0.22, s * 0.57, s * 0.34), fill=gold)
    return shadowed(img.resize((size, size), Image.LANCZOS))


def place(frame, sprite, cx, cy, scale=1.0, alpha=1.0, rot=0.0):
    if scale <= 0.02 or alpha <= 0.02:
        return
    s = sprite
    if rot:
        s = s.rotate(rot, resample=Image.BICUBIC, expand=True)
    if abs(scale - 1) > 1e-3:
        s = s.resize((max(1, int(s.width * scale)), max(1, int(s.height * scale))), Image.BILINEAR)
    if alpha < 0.999:
        s = s.copy()
        s.putalpha(s.getchannel("A").point(lambda v: int(v * alpha)))
    x, y = int(cx - s.width / 2), int(cy - s.height / 2)
    # alpha_composite needs a non-negative destination: crop what is off-frame
    cl, ct = max(0, -x), max(0, -y)
    cr, cb = min(s.width, frame.width - x), min(s.height, frame.height - y)
    if cr <= cl or cb <= ct:
        return
    frame.alpha_composite(s.crop((cl, ct, cr, cb)), (x + cl, y + ct))


def fit(img, max_w, max_h):
    k = min(max_w / img.width, max_h / img.height)
    return img.resize((int(img.width * k), int(img.height * k)), Image.LANCZOS)


# --------------------------------------------------------------------------
# Scene renderer (runs inside worker processes)
# --------------------------------------------------------------------------

G = {}


def _init(fmt, plan, product):
    L = FORMATS[fmt]
    W, H = L["W"], L["H"]
    G.update(fmt=fmt, L=L, plan=plan, product=product, cache={})
    # background: vertical gradient + soft glow behind the product stage
    y = np.linspace(0, 1, H)[:, None]
    top, bot = np.array(BG_TOP), np.array(BG_BOTTOM)
    grad = (top * (1 - y) + bot * y)[:, None, :].repeat(W, axis=1)
    cx, cy = L["prod"][0], L["prod"][1]
    yy, xx = np.mgrid[0:H, 0:W]
    glow = np.exp(-(((xx - cx) / (W * 0.55)) ** 2 + ((yy - cy) / (H * 0.32)) ** 2))[..., None]
    img = grad * (1 - 0.55 * glow) + np.array([255, 246, 214]) * 0.55 * glow
    G["bg"] = Image.fromarray(img.clip(0, 255).astype(np.uint8)).convert("RGBA")
    rng = np.random.default_rng(11)
    G["bokeh"] = [dict(x=rng.uniform(0, W), y=rng.uniform(0, H), r=rng.uniform(40, 140),
                       vx=rng.uniform(-14, 14), vy=rng.uniform(-24, -8), a=rng.uniform(0.08, 0.22))
                  for _ in range(9)]
    G["bokeh_sprites"] = {}
    for b in G["bokeh"]:
        r = int(b["r"])
        if r not in G["bokeh_sprites"]:
            s = Image.new("RGBA", (r * 2 + 40, r * 2 + 40), (0, 0, 0, 0))
            ImageDraw.Draw(s).ellipse((20, 20, 20 + 2 * r, 20 + 2 * r), fill=(255, 255, 255, 255))
            G["bokeh_sprites"][r] = s.filter(ImageFilter.GaussianBlur(10))
    G["assets"] = {n: Image.open(ASSETS / f"{n}.png").convert("RGBA")
                   for n in ("bag", "stand", "stand_folded")}
    sh = Image.new("RGBA", (400, 80), (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse((20, 20, 380, 60), fill=(90, 50, 0, 110))
    G["shadow"] = sh.filter(ImageFilter.GaussianBlur(12))


def cached(key, fn):
    c = G["cache"]
    if key not in c:
        c[key] = fn()
    return c[key]


def product(name, max_w, max_h):
    return cached(("p", name, int(max_w), int(max_h)), lambda: fit(G["assets"][name], max_w, max_h))


def draw_product(frame, name, cx, cy, max_w, max_h, scale=1.0, alpha=1.0, rot=0.0, shadow=True):
    spr = product(name, max_w, max_h)
    if shadow:
        sh = cached(("sh", spr.width), lambda: G["shadow"].resize((int(spr.width * 0.9), int(spr.width * 0.12))))
        place(frame, sh, cx, cy + spr.height * scale / 2, scale, alpha * 0.9)
    place(frame, spr, cx, cy, scale, alpha, rot)


def title_sprite(text):
    L = G["L"]
    size, max_w = L["title_size"], 940

    def build():
        sz = size
        # shrink (down to 78%) before letting a line wrap
        while sz > size * 0.78 and max(_text_w(l, font(sz)) for l in text.split("\n")) > max_w:
            sz -= 2
        return pill(text_block(text, sz, WHITE, max_w=max_w), NAVY, pad_x=44, pad_y=24, radius=34)
    return cached(("title", text), build)


def label_sprite(text, size=40, bg=WHITE, color=NAVY, icon=None):
    return cached(("label", text, size, bg, icon), lambda: pill(
        text_block(text, size, color, "Bold"), bg, pad_x=28, pad_y=14,
        icon=(check_icon(int(size * 1.1)) if icon == "check" else emoji(icon, int(size * 1.15)) if icon else None)))


def pop(lt, start, dur=0.38):
    p = (lt - start) / dur
    return ease_out_back(p), clamp(p * 3)


def scene_exit(lt, dur, last):
    if last:
        return 1.0
    return clamp((dur - lt) / 0.2)


def draw_title(frame, sc, lt, ex, delay=0.0):
    L = G["L"]
    s, a = pop(lt, delay)
    bob = math.sin(lt * 2.2) * 4
    place(frame, title_sprite(sc["title"]), L["W"] / 2, L["title_cy"] + bob, s * (0.92 + 0.08 * ex), a * ex)


def line_start(sc, i, default):
    lt = sc["lines_t"]
    return lt[i][0] if i < len(lt) else default


def duo_layout(scale_k=1.0, dy=0.0):
    """Where bag, stand, plus-badge and labels sit. Tall formats stack the two
    products diagonally (overlapping) to use the height; others go side by side."""
    L = G["L"]
    cx, cy, bw, bh = L["prod"]
    cy += dy * bh
    k = scale_k
    if L["H"] / L["W"] > 1.5:
        return dict(bag=(cx + 0.17 * bw * k, cy - 0.19 * bh * k, 0.62 * bw * k, 0.62 * bh * k),
                    stand=(cx - 0.17 * bw * k, cy + 0.25 * bh * k, 0.6 * bw * k, 0.5 * bh * k),
                    plus=(cx + 0.25 * bw * k, cy + 0.19 * bh * k),
                    bag_label=(cx - 0.27 * bw * k, cy - 0.31 * bh * k),
                    stand_label=(cx + 0.25 * bw * k, cy + 0.37 * bh * k))
    return dict(bag=(cx + 0.24 * bw * k, cy, 0.48 * bw * k, 0.68 * bh * k),
                stand=(cx - 0.25 * bw * k, cy + 0.06 * bh * k, 0.44 * bw * k, 0.5 * bh * k),
                plus=(cx, cy),
                bag_label=(cx + 0.24 * bw * k, cy + 0.42 * bh * k),
                stand_label=(cx - 0.25 * bw * k, cy + 0.42 * bh * k))


def v_duo(frame, sc, lt, dur, ex, scale_k=1.0, dy=0.0, labels=True):
    lay = duo_layout(scale_k, dy)
    zoom = 1 + 0.04 * clamp(lt / max(dur, 0.1))
    k = zoom * (0.92 + 0.08 * ex)
    s1, a1 = pop(lt, 0.10)
    s2, a2 = pop(lt, 0.28)
    draw_product(frame, "bag", *lay["bag"], s1 * k, a1 * ex)
    draw_product(frame, "stand", *lay["stand"], s2 * k, a2 * ex)
    sp, ap = pop(lt, 0.45)
    place(frame, cached(("plus",), lambda: plus_icon(96)), *lay["plus"], sp * min(1, scale_k + 0.2) * ex, ap * ex)
    if labels:
        prod = G["product"]
        sl, al = pop(lt, 0.6)
        place(frame, label_sprite(prod["bag_label"], 36), *lay["bag_label"], sl * ex, al * ex)
        sl, al = pop(lt, 0.72)
        place(frame, label_sprite(prod["stand_label"], 36), *lay["stand_label"], sl * ex, al * ex)


def v_hook(frame, sc, lt, dur, ex, last):
    L = G["L"]
    cx, cy, bw, bh = L["prod"]
    draw_title(frame, sc, lt, ex, delay=-0.2)  # already half-in on frame 0 (feed autoplay)
    lay = duo_layout()
    p1 = ease_out_cubic((lt - 0.15) / 0.5)
    p2 = ease_out_cubic((lt - 0.3) / 0.5)
    wig = math.sin(lt * 6) * 3
    bx, by, bw_, bh_ = lay["bag"]
    sx, sy, sw_, sh_ = lay["stand"]
    draw_product(frame, "bag", L["W"] + 500 - (L["W"] + 500 - bx) * p1, by, bw_, bh_, 1.0, ex,
                 rot=wig * (1 - p1) + 2)
    draw_product(frame, "stand", -500 + (sx + 500) * p2, sy, sw_, sh_, 1.0, ex, rot=-wig * (1 - p2) - 2)
    sq, aq = pop(lt, 0.7)
    tall = L["H"] / L["W"] > 1.5
    ex_, ey_ = (cx - 0.3 * bw, cy - 0.3 * bh) if tall else (cx, cy - 0.36 * bh)
    place(frame, cached(("emoji", "🤔", 140), lambda: emoji("🤔", 140)), ex_, ey_,
          sq * ex * (1 + 0.05 * math.sin(lt * 8)), aq * ex)


def v_gift(frame, sc, lt, dur, ex, last):
    L = G["L"]
    cx, cy, bw, bh = L["prod"]
    draw_title(frame, sc, lt, ex, delay=-0.2)
    sg, ag = pop(lt, 0.15, 0.5)
    bounce = abs(math.sin(lt * 4)) * 22
    gsize = int(min(bw, bh) * 0.5)
    place(frame, cached(("gift", gsize), lambda: gift_icon(gsize)), cx, cy - bounce, sg * ex, ag * ex)
    s1, a1 = pop(lt, 0.5)
    draw_product(frame, "bag", cx + 0.33 * bw, cy + 0.18 * bh, 0.3 * bw, 0.42 * bh, s1 * ex, a1 * ex, rot=6)
    s2, a2 = pop(lt, 0.65)
    draw_product(frame, "stand", cx - 0.33 * bw, cy + 0.22 * bh, 0.3 * bw, 0.36 * bh, s2 * ex, a2 * ex, rot=-6)


def v_offer(frame, sc, lt, dur, ex, last):
    draw_title(frame, sc, lt, ex)
    v_duo(frame, sc, lt, dur, ex)


# callout anchors in normalized bag-image coordinates, and label offsets
BAG_CALLOUTS = [
    ("تتشال في الإيد", (0.50, 0.08), (-0.30, -0.10)),
    ("حزام كروس", (0.06, 0.78), (0.0, 0.17)),
    ("سوستة قدام", (0.25, 0.56), (0.10, -0.20)),
]


def v_bag(frame, sc, lt, dur, ex, last):
    L = G["L"]
    cx, cy, bw, bh = L["prod"]
    draw_title(frame, sc, lt, ex)
    s, a = pop(lt, 0.08, 0.45)
    kb = 1 + 0.07 * ease_in_out(lt / max(dur, 0.1))
    spr = product("bag", 0.86 * bw, 0.9 * bh)
    k = s * kb * (0.92 + 0.08 * ex)
    draw_product(frame, "bag", cx, cy, 0.86 * bw, 0.9 * bh, k, a * ex)
    if sc.get("callouts", True):
        n = len(sc["lines_t"])
        first, zip_line = max(0, n - 2), n - 1
        times = [line_start(sc, first, dur * 0.2) + 0.15, line_start(sc, first, dur * 0.2) + 0.9,
                 line_start(sc, zip_line, dur * 0.6) + 0.1 if n > 1 else dur * 0.6]
        d = ImageDraw.Draw(frame, "RGBA")
        for (text, (nx, ny), (ox, oy)), t0 in zip(BAG_CALLOUTS, times):
            if lt < t0:
                continue
            sl, al = pop(lt, t0, 0.3)
            px = cx + (nx - 0.5) * spr.width * k
            py = cy + (ny - 0.5) * spr.height * k
            lx, ly = px + ox * bw, py + oy * bh
            lab = label_sprite(text, 38, NAVY, WHITE)
            lx = clamp(lx, lab.width / 2 - 10, L["W"] - lab.width / 2 + 10)
            if al * ex > 0.3:
                d.line([(px, py), (lx, ly)], fill=(*NAVY, int(255 * al * ex)), width=5)
                r = 13
                d.ellipse((px - r, py - r, px + r, py + r), fill=WHITE, outline=NAVY, width=5)
            place(frame, lab, lx, ly, sl * ex, al * ex)


def v_stand(frame, sc, lt, dur, ex, last):
    L = G["L"]
    cx, cy, bw, bh = L["prod"]
    draw_title(frame, sc, lt, ex)
    s, a = pop(lt, 0.08, 0.45)
    sway = math.sin(lt * 1.6) * 2
    k = s * (1 + 0.05 * ease_in_out(lt / max(dur, 0.1))) * (0.92 + 0.08 * ex)
    draw_product(frame, "stand", cx, cy - 0.04 * bh, 0.84 * bw, 0.74 * bh, k, a * ex, rot=sway)
    sa, aa = pop(lt, 0.4)
    rise = (lt * 1.6) % 1.0
    place(frame, cached(("arrow",), lambda: arrow_up(70)), cx + 0.36 * bw, cy - 0.18 * bh - rise * 50,
          sa * ex, aa * ex * (1 - rise * 0.7))
    t1 = line_start(sc, 0, 0.3) + 0.3
    t2 = line_start(sc, 1, dur * 0.5) + 0.2
    for i, (text, t0) in enumerate([("الشاشة في مستوى أعلى", t1), ("رقبتك وضهرك مرتاحين", t2)]):
        sl, al = pop(lt, t0)
        place(frame, label_sprite(text, 38, icon="check"), cx, cy + 0.32 * bh + i * max(0.13 * bh, 84),
              sl * ex, al * ex)


def v_fold(frame, sc, lt, dur, ex, last):
    L = G["L"]
    cx, cy, bw, bh = L["prod"]
    draw_title(frame, sc, lt, ex)
    l0, d0 = sc["lines_t"][0]
    t_fold = l0 + d0 * 0.45
    s, a = pop(lt, 0.08, 0.4)
    pf = ease_in_out((lt - t_fold) / 0.45)
    if pf < 1:
        draw_product(frame, "stand", cx, cy - 0.05 * bh, 0.8 * bw, 0.66 * bh,
                     s * (1 - 0.7 * pf) * (0.92 + 0.08 * ex), a * ex * (1 - pf), rot=-25 * pf)
    if pf > 0:
        sf = ease_out_back((lt - t_fold - 0.15) / 0.45)
        bob = math.sin(lt * 3) * 8
        draw_product(frame, "stand_folded", cx, cy - 0.05 * bh + bob, 0.62 * bw, 0.55 * bh,
                     sf * (0.92 + 0.08 * ex), clamp(pf * 2) * ex, rot=8 * math.sin(lt * 1.5))
        sl, al = pop(lt, t_fold + 0.5)
        place(frame, label_sprite("بيتقفل ويبقى صغير", 38, icon="check"), cx, cy + 0.34 * bh, sl * ex, al * ex)
    t_carry = sc["lines_t"][1][0] + 0.1 if len(sc["lines_t"]) > 1 else t_fold + 1.3
    if lt >= t_carry:
        sl, al = pop(lt, t_carry)
        place(frame, label_sprite("تاخده معاك في أي حتة", 38, icon="check"), cx,
              cy + 0.34 * bh + max(0.13 * bh, 84),
              sl * ex, al * ex)


def v_places(frame, sc, lt, dur, ex, last):
    L = G["L"]
    cx, cy, bw, bh = L["prod"]
    draw_title(frame, sc, lt, ex)
    v_duo(frame, sc, lt, dur, ex, scale_k=0.72, dy=0.12, labels=False)
    chips = sc.get("chips", [])
    l0, d0 = sc["lines_t"][0]
    n = max(1, len(chips))
    span = 0.86 * bw
    for i, chip in enumerate(chips):
        t0 = l0 + d0 * i / n
        sc_, ac = pop(lt, t0)
        x = cx + span / 2 - span * (i + 0.5) / n  # RTL: first chip on the right
        chip_y = cy - (0.27 if L["H"] / L["W"] > 1.5 else 0.34) * bh
        place(frame, label_sprite(chip, 40, icon=CHIP_EMOJI.get(chip, "⭐")), x, chip_y,
              sc_ * ex, ac * ex)


def v_cta(frame, sc, lt, dur, ex, last):
    L = G["L"]
    prod = G["product"]
    cx, cy, bw, bh = L["prod"]
    draw_title(frame, sc, lt, ex)
    tall = L["H"] / L["W"] > 1.5
    v_duo(frame, sc, lt, dur, ex, scale_k=0.7 if tall else 0.62, dy=-0.22 if tall else -0.21, labels=False)
    y = cy + (0.25 if tall else 0.19) * bh
    if prod.get("price"):
        txt = f"{prod['price']} {prod['currency']}"
        sp, ap = pop(lt, 0.35)
        place(frame, cached(("price", txt), lambda: pill(text_block(txt, 64, WHITE), GREEN, 36, 12)),
              cx, y - 0.02 * bh, sp, ap)
        if prod.get("old_price"):
            old = f"بدل {prod['old_price']}"
            place(frame, cached(("old", old), lambda: _strike(text_block(old, 40, NAVY, "Bold"))),
                  cx, y + 0.09 * bh, sp, ap)
        y += 0.17 * bh
    sb, ab = pop(lt, 0.5, 0.45)
    pulse = 1 + 0.05 * max(0.0, math.sin(lt * 7))
    btn = cached(("btn",), lambda: pill(text_block("اطلب دلوقتي", 62, WHITE), ORANGE, 56, 22,
                                        icon=emoji("👇", 64)))
    place(frame, btn, cx, y, sb * pulse, ab)
    badges = []
    if prod.get("home_delivery"):
        badges.append(("توصيل لحد البيت", "🚚"))
    if prod.get("cash_on_delivery"):
        badges.append(("الدفع عند الاستلام", "💵"))
    for i, (text, ic) in enumerate(badges):
        s_, a_ = pop(lt, 0.8 + 0.15 * i)
        bx = cx + (0.24 * bw if len(badges) == 2 else 0) * (1 if i == 0 else -1)
        place(frame, label_sprite(text, 32, icon=ic), bx, y + (0.15 if tall else 0.17) * bh, s_, a_)
    ss, as_ = pop(lt, 1.1)
    store = f"{prod['store_ar']} | {prod['store_latin']}"
    place(frame, cached(("store", store), lambda: text_block(store, 36, NAVY, "Bold")), cx,
          y + (0.25 if tall else 0.3) * bh,
          ss, as_)


def _strike(img):
    d = ImageDraw.Draw(img)
    d.line([(0, img.height * 0.55), (img.width, img.height * 0.45)], fill=(200, 30, 30, 255), width=5)
    return img


VISUALS = {"hook": v_hook, "gift": v_gift, "duo": v_offer, "bag": v_bag, "stand": v_stand,
           "fold": v_fold, "places": v_places, "cta": v_cta}


def caption_sprite(text):
    L = G["L"]
    return cached(("cap", text), lambda: pill(text_block(text, L["cap_size"], NAVY, "Bold", max_w=940),
                                              (255, 255, 255, 240), 36, 18, radius=30))


def render_frame(i):
    t = i / FPS
    L, plan = G["L"], G["plan"]
    frame = G["bg"].copy()
    for b in G["bokeh"]:
        x = (b["x"] + b["vx"] * t) % (L["W"] + 300) - 150
        y = (b["y"] + b["vy"] * t) % (L["H"] + 300) - 150
        place(frame, G["bokeh_sprites"][int(b["r"])], x, y, 1.0, b["a"])
    scenes = plan["scenes"]
    for si, sc in enumerate(scenes):
        if sc["start"] <= t < sc["end"] or (si == len(scenes) - 1 and t >= sc["start"]):
            lt, dur = t - sc["start"], sc["end"] - sc["start"]
            last = si == len(scenes) - 1
            VISUALS[sc["visual"]](frame, sc, lt, dur, scene_exit(lt, dur, last), last)
            break
    for c in plan["captions"]:
        if c["start"] <= t < c["end"]:
            s, a = pop(t, c["start"], 0.22)
            out = clamp((c["end"] - t) / 0.08)
            place(frame, caption_sprite(c["text"]), L["W"] / 2, L["cap_cy"], 0.9 + 0.1 * s, a * out)
            break
    return frame.convert("RGB").tobytes()


# --------------------------------------------------------------------------
# Audio mix + encode
# --------------------------------------------------------------------------

def mix_audio(plan, path: Path):
    n = int((plan["duration"] + 0.5) * SR)
    vo = np.zeros(n, dtype=np.float32)
    for t0, clip in plan["clips"]:
        i = int(t0 * SR)
        vo[i:i + len(clip)] += clip[: n - i]
    raw = path.with_name(path.stem + "_vo_raw.wav")
    _write(raw, vo)
    proc = path.with_name(path.stem + "_vo.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af",
                    "highpass=f=90,equalizer=f=3200:t=q:w=1.2:g=3,"
                    "acompressor=threshold=-20dB:ratio=3:attack=5:release=90:makeup=2",
                    "-ar", str(SR), str(proc)], check=True)
    vo = _read_audio(proc)[:n]
    vo = np.pad(vo, (0, n - len(vo)))
    raw.unlink()
    proc.unlink()

    bed = music.music_bed(n / SR)[:n]
    env = np.convolve(np.abs(vo), np.ones(int(0.12 * SR)) / int(0.12 * SR), mode="same")
    env = np.clip(env / (np.percentile(env[env > 1e-4], 60) if np.any(env > 1e-4) else 1), 0, 1)
    env = np.convolve(env, np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same")
    duck = 1 - 0.6 * env
    mix = vo / (np.max(np.abs(vo)) or 1) * 0.85 + bed * 0.22 * duck
    sfx = music.whoosh()
    for sc in plan["scenes"][1:]:
        i = max(0, int((sc["start"] + 0.1) * SR) - len(sfx) // 2)
        mix[i:i + len(sfx)] += sfx[: n - i] * 0.12
    cta = plan["scenes"][-1]["start"] + 0.5
    p = music.pop()
    i = int(cta * SR)
    mix[i:i + len(p)] += p[: n - i] * 0.15
    _write(path, mix / max(1.0, np.max(np.abs(mix)) / 0.97))


def _write(path, audio):
    pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def srt(plan, path: Path):
    def ts(x):
        ms = int(round(x * 1000))
        return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
    rows = [f"{i}\n{ts(c['start'])} --> {ts(c['end'])}\n{c['text']}\n"
            for i, c in enumerate(plan["captions"], 1)]
    path.write_text("\n".join(rows), encoding="utf-8")


def render(ad_id, fmt, plan, product, workers):
    L = FORMATS[fmt]
    OUT.mkdir(exist_ok=True)
    wav = OUT / f"{ad_id}_{fmt}.wav"
    mix_audio(plan, wav)
    mp4 = OUT / f"{ad_id}_{fmt}.mp4"
    frames = int(math.ceil(plan["duration"] * FPS))
    enc = subprocess.Popen([
        "ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{L['W']}x{L['H']}", "-r", str(FPS), "-i", "-", "-i", str(wav),
        "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
        "-profile:v", "high", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-shortest", "-movflags", "+faststart", str(mp4)],
        stdin=subprocess.PIPE)
    cover_at = int((plan["scenes"][-1]["start"] + 1.6) * FPS)
    visual_plan = {k: v for k, v in plan.items() if k != "clips"}
    with Pool(workers, initializer=_init, initargs=(fmt, visual_plan, product)) as pool:
        for i, buf in enumerate(pool.imap(render_frame, range(frames), chunksize=6)):
            enc.stdin.write(buf)
            if i == min(cover_at, frames - 1):
                Image.frombytes("RGB", (L["W"], L["H"]), buf).save(OUT / f"{ad_id}_{fmt}_cover.jpg",
                                                                  quality=92)
    enc.stdin.close()
    if enc.wait() != 0:
        raise SystemExit(f"ffmpeg failed for {mp4}")
    wav.unlink()
    return mp4


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ads", default="all", help="comma list of ad ids from ads.json")
    ap.add_argument("--formats", default="9x16,4x5,1x1")
    ap.add_argument("--tts", default="piper", choices=["piper", "edge", "azure"])
    ap.add_argument("--voice", default="ar-EG-ShakirNeural", help="edge/azure voice (or ar-EG-SalmaNeural)")
    ap.add_argument("--rate", help="speaking-rate change, e.g. +6%% (default +10%% piper, +6%% neural)")
    ap.add_argument("--workers", type=int, default=os.cpu_count() or 2)
    a = ap.parse_args()

    cfg = json.loads((HERE / "ads.json").read_text(encoding="utf-8"))
    ids = list(cfg["ads"]) if a.ads == "all" else a.ads.split(",")
    rate = a.rate or ("+10%" if a.tts == "piper" else "+6%")
    voice = Voice(a.tts, a.voice if a.tts != "piper" else "kareem", rate)
    ensure_font()
    for ad_id in ids:
        plan = plan_ad(cfg["ads"][ad_id], voice)
        OUT.mkdir(exist_ok=True)
        srt(plan, OUT / f"{ad_id}.ar_AR.srt")
        for fmt in a.formats.split(","):
            mp4 = render(ad_id, fmt, plan, cfg["product"], a.workers)
            print(f"{mp4.name}: {plan['duration']:.1f}s")


if __name__ == "__main__":
    main()
