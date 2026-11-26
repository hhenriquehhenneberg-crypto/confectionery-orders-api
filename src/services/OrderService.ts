import { OrderRepository } from "../repositories/OrderRepository";
import { CustomerRepository } from "../repositories/CustomerRepository";
import { PaymentRepository } from "../repositories/PaymentRepository";
import { Transaction } from "../repositories/Transaction";
import { CreateOrderDTO, UpdateOrderDTO } from "../models/Order";
import { OrderRules } from "../models/OrderRules";
import { AppError } from "../errors/AppError";

export class OrderService {
  constructor(
    private readonly orders = new OrderRepository(),
    private readonly customers = new CustomerRepository(),
    private readonly payments = new PaymentRepository(),
    private readonly transaction = new Transaction(),
  ) {}
  list() { return this.orders.findAll(); }
  async get(id: string) {
    const order = await this.orders.findById(id);
    if (!order) throw new AppError(404, "Encomenda não encontrada.");
    return order;
  }
  async create(data: CreateOrderDTO) {
    if (!await this.customers.findById(data.customer_id)) throw new AppError(404, "Cliente não encontrado.");
    return this.orders.create(data);
  }
  update(id: string, data: UpdateOrderDTO) {
    return this.transaction.run(async ({ orders, customers, payments }) => {
      const order = await orders.findByIdForUpdate(id);
      if (!order) throw new AppError(404, "Encomenda não encontrada.");
      if (data.customer_id && !await customers.findById(data.customer_id)) throw new AppError(404, "Cliente não encontrado.");
      new OrderRules(order, await payments.totalForOrder(id)).assertUpdate(data);
      const updated = await orders.update(id, data);
      if (!updated) throw new AppError(404, "Encomenda não encontrada.");
      return updated;
    });
  }
  delete(id: string) {
    return this.transaction.run(async ({ orders, payments }) => {
      const order = await orders.findByIdForUpdate(id);
      if (!order) throw new AppError(404, "Encomenda não encontrada.");
      new OrderRules(order, await payments.totalForOrder(id)).assertDeletion();
      if (!await orders.delete(id)) throw new AppError(404, "Encomenda não encontrada.");
    });
  }
  async listPayments(id: string) {
    await this.get(id);
    return this.payments.findByOrderId(id);
  }
}
