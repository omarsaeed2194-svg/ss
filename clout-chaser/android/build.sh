#!/usr/bin/env bash
# Build Clout Chaser as an Android APK. Needs a JDK (17+) and Python 3; no Android SDK required.
# The platform jar and the dex compiler are downloaded from Maven Central into .tools/ on first run.
#   ./build.sh            -> dist/clout-chaser.apk
set -euo pipefail
cd "$(dirname "$0")"
GAME=..
TOOLS=.tools
BUILD=build
mkdir -p "$TOOLS" "$BUILD" dist

fetch() { [ -s "$TOOLS/$1" ] || curl -fsSL -o "$TOOLS/$1" "$2"; }
fetch android-all.jar https://repo1.maven.org/maven2/org/robolectric/android-all/9-robolectric-4913185-2/android-all-9-robolectric-4913185-2.jar
fetch dx.jar https://repo1.maven.org/maven2/com/jakewharton/android/repackaged/dalvik-dx/16.0.1/dalvik-dx-16.0.1.jar

echo "1/5 compiling the WebView wrapper"
rm -rf "$BUILD/classes" && mkdir -p "$BUILD/classes"
javac -nowarn --release 8 -cp "$TOOLS/android-all.jar" -d "$BUILD/classes" $(find src -name '*.java') 2>&1 | grep -v "^warning\|bootstrap class path\|^1 warning" || true

echo "2/5 converting to Dalvik bytecode"
java -cp "$TOOLS/dx.jar" com.android.dx.command.Main --dex --min-sdk-version=24 --output="$BUILD/classes.dex" "$BUILD/classes"

echo "3/5 packing the game"
rm -rf "$BUILD/www" && mkdir -p "$BUILD/www"
cp "$GAME"/*.js "$BUILD/www/"
{ printf '<!doctype html>\n<html lang="en">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'; cat "$GAME/index.html"; } > "$BUILD/www/index.html"

echo "4/5 building the APK"
python3 apkbuild.py "$BUILD/classes.dex" "$BUILD/www" icons "$BUILD/unsigned.apk"

echo "5/5 signing"
KS=${KEYSTORE:-$TOOLS/clout-chaser.jks}
if [ ! -s "$KS" ]; then
  keytool -genkeypair -keystore "$KS" -storepass ${KS_PASS:-cloutchaser} -keypass ${KS_PASS:-cloutchaser} -alias clout \
    -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Clout Chaser, O=Clout Chaser" >/dev/null 2>&1
fi
cp "$BUILD/unsigned.apk" dist/clout-chaser.apk
jarsigner -keystore "$KS" -storepass ${KS_PASS:-cloutchaser} -sigalg SHA256withRSA -digestalg SHA-256 dist/clout-chaser.apk clout >/dev/null
P12="$TOOLS/clout-chaser.p12"
[ -s "$P12" ] || keytool -importkeystore -srckeystore "$KS" -srcstorepass ${KS_PASS:-cloutchaser} -destkeystore "$P12" -deststoretype PKCS12 -deststorepass ${KS_PASS:-cloutchaser} >/dev/null 2>&1
python3 sign_v2.py dist/clout-chaser.apk "$P12" ${KS_PASS:-cloutchaser}
ls -la dist/clout-chaser.apk
