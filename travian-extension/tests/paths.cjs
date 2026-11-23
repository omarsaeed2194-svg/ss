// 2.11.2: Travian's new page addresses (/building…, and whatever replaced
// /dorf1.php and /dorf2.php) are read like the old ones; newer upgrade
// buttons (textButtonV2) are found.
const path = require('path');
const fs = require('fs');
const { JSDOM } = require(path.join(process.env.JSDOM_DIR || '/tmp/claude-0/-home-user-ss/21855661-2e08-5d01-a58a-b58743978a7e/scratchpad/jsdom-env', 'node_modules/jsdom'));
const EXT = process.env.EXT || path.join(__dirname, '..');
const P = require(path.join(EXT, 'src/parser.js'));
const FX = (process.env.FX || '/home/user/vinaghost/fx/MainCore.Test/Parsers') + '/'; // fixtures: git archive 8d1ccef MainCore.Test/Parsers of vinaghost/travianbotsharp
let fails = 0;
const eq = (name, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${JSON.stringify(got)}${ok ? '' : ` (want ${JSON.stringify(want)})`}`); };
const H = 'https://ts30.x3.international.travian.com';
const page = (file, u, html) => P.parsePage(new JSDOM(html || fs.readFileSync(FX + file, 'utf8'), { url: H + u }).window.document, new URL(H + u));

let r = page('Upgrade/CroplandConstructed.html', '/building?id=26');
eq('/building: a building page, upgrade found', [r.type, !!r.buildPage, r.buildPage && r.buildPage.canUpgrade, r.buildPage && r.buildPage.nextLevel], ['build', true, true, 2]);
r = page('TrainTroop/BarrackPage.html', '/building?id=19');
eq('/building: barracks units', r.buildPage.trainable.map((u) => u.field), ['t1']);
r = page('BuildingTab/NewBuilding.html', '/building?id=24&category=1');
eq('/building: empty site contracts', r.buildPage.newBuildings.length > 5, true);
r = page('BuildingLayout/Resources.html', '/dorf1');
eq('/dorf1 (no .php): fields', [r.type, r.fields.length], ['dorf1', 18]);
r = page('BuildingLayout/Resources.html', '/village/resources');
eq('any other new address with resource fields: dorf1', [r.type, r.fields.length], ['dorf1', 18]);
r = page('BuildingLayout/Buildings.html', '/village/buildings');
eq('… with building sites: dorf2', [r.type, r.buildings.length > 10], ['dorf2', true]);
r = page('BuildingLayout/Buildings.html', '/karte.php');
eq('an old address keeps its own type (not read as dorf2)', r.type, 'other');
r = page('BuildingLayout/Buildings.html', '/hero/adventures');
eq('hero pages stay hero pages', r.type, 'adventures');
const rally = fs.readFileSync(FX + 'BuildingLayout/Buildings.html', 'utf8').replace('<div id="contentOuterContainer" class="">', '<div id="contentOuterContainer" class=""><div id="content" class="build"><div id="build" class="gid16 level10"><div id="rallyPointFarmList"></div></div></div>');
eq('/building?tt=99&id=16: the farm lists', page(null, '/building?tt=99&id=16', rally).type, 'farmlist');
eq('/building?tt=2&id=39: send troops', page(null, '/building?tt=2&id=39', rally).type, 'send');
eq('/building?tt=1&id=39: the rally point list', page(null, '/building?tt=1&id=39', rally).type, 'rally');
// A newer upgrade button: textButtonV2, green, not marked "build".
const v2 = fs.readFileSync(FX + 'Upgrade/CroplandConstructed.html', 'utf8')
  .replace(/<button([^>]*?)class="textButtonV1 green build"/, '<button$1class="textButtonV2 buttonFramed rectangle withText green"');
const d = new JSDOM(v2, { url: H + '/building?id=5' }).window.document;
const b = P.upgradeButton(d);
eq('textButtonV2 upgrade button found (not the video one)', !!b && !/video/.test(b.className), true);
console.log(fails ? `FAILED ${fails}` : 'ALL OK');
process.exit(fails ? 1 : 0);
