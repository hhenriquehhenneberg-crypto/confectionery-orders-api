import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { vi } from "vitest";
import { database } from "../../src/config/database";
import { Pool } from "pg";
import { randomUUID } from "node:crypto";

export async function createTestDatabase() {
  if (process.env.TEST_DATABASE_URL) return createPostgresDatabase(process.env.TEST_DATABASE_URL);
  const db = new PGlite();
  await db.exec(readFileSync("database/create_tables.sql", "utf8"));
  let tail = Promise.resolve();
  async function lock() {
    const previous = tail;
    let release!: () => void;
    tail = new Promise<void>(resolve => { release = resolve; });
    await previous;
    return release;
  }
  const query = async (text: string, values?: unknown[]) => {
    const result = await db.query(text, values);
    return { rows: result.rows, rowCount: result.affectedRows ?? result.rows.length };
  };
  const querySpy = vi.spyOn(database, "query").mockImplementation((async (text: string, values?: unknown[]) => {
    const release = await lock();
    try { return await query(text, values); } finally { release(); }
  }) as never);
  const connectSpy = vi.spyOn(database, "connect").mockImplementation((async () => {
    const release = await lock();
    return { query, release };
  }) as never);
  return {
    db,
    async close() {
      querySpy.mockRestore();
      connectSpy.mockRestore();
      await db.close();
      await database.end();
    },
  };
}

// Cada execução usa um schema exclusivo. Nenhum registro da aplicação é consultado ou removido.
async function createPostgresDatabase(connectionString: string) {
  const schema = "test_" + randomUUID().replaceAll("-", "");
  const admin = new Pool({ connectionString });
  const pool = new Pool({ connectionString, options: "-c search_path=" + schema });
  try {
    await admin.query("create schema " + schema);
    await pool.query(readFileSync("database/create_tables.sql", "utf8").replaceAll("public.", schema + "."));
  } catch (error) {
    await pool.end();
    await admin.query("drop schema if exists " + schema + " cascade");
    await admin.end();
    throw error;
  }
  const querySpy = vi.spyOn(database, "query").mockImplementation(pool.query.bind(pool) as never);
  const connectSpy = vi.spyOn(database, "connect").mockImplementation(pool.connect.bind(pool) as never);
  return {
    db: pool,
    async close() {
      querySpy.mockRestore();
      connectSpy.mockRestore();
      await pool.end();
      await admin.query("drop schema " + schema + " cascade");
      await admin.end();
      await database.end();
    },
  };
}
