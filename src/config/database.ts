import { Pool } from "pg";
import "dotenv/config";

// TLS é configurado pela URL (sslmode=verify-full) e, se necessário, PGSSLROOTCERT.
let connectionString = process.env.DATABASE_URL;
if (connectionString && process.env.PGSSLROOTCERT) {
  const url = new URL(connectionString);
  url.searchParams.set("sslrootcert", process.env.PGSSLROOTCERT);
  connectionString = url.toString();
}
export const database = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
  max: 10,
});
database.on("error", () => console.error("Conexão ociosa com o banco foi interrompida."));
