const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawn } = require('node:child_process');
const { createServer } = require('node:net');
const { once } = require('node:events');

test('servidor compilado inicia, verifica banco e atende HTTP em processo separado', { timeout: 20000 }, async () => {
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const child = spawn(process.execPath, ['--require', './tests/helpers/pglite-preload.cjs', 'dist/server.js'], {
    cwd: process.cwd(), windowsHide: true,
    env: { ...process.env, PORT: String(port), DATABASE_URL: 'postgresql://test:test@localhost/test' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stderr.on('data', chunk => { output += chunk; });
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Servidor não iniciou: ' + output)), 15000);
      child.stdout.on('data', chunk => {
        output += chunk;
        if (output.includes('Servidor rodando')) { clearTimeout(timer); resolve(); }
      });
      child.once('error', error => { clearTimeout(timer); reject(error); });
      child.once('exit', code => { clearTimeout(timer); reject(new Error(`Saída antecipada ${code}: ${output}`)); });
    });
    const response = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).message, 'Confectionery Orders API');
    const customers = await fetch(`http://127.0.0.1:${port}/customers`);
    assert.equal(customers.status, 200);
    assert.deepEqual(await customers.json(), []);
  } finally {
    if (child.exitCode === null) { child.kill(); await once(child, 'exit'); }
  }
});

test('servidor recusa configuração ausente sem exibir credenciais', async () => {
  const child = spawn(process.execPath, ['dist/server.js'], {
    windowsHide: true,
    env: { ...process.env, DATABASE_URL: '', PORT: '3000', DOTENV_CONFIG_PATH: '__arquivo_inexistente__' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stderr.on('data', chunk => { output += chunk; });
  const [code] = await once(child, 'exit');
  assert.equal(code, 1);
  assert.match(output, /Configure DATABASE_URL/);
});
