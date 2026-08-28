import "dotenv/config";
import app from "./app";
import { database } from "./config/database";

const PORT = Number(process.env.PORT) || 3000;

async function start(): Promise<void> {
  try {
    await database.query("select 1");

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Não foi possível conectar ao banco de dados.", error);
    process.exit(1);
  }
}

start();
