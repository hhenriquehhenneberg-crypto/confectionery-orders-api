import { database } from "../config/database";
export async function checkDatabase(): Promise<void> { await database.query("select 1"); }
