import { Router } from "express";
import { CustomerController } from "../controllers/CustomerController";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router();
const controller = new CustomerController();
router.get("/", asyncHandler(controller.list));
router.get("/:id", asyncHandler(controller.get));
router.post("/", asyncHandler(controller.create));
router.put("/:id", asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.delete));
router.get("/:id/orders", asyncHandler(controller.listOrders));
export default router;
