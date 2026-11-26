import express from "express";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import customerRoutes from "./routes/customerRoutes";
import orderRoutes from "./routes/orderRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { openapi } from "./docs/openapi";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.get("/", (_req, res) => {
  res.json({ message: "Confectionery Orders API", status: "running" });
});
// Liveness: informa que o processo está atendendo; a conexão é verificada ao iniciar o servidor.
app.get("/health", (_req, res) => { res.json({ status: "ok" }); });
app.get("/app/config.json", (_req, res) => {
  res.json({ demo: process.env.DEMO_MODE === "true" });
});
app.use("/app", express.static(path.join(__dirname, "..", "public")));
app.get("/openapi.json", (_req, res) => { res.json(openapi); });
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.use("/customers", customerRoutes);
app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);
app.use((_req, res) => { res.status(404).json({ message: "Rota não encontrada." }); });
app.use(errorHandler);
export default app;
