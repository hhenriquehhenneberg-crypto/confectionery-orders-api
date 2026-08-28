import express from "express";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Restaurant Ordering System API" });
});

app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);

export default app;
