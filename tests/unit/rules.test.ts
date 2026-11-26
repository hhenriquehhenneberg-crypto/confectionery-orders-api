import { describe, test, expect } from "vitest";
import { OrderRules } from "../../src/models/OrderRules";
import { Order } from "../../src/models/Order";
const order = { id: "order", total_price: 0.3, status: "pending" } as Order;
describe("OrderRules", () => {
  test("aceita o saldo exato usando centavos", () => {
    expect(() => new OrderRules(order, 0.1).assertPayment(0.2)).not.toThrow();
  });
  test("recusa pagamento superior ao saldo", () => {
    expect(() => new OrderRules(order, 0.2).assertPayment(0.2)).toThrow("excede");
  });
  test("recusa pagamento em encomenda cancelada", () => {
    expect(() => new OrderRules({ ...order, status: "cancelled" }, 0).assertPayment(0.1)).toThrow("cancelada");
  });
  test("recusa reduzir o preço abaixo do total pago", () => {
    expect(() => new OrderRules(order, 0.2).assertUpdate({ total_price: 0.1 })).toThrow("menor");
  });
  test("permite preço igual ao total pago e alterações sem preço", () => {
    const rules = new OrderRules(order, 0.2);
    expect(() => rules.assertUpdate({ total_price: 0.2 })).not.toThrow();
    expect(() => rules.assertUpdate({ title: "Outro bolo" })).not.toThrow();
  });
  test("cancelar e excluir exige ausência de pagamentos", () => {
    expect(() => new OrderRules(order, 0.1).assertUpdate({ status: "cancelled" })).toThrow("cancelar");
    expect(() => new OrderRules(order, 0.1).assertDeletion()).toThrow("excluir");
    expect(() => new OrderRules(order, 0).assertUpdate({ status: "cancelled" })).not.toThrow();
    expect(() => new OrderRules(order, 0).assertDeletion()).not.toThrow();
  });
});
