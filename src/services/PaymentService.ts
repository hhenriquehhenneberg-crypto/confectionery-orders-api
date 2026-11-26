import { PaymentRepository } from "../repositories/PaymentRepository";
import { Transaction } from "../repositories/Transaction";
import { CreatePaymentDTO, UpdatePaymentDTO } from "../models/Payment";
import { OrderRules } from "../models/OrderRules";
import { AppError } from "../errors/AppError";

export class PaymentService {
  constructor(private readonly payments = new PaymentRepository(), private readonly transaction = new Transaction()) {}
  list() { return this.payments.findAll(); }
  async get(id: string) {
    const payment = await this.payments.findById(id);
    if (!payment) throw new AppError(404, "Pagamento não encontrado.");
    return payment;
  }
  create(data: CreatePaymentDTO) {
    return this.transaction.run(async ({ orders, payments }) => {
      const order = await orders.findByIdForUpdate(data.order_id);
      if (!order) throw new AppError(404, "Encomenda não encontrada.");
      new OrderRules(order, await payments.totalForOrder(order.id)).assertPayment(data.amount);
      return payments.create(data);
    });
  }
  async update(id: string, data: UpdatePaymentDTO) {
    const original = await this.get(id);
    return this.transaction.run(async ({ orders, payments }) => {
      const order = await orders.findByIdForUpdate(original.order_id);
      if (!order) throw new AppError(404, "Encomenda não encontrada.");
      const payment = await payments.findById(id);
      if (!payment) throw new AppError(404, "Pagamento não encontrado.");
      new OrderRules(order, await payments.totalForOrder(order.id, id)).assertPayment(data.amount ?? payment.amount);
      const updated = await payments.update(id, data);
      if (!updated) throw new AppError(404, "Pagamento não encontrado.");
      return updated;
    });
  }
  async delete(id: string) {
    const payment = await this.get(id);
    return this.transaction.run(async ({ orders, payments }) => {
      if (!await orders.findByIdForUpdate(payment.order_id)) throw new AppError(404, "Encomenda não encontrada.");
      if (!await payments.delete(id)) throw new AppError(404, "Pagamento não encontrado.");
    });
  }
}
