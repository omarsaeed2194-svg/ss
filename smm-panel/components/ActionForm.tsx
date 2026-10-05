"use client";

import { useRef, useState } from "react";
import type { FormResult } from "@/app/actions/auth";
import { SubmitButton } from "./SubmitButton";
import { toast } from "./Toaster";

/**
 * Runs a server action and shows the error/success message it returns — inline,
 * or as a toast for forms that disappear once the action succeeds (rows in a list).
 */
export function ActionForm({
  action,
  children,
  submit,
  pendingText,
  className = "stack",
  resetOnOk,
  feedback = "inline",
}: {
  action: (fd: FormData) => Promise<FormResult>;
  children: React.ReactNode;
  submit: string;
  pendingText?: string;
  className?: string;
  resetOnOk?: boolean;
  feedback?: "inline" | "toast";
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<FormResult>();
  return (
    <form
      ref={ref}
      className={className}
      action={async (fd) => {
        const res = await action(fd);
        if (feedback === "toast") {
          if (res?.error) toast("error", res.error);
          else if (res?.ok) toast("ok", res.ok);
        } else setResult(res);
        if (res?.ok && resetOnOk) ref.current?.reset();
      }}
    >
      {children}
      {result?.error && <div className="alert alert-error">{result.error}</div>}
      {result?.ok && <div className="alert alert-success">{result.ok}</div>}
      <div className="form-actions">
        <SubmitButton pendingText={pendingText}>{submit}</SubmitButton>
      </div>
    </form>
  );
}
