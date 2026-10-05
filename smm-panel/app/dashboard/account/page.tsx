import { changePassword } from "@/app/actions/account";
import { ActionForm } from "@/components/ActionForm";
import { Time } from "@/components/Time";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Account</h1>
        </div>
      </div>
      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card card-body">
          <table className="table">
            <tbody>
              <tr>
                <td className="muted">Username</td>
                <td>{user.username}</td>
              </tr>
              <tr>
                <td className="muted">Email</td>
                <td>{user.email}</td>
              </tr>
              <tr>
                <td className="muted">Member since</td>
                <td>
                  <Time value={user.created_at} dateOnly />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-head">
            <h2>Change password</h2>
          </div>
          <div className="card-body">
            <ActionForm action={changePassword} submit="Update password" pendingText="Saving…" resetOnOk>
              <label className="field">
                <span>Current password</span>
                <input name="current" type="password" autoComplete="current-password" required />
              </label>
              <label className="field">
                <span>New password</span>
                <input name="password" type="password" autoComplete="new-password" required minLength={8} />
              </label>
              <label className="field">
                <span>Confirm new password</span>
                <input name="confirm" type="password" autoComplete="new-password" required minLength={8} />
              </label>
            </ActionForm>
          </div>
        </div>
      </div>
    </>
  );
}
