#!/usr/bin/env sh
# Rebuilds jeep-ad-30s.mp4. Offer details are optional:
#   PRICE=499 OLD=699 COD=1 ./build.sh
set -e
cd "$(dirname "$0")"
python3 music.py music_raw.wav
ffmpeg -loglevel error -y -i music_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=9 -ar 44100 music.wav
node render.mjs --audio=music.wav --out=jeep-ad-30s.mp4 ${PRICE:+--price=$PRICE} ${OLD:+--old=$OLD} ${COD:+--cod=$COD}
rm -f music_raw.wav music.wav
