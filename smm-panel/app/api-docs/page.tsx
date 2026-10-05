import { ApiDocs } from "@/components/ApiDocs";
import { PublicFooter, PublicNav } from "@/components/PublicNav";
import { getUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { baseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";
export const metadata = { title: "API" };

export default async function PublicApiDocs() {
  const [s, user] = await Promise.all([getSettings(), getUser()]);
  return (
    <div className="lp">
      <PublicNav siteName={s.siteName} signedIn={!!user} />
      <main className="lp-container public-page stack" style={{ maxWidth: 1000 }}>
        <div className="page-head">
          <div>
            <h1>API</h1>
            <p>Standard SMM panel API (v2) — compatible with every major panel script and reseller bot.</p>
          </div>
        </div>
        <ApiDocs endpoint={`${await baseUrl()}/api/v2`} />
      </main>
      <PublicFooter siteName={s.siteName} supportEmail={s.supportEmail} />
    </div>
  );
}
