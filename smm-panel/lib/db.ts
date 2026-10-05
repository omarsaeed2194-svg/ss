import { mkdirSync } from "fs";
import path from "path";
import { SCHEMA, seed } from "./schema";

// One Postgres dialect, two drivers: `pg` against DATABASE_URL in production,
// or an embedded PGlite (WASM Postgres) in ./data/pglite when it's unset.

export type Row = Record<string, any>;

export interface Q {
  query<T = Row>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

interface Db extends Q {
  tx<T>(fn: (q: Q) => Promise<T>): Promise<T>;
}

const NUMERIC = 1700;
const INT8 = 20;
const parseNumeric = (v: string) => parseFloat(v);
const parseInt8 = (v: string) => parseInt(v, 10);

async function connectPg(url: string): Promise<Db> {
  const pg = await import("pg");
  const { Pool, types } = pg.default ?? pg;
  types.setTypeParser(NUMERIC, parseNumeric);
  types.setTypeParser(INT8, parseInt8);
  const pool = new Pool({ connectionString: url, max: Number(process.env.DATABASE_POOL_SIZE) || 5 });
  return {
    query: (sql, params) => pool.query(sql, params as unknown[]) as Promise<{ rows: any[] }>,
    async tx(fn) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await fn({ query: (sql, params) => client.query(sql, params as unknown[]) as Promise<{ rows: any[] }> });
        await client.query("COMMIT");
        return result;
      } catch (e) {
        await client.query("ROLLBACK").catch(() => {});
        throw e;
      } finally {
        client.release();
      }
    },
  };
}

async function connectPglite(): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR || path.join(process.cwd(), "data", "pglite");
  mkdirSync(dir, { recursive: true });
  const db = new PGlite(dir, { parsers: { [NUMERIC]: parseNumeric, [INT8]: parseInt8 } });
  await db.waitReady;
  return {
    query: (sql, params) => db.query(sql, params as unknown[]) as Promise<{ rows: any[] }>,
    tx: (fn) => db.transaction((t) => fn({ query: (sql, params) => t.query(sql, params as unknown[]) as Promise<{ rows: any[] }> })),
  };
}

async function init(): Promise<Db> {
  const db = process.env.DATABASE_URL ? await connectPg(process.env.DATABASE_URL) : await connectPglite();
  // Serialized with an advisory lock so concurrent cold starts don't race on DDL or seeding.
  await db.tx(async (q) => {
    await q.query("SELECT pg_advisory_xact_lock(727274)");
    for (const stmt of SCHEMA) await q.query(stmt);
    await seed(q);
  });
  return db;
}

// Survive Next.js dev hot reloads: one connection (and one PGlite instance) per process.
const g = globalThis as unknown as { __smmDb?: Promise<Db> };

function db(): Promise<Db> {
  if (!g.__smmDb) {
    g.__smmDb = init().catch((e) => {
      g.__smmDb = undefined;
      throw e;
    });
  }
  return g.__smmDb;
}

export async function query<T = Row>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await (await db()).query<T>(sql, params)).rows;
}

export async function one<T = Row>(sql: string, params: unknown[] = []): Promise<T | null> {
  return (await query<T>(sql, params))[0] ?? null;
}

export async function tx<T>(fn: (q: Q) => Promise<T>): Promise<T> {
  return (await db()).tx(fn);
}

export const usingEmbeddedDb = !process.env.DATABASE_URL;
