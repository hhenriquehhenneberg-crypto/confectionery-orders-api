import "dotenv/config";
import app from "./app";
import { database } from "./config/database";
import { checkDatabase } from "./repositories/HealthRepository";

async function start(): Promise<void> {
  const port = Number(process.env.PORT ?? 3000);
  if (!process.env.DATABASE_URL || !Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("Configure DATABASE_URL e PORT (1 a 65535) no .env.");
    process.exitCode = 1;
    await database.end();
    return;
  }
  try {
    await checkDatabase();
    const server = app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
    server.on("error", () => {
      console.error("Não foi possível iniciar o servidor HTTP.");
      void database.end();
      process.exitCode = 1;
    });
    const stop = () => {
      server.close(() => { void database.end(); });
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  } catch {
    console.error("Não foi possível conectar ao banco. Verifique DATABASE_URL, rede e certificado TLS.");
    await database.end();
    process.exitCode = 1;
  }
}
void start();
