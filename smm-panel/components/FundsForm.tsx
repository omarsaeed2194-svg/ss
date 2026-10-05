"use client";

import { useState } from "react";
import { createPayment } from "@/app/actions/account";
import { money } from "@/lib/format";
import { ActionForm } from "./ActionForm";

export interface Method {
  id: number;
  name: string;
  instructions: string;
  min_amount: number;
  bonus_percent: number;
}

export function FundsForm({ methods, symbol }: { methods: Method[]; symbol: string }) {
  const [id, setId] = useState(methods[0]?.id);
  const m = methods.find((x) => x.id === id);
  if (!methods.length) return <div className="empty">No payment methods are available yet. Please contact support.</div>;
  return (
    <ActionForm action={createPayment} submit="Submit payment" pendingText="Submitting…" resetOnOk>
      <label className="field">
        <span>Method</span>
        <select name="method" value={id} onChange={(e) => setId(Number(e.target.value))}>
          {methods.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
              {x.bonus_percent > 0 ? ` (+${x.bonus_percent}% bonus)` : ""}
            </option>
          ))}
        </select>
      </label>
      {m && (
        <div className="desc-box">
          {m.instructions || "Contact support for payment details."}
          {"\n\n"}Minimum: {money(m.min_amount, symbol)}
          {m.bonus_percent > 0 && `\nBonus: +${m.bonus_percent}% added to your balance`}
        </div>
      )}
      <div className="grid-form">
        <label className="field">
          <span>Amount</span>
          <input name="amount" type="number" step="0.01" min={m?.min_amount} inputMode="decimal" required />
        </label>
        <label className="field">
          <span>Transaction ID / reference</span>
          <input name="reference" maxLength={300} required autoComplete="off" />
        </label>
      </div>
    </ActionForm>
  );
}
