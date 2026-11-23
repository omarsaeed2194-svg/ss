// Every text key used in the code exists in English and Arabic.
// Run from travian-extension/: node tests/keys.mjs
import fs from 'fs';
const src = fs.readFileSync('src/i18n.js', 'utf8');
const blocks = { en: src.slice(src.indexOf('  en: {'), src.indexOf('  ar: {')), ar: src.slice(src.indexOf('  ar: {')) };
const keysOf = (b) => new Set([...b.matchAll(/^\s+'([\w.]+)':/gm), ...b.matchAll(/,\s'([\w.]+)':/g)].map((m) => m[1]));
const en = keysOf(blocks.en), ar = keysOf(blocks.ar);
const used = new Set();
for (const f of [...fs.readdirSync('src').map((x) => 'src/' + x), ...fs.readdirSync('dashboard').map((x) => 'dashboard/' + x), ...fs.readdirSync('popup').map((x) => 'popup/' + x)].filter((f) => /\.(js|html)$/.test(f) && f !== 'src/i18n.js')) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/\bt\(\s*'([\w.]+)'/g)) used.add(m[1]);
  for (const m of s.matchAll(/data-i18n(?:-html|-title)?="([\w.]+)"/g)) used.add(m[1]);
}
const missing = [...used].filter((k) => !en.has(k) || !ar.has(k));
const enOnly = [...en].filter((k) => !ar.has(k)), arOnly = [...ar].filter((k) => !en.has(k));
console.log('used:', used.size, 'en:', en.size, 'ar:', ar.size);
console.log('missing:', missing, 'en-only:', enOnly, 'ar-only:', arOnly);
process.exit(missing.length || enOnly.length || arOnly.length ? 1 : 0);
