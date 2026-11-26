import { Request, Response } from "express";
import { CustomerService } from "../services/CustomerService";
import { uuidSchema, customerSchema, customerUpdateSchema } from "../validators/schemas";

export class CustomerController {
  constructor(private readonly service = new CustomerService()) {}
  list = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.service.list());
  };
  get = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.get(uuidSchema.parse(req.params.id)));
  };
  create = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.create(customerSchema.parse(req.body));
    res.location(`/customers/${result.id}`).status(201).json(result);
  };
  update = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.update(uuidSchema.parse(req.params.id), customerUpdateSchema.parse(req.body)));
  };
  delete = async (req: Request, res: Response): Promise<void> => {
    await this.service.delete(uuidSchema.parse(req.params.id));
    res.status(204).send();
  };
  listOrders = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.listOrders(uuidSchema.parse(req.params.id)));
  };
}
