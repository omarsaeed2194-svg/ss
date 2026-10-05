import { updateSettings } from "@/app/actions/admin";
import { ActionForm } from "@/components/ActionForm";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Settings · Admin" };

export default async function AdminSettings() {
  await requireAdmin();
  const s = await getSettings();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
        </div>
      </div>
      <div className="card card-body" style={{ maxWidth: 860 }}>
        <ActionForm action={updateSettings} submit="Save settings" pendingText="Saving…">
          <div className="grid-form">
            <label className="field">
              <span>Panel name</span>
              <input name="siteName" defaultValue={s.siteName} required maxLength={60} />
            </label>
            <label className="field">
              <span>Currency code</span>
              <input name="currencyCode" defaultValue={s.currencyCode} maxLength={6} />
              <span className="hint">Returned by the API (e.g. USD, EUR, SAR).</span>
            </label>
            <label className="field">
              <span>Currency symbol</span>
              <input name="currencySymbol" defaultValue={s.currencySymbol} maxLength={6} />
            </label>
          </div>
          <label className="field">
            <span>Homepage headline</span>
            <input name="heroTitle" defaultValue={s.heroTitle} maxLength={120} />
            <span className="hint">The last two words are highlighted.</span>
          </label>
          <label className="field">
            <span>Homepage subheading</span>
            <textarea name="heroSubtitle" rows={3} defaultValue={s.heroSubtitle} maxLength={400} />
          </label>
          <label className="field">
            <span>Dashboard announcement</span>
            <textarea name="announcement" rows={2} defaultValue={s.announcement} maxLength={500} placeholder="Shown at the top of every customer page. Leave empty to hide." />
          </label>
          <div className="grid-form">
            <label className="field">
              <span>Support email</span>
              <input name="supportEmail" type="email" defaultValue={s.supportEmail} />
            </label>
            <label className="check" style={{ alignSelf: "end", paddingBottom: 10 }}>
              <input type="checkbox" name="registrationOpen" defaultChecked={s.registrationOpen} /> Allow new sign-ups
            </label>
          </div>
          <label className="field">
            <span>Terms of service</span>
            <textarea name="terms" rows={10} defaultValue={s.terms} />
          </label>
        </ActionForm>
      </div>
    </>
  );
}
