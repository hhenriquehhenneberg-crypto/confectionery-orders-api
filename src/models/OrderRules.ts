import { AppError } from "../errors/AppError";
import { Order, UpdateOrderDTO } from "./Order";

// Valores monetários são comparados em centavos, evitando diferenças de ponto flutuante.
export class OrderRules {
  constructor(private readonly order: Order, private readonly paid: number) {}

  assertPayment(amount: number): void {
    if (this.order.status === "cancelled") {
      throw new AppError(409, "Não é possível registrar pagamento de encomenda cancelada.");
    }
    if (Math.round((this.paid + amount) * 100) > Math.round(this.order.total_price * 100)) {
      throw new AppError(409, "Pagamento excede o saldo da encomenda.");
    }
  }

  assertUpdate(data: UpdateOrderDTO): void {
    if (data.total_price !== undefined && Math.round(data.total_price * 100) < Math.round(this.paid * 100)) {
      throw new AppError(409, "O preço não pode ser menor que o total já pago.");
    }
    if (data.status === "cancelled" && this.paid > 0) {
      throw new AppError(409, "Remova os pagamentos antes de cancelar a encomenda.");
    }
  }

  assertDeletion(): void {
    if (this.paid > 0) throw new AppError(409, "Remova os pagamentos antes de excluir a encomenda.");
  }
}
