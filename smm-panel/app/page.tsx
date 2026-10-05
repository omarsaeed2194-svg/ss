import Link from "next/link";
import { Icon } from "@/components/icons";
import { PublicFooter, PublicNav } from "@/components/PublicNav";
import { getUser } from "@/lib/auth";
import { one } from "@/lib/db";
import { money, num } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const PLATFORMS: [string, string][] = [
  ["Instagram", "#e1306c"],
  ["TikTok", "#25f4ee"],
  ["YouTube", "#ff0000"],
  ["Facebook", "#1877f2"],
  ["X / Twitter", "#8899a6"],
  ["Telegram", "#26a5e4"],
  ["Spotify", "#1db954"],
  ["Twitch", "#9146ff"],
  ["LinkedIn", "#0a66c2"],
  ["Threads", "#777"],
];

const FEATURES = [
  ["bolt", "Fast, automated start", "Orders go straight to fulfilment the moment you place them — most services start within minutes."],
  ["tag", "Wholesale prices", "Prices are listed per 1,000 so you can compare at a glance and resell with your own margin."],
  ["refresh", "Refill guarantee", "Services marked with refill can be topped up for free from your order history if counts drop."],
  ["code", "Reseller API", "A standard v2 API that works with every panel script and bot, so you can automate or white-label."],
  ["chart", "Live order tracking", "Start count, remaining quantity and status for every order, updated automatically."],
  ["chat", "Real support", "Open a ticket from your dashboard about any order or payment and get a reply from our team."],
];

const FAQ = [
  ["What is an SMM panel?", "A social media marketing panel is a self-serve store for social growth services — followers, likes, views, members and more. You add funds once, then place as many orders as you like from one dashboard."],
  ["Do you need my password?", "Never. Every service only needs a public link or username. Make sure the account or post is public while the order is running."],
  ["How fast do orders start?", "Each service shows its typical start time and speed in its description. Most automated services start within minutes to a few hours."],
  ["What happens if an order can't be completed?", "If an order is canceled or only partially delivered, the undelivered part is refunded to your balance automatically."],
  ["Can I resell your services?", "Yes. Use the API from your dashboard to connect your own panel, bot or app, and set your own prices."],
];

export default async function Home() {
  const [s, user, stats] = await Promise.all([
    getSettings(),
    getUser(),
    one<{ services: number; orders: number; cheapest: number | null }>(
      `SELECT (SELECT count(*) FROM services s JOIN categories c ON c.id = s.category_id WHERE s.active AND c.active) AS services,
              (SELECT count(*) FROM orders WHERE status = 'completed') AS orders,
              (SELECT min(rate) FROM services WHERE active AND type <> 'package') AS cheapest`
    ),
  ]);

  return (
    <div className="lp">
      <PublicNav siteName={s.siteName} signedIn={!!user} />

      <section className="hero">
        <div className="lp-container">
          <span className="eyebrow">
            <span className="dot" /> Orders processed automatically, 24/7
          </span>
          <h1>
            {s.heroTitle.split(" ").slice(0, -2).join(" ")} <span className="grad">{s.heroTitle.split(" ").slice(-2).join(" ")}</span>
          </h1>
          <p className="lead">{s.heroSubtitle}</p>
          <div className="cta">
            <Link href={user ? "/dashboard" : "/register"} className="btn btn-primary btn-lg">
              {user ? "Go to dashboard" : "Create free account"}
            </Link>
            <Link href="/services" className="btn btn-lg">
              View services & prices
            </Link>
          </div>
          <div className="hero-stats">
            <div>
              <div className="v">{num(stats?.services)}</div>
              <div className="l">services available</div>
            </div>
            {stats?.cheapest != null && (
              <div>
                <div className="v">{money(stats.cheapest, s.currencySymbol)}</div>
                <div className="l">starting price per 1,000</div>
              </div>
            )}
            {!!stats?.orders && stats.orders >= 100 && (
              <div>
                <div className="v">{num(stats.orders)}</div>
                <div className="l">orders completed</div>
              </div>
            )}
            <div>
              <div className="v">24/7</div>
              <div className="l">automated delivery</div>
            </div>
          </div>
          <div className="platforms">
            {PLATFORMS.map(([name, color]) => (
              <span key={name} className="platform">
                <i style={{ background: color }} />
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="lp-container">
          <div className="section-head">
            <h2>Everything you need to grow — or resell</h2>
            <p>Built for creators, agencies and resellers who want reliable delivery without the back-and-forth.</p>
          </div>
          <div className="features">
            {FEATURES.map(([icon, title, text]) => (
              <div key={title} className="card feature">
                <div className="icon">
                  <Icon name={icon} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="how" style={{ paddingTop: 0 }}>
        <div className="lp-container">
          <div className="section-head">
            <h2>Up and running in minutes</h2>
            <p>No contracts, no minimums beyond the service's own.</p>
          </div>
          <div className="steps">
            <div className="card step">
              <h3>Create an account</h3>
              <p>Sign up with just a username, email and password.</p>
            </div>
            <div className="card step">
              <h3>Add funds</h3>
              <p>Top up your balance with any of the payment methods we accept.</p>
            </div>
            <div className="card step">
              <h3>Place an order</h3>
              <p>Pick a service, paste the link, choose a quantity — the price is calculated instantly.</p>
            </div>
            <div className="card step">
              <h3>Watch it grow</h3>
              <p>Track progress live from your orders page, and request refills when eligible.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="faq" style={{ paddingTop: 0 }}>
        <div className="lp-container">
          <div className="section-head">
            <h2>Frequently asked questions</h2>
          </div>
          <div className="faq">
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="lp-container">
          <div className="cta-band">
            <h2>Ready to boost your accounts?</h2>
            <p>Create a free account, add funds and place your first order in under five minutes.</p>
            <Link href={user ? "/dashboard" : "/register"} className="btn btn-lg">
              {user ? "Place an order" : "Get started"}
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter siteName={s.siteName} supportEmail={s.supportEmail} />
    </div>
  );
}
