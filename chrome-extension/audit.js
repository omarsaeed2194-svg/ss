// Injected into the active tab via chrome.scripting.executeScript, so it must be
// fully self-contained (no references to anything outside this function).
// Returns raw facts about the page and its site; popup.js turns them into checks.
async function aivCollectPageFacts() {
  const AI_BOTS = [
    { ua: 'OAI-SearchBot', owner: 'ChatGPT search' },
    { ua: 'GPTBot', owner: 'OpenAI training' },
    { ua: 'ChatGPT-User', owner: 'ChatGPT browsing' },
    { ua: 'PerplexityBot', owner: 'Perplexity' },
    { ua: 'Claude-SearchBot', owner: 'Claude search' },
    { ua: 'ClaudeBot', owner: 'Anthropic training' },
    { ua: 'Google-Extended', owner: 'Gemini' },
    { ua: 'Bingbot', owner: 'Copilot / Bing' },
    { ua: 'Applebot-Extended', owner: 'Apple Intelligence' },
    { ua: 'CCBot', owner: 'Common Crawl' },
  ];

  const text = (el) => (el?.innerText || el?.textContent || '').replace(/\s+/g, ' ').trim();
  const meta = (sel) => document.querySelector(sel)?.getAttribute('content') || '';
  const wordCount = (s) => (s.match(/[\p{L}\p{N}]+/gu) || []).length;

  async function get(path) {
    try {
      const res = await fetch(path, { credentials: 'omit', cache: 'no-store' });
      return { ok: res.ok, status: res.status, body: res.ok ? await res.text() : '' };
    } catch (e) {
      return { ok: false, status: 0, body: '', error: String(e) };
    }
  }

  // robots.txt: find the group that applies to each bot (specific UA, else *).
  function robotsVerdicts(body) {
    const groups = [];
    let cur = null;
    let lastWasUA = false;
    for (const raw of body.split(/\r?\n/)) {
      const line = raw.replace(/#.*/, '').trim();
      const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
      if (!m) continue;
      const key = m[1].toLowerCase();
      const val = m[2].trim();
      if (key === 'user-agent') {
        if (!lastWasUA) groups.push((cur = { agents: [], rules: [] }));
        cur.agents.push(val.toLowerCase());
        lastWasUA = true;
      } else {
        lastWasUA = false;
        if (cur && (key === 'allow' || key === 'disallow')) cur.rules.push({ type: key, path: val });
      }
    }
    return AI_BOTS.map((bot) => {
      const ua = bot.ua.toLowerCase();
      const group =
        groups.find((g) => g.agents.includes(ua)) || groups.find((g) => g.agents.includes('*'));
      if (!group) return { ...bot, status: 'allowed', via: 'no matching rule' };
      const blocksAll = group.rules.some((r) => r.type === 'disallow' && r.path === '/');
      const allowsRoot = group.rules.some((r) => r.type === 'allow' && (r.path === '/' || r.path === ''));
      const partial = group.rules.some((r) => r.type === 'disallow' && r.path && r.path !== '/');
      const via = group.agents.includes(ua) ? `User-agent: ${bot.ua}` : 'User-agent: *';
      if (blocksAll && !allowsRoot) return { ...bot, status: 'blocked', via };
      return { ...bot, status: partial ? 'partial' : 'allowed', via };
    });
  }

  // JSON-LD: collect every @type, including inside @graph and nested objects.
  const ldTypes = new Set();
  const ldObjects = [];
  let ldInvalid = 0;
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    if (node['@type']) {
      [].concat(node['@type']).forEach((t) => ldTypes.add(String(t)));
      ldObjects.push(node);
    }
    Object.values(node).forEach(walk);
  };
  document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    try {
      walk(JSON.parse(s.textContent));
    } catch {
      ldInvalid++;
    }
  });
  const hasMicrodata = !!document.querySelector('[itemscope][itemtype]');

  // Headings + question-style headings with the answer text that follows them.
  const headings = [...document.querySelectorAll('h1, h2, h3')].map((h) => ({
    level: Number(h.tagName[1]),
    text: text(h),
  }));
  const QUESTION_RE =
    /\?\s*$|^(what|how|why|when|where|which|who|can|do|does|is|are|should|will|ما|كيف|لماذا|متى|أين|هل|من)\b/i;
  const faqs = [];
  document.querySelectorAll('h2, h3, h4, dt, summary').forEach((h) => {
    const q = text(h);
    if (!q || q.length > 200 || !QUESTION_RE.test(q)) return;
    let answer = '';
    if (h.tagName === 'SUMMARY') {
      answer = text(h.parentElement).slice(q.length);
    } else {
      let el = h.nextElementSibling;
      while (el && !/^H[1-4]$|^DT$/.test(el.tagName) && answer.length < 600) {
        answer += ' ' + text(el);
        el = el.nextElementSibling;
      }
    }
    answer = answer.trim();
    if (answer.length >= 20) faqs.push({ q, a: answer.slice(0, 600) });
  });

  const main = document.querySelector('main, article, [role="main"]') || document.body;
  const renderedText = text(main);
  const renderedWords = wordCount(text(document.body));

  // What a non-JS crawler sees: most AI crawlers don't execute JavaScript.
  const raw = await get(location.href);
  let rawWords = null;
  if (raw.ok) {
    const doc = new DOMParser().parseFromString(raw.body, 'text/html');
    doc.querySelectorAll('script, style, noscript, template').forEach((n) => n.remove());
    rawWords = wordCount(doc.body?.textContent || '');
  }

  const [robots, llms, llmsFull, sitemap] = await Promise.all([
    get('/robots.txt'),
    get('/llms.txt'),
    get('/llms-full.txt'),
    get('/sitemap.xml'),
  ]);

  // Sitemap URLs (follow a sitemap index one level deep, capped).
  let sitemapUrls = [];
  const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
  if (sitemap.ok) {
    if (/<sitemapindex/i.test(sitemap.body)) {
      const children = locs(sitemap.body).slice(0, 5);
      for (const child of children) {
        try {
          const u = new URL(child);
          if (u.origin !== location.origin) continue;
          const r = await get(u.pathname + u.search);
          if (r.ok) sitemapUrls.push(...locs(r.body));
        } catch {}
      }
    } else {
      sitemapUrls = locs(sitemap.body);
    }
  }
  if (!sitemap.ok && robots.ok) {
    const m = robots.body.match(/^\s*sitemap\s*:\s*(\S+)/im);
    if (m) sitemapUrls = ['(declared in robots.txt) ' + m[1]];
  }

  const robotsMeta = [meta('meta[name="robots"]'), meta('meta[name="googlebot"]')].join(',').toLowerCase();
  const modified =
    meta('meta[property="article:modified_time"]') ||
    ldObjects.map((o) => o.dateModified || o.datePublished).find(Boolean) ||
    '';

  return {
    url: location.href,
    origin: location.origin,
    host: location.hostname,
    title: document.title,
    description: meta('meta[name="description"]'),
    canonical: document.querySelector('link[rel="canonical"]')?.href || '',
    lang: document.documentElement.lang || '',
    hreflangs: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) =>
      l.getAttribute('hreflang')
    ),
    og: {
      title: meta('meta[property="og:title"]'),
      description: meta('meta[property="og:description"]'),
      image: meta('meta[property="og:image"]'),
      siteName: meta('meta[property="og:site_name"]'),
    },
    robotsMeta,
    nosnippetBlocks: document.querySelectorAll('[data-nosnippet]').length,
    ldTypes: [...ldTypes],
    ldInvalid,
    hasMicrodata,
    orgName: ldObjects.find((o) => /Organization|LocalBusiness/.test([].concat(o['@type']).join()))?.name || '',
    modified,
    headings,
    faqs: faqs.slice(0, 20),
    listsAndTables: main.querySelectorAll('ul, ol, table').length,
    numbersInText: (renderedText.match(/\b\d[\d,.]*\s*(%|\+|k|m|years?|languages?|clients?)?/gi) || []).length,
    renderedWords,
    rawWords,
    rawStatus: raw.status,
    robotsTxt: { status: robots.status, found: robots.ok, bots: robots.ok ? robotsVerdicts(robots.body) : robotsVerdicts('') },
    llmsTxt: { found: llms.ok && !/<html/i.test(llms.body), preview: llms.ok ? llms.body.slice(0, 400) : '' },
    llmsFullTxt: { found: llmsFull.ok && !/<html/i.test(llmsFull.body) },
    sitemap: { found: sitemap.ok, urls: sitemapUrls.slice(0, 300) },
  };
}
