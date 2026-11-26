import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";
import { uuidSchema, orderSchema, orderUpdateSchema } from "../validators/schemas";

export class OrderController {
  constructor(private readonly service = new OrderService()) {}
  list = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.service.list());
  };
  get = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.get(uuidSchema.parse(req.params.id)));
  };
  create = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.create(orderSchema.parse(req.body));
    res.location(`/orders/${result.id}`).status(201).json(result);
  };
  update = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.update(uuidSchema.parse(req.params.id), orderUpdateSchema.parse(req.body)));
  };
  delete = async (req: Request, res: Response): Promise<void> => {
    await this.service.delete(uuidSchema.parse(req.params.id));
    res.status(204).send();
  };
  listPayments = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.listPayments(uuidSchema.parse(req.params.id)));
  };
}
