// Exclusivo dos testes: transporte de banco para o processo separado do servidor.
const { PGlite } = require('@electric-sql/pglite');
const { readFileSync } = require('node:fs');
const { Pool } = require('pg');
const db = new PGlite();
const ready = db.exec(readFileSync('database/create_tables.sql', 'utf8'));
Pool.prototype.query = async function (text, values) {
  await ready;
  const result = await db.query(text, values);
  return { rows: result.rows, rowCount: result.affectedRows ?? result.rows.length };
};
Pool.prototype.end = async function () { await ready; await db.close(); };
