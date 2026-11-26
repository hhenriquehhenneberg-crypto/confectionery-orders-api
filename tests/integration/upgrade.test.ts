import { test, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

test("atualização adiciona pagamentos e preserva clientes e encomendas existentes", async () => {
  const db = new PGlite();
  try {
    await db.exec(readFileSync("tests/fixtures/original-schema.sql", "utf8"));
    const customer = (await db.query<{ id: string }>("insert into customers (name, phone) values ('Cliente anterior', '123') returning id")).rows[0];
    const order = (await db.query<{ id: string }>("insert into orders (customer_id, title, delivery_date, total_price) values ($1, 'Pedido anterior', now(), 200) returning id", [customer.id])).rows[0];
    await db.exec(readFileSync("database/upgrade_payments.sql", "utf8"));
    expect((await db.query("select id from customers")).rows).toEqual([{ id: customer.id }]);
    expect((await db.query("select id from orders")).rows).toEqual([{ id: order.id }]);
    const payment = (await db.query<{ id: string; updated_at: Date }>("insert into payments (order_id, amount, method) values ($1, 50, 'pix') returning *", [order.id])).rows[0];
    const updated = (await db.query<{ updated_at: Date }>("update payments set amount = 60 where id = $1 returning *", [payment.id])).rows[0];
    expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(payment.updated_at.getTime());
  } finally { await db.close(); }
});
