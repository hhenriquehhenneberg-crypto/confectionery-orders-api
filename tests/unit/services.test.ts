import { afterEach, test, expect, vi } from "vitest";
import { CustomerService } from "../../src/services/CustomerService";
import { OrderService } from "../../src/services/OrderService";
import { PaymentService } from "../../src/services/PaymentService";
import { CustomerRepository } from "../../src/repositories/CustomerRepository";
import { OrderRepository } from "../../src/repositories/OrderRepository";
import { PaymentRepository } from "../../src/repositories/PaymentRepository";
import { Transaction } from "../../src/repositories/Transaction";
import { database } from "../../src/config/database";
import { Order } from "../../src/models/Order";
import { Payment } from "../../src/models/Payment";

afterEach(() => { vi.restoreAllMocks(); });

test("CustomerService bloqueia exclusão com encomendas antes de acessar DELETE", async () => {
  const customers = new CustomerRepository();
  const orders = new OrderRepository();
  vi.spyOn(customers, "findById").mockResolvedValue({ id: "c" } as never);
  vi.spyOn(customers, "hasOrders").mockResolvedValue(true);
  const remove = vi.spyOn(customers, "delete");
  await expect(new CustomerService(customers, orders).delete("c")).rejects.toMatchObject({ statusCode: 409 });
  expect(remove).not.toHaveBeenCalled();
});

test("CustomerService trata remoção concorrente sem retornar sucesso falso", async () => {
  const customers = new CustomerRepository();
  vi.spyOn(customers, "findById").mockResolvedValue({ id: "c" } as never);
  vi.spyOn(customers, "hasOrders").mockResolvedValue(false);
  vi.spyOn(customers, "delete").mockResolvedValue(false);
  await expect(new CustomerService(customers).delete("c")).rejects.toMatchObject({ statusCode: 404 });
});

function dependencies() {
  const customers = new CustomerRepository();
  const orders = new OrderRepository();
  const payments = new PaymentRepository();
  const transaction = new Transaction();
  vi.spyOn(transaction, "run").mockImplementation(async work => work({ customers, orders, payments }));
  return { customers, orders, payments, transaction };
}
const order = { id: "o", customer_id: "c", total_price: 100, status: "pending" } as Order;
const payment = { id: "p", order_id: "o", amount: 40, method: "pix" } as Payment;

test("PaymentService recusa excesso usando o total dos demais pagamentos", async () => {
  const d = dependencies();
  vi.spyOn(d.payments, "findById").mockResolvedValue(payment);
  vi.spyOn(d.orders, "findByIdForUpdate").mockResolvedValue(order);
  const total = vi.spyOn(d.payments, "totalForOrder").mockResolvedValue(70);
  const update = vi.spyOn(d.payments, "update");
  await expect(new PaymentService(d.payments, d.transaction).update("p", { amount: 40 })).rejects.toMatchObject({ statusCode: 409 });
  expect(total).toHaveBeenCalledWith("o", "p");
  expect(update).not.toHaveBeenCalled();
});

test("PaymentService preserva o valor quando apenas o método é corrigido", async () => {
  const d = dependencies();
  vi.spyOn(d.payments, "findById").mockResolvedValue(payment);
  vi.spyOn(d.orders, "findByIdForUpdate").mockResolvedValue(order);
  vi.spyOn(d.payments, "totalForOrder").mockResolvedValue(60);
  vi.spyOn(d.payments, "update").mockResolvedValue({ ...payment, method: "cash" });
  expect(await new PaymentService(d.payments, d.transaction).update("p", { method: "cash" })).toMatchObject({ amount: 40, method: "cash" });
});

test("PaymentService trata pagamento removido entre a consulta e a transação", async () => {
  const d = dependencies();
  vi.spyOn(d.payments, "findById").mockResolvedValueOnce(payment).mockResolvedValueOnce(undefined);
  vi.spyOn(d.orders, "findByIdForUpdate").mockResolvedValue(order);
  await expect(new PaymentService(d.payments, d.transaction).update("p", { amount: 10 })).rejects.toMatchObject({ statusCode: 404 });
});

test("PaymentService não confirma atualização sem registro retornado", async () => {
  const d = dependencies();
  vi.spyOn(d.payments, "findById").mockResolvedValue(payment);
  vi.spyOn(d.orders, "findByIdForUpdate").mockResolvedValue(order);
  vi.spyOn(d.payments, "totalForOrder").mockResolvedValue(0);
  vi.spyOn(d.payments, "update").mockResolvedValue(undefined);
  await expect(new PaymentService(d.payments, d.transaction).update("p", { amount: 10 })).rejects.toMatchObject({ statusCode: 404 });
});

test("PaymentService verifica a encomenda em atualização e exclusão", async () => {
  const d = dependencies();
  vi.spyOn(d.payments, "findById").mockResolvedValue(payment);
  vi.spyOn(d.orders, "findByIdForUpdate").mockResolvedValue(undefined);
  const service = new PaymentService(d.payments, d.transaction);
  await expect(service.update("p", { amount: 10 })).rejects.toMatchObject({ statusCode: 404 });
  await expect(service.delete("p")).rejects.toMatchObject({ statusCode: 404 });
});

test("PaymentService trata exclusão concorrente", async () => {
  const d = dependencies();
  vi.spyOn(d.payments, "findById").mockResolvedValue(payment);
  vi.spyOn(d.orders, "findByIdForUpdate").mockResolvedValue(order);
  vi.spyOn(d.payments, "delete").mockResolvedValue(false);
  await expect(new PaymentService(d.payments, d.transaction).delete("p")).rejects.toMatchObject({ statusCode: 404 });
});

test("OrderService valida cliente ao criar e mantém regra de saldo no Service", async () => {
  const d = dependencies();
  vi.spyOn(d.customers, "findById").mockResolvedValue(undefined);
  const create = vi.spyOn(d.orders, "create");
  const service = new OrderService(d.orders, d.customers, d.payments, d.transaction);
  await expect(service.create({ customer_id: "inexistente", title: "Bolo", total_price: 10, delivery_date: "2026-12-10T15:00:00Z" })).rejects.toMatchObject({ statusCode: 404 });
  expect(create).not.toHaveBeenCalled();
  vi.spyOn(d.orders, "findByIdForUpdate").mockResolvedValue(order);
  vi.spyOn(d.payments, "totalForOrder").mockResolvedValue(40);
  await expect(service.update("o", { total_price: 30 })).rejects.toMatchObject({ statusCode: 409 });
});

test("Transaction confirma sucesso e libera a conexão", async () => {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const release = vi.fn();
  vi.spyOn(database, "connect").mockResolvedValue({ query, release } as never);
  const result = await new Transaction().run(async () => "ok");
  expect(result).toBe("ok");
  expect(query.mock.calls.map(call => call[0])).toEqual(["BEGIN", "COMMIT"]);
  expect(release).toHaveBeenCalledOnce();
});

test("Transaction reverte falha de negócio e libera conexão", async () => {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const release = vi.fn();
  vi.spyOn(database, "connect").mockResolvedValue({ query, release } as never);
  await expect(new Transaction().run(async () => { throw new Error("falha"); })).rejects.toThrow("falha");
  expect(query.mock.calls.map(call => call[0])).toEqual(["BEGIN", "ROLLBACK"]);
  expect(release).toHaveBeenCalledOnce();
});

test("CustomerRepository converte violação de FK em conflito", async () => {
  const query = vi.fn().mockRejectedValue({ code: "23503" });
  const repo = new CustomerRepository({ query } as never);
  await expect(repo.delete("c")).rejects.toMatchObject({ statusCode: 409 });
});

test("OrderRepository converte cliente removido em 404 e preserva outros erros", async () => {
  const query = vi.fn().mockRejectedValue({ code: "23503" });
  const repo = new OrderRepository({ query } as never);
  const data = { customer_id: "c", title: "Bolo", delivery_date: "2026-12-10T15:00:00Z", total_price: 10 };
  await expect(repo.create(data)).rejects.toMatchObject({ statusCode: 404 });
  await expect(repo.update("o", { customer_id: "c" })).rejects.toMatchObject({ statusCode: 404 });
  query.mockRejectedValue(new Error("falha no banco"));
  await expect(repo.create(data)).rejects.toThrow("falha no banco");
});
