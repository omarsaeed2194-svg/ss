#!/usr/bin/env python3
"""Photo pack tool.

    python3 tools/photos.py              rebuild images/manifest.js from the files that exist
    python3 tools/photos.py --optimize   shrink and compress the photos first (needs Pillow), then rebuild

Name each file after what it replaces: images/scenes/mansion.jpg, images/pets/cat.png,
images/npcs/aurora.jpg (see images/DOWNLOAD.md for every name). Scenes become 1280px JPEGs,
pets stay PNG with transparency (max 600px), portraits become 400x400 JPEGs.
Portraits are only ever shown for the game's original characters, never for parodies of real people."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'images'
EXT = ('.jpg', '.jpeg', '.png', '.webp')


def optimize():
    from PIL import Image, ImageOps
    saved = 0
    for kind in ('scenes', 'pets', 'npcs'):
        for f in sorted((ROOT / kind).glob('*')):
            if f.suffix.lower() not in EXT:
                continue
            before = f.stat().st_size
            im = ImageOps.exif_transpose(Image.open(f))
            if kind == 'pets':
                im = im.convert('RGBA')
                im.thumbnail((600, 600))
                bbox = im.getchannel('A').getbbox()  # trim empty space around the animal
                if bbox:
                    im = im.crop(bbox)
                out = f.with_suffix('.png')
                im.save(out, optimize=True)
            else:
                im = im.convert('RGB')
                if kind == 'scenes':
                    im.thumbnail((1280, 1280))
                else:
                    im = ImageOps.fit(im, (400, 400))
                out = f.with_suffix('.jpg')
                im.save(out, quality=80 if kind == 'scenes' else 84, optimize=True, progressive=True)
            if out != f:
                f.unlink()
            saved += before - out.stat().st_size
            print(f'{kind}/{out.name}: {before // 1024} KB -> {out.stat().st_size // 1024} KB')
    print(f'saved {saved // 1024} KB')


def manifest():
    pack = {}
    for kind in ('scenes', 'pets', 'npcs'):
        pack[kind] = {f.stem: f'images/{kind}/{f.name}' for f in sorted((ROOT / kind).glob('*')) if f.suffix.lower() in EXT}
    head = (ROOT / 'manifest.js').read_text().split('window.PHOTO_PACK')[0]
    (ROOT / 'manifest.js').write_text(head + 'window.PHOTO_PACK = ' + json.dumps(pack, indent=1) + ';\n')
    print({k: len(v) for k, v in pack.items()})


if __name__ == '__main__':
    if '--optimize' in sys.argv:
        optimize()
    manifest()
