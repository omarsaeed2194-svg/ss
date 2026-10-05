import { PublicFooter, PublicNav } from "@/components/PublicNav";
import { getUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Terms of service" };

export default async function Terms() {
  const [s, user] = await Promise.all([getSettings(), getUser()]);
  return (
    <div className="lp">
      <PublicNav siteName={s.siteName} signedIn={!!user} />
      <main className="lp-container public-page" style={{ maxWidth: 820 }}>
        <h1>Terms of service</h1>
        <div className="card card-body pre" style={{ marginTop: 20 }}>
          {s.terms}
        </div>
      </main>
      <PublicFooter siteName={s.siteName} supportEmail={s.supportEmail} />
    </div>
  );
}
