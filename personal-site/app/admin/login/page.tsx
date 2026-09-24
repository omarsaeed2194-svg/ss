"use client";

import { useState } from "react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) window.location.href = "/admin";
    else setError(((await res.json().catch(() => ({}))) as { error?: string }).error || "Login failed.");
  }

  return (
    <div className="adm adm-login">
      <form onSubmit={submit} className="adm-card">
        <h1>Site admin</h1>
        <p className="adm-muted">Sign in to edit your website.</p>
        <label className="adm-field">
          <span>Password</span>
          <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="adm-error">{error}</p>}
        <button className="adm-btn adm-btn-primary" disabled={busy || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <a href="/" className="adm-link">
          ← Back to site
        </a>
      </form>
    </div>
  );
}
