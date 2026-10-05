import { cache } from "react";
import { one, query } from "./db";

export interface Settings {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  currencyCode: string;
  currencySymbol: string;
  announcement: string;
  registrationOpen: boolean;
  supportEmail: string;
  terms: string;
}

export const DEFAULT_SETTINGS: Settings = {
  siteName: "BoostPanel",
  heroTitle: "Grow every account from one panel",
  heroSubtitle:
    "Followers, likes, views and members for Instagram, TikTok, YouTube, Telegram and more — automated delivery, wholesale prices and an API for resellers.",
  currencyCode: "USD",
  currencySymbol: "$",
  announcement: "",
  registrationOpen: true,
  supportEmail: "",
  terms:
    "1. Services are delivered to public accounts and links only. Private or deleted targets can't be refunded once an order has started.\n2. Do not place two orders for the same link at the same time; start counts and delivery can't be guaranteed.\n3. Refills are only offered on services marked with refill, within the stated period.\n4. Funds added to your balance can be spent on any service and are not withdrawable.\n5. We may change prices and services at any time; existing orders keep the price they were placed at.",
};

export const getSettings = cache(async (): Promise<Settings> => {
  const row = await one<{ value: string }>("SELECT value FROM settings WHERE key = 'site'");
  let stored: Partial<Settings> = {};
  try {
    stored = row ? JSON.parse(row.value) : {};
  } catch {}
  return { ...DEFAULT_SETTINGS, ...stored };
});

export async function saveSettings(next: Settings) {
  await query(
    "INSERT INTO settings (key, value) VALUES ('site', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
    [JSON.stringify(next)]
  );
}
