// Pure helpers, safe to import from client components.

export function money(n: number | null | undefined, symbol = "$") {
  const v = Number(n ?? 0);
  // At least 2 decimals, up to 4 for sub-cent amounts (rates and small charges).
  let s = Math.abs(v).toFixed(4).replace(/0{1,2}$/, "");
  if (Math.abs(v) >= 1000) s = Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${v < 0 ? "-" : ""}${symbol}${s}`;
}

export const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

export const num = (n: number | null | undefined) => (n == null ? "—" : Number(n).toLocaleString("en-US"));

export type ServiceType = "default" | "package" | "custom_comments";
export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  default: "Default",
  package: "Package",
  custom_comments: "Custom Comments",
};

export const ORDER_STATUSES = ["pending", "in_progress", "processing", "completed", "partial", "canceled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  in_progress: "In progress",
  processing: "Processing",
  completed: "Completed",
  partial: "Partial",
  canceled: "Canceled",
  open: "Open",
  answered: "Answered",
  closed: "Closed",
  rejected: "Rejected",
};

export function chargeFor(service: { type: string; rate: number }, quantity: number) {
  return round6(service.type === "package" ? Number(service.rate) : (Number(service.rate) * quantity) / 1000);
}
