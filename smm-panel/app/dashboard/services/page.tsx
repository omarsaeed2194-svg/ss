import { ServicesTable } from "@/components/ServicesTable";
import { getCatalog } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const [s, catalog] = await Promise.all([getSettings(), getCatalog()]);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Services</h1>
          <p>Prices are per 1,000 unless marked as a package.</p>
        </div>
      </div>
      <ServicesTable catalog={catalog} symbol={s.currencySymbol} orderLinks />
    </>
  );
}
