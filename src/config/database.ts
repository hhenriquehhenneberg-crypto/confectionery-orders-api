import { Pool } from "pg";
import "dotenv/config";

export const database = new Pool({
  connectionString: process.env.DATABASE_URL,
});
