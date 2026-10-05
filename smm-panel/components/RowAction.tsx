"use client";

import { useTransition } from "react";
import type { FormResult } from "@/app/actions/auth";
import { toast } from "./Toaster";

/** A small button that runs a server action with fixed fields and reports the outcome as a toast. */
export function RowAction({
  action,
  fields,
  label,
  confirm,
  className = "btn btn-sm",
}: {
  action: (fd: FormData) => Promise<FormResult>;
  fields: Record<string, string | number>;
  label: string;
  confirm?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        const fd = new FormData();
        for (const [k, v] of Object.entries(fields)) fd.set(k, String(v));
        start(async () => {
          const res = await action(fd);
          if (res?.error) toast("error", res.error);
          else if (res?.ok) toast("ok", res.ok);
        });
      }}
    >
      {pending ? "Working…" : label}
    </button>
  );
}
