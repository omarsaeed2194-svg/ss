import { PublicFooter, PublicNav } from "@/components/PublicNav";
import { ServicesTable } from "@/components/ServicesTable";
import { getUser } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Services & prices" };

export default async function PublicServices() {
  const [s, user, catalog] = await Promise.all([getSettings(), getUser(), getCatalog()]);
  return (
    <div className="lp">
      <PublicNav siteName={s.siteName} signedIn={!!user} />
      <main className="lp-container public-page stack">
        <div className="page-head">
          <div>
            <h1>Services & prices</h1>
            <p>Prices are per 1,000 unless marked as a package. Minimum and maximum are per order.</p>
          </div>
        </div>
        <ServicesTable catalog={catalog} symbol={s.currencySymbol} orderLinks={!!user} />
      </main>
      <PublicFooter siteName={s.siteName} supportEmail={s.supportEmail} />
    </div>
  );
}
