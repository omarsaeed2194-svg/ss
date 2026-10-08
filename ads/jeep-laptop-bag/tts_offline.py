"""Offline Egyptian-Arabic voice-over with a Piper (VITS) Arabic voice.

The script is written in an Egyptian "Franco" transliteration so it is said
the way Cairo says it, not the way MSA spelling suggests. It is converted to
the IPA symbols Piper voices are trained on, with Cairene stress, and run
through onnxruntime. No network or espeak needed at synthesis time.

This is a fallback/guide voice: for the published ad prefer a licensed
Egyptian neural voice (build.py --tts edge|azure).

Transliteration (case-sensitive):
  vowels a i u e o, long aa ii uu ee oo
  2=ʔ 3=ʕ 7=ħ kh=χ gh=ɣ sh=ʃ y=j J=ʒ (English j)  S T D Z = emphatic s t d z
  doubled consonants are geminated; ' forces stress on the next syllable;
  - joins clitics (fi-lmaktab) and is ignored.
"""

import json
import re
import unicodedata
import wave
from pathlib import Path

import numpy as np
import onnxruntime as ort

_MULTI = [("sh", "ʃ"), ("kh", "χ"), ("gh", "ɣ"),
          ("aa", "aː"), ("ii", "iː"), ("uu", "uː"), ("ee", "eː"), ("oo", "oː")]
_SINGLE = {
    "a": "a", "i": "i", "u": "u", "e": "e", "o": "o",
    "b": "b", "t": "t", "d": "d", "r": "r", "z": "z", "s": "s",
    "k": "k", "l": "l", "m": "m", "n": "n", "h": "h", "w": "w", "f": "f",
    "y": "j", "J": "ʒ", "v": "v", "p": "p", "q": "q",
    # The Arabic Piper voices render a plain /ɡ/ weakly (heard as k/h), so the
    # Egyptian g is voiced as dʒ: less Cairene, much more intelligible.
    "g": "dʒ",
    "2": "ʔ", "3": "ʕ", "7": "ħ",
    "S": "s̪", "T": "t̪", "D": "dˤ", "Z": "zˤ",
}
_VOWELS = {"a", "i", "u", "e", "o", "aː", "iː", "uː", "eː", "oː"}
_UNSTRESSED = {"fi", "wi", "bi", "li", "ya", "ma", "fa", "il", "da", "di"}


def _units(word: str):
    units, i = [], 0
    while i < len(word):
        if word[i] == "'":
            units.append("'")
            i += 1
            continue
        for src, dst in _MULTI:
            if word.startswith(src, i):
                units.append(dst)
                i += len(src)
                break
        else:
            if word[i] in _SINGLE:
                units.append(_SINGLE[word[i]])
            i += 1
    return units


def _stress(units):
    """Approximate Cairene stress: final syllable if superheavy, else penult."""
    if "'" in units:
        k = units.index("'")
        head, rest = units[:k], units[k + 1:]
        for j, u in enumerate(rest):
            if u in _VOWELS:
                return head + rest[:j] + ["ˈ"] + rest[j:]
        return head + rest
    vidx = [j for j, u in enumerate(units) if u in _VOWELS]
    if not vidx:
        return units
    target = vidx[-1]
    if len(vidx) >= 2:
        last = vidx[-1]
        coda = len(units) - last - 1
        superheavy = coda >= 2 or (units[last].endswith("ː") and coda >= 1)
        target = last if superheavy else vidx[-2]
    return units[:target] + ["ˈ"] + units[target:]


def franco_to_ipa(text: str) -> str:
    out = []
    for token in text.split():
        m = re.match(r"^(.*?)([,.!?:]*)$", token)
        word, punct = m.group(1).replace("-", ""), m.group(2)[:1].replace(":", ",")
        units = _units(word)
        if word.lower() in _UNSTRESSED:
            units = [u for u in units if u != "'"]
        else:
            units = _stress(units)
        out.append("".join(units) + punct)
    return " ".join(out)


class PiperVoice:
    def __init__(self, model_path: str):
        cfg = json.loads(Path(str(model_path) + ".json").read_text())
        self.id_map = cfg["phoneme_id_map"]
        self.sample_rate = cfg["audio"]["sample_rate"]
        inf = cfg.get("inference", {})
        self.noise_scale = inf.get("noise_scale", 0.667)
        self.noise_w = inf.get("noise_w", 0.8)
        opts = ort.SessionOptions()
        opts.log_severity_level = 3
        self.session = ort.InferenceSession(str(model_path), opts, providers=["CPUExecutionProvider"])

    def _ids(self, phonemes: str):
        pad, bos, eos = self.id_map["_"][0], self.id_map["^"][0], self.id_map["$"][0]
        ids = [bos, pad]
        for ch in unicodedata.normalize("NFD", phonemes):
            if ch in self.id_map:
                ids.extend([self.id_map[ch][0], pad])
        ids.append(eos)
        return ids

    def synth_phonemes(self, phonemes: str, length_scale: float = 1.0) -> np.ndarray:
        ids = np.array([self._ids(phonemes)], dtype=np.int64)
        lens = np.array([ids.shape[1]], dtype=np.int64)
        scales = np.array([self.noise_scale, length_scale, self.noise_w], dtype=np.float32)
        audio = self.session.run(None, {"input": ids, "input_lengths": lens, "scales": scales})[0]
        return audio.squeeze().astype(np.float32)

    def synth(self, franco: str, length_scale: float = 1.0) -> np.ndarray:
        """Synthesize one caption line; the voice clips the last phoneme
        unless the chunk ends on terminal punctuation, so force one."""
        text = franco.strip()
        text = re.sub(r"[,:]$", ".", text)
        if not re.search(r"[.!?]$", text):
            text += "."
        sentences = [s for s in re.split(r"(?<=[.!?])\s+", text) if s]
        gap = np.zeros(int(self.sample_rate * 0.15), dtype=np.float32)
        parts = []
        for s in sentences:
            parts += [self.synth_phonemes(franco_to_ipa(s), length_scale), gap]
        return np.concatenate(parts[:-1])


def write_wav(path, audio: np.ndarray, sample_rate: int) -> None:
    peak = float(np.max(np.abs(audio))) or 1.0
    pcm = (audio / peak * 0.95 * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sample_rate)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(description="Egyptian Franco text -> wav")
    ap.add_argument("model", help="path to a Piper .onnx voice (with .onnx.json beside it)")
    ap.add_argument("text")
    ap.add_argument("out")
    ap.add_argument("--speed", type=float, default=1.0, help=">1 is faster")
    a = ap.parse_args()
    print(franco_to_ipa(a.text))
    v = PiperVoice(a.model)
    write_wav(a.out, v.synth(a.text, 1.0 / a.speed), v.sample_rate)
