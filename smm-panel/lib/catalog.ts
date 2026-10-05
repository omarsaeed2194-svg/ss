import { query } from "./db";
import type { ServiceType } from "./format";

export interface CatalogService {
  id: number;
  name: string;
  description: string;
  type: ServiceType;
  rate: number;
  min: number;
  max: number;
  refill: boolean;
  cancel: boolean;
}

export interface CatalogCategory {
  id: number;
  name: string;
  services: CatalogService[];
}

/** Active categories with their active services, in display order. */
export async function getCatalog(): Promise<CatalogCategory[]> {
  const rows = await query<CatalogService & { category_id: number; category_name: string }>(
    `SELECT s.id, s.name, s.description, s.type, s.rate, s.min, s.max, s.refill, s.cancel,
            c.id AS category_id, c.name AS category_name
     FROM services s JOIN categories c ON c.id = s.category_id
     WHERE s.active AND c.active
     ORDER BY c.sort, c.id, s.sort, s.id`
  );
  const cats = new Map<number, CatalogCategory>();
  for (const { category_id, category_name, ...svc } of rows) {
    if (!cats.has(category_id)) cats.set(category_id, { id: category_id, name: category_name, services: [] });
    cats.get(category_id)!.services.push({ ...svc, rate: Number(svc.rate) });
  }
  return [...cats.values()];
}
