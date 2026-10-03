#!/usr/bin/env python3
"""Rebuild images/manifest.js from the files in images/scenes, images/pets and images/npcs.

Name each file after what it replaces, e.g. images/scenes/mansion.jpg, images/pets/cat.jpg,
images/npcs/aurora.jpg. Supported: .jpg .jpeg .png .webp. Keep scenes about 1200x750 and under 300 KB.
Portraits are only used for the game's original characters, never for parodies of real people."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent / 'images'
pack = {}
for kind in ('scenes', 'pets', 'npcs'):
    pack[kind] = {f.stem: f'images/{kind}/{f.name}' for f in sorted((root / kind).glob('*')) if f.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp')}
head = (root / 'manifest.js').read_text().split('window.PHOTO_PACK')[0]
(root / 'manifest.js').write_text(head + 'window.PHOTO_PACK = ' + json.dumps(pack, indent=1) + ';\n')
print({k: len(v) for k, v in pack.items()})
