import Link from "next/link";
import { redirect } from "next/navigation";
import { login } from "@/app/actions/auth";
import { ActionForm } from "@/components/ActionForm";
import { Brand } from "@/components/Brand";
import { getUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getUser()) redirect("/dashboard");
  const s = await getSettings();
  return (
    <div className="auth">
      <div className="card auth-card">
        <Brand name={s.siteName} />
        <h1>Welcome back</h1>
        <p className="muted" style={{ marginBottom: 20 }}>
          Sign in to place orders and track them.
        </p>
        <ActionForm action={login} submit="Sign in" pendingText="Signing in…">
          <label className="field">
            <span>Username or email</span>
            <input name="login" autoComplete="username" required autoFocus />
          </label>
          <label className="field">
            <span>Password</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
        </ActionForm>
        <p className="muted small" style={{ marginTop: 18 }}>
          No account yet? <Link href="/register">Create one</Link>
          {s.supportEmail && (
            <>
              <br />
              Forgot your password? Email <a href={`mailto:${s.supportEmail}`}>{s.supportEmail}</a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
