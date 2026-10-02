#!/usr/bin/env bash
# Build Clout Chaser for Android. Needs a JDK (17+) and Python 3; no Android SDK required.
# The platform jar and the dex compiler are downloaded from Maven Central into .tools/ on first run.
#   ./build.sh            -> dist/clout-chaser.apk (sideload) and dist/clout-chaser.aab (Google Play)
# Signing: set KEYSTORE, KS_PASS and KS_ALIAS to your release key. Without them a throwaway key in .tools/ is used,
# which is fine for testing but cannot publish updates to an app signed with another key.
set -euo pipefail
cd "$(dirname "$0")"
GAME=..
TOOLS=.tools
BUILD=build
mkdir -p "$TOOLS" "$BUILD" dist

fetch() { [ -s "$TOOLS/$1" ] || curl -fsSL -o "$TOOLS/$1" "$2"; }
fetch android-all.jar https://repo1.maven.org/maven2/org/robolectric/android-all/9-robolectric-4913185-2/android-all-9-robolectric-4913185-2.jar
fetch dx.jar https://repo1.maven.org/maven2/com/jakewharton/android/repackaged/dalvik-dx/16.0.1/dalvik-dx-16.0.1.jar
fetch bundletool.jar https://github.com/google/bundletool/releases/download/1.17.2/bundletool-all-1.17.2.jar

echo "1/6 compiling the WebView wrapper"
rm -rf "$BUILD/classes" && mkdir -p "$BUILD/classes"
javac -nowarn --release 8 -cp "$TOOLS/android-all.jar" -d "$BUILD/classes" $(find src -name '*.java') 2>&1 | grep -v "^warning\|bootstrap class path\|^1 warning" || true

echo "2/6 converting to Dalvik bytecode"
java -cp "$TOOLS/dx.jar" com.android.dx.command.Main --dex --min-sdk-version=24 --output="$BUILD/classes.dex" "$BUILD/classes"

echo "3/6 packing the game"
rm -rf "$BUILD/www" && mkdir -p "$BUILD/www"
cp "$GAME"/*.js "$BUILD/www/"
{ printf '<!doctype html>\n<html lang="en">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<script>window.STORE_BUILD = true;</script>\n'; cat "$GAME/index.html"; } > "$BUILD/www/index.html"

echo "4/6 preparing the signing key"
KS=${KEYSTORE:-$TOOLS/clout-chaser.jks}
ALIAS=${KS_ALIAS:-clout}
PASS=${KS_PASS:-cloutchaser}
if [ ! -s "$KS" ]; then
  keytool -genkeypair -keystore "$KS" -storepass "$PASS" -keypass "$PASS" -alias "$ALIAS" \
    -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Clout Chaser, O=Clout Chaser" >/dev/null 2>&1
fi

echo "5/6 building the Play Store bundle (AAB)"
rm -rf "$BUILD/aab" && mkdir -p "$BUILD/aab/base/dex" "$BUILD/aab/base/assets" "$BUILD/tools"
javac -nowarn -cp "$TOOLS/bundletool.jar" -d "$BUILD/tools" tools/AabModule.java 2>&1 | grep -v "^warning\|^Note\|JAVA_TOOL" || true
python3 apkbuild.py --manifest-txt "$BUILD/manifest.txt"
java -cp "$TOOLS/bundletool.jar:$BUILD/tools" AabModule "$BUILD/manifest.txt" "$BUILD/aab/base"
cp "$BUILD/classes.dex" "$BUILD/aab/base/dex/"
cp -r "$BUILD/www" "$BUILD/aab/base/assets/www"
for d in mdpi:48 hdpi:72 xhdpi:96 xxhdpi:144 xxxhdpi:192; do mkdir -p "$BUILD/aab/base/res/mipmap-${d%%:*}-v4"; cp "icons/ic_launcher_${d##*:}.png" "$BUILD/aab/base/res/mipmap-${d%%:*}-v4/ic_launcher.png"; done
(cd "$BUILD/aab/base" && rm -f ../base.zip && zip -qr ../base.zip .)
rm -f dist/clout-chaser.aab
java -jar "$TOOLS/bundletool.jar" build-bundle --modules="$BUILD/aab/base.zip" --output=dist/clout-chaser.aab
jarsigner -keystore "$KS" -storepass "$PASS" -sigalg SHA256withRSA -digestalg SHA-256 dist/clout-chaser.aab "$ALIAS" >/dev/null

echo "6/6 building the phone APK from the bundle (aligned and signed by bundletool)"
rm -f "$BUILD/universal.apks" dist/clout-chaser.apk
java -jar "$TOOLS/bundletool.jar" build-apks --bundle=dist/clout-chaser.aab --output="$BUILD/universal.apks" --mode=universal \
  --ks="$KS" --ks-pass=pass:"$PASS" --ks-key-alias="$ALIAS" --key-pass=pass:"$PASS"
unzip -p "$BUILD/universal.apks" universal.apk > dist/clout-chaser.apk
ls -la dist/
