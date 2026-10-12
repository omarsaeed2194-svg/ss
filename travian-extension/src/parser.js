// Reads game state out of a Travian Legends page. Pure DOM parsing: no
// side effects, so it can run in the content script and in Node tests.
(function (root) {
  'use strict';

  const RESOURCE_KEYS = ['wood', 'clay', 'iron', 'crop'];

  // Travian wraps numbers in bidi marks (U+202D/U+202C), uses U+2212 for
  // minus and localised thousands separators. Keep digits and the sign.
  function num(text) {
    if (text == null) return null;
    const s = String(text).replace(/−/g, '-').replace(/[^\d-]/g, '');
    const m = s.match(/-?\d+/);
    return m ? parseInt(m[0], 10) : null;
  }

  const qs = (el, sel) => (el ? el.querySelector(sel) : null);
  const qsa = (el, sel) => (el ? Array.from(el.querySelectorAll(sel)) : []);
  const text = (el) => (el ? el.textContent.replace(/[‪-‮]/g, '').replace(/\s+/g, ' ').trim() : '');

  function classNumber(el, prefix) {
    for (const c of el.classList) {
      const m = c.match(new RegExp('^' + prefix + '(\\d+)$'));
      if (m) return parseInt(m[1], 10);
    }
    return null;
  }

  function pageType(doc, url) {
    if (doc.getElementById('loginScene')) return 'login';
    if (!doc.getElementById('stockBar') && !doc.getElementById('servertime')) return 'unknown';
    const p = url.pathname;
    if (p.endsWith('/dorf1.php')) return 'dorf1';
    if (p.endsWith('/dorf2.php')) return 'dorf2';
    if (p.endsWith('/build.php')) {
      const gid = url.searchParams.get('gid');
      const tt = url.searchParams.get('tt');
      if (gid === '16' && tt === '99') return 'farmlist';
      return 'build';
    }
    if (p.startsWith('/hero/adventures')) return 'adventures';
    return 'other';
  }

  // Every in-game page carries an inline `var resources = {production: ...,
  // storage: ..., maxStorage: ...}` block. It has hourly production, which
  // the DOM only shows on dorf1.
  function parseResourcesScript(doc) {
    for (const s of qsa(doc, 'script:not([src])')) {
      const t = s.textContent;
      if (!t.includes('var resources')) continue;
      const block = (key) => {
        const m = t.match(new RegExp('(?:^|[^A-Za-z])' + key + '\\s*:\\s*(\\{[^}]*\\})'));
        if (!m) return null;
        try { return JSON.parse(m[1]); } catch (e) { return null; }
      };
      return { production: block('production'), storage: block('storage'), maxStorage: block('maxStorage') };
    }
    return null;
  }

  function parseResources(doc) {
    const script = parseResourcesScript(doc) || {};
    const stock = {};
    RESOURCE_KEYS.forEach((k, i) => {
      const el = doc.getElementById('l' + (i + 1));
      let v = el ? num(el.textContent) : null;
      if (v == null && script.storage) v = Math.floor(script.storage['l' + (i + 1)]);
      stock[k] = v;
    });

    const bar = doc.getElementById('stockBar');
    let warehouse = num(text(qs(bar, '.warehouse .capacity .value')));
    let granary = num(text(qs(bar, '.granary .capacity .value')));
    if (warehouse == null && script.maxStorage) warehouse = script.maxStorage.l1;
    if (granary == null && script.maxStorage) granary = script.maxStorage.l4;

    let production = null;
    if (script.production) {
      const p = script.production;
      // l5 is the crop balance after upkeep; l4 is gross crop production.
      production = { wood: p.l1, clay: p.l2, iron: p.l3, crop: p.l5 != null ? p.l5 : p.l4, cropGross: p.l4 };
    } else {
      const rows = qsa(doc, '#production tbody tr');
      if (rows.length >= 4) {
        production = {};
        RESOURCE_KEYS.forEach((k, i) => { production[k] = num(text(qs(rows[i], '.num'))); });
      }
    }
    const freeCropEl = doc.getElementById('stockBarFreeCrop');
    if (production && freeCropEl) production.crop = num(freeCropEl.textContent);

    if (stock.wood == null && warehouse == null) return null;
    return { stock, capacity: { warehouse, granary }, production };
  }

  function parseVillages(doc) {
    const box = doc.getElementById('sidebarBoxVillagelist') || doc.getElementById('sidebarBoxVillageList');
    return qsa(box, '.listEntry[data-did]').map((el) => {
      const coord = qs(el, '.coordinatesGrid');
      let x = coord ? num(coord.getAttribute('data-x')) : null;
      let y = coord ? num(coord.getAttribute('data-y')) : null;
      if (x == null) x = num(text(qs(el, '.coordinateX')));
      if (y == null) y = num(text(qs(el, '.coordinateY')));
      return {
        id: el.getAttribute('data-did'),
        name: text(qs(el, '.name')) || (coord && coord.getAttribute('data-villagename')) || '',
        x, y,
        active: el.classList.contains('active'),
        underAttack: el.classList.contains('attack'),
      };
    });
  }

  function activeVillageId(doc, url) {
    const active = qs(doc, '#sidebarBoxVillagelist .listEntry.active[data-did], #sidebarBoxVillageList .listEntry.active[data-did]');
    if (active) return active.getAttribute('data-did');
    return url.searchParams.get('newdid');
  }

  function parseBuildQueue(doc) {
    const list = qs(doc, '.buildingList');
    return qsa(list, 'ul li').map((li) => {
      const nameEl = qs(li, '.name');
      const lvl = qs(nameEl, '.lvl');
      let name = '';
      if (nameEl) {
        const first = nameEl.childNodes[0];
        name = first ? first.textContent.replace(/[‪-‮]/g, '').trim() : '';
      }
      const timer = qs(li, '.timer');
      const secs = timer ? num(timer.getAttribute('value')) : null;
      return { name, level: lvl ? num(text(lvl)) : null, secondsLeft: secs };
    });
  }

  function parseFields(doc) {
    const container = doc.getElementById('resourceFieldContainer');
    return qsa(container, 'a[href*="build.php"]').map((a) => {
      const slot = num(a.getAttribute('data-aid')) || classNumber(a, 'buildingSlot');
      const gid = num(a.getAttribute('data-gid')) || classNumber(a, 'gid');
      let level = classNumber(a, 'level');
      if (level == null) level = num(text(qs(a, '.labelLayer')));
      return {
        slot, gid, level: level || 0,
        upgradable: a.classList.contains('good'),
        underConstruction: a.classList.contains('underConstruction'),
        maxLevel: a.classList.contains('maxLevel'),
      };
    }).filter((f) => f.slot && f.gid);
  }

  function parseBuildings(doc) {
    const content = doc.getElementById('villageContent');
    const seen = new Set();
    const out = [];
    for (const div of qsa(content, '.buildingSlot[data-aid]')) {
      const slot = num(div.getAttribute('data-aid'));
      if (!slot || seen.has(slot)) continue; // the wall is drawn as two slots
      seen.add(slot);
      const a = qs(div, 'a[data-level]') || qs(div, 'a');
      let gid = num(div.getAttribute('data-gid')) || 0;
      if (!gid && a) {
        const m = (a.getAttribute('href') || '').match(/gid=(\d+)/);
        if (m) gid = parseInt(m[1], 10);
      }
      out.push({
        slot, gid,
        name: div.getAttribute('data-name') || '',
        level: a ? num(a.getAttribute('data-level')) || 0 : 0,
        upgradable: !!(a && a.classList.contains('good')),
        underConstruction: !!(a && a.classList.contains('underConstruction')),
        maxLevel: !!(a && a.classList.contains('maxLevel')),
      });
    }
    return out;
  }

  // Troop movements box on dorf1. Icon classes: att1 incoming attack,
  // att2 own attack, att3 attack on oasis, def1 incoming reinforcement,
  // def2 own reinforcement, adventure / hero_on_adventure, settlers.
  function parseMovements(doc) {
    return qsa(doc, '#movements tr').map((tr) => {
      const img = qs(tr, '.typ img, td img');
      if (!img) return null;
      const kind = Array.from(img.classList).find((c) => c !== 'x' && c !== 'unit') || 'unknown';
      const timer = qs(tr, '.timer');
      return {
        kind,
        count: num(text(qs(tr, '.mov'))) || 1,
        secondsLeft: timer ? num(timer.getAttribute('value')) : null,
        label: text(qs(tr, '.mov')),
      };
    }).filter(Boolean);
  }

  function parseHero(doc) {
    const adv = qs(doc, 'a.adventure.round');
    const status = qs(doc, '.heroStatus');
    return {
      adventures: adv ? num(text(qs(adv, '.content'))) || 0 : 0,
      home: !!qs(status, 'i.heroHome'),
      statusText: status ? (qs(status, 'a') ? qs(status, 'a').getAttribute('title') || '' : '') : '',
    };
  }

  // build.php for an existing building / field / empty site.
  function parseBuildPage(doc, url) {
    const slot = num(url.searchParams.get('id'));
    const upgrade = qs(doc, '.upgradeButtonsContainer .section1 button.build') ||
      qs(doc, '.upgradeButtonsContainer button.green.build');
    const contract = doc.getElementById('contract') || qs(doc, '[id^="contract_building"]');
    const error = qs(contract || doc, '.errorMessage');
    const waitTimer = qs(error, '.timer');
    const costEls = qsa(qs(contract, '.resourceWrapper'), '.resource .value');
    const title = qs(doc, '.titleInHeader') || qs(doc, 'h1');
    const lvl = qs(title, '.level');
    return {
      slot,
      title: text(title),
      level: lvl ? num(text(lvl)) : null,
      canUpgrade: !!(upgrade && !upgrade.disabled && !upgrade.classList.contains('disabled')),
      // "Upgrade to level N" — already accounts for levels queued.
      nextLevel: upgrade ? num(upgrade.getAttribute('value') || text(upgrade)) : null,
      blockedReason: error ? text(error).replace(/\d+:\d+:\d+.*$/, '').trim() : null,
      secondsUntilResources: waitTimer ? num(waitTimer.getAttribute('value')) : null,
      cost: costEls.length >= 4
        ? { wood: num(text(costEls[0])), clay: num(text(costEls[1])), iron: num(text(costEls[2])), crop: num(text(costEls[3])) }
        : null,
      maxLevel: !upgrade && !error && !!qs(doc, '.upgradeBuilding .maxLevel, .maxLevelReached'),
      trainable: qsa(doc, '.troop:not(.empty) .cta input.text[name^="t"]').map((input) => {
        const box = input.closest('.troop');
        const img = qs(box, 'img.unit');
        const maxLink = qs(qs(box, '.cta'), 'a');
        return {
          field: input.getAttribute('name'),
          name: img ? img.getAttribute('alt') || '' : '',
          max: maxLink ? num(text(maxLink)) || 0 : 0,
        };
      }),
    };
  }

  function parseFarmLists(doc) {
    const root = doc.getElementById('rallyPointFarmList');
    return qsa(root, '.farmListHeader').map((h) => ({
      id: (qs(h, '[data-list]') || h).getAttribute('data-list'),
      name: text(qs(h, '.name')),
      canStart: !!qs(h, 'button.startFarmList:not([disabled])'),
    }));
  }

  function parseAccount(doc) {
    return {
      gold: num(text(qs(doc, '.ajaxReplaceableGoldAmount'))),
      silver: num(text(qs(doc, '.ajaxReplaceableSilverAmount'))),
      hero: parseHero(doc),
    };
  }

  function parsePage(doc, href) {
    const url = new URL(href);
    const type = pageType(doc, url);
    const out = { type, url: href, server: url.origin, at: Date.now() };
    if (type === 'login' || type === 'unknown') return out;

    out.villages = parseVillages(doc);
    out.villageId = activeVillageId(doc, url);
    out.account = parseAccount(doc);
    out.resources = parseResources(doc);
    out.buildQueue = parseBuildQueue(doc);
    if (type === 'dorf1') {
      out.fields = parseFields(doc);
      out.movements = parseMovements(doc);
    }
    if (type === 'dorf2') out.buildings = parseBuildings(doc);
    if (type === 'build') out.buildPage = parseBuildPage(doc, url);
    if (type === 'farmlist') out.farmLists = parseFarmLists(doc);
    return out;
  }

  const api = { num, parsePage, parseResources, parseVillages, parseBuildQueue, parseFields, parseBuildings, parseMovements, parseBuildPage, parseFarmLists, parseHero, pageType };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TravianParser = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
