import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";

const categoryRoutes = Router();
const categoryController = new CategoryController();

categoryRoutes.get("/", (req, res) => categoryController.list(req, res));
categoryRoutes.post("/", (req, res) => categoryController.create(req, res));

export default categoryRoutes;
