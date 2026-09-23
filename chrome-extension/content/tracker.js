/* global AIV_DEFAULTS */
// Runs on AI assistant pages. Watches the rendered answer, highlights links to
// and mentions of your site, and records whether the answer cited you.
// It only reads the page; it never changes what the assistant says.
(() => {
  const ENGINE = (() => {
    const h = location.hostname;
    if (h.endsWith('chatgpt.com')) return 'chatgpt';
    if (h.endsWith('perplexity.ai')) return 'perplexity';
    if (h === 'gemini.google.com') return 'gemini';
    if (h === 'claude.ai') return 'claude';
    if (h === 'copilot.microsoft.com') return 'copilot';
    return h;
  })();
  const MIN_ANSWER_CHARS = 400; // ignore empty/landing pages
  const LOG_LIMIT = 500;

  let settings = { ...AIV_DEFAULTS };
  let brandRe = null;
  let pill = null;
  let timer = null;
  const initialPrompt = new URLSearchParams(location.search).get('q') || '';
  const loadedAt = Date.now();

  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function buildRegex() {
    const terms = [settings.domain, ...settings.brands].filter(Boolean).map(escapeRe);
    brandRe = terms.length ? new RegExp(terms.join('|'), 'gi') : null;
  }

  // Text the user typed (prompt box, their own messages) must not count as a mention.
  function isUserText(node) {
    const el = node.nodeType === 1 ? node : node.parentElement;
    return !!el?.closest(
      'textarea, input, [contenteditable="true"], [data-message-author-role="user"], [data-testid="user-message"], .user-query, #aiv-pill'
    );
  }

  function linkMatches(href) {
    if (!href) return false;
    try {
      const u = new URL(href, location.href);
      const host = u.hostname.toLowerCase();
      const d = settings.domain;
      if (host === d || host.endsWith('.' + d)) return true;
      // Redirect/tracking wrappers that carry the target in a parameter.
      return decodeURIComponent(u.search).toLowerCase().includes(d);
    } catch {
      return false;
    }
  }

  function scan() {
    if (!settings.domain || !document.body) return;
    const bodyText = document.body.innerText || '';
    if (bodyText.length < MIN_ANSWER_CHARS) return;

    const links = [...document.querySelectorAll('a[href]')].filter((a) => !isUserText(a) && linkMatches(a.href));
    links.forEach((a) => {
      a.style.outline = '2px solid #1f8a4c';
      a.style.outlineOffset = '2px';
      a.style.borderRadius = '3px';
    });

    // Text mentions, highlighted with the CSS Custom Highlight API so the
    // assistant's DOM (usually React-managed) is never modified.
    const ranges = [];
    let snippet = '';
    if (brandRe) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) =>
          n.nodeValue.trim() && !isUserText(n) && !/^(SCRIPT|STYLE|NOSCRIPT)$/.test(n.parentElement?.tagName)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT,
      });
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        brandRe.lastIndex = 0;
        let m;
        while ((m = brandRe.exec(n.nodeValue))) {
          const r = new Range();
          r.setStart(n, m.index);
          r.setEnd(n, m.index + m[0].length);
          ranges.push(r);
          if (!snippet) {
            const ctx = (n.parentElement?.innerText || n.nodeValue).replace(/\s+/g, ' ');
            const at = Math.max(0, ctx.toLowerCase().indexOf(m[0].toLowerCase()) - 80);
            snippet = ctx.slice(at, at + 220);
          }
        }
      }
      if (window.CSS?.highlights && window.Highlight) CSS.highlights.set('aiv-mention', new Highlight(...ranges));
    }

    showPill(links.length, ranges.length);
    record(links.length, ranges.length, snippet);
  }

  function showPill(links, mentions) {
    if (!pill) {
      pill = document.createElement('div');
      pill.id = 'aiv-pill';
      const shadow = pill.attachShadow({ mode: 'open' });
      shadow.innerHTML = `<style>
        div{position:fixed;right:16px;bottom:16px;z-index:2147483647;font:12px/1.3 system-ui,sans-serif;
        padding:8px 12px;border-radius:999px;color:#fff;box-shadow:0 2px 10px rgba(0,0,0,.25);pointer-events:none}
      </style><div></div>`;
      document.documentElement.appendChild(pill);
      const style = document.createElement('style');
      style.textContent = '::highlight(aiv-mention){background:#ffe58a;color:#111}';
      document.head.appendChild(style);
    }
    const box = pill.shadowRoot.querySelector('div');
    if (links) {
      box.style.background = '#1f8a4c';
      box.textContent = `✓ ${settings.domain} cited ×${links}`;
    } else if (mentions) {
      box.style.background = '#b7791f';
      box.textContent = `Named ×${mentions}, but no link to ${settings.domain}`;
    } else {
      box.style.background = '#6b6f7a';
      box.textContent = `${settings.domain} not in this answer`;
    }
  }

  // Returns null when no conversation is on screen, so landing pages aren't logged.
  function currentPrompt(pending) {
    const firstUser = document.querySelector('[data-message-author-role="user"], [data-testid="user-message"], .user-query');
    if (firstUser?.innerText?.trim()) return firstUser.innerText.trim().slice(0, 300);
    // ?q= only describes the conversation started right after page load.
    if (initialPrompt && Date.now() - loadedAt < 5 * 60 * 1000) return initialPrompt;
    if (pending && pending.engine === ENGINE && Date.now() - pending.ts < 10 * 60 * 1000) return pending.prompt;
    return null;
  }

  async function record(links, mentions, snippet) {
    const { citations = [], pendingPrompt } = await chrome.storage.local.get(['citations', 'pendingPrompt']);
    const url = location.origin + location.pathname;
    const prompt = currentPrompt(pendingPrompt);
    if (!prompt) return;
    const key = `${ENGINE}|${url}|${prompt}`;
    const now = Date.now();
    let entry = citations.find((c) => c.key === key);
    if (!entry) {
      entry = { key, engine: ENGINE, url, prompt, firstSeen: now, links: 0, mentions: 0, snippet: '' };
      citations.push(entry);
    }
    // Keep the best result seen for this answer (answers stream in gradually).
    entry.links = Math.max(entry.links, links);
    entry.mentions = Math.max(entry.mentions, mentions);
    entry.snippet = entry.snippet || snippet;
    entry.lastSeen = now;
    await chrome.storage.local.set({ citations: citations.slice(-LOG_LIMIT) });
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(scan, 1500);
  }

  chrome.storage.sync.get(['domain', 'brands', 'prompts'], (stored) => {
    settings = { ...AIV_DEFAULTS, ...stored };
    buildRegex();
    new MutationObserver((muts) => {
      if (muts.every((m) => pill && pill.contains(m.target))) return;
      schedule();
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    schedule();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    for (const k of ['domain', 'brands']) if (changes[k]) settings[k] = changes[k].newValue;
    buildRegex();
    schedule();
  });
})();
