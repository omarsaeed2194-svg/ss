# Game Localization Lead-Gen Email (2026)

An HTML email campaign that drives people interested in game translation and
localization to the lead-capture landing page:

https://localization.saudisoft.com/game-localization-adslp2026/?utm_source=email&utm_medium=mailcampaign&utm_campaign=game_localization

| File         | Purpose                                                    |
| ------------ | ---------------------------------------------------------- |
| `email.html` | The HTML email. Paste into your ESP's "code your own" editor. |
| `email.txt`  | Plain-text version. Send it as the text part of the email. |
| `preview-desktop.png`, `preview-mobile.png` | Rendered previews (not part of the email). |

## Subject lines (A/B test)

1. Is your game ready for Arabic players?
2. Your game, in 100+ languages (with RTL done right)
3. Broken RTL menus cost you players. Let's fix that.
4. From strings to voice-over: game localization, handled
5. Launch your game in MENA and beyond. Free quote inside.

**Preheader** (already in the HTML, shown in the inbox after the subject):
Arabic RTL, native voice-over and in-game LQA from one team, in 100+ languages. Get a free quote for your game.

**Recommended sender:** a named person at Saudisoft (e.g. "Name from Saudisoft
Localization"), with a reply-to address the games team monitors. The final CTA
invites people to reply, so replies are leads too.

## Merge tags to replace

The template uses neutral placeholders. Swap them for your ESP's tags before
sending:

| Placeholder           | Mailchimp              | Brevo (Sendinblue) |
| --------------------- | ---------------------- | ------------------ |
| `{{view_online_url}}` | `*\|ARCHIVE\|*`        | `{{ mirror }}`     |
| `{{unsubscribe_url}}` | `*\|UNSUB\|*`          | `{{ unsubscribe }}` |
| `{{company_address}}` | `*\|LIST:ADDRESSLINE\|*` | your postal address as text |

For other platforms (HubSpot, Klaviyo, Mailjet, etc.), use the equivalent
"view in browser", "unsubscribe" and "company address" tags. An unsubscribe
link and a physical postal address are legally required (CAN-SPAM, GDPR/PECR,
Saudi PDPL).

## Link tracking

Every link points to the landing page with the campaign's UTM parameters, plus
a `utm_content` value so you can see in GA4 which part of the email drove the
click:

| `utm_content`         | Where in the email                    |
| --------------------- | ------------------------------------- |
| `header_logo`         | Saudisoft wordmark at the top         |
| `hero_cta`            | "Get my free quote" (main button)     |
| `interest_mobile`     | "Mobile game" interest button         |
| `interest_pc_console` | "PC / console game" interest button   |
| `interest_voiceover`  | "Voice-over & casting" interest button |
| `interest_lqa`        | "LQA & game testing" interest button  |
| `final_cta`           | "Request my free quote" (bottom button) |
| `footer_link`         | Website link in the footer            |

The four `interest_*` buttons work as one-click segmentation: if the landing
page form captures UTM values into hidden fields, each lead arrives already
tagged with what they're localizing, so sales can follow up with the right
pitch.

## Design and compatibility notes

- 600px, table-based, fluid-hybrid layout with all styles inlined, so it holds
  together in Gmail, Outlook (desktop, web and mobile), Apple Mail and Yahoo.
- Buttons are "bulletproof" (VML fallback for Outlook on Windows) and readable
  with images off. The email has no images at all, so nothing gets blocked.
- Columns stack to a single column on phones.
- Dark mode is handled for Apple Mail, iOS Mail and Outlook.com.
- About 48 KB, well under Gmail's 102 KB clipping limit.
- The hero's before/after game menu is live HTML text (English vs. Arabic
  RTL), so it renders crisp everywhere and doubles as a demo of the service.

## Before you send

- [ ] Replace the three merge-tag placeholders.
- [ ] Confirm the "free, no-obligation quote" offer matches the landing page.
- [ ] Optionally replace the text wordmark with the Saudisoft logo image
      (host it on your ESP/CDN, ~160px wide, with `alt="Saudisoft Localization"`).
- [ ] Adjust the footer's "why you're receiving this" line to match how the
      list was collected.
- [ ] Send test emails to Gmail, Outlook and an iPhone, and click every link.
