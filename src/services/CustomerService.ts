import { CustomerRepository } from "../repositories/CustomerRepository";
import { OrderRepository } from "../repositories/OrderRepository";
import { CreateCustomerDTO, UpdateCustomerDTO } from "../models/Customer";
import { AppError } from "../errors/AppError";

export class CustomerService {
  constructor(private readonly customers = new CustomerRepository(), private readonly orders = new OrderRepository()) {}
  list() { return this.customers.findAll(); }
  async get(id: string) {
    const customer = await this.customers.findById(id);
    if (!customer) throw new AppError(404, "Cliente não encontrado.");
    return customer;
  }
  create(data: CreateCustomerDTO) { return this.customers.create(data); }
  async update(id: string, data: UpdateCustomerDTO) {
    const customer = await this.customers.update(id, data);
    if (!customer) throw new AppError(404, "Cliente não encontrado.");
    return customer;
  }
  async delete(id: string) {
    await this.get(id);
    if (await this.customers.hasOrders(id)) throw new AppError(409, "Não é possível excluir um cliente que possui encomendas.");
    if (!await this.customers.delete(id)) throw new AppError(404, "Cliente não encontrado.");
  }
  async listOrders(id: string) {
    await this.get(id);
    return this.orders.findByCustomerId(id);
  }
}
