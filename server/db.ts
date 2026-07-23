import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("No database URL configured.");
}

export const pool = new Pool({
  connectionString: databaseUrl,
});
export const db = drizzle(pool, { schema });
