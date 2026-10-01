import { Request, Response } from "express";
import { OrderRepository } from "../repositories/OrderRepository";
import { CustomerRepository } from "../repositories/CustomerRepository";
import { AppError } from "../errors/AppError";
import { uuidSchema, orderSchema, orderUpdateSchema } from "../validators/schemas";

export class OrderController {
  private readonly repository = new OrderRepository();
  private readonly customers = new CustomerRepository();
  list = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.repository.findAll());
  };
  get = async (req: Request, res: Response): Promise<void> => {
    const id = uuidSchema.parse(req.params.id);
    const result = await this.repository.findById(id);
    if (!result) throw new AppError(404, "Encomenda não encontrada.");
    res.json(result);
  };
  create = async (req: Request, res: Response): Promise<void> => {
    const data = orderSchema.parse(req.body);
    if (!await this.customers.findById(data.customer_id)) throw new AppError(404, "Cliente não encontrado.");
    const result = await this.repository.create(data);
    res.location(`/orders/${result.id}`).status(201).json(result);
  };
  update = async (req: Request, res: Response): Promise<void> => {
    const id = uuidSchema.parse(req.params.id);
    const data = orderUpdateSchema.parse(req.body);
    if (!await this.repository.findById(id)) throw new AppError(404, "Encomenda não encontrada.");
    if (data.customer_id && !await this.customers.findById(data.customer_id)) throw new AppError(404, "Cliente não encontrado.");
    const result = await this.repository.update(id, data);
    if (!result) throw new AppError(404, "Encomenda não encontrada.");
    res.json(result);
  };
  delete = async (req: Request, res: Response): Promise<void> => {
    const id = uuidSchema.parse(req.params.id);
    if (!await this.repository.findById(id)) throw new AppError(404, "Encomenda não encontrada.");

    if (!await this.repository.delete(id)) throw new AppError(404, "Encomenda não encontrada.");
    res.status(204).send();
  };

}
