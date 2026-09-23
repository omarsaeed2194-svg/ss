/* global AIV_DEFAULTS, aivCollectPageFacts */

const ENGINES = [
  { id: 'chatgpt', name: 'ChatGPT', url: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}` },
  { id: 'perplexity', name: 'Perplexity', url: (q) => `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}` },
  { id: 'claude', name: 'Claude', url: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}` },
  { id: 'copilot', name: 'Copilot', url: (q) => `https://copilot.microsoft.com/?q=${encodeURIComponent(q)}` },
  // Gemini has no query parameter; the prompt is copied to the clipboard instead.
  { id: 'gemini', name: 'Gemini', url: () => 'https://gemini.google.com/app', paste: true },
];
const SEARCH_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Claude-SearchBot', 'Bingbot'];

const $ = (sel) => document.querySelector(sel);
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

let settings = { ...AIV_DEFAULTS };
let lastFacts = null;

async function loadSettings() {
  const stored = await chrome.storage.sync.get(['domain', 'brands', 'prompts']);
  settings = { ...AIV_DEFAULTS, ...stored };
}

// ---------- tabs ----------
document.querySelectorAll('nav button').forEach((btn) =>
  btn.addEventListener('click', () => showTab(btn.dataset.tab))
);
function showTab(id) {
  document.querySelectorAll('nav button').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === id));
  document.querySelectorAll('.panel').forEach((p) => (p.hidden = p.id !== id));
  if (id === 'track') renderTrack();
}

// ---------- audit ----------
$('#run-audit').addEventListener('click', runAudit);

async function runAudit() {
  const btn = $('#run-audit');
  btn.disabled = true;
  $('#audit-status').textContent = 'Auditing… (fetching robots.txt, llms.txt, sitemap and raw HTML)';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !/^https?:/.test(tab.url || '')) throw new Error('Open a web page (http/https) first.');
    const [{ result }] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: aivCollectPageFacts });
    lastFacts = result;
    await chrome.storage.local.set({ lastFacts: result });
    renderAudit(result);
    $('#audit-status').textContent = '';
  } catch (e) {
    $('#audit-status').textContent = 'Could not audit this page: ' + e.message;
  } finally {
    btn.disabled = false;
  }
}

function buildChecks(f) {
  const checks = [];
  const add = (weight, status, label, detail, fix) => checks.push({ weight, status, label, detail, fix });

  const blockedSearch = f.robotsTxt.bots.filter((b) => SEARCH_BOTS.includes(b.ua) && b.status === 'blocked');
  const blockedOther = f.robotsTxt.bots.filter((b) => !SEARCH_BOTS.includes(b.ua) && b.status === 'blocked');
  if (blockedSearch.length)
    add(3, 'fail', 'AI search crawlers blocked', blockedSearch.map((b) => b.ua).join(', ') + ' cannot read your site.',
      'Allow these user-agents in robots.txt. Blocked search bots mean the assistant cannot cite you at all. Use Generate → robots.txt rules.');
  else if (blockedOther.length)
    add(1, 'warn', 'Some AI training crawlers blocked', blockedOther.map((b) => b.ua).join(', ') + ' are disallowed.',
      'This is a policy choice. Blocking training bots does not stop live citations, but the models may know less about your brand.');
  else add(3, 'pass', 'AI crawlers can access the site', f.robotsTxt.found ? 'robots.txt allows all major AI bots.' : 'No robots.txt, so nothing is blocked.');

  const rm = f.robotsMeta;
  if (/noindex|nosnippet|max-snippet\s*:\s*0\b|none/.test(rm))
    add(3, 'fail', 'Page blocks indexing or snippets', `meta robots: "${rm.replace(/^,|,$/g, '')}"`,
      'Remove noindex / nosnippet / max-snippet:0. Engines will not quote a page that forbids snippets.');
  else add(3, 'pass', 'Page allows indexing and snippets', f.nosnippetBlocks ? `${f.nosnippetBlocks} data-nosnippet block(s) are excluded from quotes.` : '');

  if (f.rawWords == null)
    add(2, 'warn', 'Could not fetch raw HTML', `HTTP ${f.rawStatus}`, 'Make sure the URL returns 200 to non-browser clients.');
  else {
    const ratio = f.renderedWords ? f.rawWords / f.renderedWords : 1;
    const detail = `${f.rawWords} words in raw HTML vs ${f.renderedWords} after JavaScript runs.`;
    if (ratio < 0.3)
      add(3, 'fail', 'Content needs JavaScript to appear', detail,
        'Most AI crawlers (GPTBot, ClaudeBot, PerplexityBot) do not run JavaScript. Use server-side rendering or pre-rendering for key content.');
    else if (ratio < 0.7)
      add(2, 'warn', 'Some content is JavaScript-only', detail, 'Put the main copy in the server HTML.');
    else add(3, 'pass', 'Content is in the server HTML', detail);
  }

  if (f.llmsTxt.found) add(1, 'pass', 'llms.txt present', f.llmsFullTxt.found ? 'llms-full.txt also present.' : '');
  else add(1, 'warn', 'No /llms.txt', 'An emerging convention that gives LLMs a curated map of your site.', 'Use Generate → llms.txt and upload it to the site root.');

  if (f.sitemap.found || f.sitemap.urls.length) add(1, 'pass', 'Sitemap found', `${f.sitemap.urls.length} URL(s) read.`);
  else add(1, 'warn', 'No sitemap.xml found', '', 'Publish a sitemap and reference it in robots.txt so crawlers find every page.');

  const types = f.ldTypes;
  if (!types.length && !f.hasMicrodata)
    add(2, 'fail', 'No structured data', '', 'Add JSON-LD (Organization, Service, FAQPage, Article) so engines can read facts about you. Use Generate.');
  else add(2, 'pass', 'Structured data found', types.join(', ') || 'microdata');
  if (f.ldInvalid) add(1, 'fail', 'Invalid JSON-LD', `${f.ldInvalid} block(s) fail to parse.`, 'Fix the JSON syntax. Invalid blocks are ignored.');
  if (!types.some((t) => /Organization|LocalBusiness|Corporation/.test(t)))
    add(1, 'warn', 'No Organization schema', 'Engines use this to connect the page to your brand.', 'Use Generate → Organization schema (add it once, site-wide).');

  if (f.faqs.length >= 3) {
    if (types.includes('FAQPage')) add(2, 'pass', 'Q&A content with FAQPage schema', `${f.faqs.length} question headings.`);
    else add(2, 'warn', 'Q&A content without FAQPage schema', `${f.faqs.length} question headings found.`, 'Use Generate → FAQPage schema.');
  } else
    add(2, 'warn', 'Little question-and-answer content', `${f.faqs.length} question-style heading(s).`,
      'AI answers are built around questions. Add an FAQ section that answers the questions buyers actually ask, 2–4 sentences each.');

  const h1s = f.headings.filter((h) => h.level === 1);
  const h2s = f.headings.filter((h) => h.level === 2);
  if (h1s.length !== 1) add(1, 'warn', `Page has ${h1s.length} H1 headings`, '', 'Use exactly one descriptive H1.');
  else add(1, 'pass', 'One clear H1', h1s[0].text.slice(0, 90));
  if (h2s.length < 3) add(1, 'warn', 'Thin heading structure', `${h2s.length} H2 heading(s).`, 'Split the content into sections with descriptive H2s. Engines lift passages by section.');
  else add(1, 'pass', 'Good heading structure', `${h2s.length} H2 sections.`);

  if (f.renderedWords < 250) add(2, 'fail', 'Very little content', `${f.renderedWords} words.`, 'Pages under ~300 words are rarely cited. Expand with specifics.');
  else if (f.renderedWords < 600) add(2, 'warn', 'Moderate content depth', `${f.renderedWords} words.`, 'Add detail: process, pricing factors, examples, comparisons.');
  else add(2, 'pass', 'Substantial content', `${f.renderedWords} words.`);

  if (f.numbersInText < 5)
    add(1, 'warn', 'Few concrete facts or figures', `${f.numbersInText} numeric fact(s).`,
      'Specific numbers (languages supported, years in business, turnaround times, clients) get quoted far more often than general claims.');
  else add(1, 'pass', 'Contains concrete facts and figures', `${f.numbersInText} numeric fact(s).`);

  if (!f.listsAndTables) add(1, 'warn', 'No lists or tables', '', 'Lists and comparison tables are easy for engines to extract.');
  else add(1, 'pass', 'Uses lists or tables', `${f.listsAndTables} found.`);

  const d = f.description.length;
  if (!f.title || d < 50 || d > 170)
    add(1, 'warn', 'Title or meta description needs work', `Description is ${d} characters.`, 'Write a 120–160 character description that answers "what is this page and who is it for".');
  else add(1, 'pass', 'Title and meta description present', f.title.slice(0, 90));

  if (f.modified) {
    const age = (Date.now() - Date.parse(f.modified)) / 864e5;
    if (age > 365) add(1, 'warn', 'Content looks stale', `Last modified ${f.modified.slice(0, 10)}.`, 'Update the page and its dateModified. Assistants favor fresh sources.');
    else add(1, 'pass', 'Recently updated', `Last modified ${f.modified.slice(0, 10)}.`);
  } else add(1, 'warn', 'No modified date', '', 'Expose dateModified in JSON-LD or article:modified_time.');

  if (!f.canonical) add(1, 'warn', 'No canonical URL', '', 'Add <link rel="canonical"> so citations point to one URL.');
  if (!f.lang) add(1, 'warn', 'No lang attribute', '', 'Set <html lang="…">.');
  if (!f.hreflangs.length) add(1, 'warn', 'No hreflang alternates', '', 'If you publish Arabic and English versions, link them with hreflang so each language gets cited in the right answers.');
  else add(1, 'pass', 'Language alternates declared', f.hreflangs.join(', '));
  if (!f.og.title || !f.og.description) add(1, 'warn', 'Incomplete Open Graph tags', '', 'Add og:title, og:description and og:image.');

  const brandRe = new RegExp(settings.brands.map((b) => b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
  if (settings.brands.length && !brandRe.test(f.title + ' ' + f.og.siteName + ' ' + f.orgName))
    add(1, 'warn', 'Brand name not prominent', 'Your brand does not appear in the title, og:site_name or Organization schema.',
      'Use a consistent brand name in the title and schema so engines tie the content to you.');

  return checks;
}

function renderAudit(f) {
  const checks = buildChecks(f);
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const got = checks.reduce((s, c) => s + c.weight * (c.status === 'pass' ? 1 : c.status === 'warn' ? 0.5 : 0), 0);
  const score = Math.round((got / total) * 100);
  const cls = score >= 80 ? 'pass' : score >= 55 ? 'warn' : 'fail';
  $('#score').textContent = score;
  $('#score').className = 'score ' + cls;
  $('#score').style.borderColor = `var(--${cls})`;
  $('#score-label').textContent =
    score >= 80 ? 'Well prepared for AI answers' : score >= 55 ? 'Some gaps to fix' : 'Hard for AI engines to use';
  $('#audit-url').textContent = f.url;

  $('#bots').innerHTML =
    '<tr><th>Crawler</th><th>Used by</th><th>Status</th></tr>' +
    f.robotsTxt.bots
      .map((b) => {
        const c = b.status === 'blocked' ? 'fail' : b.status === 'partial' ? 'warn' : 'pass';
        return `<tr><td>${esc(b.ua)}</td><td class="muted">${esc(b.owner)}</td><td class="${c}" title="${esc(b.via)}">${esc(b.status)}</td></tr>`;
      })
      .join('');

  const order = { fail: 0, warn: 1, pass: 2 };
  $('#checks').innerHTML = checks
    .sort((a, b) => order[a.status] - order[b.status] || b.weight - a.weight)
    .map(
      (c) => `<li><div class="label"><span class="dot ${c.status}"></span>${esc(c.label)}</div>
        ${c.detail ? `<div class="detail">${esc(c.detail)}</div>` : ''}
        ${c.fix && c.status !== 'pass' ? `<div class="fix">→ ${esc(c.fix)}</div>` : ''}</li>`
    )
    .join('');
  $('#audit-result').hidden = false;
}

// ---------- generators ----------
document.querySelectorAll('[data-gen]').forEach((b) => b.addEventListener('click', () => generate(b.dataset.gen)));
$('#gen-copy').addEventListener('click', () => copy($('#gen-output').value, $('#gen-copy')));

function titleFromUrl(u) {
  try {
    const path = decodeURIComponent(new URL(u).pathname).replace(/\/$/, '');
    const slug = path.split('/').pop() || 'Home';
    return slug.replace(/\.\w+$/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return u;
  }
}

function generate(kind) {
  const f = lastFacts;
  const out = $('#gen-output');
  const note = $('#gen-note');
  note.textContent = '';
  if (!f && kind !== 'robots') {
    out.value = '';
    note.textContent = 'Run an audit on a page of your site first (Audit tab).';
    return;
  }
  const brand = settings.brands[0] || f?.og.siteName || f?.host || '';
  if (kind === 'llms') {
    const urls = f.sitemap.urls.filter((u) => /^https?:/.test(u)).slice(0, 80);
    const lines = urls.length ? urls.map((u) => `- [${titleFromUrl(u)}](${u})`) : [`- [${f.title}](${f.url})`];
    out.value = [
      `# ${brand}`,
      '',
      `> ${f.description || 'One or two sentences on what you do, for whom, and where.'}`,
      '',
      'Key facts: <languages supported, years in business, certifications, industries served, locations>',
      '',
      '## Pages',
      ...lines,
      '',
      '## Contact',
      `- [Contact](${f.origin}/contact)`,
    ].join('\n');
    note.textContent = `Built from ${urls.length} sitemap URL(s). Rename the links, remove low-value pages, fill in key facts, then upload to ${f.origin}/llms.txt.`;
  } else if (kind === 'faq') {
    if (!f.faqs.length) {
      out.value = '';
      note.textContent = 'No question-style headings with answers were found on this page. Add an FAQ section first.';
      return;
    }
    const data = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: f.faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    };
    out.value = `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
    note.textContent = `${f.faqs.length} Q&A pair(s) taken from the page. The answers must match the visible text. Trim any extra text that was picked up.`;
  } else if (kind === 'org') {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: brand,
      alternateName: settings.brands.slice(1),
      url: f.origin,
      logo: f.og.image || `${f.origin}/logo.png`,
      description: f.description,
      sameAs: ['https://www.linkedin.com/company/<your-company>', 'https://x.com/<handle>'],
      contactPoint: { '@type': 'ContactPoint', contactType: 'sales', email: '<sales@your-domain>', availableLanguage: ['en', 'ar'] },
    };
    out.value = `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
    note.textContent = 'Replace the <placeholders>. Add it to every page (e.g. in the site header). sameAs links help engines confirm your brand identity.';
  } else if (kind === 'robots') {
    const bots = ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'PerplexityBot', 'Perplexity-User', 'Claude-SearchBot', 'Claude-User', 'ClaudeBot', 'Google-Extended', 'Bingbot', 'Applebot-Extended'];
    out.value = [
      '# Allow AI search and assistant crawlers',
      ...bots.flatMap((b) => [`User-agent: ${b}`, 'Allow: /', '']),
      `Sitemap: ${f ? f.origin : 'https://' + settings.domain}/sitemap.xml`,
    ].join('\n');
    note.textContent = 'Merge these rules into your existing robots.txt. Keep any Disallow rules for private areas such as /admin.';
  }
}

async function copy(text, btn) {
  await navigator.clipboard.writeText(text);
  const old = btn.textContent;
  btn.textContent = 'Copied';
  setTimeout(() => (btn.textContent = old), 1200);
}

// ---------- tracking ----------
async function renderTrack() {
  $('#prompts').innerHTML = settings.prompts
    .map(
      (p, i) => `<li><div>${esc(p)}</div><div class="engines">${ENGINES.map(
        (e) => `<button data-p="${i}" data-e="${e.id}">${e.name}</button>`
      ).join('')}</div></li>`
    )
    .join('');
  $('#prompts').querySelectorAll('button').forEach((b) =>
    b.addEventListener('click', () => askEngine(settings.prompts[b.dataset.p], ENGINES.find((e) => e.id === b.dataset.e)))
  );

  const { citations = [] } = await chrome.storage.local.get('citations');
  const cited = citations.filter((c) => c.links > 0).length;
  const mentioned = citations.filter((c) => c.links === 0 && c.mentions > 0).length;
  $('#summary').innerHTML = `
    <div><b>${citations.length}</b>answers checked</div>
    <div><b class="pass">${cited}</b>linked to you</div>
    <div><b class="warn">${mentioned}</b>named you, no link</div>`;
  $('#log').innerHTML = citations.length
    ? '<tr><th>Engine</th><th>Prompt</th><th>Result</th></tr>' +
      citations
        .slice()
        .sort((a, b) => b.lastSeen - a.lastSeen)
        .slice(0, 50)
        .map((c) => {
          const res = c.links ? `<span class="pass">cited ×${c.links}</span>` : c.mentions ? `<span class="warn">named ×${c.mentions}</span>` : '<span class="fail">absent</span>';
          return `<tr><td>${esc(c.engine)}</td><td title="${esc(c.url)}">${esc((c.prompt || '(unknown prompt)').slice(0, 70))}</td><td>${res}</td></tr>`;
        })
        .join('')
    : '<tr><td class="muted">No answers recorded yet. Click an engine above to ask a prompt.</td></tr>';
}

async function askEngine(prompt, engine) {
  // The tracker uses this to label the answer when the prompt isn't in the URL.
  await chrome.storage.local.set({ pendingPrompt: { engine: engine.id, prompt, ts: Date.now() } });
  if (engine.paste) await navigator.clipboard.writeText(prompt);
  chrome.tabs.create({ url: engine.url(prompt) });
}

$('#clear-log').addEventListener('click', async () => {
  if (!confirm('Delete all recorded AI answers?')) return;
  await chrome.storage.local.set({ citations: [] });
  renderTrack();
});

$('#export-log').addEventListener('click', async () => {
  const { citations = [] } = await chrome.storage.local.get('citations');
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [['engine', 'prompt', 'links_to_site', 'brand_mentions', 'first_seen', 'last_seen', 'url', 'snippet']].concat(
    citations.map((c) => [c.engine, c.prompt, c.links, c.mentions, new Date(c.firstSeen).toISOString(), new Date(c.lastSeen).toISOString(), c.url, c.snippet])
  );
  const blob = new Blob([rows.map((r) => r.map(cell).join(',')).join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ai-visibility-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
});

// ---------- settings ----------
function fillSettings() {
  $('#set-domain').value = settings.domain;
  $('#set-brands').value = settings.brands.join(', ');
  $('#set-prompts').value = settings.prompts.join('\n');
}
$('#save-settings').addEventListener('click', async () => {
  settings = {
    domain: $('#set-domain').value.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase(),
    brands: $('#set-brands').value.split(',').map((s) => s.trim()).filter(Boolean),
    prompts: $('#set-prompts').value.split('\n').map((s) => s.trim()).filter(Boolean),
  };
  await chrome.storage.sync.set(settings);
  $('#saved').textContent = 'Saved';
  setTimeout(() => ($('#saved').textContent = ''), 1500);
});

(async () => {
  await loadSettings();
  fillSettings();
  const { lastFacts: stored } = await chrome.storage.local.get('lastFacts');
  lastFacts = stored || null;
})();
