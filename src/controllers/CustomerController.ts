import { Request, Response } from "express";
import { CustomerRepository } from "../repositories/CustomerRepository";
import { OrderRepository } from "../repositories/OrderRepository";
import { AppError } from "../errors/AppError";
import { uuidSchema, customerSchema, customerUpdateSchema } from "../validators/schemas";

export class CustomerController {
  private readonly repository = new CustomerRepository();
  private readonly orders = new OrderRepository();
  list = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.repository.findAll());
  };
  get = async (req: Request, res: Response): Promise<void> => {
    const id = uuidSchema.parse(req.params.id);
    const result = await this.repository.findById(id);
    if (!result) throw new AppError(404, "Cliente não encontrado.");
    res.json(result);
  };
  create = async (req: Request, res: Response): Promise<void> => {
    const data = customerSchema.parse(req.body);

    const result = await this.repository.create(data);
    res.location(`/customers/${result.id}`).status(201).json(result);
  };
  update = async (req: Request, res: Response): Promise<void> => {
    const id = uuidSchema.parse(req.params.id);
    const data = customerUpdateSchema.parse(req.body);
    if (!await this.repository.findById(id)) throw new AppError(404, "Cliente não encontrado.");

    const result = await this.repository.update(id, data);
    if (!result) throw new AppError(404, "Cliente não encontrado.");
    res.json(result);
  };
  delete = async (req: Request, res: Response): Promise<void> => {
    const id = uuidSchema.parse(req.params.id);
    if (!await this.repository.findById(id)) throw new AppError(404, "Cliente não encontrado.");
    if (await this.repository.hasOrders(id)) throw new AppError(409, "Não é possível excluir um cliente que possui encomendas.");
    if (!await this.repository.delete(id)) throw new AppError(404, "Cliente não encontrado.");
    res.status(204).send();
  };

  listOrders = async (req: Request, res: Response): Promise<void> => {
    const id = uuidSchema.parse(req.params.id);
    if (!await this.repository.findById(id)) throw new AppError(404, "Cliente não encontrado.");
    res.json(await this.orders.findByCustomerId(id));
  };
}
