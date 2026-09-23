"""Download the Google Fonts used by the video into ./fonts and write fonts.css
so the headless render has no network dependency on font loading."""
import re, urllib.request, urllib.parse, pathlib

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
GREETINGS = "你好こんにちは안녕하세요नमस्तेשלוםสวัสดีΓειασου"
FAMILIES = [
    "family=Montserrat:wght@400;500;600;700;800",
    "family=Cairo:wght@400;600;700;800",
    "family=Noto+Sans+SC:wght@700",
    "family=Noto+Sans+JP:wght@700",
    "family=Noto+Sans+KR:wght@700",
    "family=Noto+Sans+Devanagari:wght@700",
    "family=Noto+Sans+Hebrew:wght@700",
    "family=Noto+Sans+Thai:wght@700",
    "family=Noto+Sans:wght@700",
]
here = pathlib.Path(__file__).parent
out = here / "fonts"
out.mkdir(exist_ok=True)

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA})).read()

css_all = []
for fam in FAMILIES:
    url = "https://fonts.googleapis.com/css2?" + fam + "&display=block"
    if "SC" in fam or "JP" in fam or "KR" in fam:
        url += "&text=" + urllib.parse.quote(GREETINGS)
    css = get(url).decode()
    for i, u in enumerate(re.findall(r"url\((https://[^)]+)\)", css)):
        name = re.sub(r"\W+", "_", fam.split("=")[1].split(":")[0]) + f"_{abs(hash(u)) % 10**8}.woff2"
        (out / name).write_bytes(get(u))
        css = css.replace(u, "fonts/" + name)
    css_all.append(css)
(here / "fonts.css").write_text("\n".join(css_all))
print("fonts:", len(list(out.iterdir())))
