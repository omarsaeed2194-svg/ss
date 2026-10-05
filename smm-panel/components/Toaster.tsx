"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; kind: "ok" | "error"; text: string };
const EVENT = "smm:toast";

/** Show a message that survives the re-render a server action triggers (the button that fired it may be gone). */
export function toast(kind: Toast["kind"], text: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { kind, text } }));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    let n = 0;
    const onToast = (e: Event) => {
      const { kind, text } = (e as CustomEvent<Omit<Toast, "id">>).detail;
      const id = ++n;
      setToasts((t) => [...t.slice(-3), { id, kind, text }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 8000 : 4000);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);
  return (
    <div className="toaster" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`alert alert-${t.kind === "ok" ? "success" : "error"} toast`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
