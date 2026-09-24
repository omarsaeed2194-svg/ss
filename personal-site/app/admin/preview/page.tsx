"use client";

import { useEffect, useState } from "react";
import Site from "@/components/Site";
import type { SiteContent } from "@/lib/types";

/** Rendered inside the admin's iframe so responsive breakpoints match the real device width. */
export default function Preview() {
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === "site-content") setContent(e.data.content);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return content ? <Site content={content} preview /> : null;
}
