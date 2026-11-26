import { beforeAll, afterAll, test, expect, vi } from "vitest";
import supertest from "supertest";
import { randomUUID } from "node:crypto";
import app from "../../src/app";
import { createTestDatabase } from "../helpers/database";
import { database } from "../../src/config/database";

const api = supertest(app);
let fixture: Awaited<ReturnType<typeof createTestDatabase>>;
beforeAll(async () => { fixture = await createTestDatabase(); });
afterAll(async () => { await fixture.close(); });
const customer = { name: " Mariana Souza ", phone: "41999999999", email: "mariana@example.com" };
const order = (id: string) => ({
  customer_id: id, title: "Bolo de aniversário", delivery_date: "2026-12-10T15:00:00-03:00", total_price: 280,
});

test("CRUD das três entidades, relação 1:N, códigos HTTP, dinheiro e timestamps", async () => {
  expect((await api.get("/")).body.message).toBe("Confectionery Orders API");
  expect((await api.get("/health")).status).toBe(200);
  for (const resource of ["customers", "orders", "payments"]) expect((await api.get("/" + resource)).body).toEqual([]);
  const created = await api.post("/customers").send(customer).expect(201);
  const c = created.body;
  expect(c.name).toBe("Mariana Souza");
  expect(created.headers.location).toBe("/customers/" + c.id);
  expect((await api.get("/customers/" + c.id)).body.id).toBe(c.id);
  expect((await api.get("/customers")).body).toHaveLength(1);
  const changedCustomer = await api.put("/customers/" + c.id).send({ email: null, phone: "123" }).expect(200);
  expect(changedCustomer.body.email).toBeNull();
  expect(Date.parse(changedCustomer.body.updated_at)).toBeGreaterThan(Date.parse(c.updated_at));
  const createdOrder = await api.post("/orders").send(order(c.id)).expect(201);
  const o = createdOrder.body;
  expect(o.status).toBe("pending");
  expect(createdOrder.headers.location).toBe("/orders/" + o.id);
  expect(o.total_price).toBe(280);
  expect(o.delivery_date).toBe("2026-12-10T18:00:00.000Z");
  expect((await api.get("/orders/" + o.id)).body.id).toBe(o.id);
  expect((await api.get("/orders")).body).toHaveLength(1);
  expect((await api.get("/customers/" + c.id + "/orders")).body).toHaveLength(1);
  const changedOrder = await api.put("/orders/" + o.id).send({ status: "confirmed", description: null }).expect(200);
  expect(Date.parse(changedOrder.body.updated_at)).toBeGreaterThan(Date.parse(o.updated_at));
  const createdPayment = await api.post("/payments").send({ order_id: o.id, amount: 100, method: "pix" }).expect(201);
  const p = createdPayment.body;
  expect(createdPayment.headers.location).toBe("/payments/" + p.id);
  expect(p.amount).toBe(100);
  expect((await api.get("/payments/" + p.id)).body.order_id).toBe(o.id);
  expect((await api.get("/payments")).body).toHaveLength(1);
  expect((await api.get("/orders/" + o.id + "/payments")).body).toHaveLength(1);
  const changedPayment = await api.put("/payments/" + p.id).send({ amount: 150, method: "cash" }).expect(200);
  expect(changedPayment.body.amount).toBe(150);
  expect(changedPayment.body.method).toBe("cash");
  expect(Date.parse(changedPayment.body.updated_at)).toBeGreaterThan(Date.parse(p.updated_at));
  await api.put("/payments/" + p.id).send({ method: "pix" }).expect(200);
  await api.delete("/customers/" + c.id).expect(409);
  await api.delete("/orders/" + o.id).expect(409);
  await api.delete("/payments/" + p.id).expect(204, "");
  await api.get("/payments/" + p.id).expect(404);
  await api.delete("/orders/" + o.id).expect(204, "");
  await api.delete("/customers/" + c.id).expect(204, "");
});

test("regras de saldo, cancelamento e redução de preço são atômicas e permitem correções", async () => {
  const c = (await api.post("/customers").send(customer)).body;
  const o = (await api.post("/orders").send(order(c.id))).body;
  const p = (await api.post("/payments").send({ order_id: o.id, amount: 100, method: "pix" })).body;
  await api.post("/payments").send({ order_id: o.id, amount: 181, method: "cash" }).expect(409);
  await api.put("/payments/" + p.id).send({ amount: 281 }).expect(409);
  await api.put("/orders/" + o.id).send({ total_price: 99 }).expect(409);
  await api.put("/orders/" + o.id).send({ status: "cancelled" }).expect(409);
  expect((await api.get("/payments/" + p.id)).body.amount).toBe(100);
  const second = (await api.post("/payments").send({ order_id: o.id, amount: 180, method: "credit_card" }).expect(201)).body;
  await api.put("/payments/" + p.id).send({ amount: 101 }).expect(409);
  await api.put("/payments/" + p.id).send({ amount: 90 }).expect(200);
  await api.put("/orders/" + o.id).send({ total_price: 270 }).expect(200);
  await api.delete("/payments/" + p.id).expect(204);
  await api.delete("/payments/" + second.id).expect(204);
  await api.put("/orders/" + o.id).send({ status: "cancelled" }).expect(200);
  await api.post("/payments").send({ order_id: o.id, amount: 1, method: "pix" }).expect(409);
  await api.delete("/orders/" + o.id).expect(204);
  await api.delete("/customers/" + c.id).expect(204);
});

test("pagamentos simultâneos não ultrapassam o saldo; centavos não geram falso conflito", async () => {
  const c = (await api.post("/customers").send(customer)).body;
  const o = (await api.post("/orders").send({ ...order(c.id), total_price: 0.3 })).body;
  const results = await Promise.all([
    api.post("/payments").send({ order_id: o.id, amount: 0.2, method: "pix" }),
    api.post("/payments").send({ order_id: o.id, amount: 0.2, method: "cash" }),
  ]);
  expect(results.map(r => r.status).sort()).toEqual([201, 409]);
  await api.post("/payments").send({ order_id: o.id, amount: 0.1, method: "debit_card" }).expect(201);
  const payments = (await api.get("/orders/" + o.id + "/payments")).body;
  expect(payments).toHaveLength(2);
  for (const p of payments) await api.delete("/payments/" + p.id).expect(204);
  await api.delete("/orders/" + o.id).expect(204);
  await api.delete("/customers/" + c.id).expect(204);
});

test("UUID inválido, registros ausentes e relacionamentos inexistentes", async () => {
  for (const resource of ["customers", "orders", "payments"]) {
    const patch = resource === "customers" ? { name: "Ana" } : resource === "orders" ? { status: "ready" } : { method: "pix" };
    for (const method of ["get", "put", "delete"] as const) {
      await api[method]("/" + resource + "/invalido").send(method === "put" ? patch : undefined).expect(400);
      await api[method]("/" + resource + "/" + randomUUID()).send(method === "put" ? patch : undefined).expect(404);
    }
  }
  for (const path of ["/customers/invalido/orders", "/orders/invalido/payments"]) await api.get(path).expect(400);
  await api.get("/customers/" + randomUUID() + "/orders").expect(404);
  await api.get("/orders/" + randomUUID() + "/payments").expect(404);
  await api.post("/orders").send(order(randomUUID())).expect(404);
  await api.post("/payments").send({ order_id: randomUUID(), amount: 1, method: "pix" }).expect(404);
});

test("validações de criação e atualização nas três entidades", async () => {
  for (const body of [{}, [], { name: " ", phone: "123" }, { name: "Ana", phone: "" }, { ...customer, email: "x" }, { ...customer, extra: true }, { ...customer, name: "x".repeat(121) }]) {
    await api.post("/customers").send(body).expect(400);
  }
  const c = (await api.post("/customers").send(customer)).body;
  for (const patch of [{ customer_id: "x" }, { title: " " }, { delivery_date: "ontem" }, { delivery_date: "2026-02-30T12:00:00Z" }, { total_price: -1 }, { total_price: "280" }, { total_price: 1.001 }, { total_price: 100000000 }, { status: "unknown" }, { occasion: "unknown" }, { extra: true }, { description: "x".repeat(501) }]) {
    await api.post("/orders").send({ ...order(c.id), ...patch }).expect(400);
  }
  for (const field of ["customer_id", "title", "delivery_date", "total_price"]) {
    const data: Record<string, unknown> = order(c.id); delete data[field];
    await api.post("/orders").send(data).expect(400);
  }
  const o = (await api.post("/orders").send(order(c.id))).body;
  await api.put("/orders/" + o.id).send({ customer_id: randomUUID() }).expect(404);
  await api.put("/orders/" + o.id).send({ total_price: -10 }).expect(400);
  await api.put("/customers/" + c.id).send({ email: "bad" }).expect(400);
  const validPayment = { order_id: o.id, amount: 1, method: "pix" };
  for (const patch of [{ amount: 0 }, { amount: -1 }, { amount: 1.001 }, { amount: "1" }, { amount: 100000000 }, { order_id: "x" }, { method: "boleto" }, { extra: true }]) {
    await api.post("/payments").send({ ...validPayment, ...patch }).expect(400);
  }
  for (const body of [{}, { amount: 1, method: "pix" }, { order_id: o.id, method: "pix" }, { order_id: o.id, amount: 1 }]) await api.post("/payments").send(body).expect(400);
  const p = (await api.post("/payments").send(validPayment)).body;
  for (const path of ["/customers/" + c.id, "/orders/" + o.id, "/payments/" + p.id]) {
    await api.put(path).send({}).expect(400);
    await api.put(path).send({ id: randomUUID() }).expect(400);
  }
  await api.put("/payments/" + p.id).send({ order_id: randomUUID() }).expect(400);
  await api.put("/payments/" + p.id).send({ amount: 0 }).expect(400);
  await api.delete("/payments/" + p.id);
  await api.delete("/orders/" + o.id);
  await api.delete("/customers/" + c.id);
});

test("banco aplica FK, CHECK, restrição de exclusão e RLS nas três tabelas", async () => {
  const db = fixture.db;
  const c = (await db.query<{id: string}>("insert into customers (name, phone) values ('Ana', '123') returning id")).rows[0];
  const insert = "insert into orders (customer_id, title, delivery_date, total_price) values ($1, 'Bolo', now(), $2) returning id";
  await expect(db.query(insert, [randomUUID(), 10])).rejects.toMatchObject({ code: "23503" });
  await expect(db.query(insert, [c.id, -1])).rejects.toMatchObject({ code: "23514" });
  const o = (await db.query<{id: string}>(insert, [c.id, 10])).rows[0];
  await expect(db.query("delete from customers where id=$1", [c.id])).rejects.toMatchObject({ code: "23503" });
  await expect(db.query("insert into payments (order_id, amount, method) values ($1, 0, 'pix')", [o.id])).rejects.toMatchObject({ code: "23514" });
  await expect(db.query("insert into payments (order_id, amount, method) values ($1, 1, 'invalid')", [o.id])).rejects.toMatchObject({ code: "23514" });
  await expect(db.query("insert into payments (order_id, amount, method) values ($1, 1, 'pix')", [randomUUID()])).rejects.toMatchObject({ code: "23503" });
  await db.query("insert into payments (order_id, amount, method) values ($1, 1, 'pix')", [o.id]);
  await expect(db.query("delete from orders where id=$1", [o.id])).rejects.toMatchObject({ code: "23503" });
  const rls = await db.query<{relrowsecurity: boolean}>("select relrowsecurity from pg_class where relname in ('customers','orders','payments') and relnamespace = current_schema()::regnamespace");
  expect(rls.rows).toHaveLength(3);
  expect(rls.rows.every(row => row.relrowsecurity)).toBe(true);
  await db.query("delete from payments where order_id=$1", [o.id]);
  await db.query("delete from orders where id=$1", [o.id]);
  await db.query("delete from customers where id=$1", [c.id]);
});

test("Swagger documenta todos os recursos e responde pela interface interativa", async () => {
  const spec = (await api.get("/openapi.json").expect(200)).body;
  expect(spec.openapi).toBe("3.0.3");
  for (const resource of ["customers", "orders", "payments"]) {
    expect(Object.keys(spec.paths["/" + resource])).toEqual(["get", "post"]);
    expect(spec.paths["/" + resource + "/{id}"].put.requestBody).toBeDefined();
  }
  const html = await api.get("/api-docs/").expect(200);
  expect(html.text).toContain("swagger-ui");
});

test("interface é servida junto à API sem expor configuração sensível", async () => {
  await api.get("/app").expect(301);
  const page = await api.get("/app/").expect(200);
  expect(page.type).toBe("text/html");
  expect(page.text).toContain("Doce Gestão");
  expect(page.text).toContain('id="form-dialog"');
  const script = await api.get("/app/app.js").expect(200);
  expect(script.type).toMatch(/javascript/);
  const stylesheet = await api.get("/app/styles.css").expect(200);
  expect(stylesheet.type).toBe("text/css");
  const config = await api.get("/app/config.json").expect(200);
  expect(Object.keys(config.body)).toEqual(["demo"]);
  expect(typeof config.body.demo).toBe("boolean");
});

test("JSON malformado, limite do corpo, rota desconhecida e falha interna sem vazamento", async () => {
  await api.post("/customers").set("Content-Type", "application/json").send("{").expect(400);
  await api.post("/customers").send({ name: "x".repeat(110000) }).expect(413);
  expect((await api.get("/nao-existe").expect(404)).body.message).toBe("Rota não encontrada.");
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const saved = database.query;
  database.query = vi.fn().mockRejectedValue(new Error("credencial privada"));
  try {
    const response = await api.get("/customers").expect(500);
    expect(response.body).toEqual({ message: "Erro interno do servidor." });
  } finally { database.query = saved; log.mockRestore(); }
});
