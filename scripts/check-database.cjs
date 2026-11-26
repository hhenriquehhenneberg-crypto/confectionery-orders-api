// Diagnóstico somente leitura. Não imprime a string de conexão, usuários ou registros.
const { database } = require('../dist/config/database');
async function main() {
  try {
    const client = await database.connect();
    let transport;
    try {
      await client.query("select 1");
      transport = { tls: client.connection.stream.encrypted === true, certificateVerified: client.connection.stream.authorized === true };
    } finally { client.release(); }
    const tables = {};
    for (const table of ['customers', 'orders', 'payments']) {
      const exists = (await database.query('select to_regclass($1) as name', ['public.' + table])).rows[0].name;
      tables[table] = exists ? Number((await database.query('select count(*)::int as total from public.' + table)).rows[0].total) : null;
    }
    console.log(JSON.stringify({ connected: true, ...transport, tables }, null, 2));
    if (Object.values(tables).some(value => value === null)) process.exitCode = 2;
  } catch (error) {
    console.error(JSON.stringify({ connected: false, code: error.code || 'CONNECTION_ERROR', message: 'Verifique disponibilidade do banco, configuração local e certificado TLS.' }));
    process.exitCode = 1;
  } finally { await database.end(); }
}
void main();
