const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { readFileSync } = require('node:fs');
const { randomUUID } = require('node:crypto');
const { PGlite } = require('@electric-sql/pglite');
const { database } = require('../dist/config/database');
const app = require('../dist/app').default;
const db = new PGlite();
let server, base;
const originalQuery = database.query;
database.query = async (text, values) => {
  const result = await db.query(text, values);
  return { rows: result.rows, rowCount: result.affectedRows ?? result.rows.length };
};
before(async () => {
  await db.exec(readFileSync('database/create_tables.sql', 'utf8'));
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  database.query = originalQuery;
  await database.end();
  await db.close();
});
async function request(method, path, body) {
  const response = await fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null, location: response.headers.get('location') };
}
const customer = { name: ' Mariana Souza ', phone: '41999999999', email: 'mariana@example.com' };
const order = id => ({ customer_id: id, title: 'Bolo de aniversário', description: 'Chocolate para 30 pessoas', occasion: 'birthday', delivery_date: '2026-10-25T15:00:00-03:00', total_price: 280 });

test('CRUD completo, relacionamento 1:N, preço JSON, status default e timestamps', async () => {
  assert.deepEqual((await request('GET', '/')).body, { message: 'Confectionery Orders API', status: 'running' });
  assert.equal((await request('GET', '/health')).status, 200);
  assert.deepEqual((await request('GET', '/customers')).body, []);
  assert.deepEqual((await request('GET', '/orders')).body, []);
  const created = await request('POST', '/customers', customer);
  assert.equal(created.status, 201);
  const c = created.body;
  assert.match(c.id, /^[0-9a-f-]{36}$/);
  assert.equal(c.name, 'Mariana Souza');
  assert.equal(created.location, `/customers/${c.id}`);
  assert.equal((await request('GET', `/customers/${c.id}`)).body.id, c.id);
  assert.equal((await request('GET', '/customers')).body.length, 1);
  const updated = await request('PUT', `/customers/${c.id}`, { phone: '41988888888', email: null });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.email, null);
  assert.equal(updated.body.name, c.name);
  assert.ok(Date.parse(updated.body.updated_at) > Date.parse(c.updated_at));
  const createdOrder = await request('POST', '/orders', order(c.id));
  assert.equal(createdOrder.status, 201);
  const o = createdOrder.body;
  assert.equal(createdOrder.location, `/orders/${o.id}`);
  assert.equal(o.status, 'pending');
  assert.equal(o.total_price, 280);
  assert.equal(o.delivery_date, '2026-10-25T18:00:00.000Z');
  const second = await request('POST', '/orders', { ...order(c.id), title: '100 brigadeiros', total_price: 0 });
  assert.equal(second.status, 201);
  assert.equal((await request('GET', '/orders')).body.length, 2);
  assert.equal((await request('GET', `/customers/${c.id}/orders`)).body.length, 2);
  assert.equal((await request('GET', `/orders/${o.id}`)).body.id, o.id);
  const changed = await request('PUT', `/orders/${o.id}`, { status: 'confirmed', total_price: 320, description: null });
  assert.equal(changed.status, 200);
  assert.equal(changed.body.customer_id, c.id);
  assert.equal(changed.body.description, null);
  assert.ok(Date.parse(changed.body.updated_at) > Date.parse(o.updated_at));
  assert.equal((await request('GET', `/orders/${o.id}`)).body.status, 'confirmed');
  const blocked = await request('DELETE', `/customers/${c.id}`);
  assert.equal(blocked.status, 409);
  assert.equal(blocked.body.message, 'Não é possível excluir um cliente que possui encomendas.');
  const c2 = (await request('POST', '/customers', { name: 'Outro cliente', phone: '123' })).body;
  assert.equal((await request('PUT', `/orders/${o.id}`, { customer_id: c2.id })).body.customer_id, c2.id);
  assert.equal((await request('GET', `/customers/${c.id}/orders`)).body.length, 1);
  for (const id of [o.id, second.body.id]) {
    assert.deepEqual(await request('DELETE', `/orders/${id}`), { status: 204, body: null, location: null });
    assert.equal((await request('GET', `/orders/${id}`)).status, 404);
  }
  assert.deepEqual((await request('GET', `/customers/${c.id}/orders`)).body, []);
  for (const id of [c.id, c2.id]) assert.equal((await request('DELETE', `/customers/${id}`)).status, 204);
});

test('UUID inválido e todos os caminhos de registro inexistente', async () => {
  for (const path of ['/customers', '/orders']) {
    for (const method of ['GET', 'PUT', 'DELETE']) {
      const body = method === 'PUT' ? (path === '/customers' ? { name: 'Nome' } : { status: 'ready' }) : undefined;
      assert.equal((await request(method, path + '/invalido', body)).status, 400);
      assert.equal((await request(method, path + '/' + randomUUID(), body)).status, 404);
    }
  }
  assert.equal((await request('GET', '/customers/invalido/orders')).status, 400);
  assert.equal((await request('GET', `/customers/${randomUUID()}/orders`)).status, 404);
  assert.equal((await request('POST', '/orders', order(randomUUID()))).status, 404);
  assert.equal((await request('GET', '/categories')).status, 404);
  assert.equal((await request('GET', '/products')).status, 404);
});

test('validações recusam campos ausentes, vazios, inválidos e desconhecidos', async () => {
  for (const body of [{}, null, [], { name: ' ', phone: '123' }, { name: 'Ana', phone: '' }, { ...customer, email: 'invalido' }, { ...customer, id: randomUUID() }, { ...customer, name: 'x'.repeat(121) }]) {
    assert.equal((await request('POST', '/customers', body)).status, 400);
  }
  const c = (await request('POST', '/customers', customer)).body;
  for (const patch of [{ customer_id: 'x' }, { title: ' ' }, { delivery_date: 'ontem' }, { delivery_date: '2026-02-30T12:00:00Z' }, { delivery_date: '2026-10-25' }, { total_price: -1 }, { total_price: '280' }, { total_price: 1.001 }, { total_price: 100000000 }, { status: 'unknown' }, { occasion: 'unknown' }, { extra: true }, { description: 'x'.repeat(501) }]) {
    const body = { ...order(c.id), ...patch };
    assert.equal((await request('POST', '/orders', body)).status, 400, JSON.stringify(patch));
  }
  for (const field of ['customer_id', 'title', 'delivery_date', 'total_price']) {
    const body = order(c.id); delete body[field];
    assert.equal((await request('POST', '/orders', body)).status, 400);
  }
  const o = (await request('POST', '/orders', order(c.id))).body;
  assert.equal((await request('PUT', `/orders/${o.id}`, { customer_id: randomUUID() })).status, 404);
  for (const path of [`/customers/${c.id}`, `/orders/${o.id}`]) {
    assert.equal((await request('PUT', path, {})).status, 400);
    assert.equal((await request('PUT', path, { id: randomUUID() })).status, 400);
  }
  assert.equal((await request('PUT', `/orders/${o.id}`, { total_price: -10 })).status, 400);
  assert.equal((await request('PUT', `/customers/${c.id}`, { email: 'bad' })).status, 400);
  await request('DELETE', `/orders/${o.id}`); await request('DELETE', `/customers/${c.id}`);
});

test('FK, CHECK, defaults e trigger são executados pelo PostgreSQL', async () => {
  const c = (await db.query("insert into customers (name, phone) values ('Ana', '123') returning *")).rows[0];
  const sql = "insert into orders (customer_id, title, delivery_date, total_price) values ($1, 'Bolo', now(), $2) returning *";
  await assert.rejects(db.query(sql, [randomUUID(), 10]), { code: '23503' });
  await assert.rejects(db.query(sql, [c.id, -1]), { code: '23514' });
  const o = (await db.query(sql, [c.id, 1])).rows[0];
  assert.equal(o.status, 'pending');
  await assert.rejects(db.query('delete from customers where id=$1', [c.id]), { code: '23503' });
  await assert.rejects(db.query("update orders set status='wrong' where id=$1", [o.id]), { code: '23514' });
  await assert.rejects(db.query("update orders set occasion='wrong' where id=$1", [o.id]), { code: '23514' });
  const { CustomerRepository } = require('../dist/repositories/CustomerRepository');
  const { OrderRepository } = require('../dist/repositories/OrderRepository');
  await assert.rejects(new CustomerRepository().delete(c.id), { statusCode: 409 });
  await assert.rejects(new OrderRepository().create(order(randomUUID())), { statusCode: 404 });
  await assert.rejects(new OrderRepository().update(o.id, { customer_id: randomUUID() }), { statusCode: 404 });
  const rls = await db.query("select relname, relrowsecurity from pg_class where relname in ('customers','orders')");
  assert.ok(rls.rows.every(row => row.relrowsecurity));
  await db.query('delete from orders where id=$1', [o.id]);
  await db.query('delete from customers where id=$1', [c.id]);
});

test('JSON malformado, 404 JSON e erro interno sem vazamento', async () => {
  const malformed = await fetch(base + '/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).message, 'JSON inválido.');
  assert.equal((await request('GET', '/nao-existe')).status, 404);
  const saved = database.query;
  database.query = async () => { throw new Error('segredo e stack privados'); };
  try {
    const response = await request('GET', '/customers');
    assert.equal(response.status, 500);
    assert.deepEqual(response.body, { message: 'Erro interno do servidor.' });
  } finally { database.query = saved; }
});
