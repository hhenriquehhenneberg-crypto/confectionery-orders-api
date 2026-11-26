import { Request, Response } from "express";
import { PaymentService } from "../services/PaymentService";
import { uuidSchema, paymentSchema, paymentUpdateSchema } from "../validators/schemas";

export class PaymentController {
  constructor(private readonly service = new PaymentService()) {}
  list = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.service.list());
  };
  get = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.get(uuidSchema.parse(req.params.id)));
  };
  create = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.create(paymentSchema.parse(req.body));
    res.location(`/payments/${result.id}`).status(201).json(result);
  };
  update = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.update(uuidSchema.parse(req.params.id), paymentUpdateSchema.parse(req.body)));
  };
  delete = async (req: Request, res: Response): Promise<void> => {
    await this.service.delete(uuidSchema.parse(req.params.id));
    res.status(204).send();
  };
}
