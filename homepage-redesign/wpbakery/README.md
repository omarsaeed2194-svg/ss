# Saudisoft homepage — WPBakery sections

Each file is one homepage section, ready to paste into a WPBakery **Raw HTML** element.
Open `preview.html` in a browser to see all sections stacked in order (preview only; don't paste it).

| File | Section |
|---|---|
| `00-global-styles.html` | Shared fonts, colours, buttons and scroll animations. **Required, once per page, first.** |
| `01-hero.html` | Hero with rotating headline and message card |
| `02-client-logos.html` | Scrolling client logos |
| `03-about.html` | Since 1983 / who we are |
| `04-languages-band.html` | Green multilingual "Innovation" band |
| `05-services.html` | Filterable services grid (All / Media / Technical / Language) |
| `06-industries.html` | 12 industry tiles |
| `07-stats.html` | Animated numbers |
| `08-why-saudisoft.html` | Why Saudisoft + ISO/GALA/SAP/EAGLS |
| `09-testimonials.html` | Testimonials slider |
| `10-latest-blogs.html` | 4 latest articles (update manually, or swap for a WPBakery Post Grid) |
| `11-call-to-action.html` | Get a quote panel |
| `12-footer.html` | Optional: for the Salient **Global Section** footer, not the homepage |

## Setup in WordPress
1. Edit the homepage with WPBakery (back up the current layout first, e.g. save it as a template).
2. For every section: **Add Row** → Row settings → **Type: Full Width Content**, padding top/bottom **0** →
   in the 1/1 column add **Raw HTML** → paste the full file contents.
3. Put `00-global-styles.html` in the first row (it shows nothing).
4. Order the rows 01 → 11. You can drop, reorder or reuse any section on other pages; each only needs `00` on the same page.
5. Because the hero contains the page `<h1>`, keep the Salient page header/title hidden on the homepage.

## Notes
- All styles are scoped under `.ss`, so they won't affect the rest of the theme and Salient styles can't override them.
- Section IDs (`#dots`, `#tTrack`, etc.) assume each section is used once per page.
- If LiteSpeed "Combine/Defer inline JS" is enabled, the scripts still work (they wait for the page to be ready).
- The site already has a WhatsApp button (Watso plugin), so none is included here.
