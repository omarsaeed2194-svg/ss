#!/usr/bin/env python3
"""Add an APK Signature Scheme v2 block to an APK (after v1 jarsigner signing).

usage: sign_v2.py <apk> <keystore.p12> <password>
Needs the `cryptography` package.
"""
import hashlib
import struct
import sys

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import pkcs12

RSA_PKCS1_SHA256 = 0x0103
V2_ID = 0x7109871A
CHUNK = 1 << 20


def lp(b):  # length-prefixed
    return struct.pack('<I', len(b)) + b


def find_eocd(data):
    i = data.rfind(b'PK\x05\x06')
    if i < 0:
        raise SystemExit('no EOCD')
    return i


def digest(sections):
    chunks = []
    for s in sections:
        for o in range(0, len(s), CHUNK):
            part = s[o:o + CHUNK]
            chunks.append(hashlib.sha256(b'\xa5' + struct.pack('<I', len(part)) + part).digest())
    return hashlib.sha256(b'\x5a' + struct.pack('<I', len(chunks)) + b''.join(chunks)).digest()


def main():
    apk, ks, pw = sys.argv[1], sys.argv[2], sys.argv[3].encode()
    key, cert, _ = pkcs12.load_key_and_certificates(open(ks, 'rb').read(), pw)
    data = open(apk, 'rb').read()
    eocd_off = find_eocd(data)
    cd_off, = struct.unpack_from('<I', data, eocd_off + 16)
    entries, cd, eocd = data[:cd_off], data[cd_off:eocd_off], bytearray(data[eocd_off:])
    # the digest covers the EOCD with the central-directory offset pointing at the signing block
    dg = digest([entries, cd, bytes(eocd)])
    cert_der = cert.public_bytes(serialization.Encoding.DER)
    signed_data = lp(lp(struct.pack('<I', RSA_PKCS1_SHA256) + lp(dg))) + lp(lp(cert_der)) + lp(b'')
    sig = key.sign(signed_data, padding.PKCS1v15(), hashes.SHA256())
    pub = key.public_key().public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)
    signer = lp(signed_data) + lp(lp(struct.pack('<I', RSA_PKCS1_SHA256) + lp(sig))) + lp(pub)
    value = lp(lp(signer))
    pair = struct.pack('<Q', 4 + len(value)) + struct.pack('<I', V2_ID) + value
    size = len(pair) + 8 + 16
    block = struct.pack('<Q', size) + pair + struct.pack('<Q', size) + b'APK Sig Block 42'
    struct.pack_into('<I', eocd, 16, cd_off + len(block))
    open(apk, 'wb').write(entries + block + cd + bytes(eocd))
    print('v2 signed')


if __name__ == '__main__':
    main()
