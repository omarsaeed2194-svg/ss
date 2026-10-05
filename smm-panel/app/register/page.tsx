import Link from "next/link";
import { redirect } from "next/navigation";
import { register } from "@/app/actions/auth";
import { ActionForm } from "@/components/ActionForm";
import { Brand } from "@/components/Brand";
import { getUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  if (await getUser()) redirect("/dashboard");
  const s = await getSettings();
  return (
    <div className="auth">
      <div className="card auth-card">
        <Brand name={s.siteName} />
        <h1>Create your account</h1>
        <p className="muted" style={{ marginBottom: 20 }}>
          Free to join — add funds only when you're ready to order.
        </p>
        {s.registrationOpen ? (
          <ActionForm action={register} submit="Create account" pendingText="Creating…">
            <label className="field">
              <span>Username</span>
              <input name="username" autoComplete="username" required minLength={3} maxLength={24} pattern="[A-Za-z0-9_]+" autoFocus />
            </label>
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label className="field">
              <span>Password</span>
              <input name="password" type="password" autoComplete="new-password" required minLength={8} />
              <span className="hint">At least 8 characters.</span>
            </label>
            <label className="check">
              <input type="checkbox" name="terms" required /> I agree to the{" "}
              <Link href="/terms" target="_blank">
                terms of service
              </Link>
            </label>
          </ActionForm>
        ) : (
          <div className="alert alert-info">Registration is currently closed.</div>
        )}
        <p className="muted small" style={{ marginTop: 18 }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
