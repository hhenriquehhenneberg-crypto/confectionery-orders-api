import { Router } from "express";
import { ProductController } from "../controllers/ProductController";

const productRoutes = Router();
const productController = new ProductController();

productRoutes.get("/", (req, res) => productController.list(req, res));
productRoutes.post("/", (req, res) => productController.create(req, res));

export default productRoutes;
