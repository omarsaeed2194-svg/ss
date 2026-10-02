#!/usr/bin/env python3
"""Build the Clout Chaser APK without the Android SDK.

Writes the binary AndroidManifest.xml and a minimal resources.arsc (launcher icon) by hand,
then zips them with classes.dex and the game files. Signing is done by build.sh (jarsigner).

usage: apkbuild.py <classes.dex> <www dir> <icon dir> <out.apk>
       apkbuild.py --manifest-txt <out.txt>   (the same manifest as a line tree, for the AAB build)
"""
import struct
import sys
import zipfile
from pathlib import Path

ANDROID_NS = 'http://schemas.android.com/apk/res/android'
# android.R.attr ids (from the platform jar)
ATTR = {
    'theme': 0x01010000, 'label': 0x01010001, 'icon': 0x01010002, 'name': 0x01010003,
    'exported': 0x01010010, 'configChanges': 0x0101001F, 'minSdkVersion': 0x0101020C,
    'versionCode': 0x0101021B, 'versionName': 0x0101021C, 'windowSoftInputMode': 0x0101022B,
    'targetSdkVersion': 0x01010270, 'allowBackup': 0x01010280, 'hardwareAccelerated': 0x010102D3,
    'roundIcon': 0x0101052C,
}
T_REF, T_STRING, T_INT, T_HEX, T_BOOL = 0x01, 0x03, 0x10, 0x11, 0x12
THEME_MATERIAL_NOACTIONBAR = 16974382
ICON_ID = 0x7F010000  # mipmap/ic_launcher in our resources.arsc

VERSION_CODE, VERSION_NAME = 8, "2.1"
MANIFEST = ('manifest', [(None, 'package', T_STRING, 'com.cloutchaser.game'),
                         ('a', 'versionCode', T_INT, VERSION_CODE), ('a', 'versionName', T_STRING, VERSION_NAME)], [
    ('uses-sdk', [('a', 'minSdkVersion', T_INT, 24), ('a', 'targetSdkVersion', T_INT, 35)], []),
    ('uses-permission', [('a', 'name', T_STRING, 'android.permission.INTERNET')], []),
    ('application', [('a', 'label', T_STRING, 'Clout Chaser'), ('a', 'icon', T_REF, ICON_ID), ('a', 'roundIcon', T_REF, ICON_ID),
                     ('a', 'allowBackup', T_BOOL, True), ('a', 'hardwareAccelerated', T_BOOL, True),
                     ('a', 'theme', T_REF, THEME_MATERIAL_NOACTIONBAR)], [
        ('activity', [('a', 'name', T_STRING, 'com.cloutchaser.game.MainActivity'), ('a', 'exported', T_BOOL, True),
                      ('a', 'configChanges', T_HEX, 0x80 | 0x20 | 0x100 | 0x200 | 0x400),  # orientation|keyboardHidden|screenLayout|uiMode|screenSize
                      ('a', 'windowSoftInputMode', T_HEX, 0x10)], [  # adjustResize
            ('intent-filter', [], [
                ('action', [('a', 'name', T_STRING, 'android.intent.action.MAIN')], []),
                ('category', [('a', 'name', T_STRING, 'android.intent.category.LAUNCHER')], []),
            ]),
        ]),
    ]),
])


def chunk(ctype, header_extra, body):
    hsize = 8 + len(header_extra)
    return struct.pack('<HHI', ctype, hsize, hsize + len(body)) + header_extra + body


def string_pool(strings, utf8=False):
    offs, data = [], b''
    for s in strings:
        offs.append(len(data))
        if utf8:
            b = s.encode('utf-8')
            assert len(s) < 128 and len(b) < 128
            data += bytes([len(s), len(b)]) + b + b'\0'
        else:
            u = s.encode('utf-16-le')
            data += struct.pack('<H', len(u) // 2) + u + b'\0\0'
    while len(data) % 4:
        data += b'\0'
    start = 28 + 4 * len(strings)
    hdr = struct.pack('<IIIII', len(strings), 0, 0x100 if utf8 else 0, start, 0)
    return chunk(0x0001, hdr, b''.join(struct.pack('<I', o) for o in offs) + data)


def manifest_axml():
    # android: attribute names go first so the resource map lines up with string indexes
    attrs, others = [], []
    def walk(node):
        tag, at, kids = node
        for ns, name, typ, val in at:
            (attrs if ns else others).append(name)
            if typ == T_STRING:
                others.append(val)
        others.append(tag)
        for k in kids:
            walk(k)
    walk(MANIFEST)
    strings = []
    for s in attrs:
        if s not in strings:
            strings.append(s)
    n_res = len(strings)
    for s in ['android', ANDROID_NS] + others:
        if s not in strings:
            strings.append(s)
    idx = strings.index
    out = string_pool(strings)
    out += chunk(0x0180, b'', b''.join(struct.pack('<I', ATTR[s]) for s in strings[:n_res]))
    line = [1]
    def node_hdr():
        line[0] += 1
        return struct.pack('<Ii', line[0], -1)
    out += chunk(0x0100, node_hdr(), struct.pack('<II', idx('android'), idx(ANDROID_NS)))
    def emit(node):
        nonlocal out
        tag, at, kids = node
        # attributes must be sorted by resource id
        at = sorted(at, key=lambda a: ATTR.get(a[1], 0) if a[0] else 0)
        body = struct.pack('<iiHHHHHH', -1, idx(tag), 20, 20, len(at), 0, 0, 0)
        for ns, name, typ, val in at:
            nsi = idx(ANDROID_NS) if ns else -1
            if typ == T_STRING:
                raw, data = idx(val), idx(val)
            elif typ == T_BOOL:
                raw, data = -1, 0xFFFFFFFF if val else 0
            else:
                raw, data = -1, val
            body += struct.pack('<iiiHBBI', nsi, idx(name), raw, 8, 0, typ, data)
        out += chunk(0x0102, node_hdr(), body)
        for k in kids:
            emit(k)
        out += chunk(0x0103, node_hdr(), struct.pack('<ii', -1, idx(tag)))
    emit(MANIFEST)
    out += chunk(0x0101, node_hdr(), struct.pack('<II', idx('android'), idx(ANDROID_NS)))
    return chunk(0x0003, b'', out)


DENSITIES = [('mdpi', 160, 48), ('hdpi', 240, 72), ('xhdpi', 320, 96), ('xxhdpi', 480, 144), ('xxxhdpi', 640, 192)]


def resources_arsc():
    """One resource: mipmap/ic_launcher, with a PNG per screen density."""
    paths = [f'res/mipmap-{d}-v4/ic_launcher.png' for d, _, _ in DENSITIES]
    gpool = string_pool(paths, utf8=True)
    type_pool = string_pool(['mipmap'])
    key_pool = string_pool(['ic_launcher'])
    # typeSpec: one entry, varies by density (CONFIG_DENSITY = 0x0100)
    spec = chunk(0x0202, struct.pack('<BBHI', 1, 0, 0, 1), struct.pack('<I', 0x0100))
    types = b''
    for i, (_, dpi, _) in enumerate(DENSITIES):
        cfg = bytearray(64)
        struct.pack_into('<I', cfg, 0, 64)        # size
        struct.pack_into('<H', cfg, 14, dpi)      # density
        struct.pack_into('<H', cfg, 24, 4)        # sdkVersion (the -v4 qualifier)
        entry = struct.pack('<HHI', 8, 0, 0) + struct.pack('<HBBI', 8, 0, T_STRING, i)
        hdr = struct.pack('<BBHII', 1, 0, 0, 1, 20 + 64 + 4) + bytes(cfg)
        types += chunk(0x0201, hdr, struct.pack('<I', 0) + entry)
    name = 'com.cloutchaser.game'.encode('utf-16-le').ljust(256, b'\0')
    pkg_hdr_len = 8 + 4 + 256 + 4 * 5
    type_off = pkg_hdr_len
    key_off = type_off + len(type_pool)
    pkg_hdr = struct.pack('<I', 0x7F) + name + struct.pack('<IIIII', type_off, 1, key_off, 1, 0)
    pkg = chunk(0x0200, pkg_hdr, type_pool + key_pool + spec + types)
    return chunk(0x0002, struct.pack('<I', 1), gpool + pkg)


def manifest_txt(path):
    names = {T_STRING: 'str', T_INT: 'int', T_HEX: 'hex', T_BOOL: 'bool', T_REF: 'ref'}
    out = []
    def walk(node):
        tag, at, kids = node
        out.append(f'start\t{tag}')
        for ns, name, typ, val in at:
            out.append('\t'.join(['attr', 'a' if ns else '-', name, str(ATTR.get(name, 0) if ns else 0), names[typ], str(val).lower() if typ == T_BOOL else str(val)]))
        for k in kids:
            walk(k)
        out.append(f'end\t{tag}')
    walk(MANIFEST)
    Path(path).write_text('\n'.join(out) + '\n')


def main():
    if sys.argv[1] == '--manifest-txt':
        return manifest_txt(sys.argv[2])
    dex, www, icons, out = map(Path, sys.argv[1:5])
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('AndroidManifest.xml', manifest_axml())
        z.writestr(zipfile.ZipInfo('resources.arsc'), resources_arsc(), compress_type=zipfile.ZIP_STORED)
        z.write(dex, 'classes.dex')
        for d, _, px in DENSITIES:
            z.write(icons / f'ic_launcher_{px}.png', f'res/mipmap-{d}-v4/ic_launcher.png', compress_type=zipfile.ZIP_STORED)
        for f in sorted(www.rglob('*')):
            if f.is_file():
                z.write(f, 'assets/www/' + f.relative_to(www).as_posix())
    print(f'wrote {out}')


if __name__ == '__main__':
    main()
