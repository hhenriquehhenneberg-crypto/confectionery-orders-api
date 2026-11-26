// Demonstração local: usa dados fictícios persistidos em .demo-data, sem acessar Supabase.
const { PGlite } = require('@electric-sql/pglite');
const { readFileSync } = require('node:fs');
const path = require('node:path');
process.env.DEMO_MODE = 'true';
const root = path.join(__dirname, '..');
const db = new PGlite(process.env.DEMO_DATA_DIR || path.join(root, '.demo-data'));

async function seed() {
  const exists = (await db.query("select to_regclass('public.customers') as name")).rows[0].name;
  if (exists) return;
  await db.exec(readFileSync(path.join(root, 'database/create_tables.sql'), 'utf8'));
  const customers = [];
  for (const [name, phone, email] of [
    ['Mariana Souza', '(41) 99912-3400', 'mariana@exemplo.com'],
    ['Camila Oliveira', '(41) 99874-1200', 'camila@exemplo.com'],
    ['Rafael Santos', '(41) 99765-4300', 'rafael@exemplo.com'],
    ['Beatriz Lima', '(41) 99654-3200', 'beatriz@exemplo.com'],
    ['Juliana Costa', '(41) 99543-2100', 'juliana@exemplo.com'],
  ]) customers.push((await db.query('insert into customers(name,phone,email) values($1,$2,$3) returning id', [name, phone, email])).rows[0].id);
  const orders = [];
  const descriptions = [
    ['Bolo jardim de morangos', 0, 0, 280, 'in_production', 'birthday', 'Massa de baunilha, recheio de brigadeiro branco e morangos frescos. Decoração delicada com flores.'],
    ['Cupcakes para celebrar', 1, 1, 180, 'confirmed', 'party', '24 cupcakes de chocolate com cobertura em tons de rosa.'],
    ['Bolo de casamento floral', 2, 2, 1250, 'pending', 'wedding', 'Três andares. Flores de açúcar em tons claros e acabamento espatulado.'],
    ['Caixa de doces especiais', 3, 0, 150, 'ready', 'other', '30 doces variados em caixa para presente.'],
    ['Mini bolos de chocolate', 4, 3, 320, 'confirmed', 'corporate', '20 mini bolos embalados individualmente para um evento.'],
    ['Bolo de aniversário da Ana', 0, -2, 240, 'delivered', 'birthday', 'Bolo de chocolate com cobertura de ganache.'],
  ];
  for (const [title, customerIndex, offset, total, status, occasion, description] of descriptions) {
    const delivery = new Date(); delivery.setDate(delivery.getDate() + offset); delivery.setHours(15 + (customerIndex % 3), 0, 0, 0);
    const order = (await db.query('insert into orders(customer_id,title,description,occasion,delivery_date,total_price,status) values($1,$2,$3,$4,$5,$6,$7) returning id',
      [customers[customerIndex], title, description, occasion, delivery.toISOString(), total, status])).rows[0];
    orders.push(order.id);
  }
  for (const [index, amount, method, days] of [[0, 100, 'pix', 0], [1, 90, 'pix', 1], [3, 150, 'credit_card', 0], [5, 240, 'cash', 2], [2, 400, 'pix', 4]]) {
    const created = new Date(); created.setDate(created.getDate() - days);
    await db.query('insert into payments(order_id,amount,method,created_at) values($1,$2,$3,$4)', [orders[index], amount, method, created.toISOString()]);
  }
}

async function start() {
  await seed();
  const { database } = require('../dist/config/database');
  let tail = Promise.resolve();
  async function lock() {
    const previous = tail;
    let release;
    tail = new Promise(resolve => { release = resolve; });
    await previous;
    return release;
  }
  async function query(text, values) {
    const result = await db.query(text, values);
    return { rows: result.rows, rowCount: result.affectedRows ?? result.rows.length };
  }
  database.query = async (text, values) => {
    const release = await lock();
    try { return await query(text, values); } finally { release(); }
  };
  database.connect = async () => {
    const release = await lock();
    return { query, release };
  };
  const port = Number(process.env.DEMO_PORT || 3100);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('DEMO_PORT deve ser um inteiro entre 1 e 65535.');
  const app = require('../dist/app').default;
  const server = app.listen(port, '127.0.0.1', () => console.log('Demonstração local em http://localhost:' + port + '/app/'));
  server.on('error', async error => { console.error(error.message); await db.close(); process.exitCode = 1; });
  const stop = () => server.close(async () => { await db.close(); await database.end(); });
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
}
start().catch(async error => { console.error('Não foi possível iniciar a demonstração:', error.message); await db.close(); process.exitCode = 1; });
