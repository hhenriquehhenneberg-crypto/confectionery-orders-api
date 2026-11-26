# Doce Gestão · Confectionery Orders API

API REST para cadastrar clientes, gerenciar encomendas e registrar pagamentos de uma confeitaria. Evolução do projeto da primeira avaliação da disciplina Desenvolvimento Back-End.

Inclui o **Doce Gestão**, uma interface responsiva para administrar os três recursos pelo navegador.

## Abrir a interface

Com a API configurada e em execução, acesse **http://localhost:3000/app/**. O Express serve os arquivos de public/ junto à API; não é preciso iniciar outro servidor ou configurar CORS.

Para experimentar **sem credenciais e sem Supabase**, execute:

```powershell
npm ci
npm run demo
```

Abra **http://localhost:3100/app/**. A demonstração usa PGlite e cria dados fictícios em .demo-data/ somente na primeira execução. As alterações ficam nesse diretório local e são preservadas entre execuções. Ele não é versionado e não acessa o banco da aplicação. DEMO_PORT permite escolher outra porta; o servidor de demonstração aceita apenas conexões locais.

O painel permite:

- Consultar encomendas em aberto, produção, recebimentos e saldo a receber.
- Visualizar as próximas entregas e os recebimentos dos últimos sete dias.
- Cadastrar, consultar, editar e excluir clientes, encomendas e pagamentos.
- Buscar registros sem diferenciar acentos ou maiúsculas.
- Filtrar por status da encomenda ou método de pagamento.
- Consultar detalhes e pagamentos relacionados.
- Exportar a seleção atual em CSV, com proteção contra fórmulas de planilha.

Valores, datas, estados vazios e erros vêm dos dados da API. O modo de demonstração é identificado por um aviso visível. A interface usa HTML, CSS e módulos JavaScript nativos, com navegação por teclado, formulários rotulados e adaptação para celular.

**Estudante responsável:** Henrique Henneberg Nurdim.

## Tecnologias

Node.js 22.12+, TypeScript, Express, PostgreSQL/Supabase (conexão direta com pg), Zod, Vitest, Supertest, PGlite e Swagger/OpenAPI. O lockfile registra as versões utilizadas.

Front-end: HTML5, CSS responsivo e JavaScript ES Modules. As fontes têm alternativas locais caso o Google Fonts esteja indisponível.

## Entidades e relacionamentos

```text
Customer 1 ---- N Order 1 ---- N Payment
customers.id <- orders.customer_id
orders.id    <- payments.order_id
```

| Entidade | Principais atributos |
| --- | --- |
| Customer | id, name, phone, email, created_at, updated_at |
| Order | id, customer_id, title, description, occasion, delivery_date, total_price, status, created_at, updated_at |
| Payment | id, order_id, amount, method, created_at, updated_at |

Os IDs são UUIDs. As chaves estrangeiras impedem remover clientes com encomendas e encomendas com pagamentos. Os valores monetários são persistidos como NUMERIC(10,2). Os timestamps possuem fuso horário e updated_at é atualizado por trigger.

## Regras de negócio

- Cliente deve ter nome e telefone; e-mail é opcional e validado quando informado.
- Uma encomenda precisa de cliente existente, título, data ISO 8601 com fuso e preço não negativo, com até duas casas decimais.
- Status de encomenda: pending, confirmed, in_production, ready, delivered ou cancelled.
- Ocasiões: birthday, wedding, party, corporate ou other.
- Um pagamento deve ser positivo, com até duas casas decimais, e pertencer a uma encomenda existente.
- Métodos de pagamento: pix, cash, credit_card ou debit_card.
- Não é permitido registrar ou corrigir um pagamento de encomenda cancelada.
- A soma dos pagamentos não pode ultrapassar o valor da encomenda. Ao corrigir um pagamento, seu valor anterior é desconsiderado.
- O preço da encomenda não pode ser reduzido abaixo do total já pago.
- Encomendas com pagamentos não podem ser canceladas ou excluídas. Clientes com encomendas não podem ser excluídos.
- A exclusão de pagamentos representa correção administrativa do registro. Esta API acadêmica não executa cobranças nem estornos bancários.
- O vínculo order_id de um pagamento não pode ser alterado. Corrija excluindo e cadastrando novamente.
- PUT atualiza os campos informados; campos omitidos são preservados. Corpos vazios e campos desconhecidos são recusados.

OrderRules encapsula o estado da encomenda e o total pago e oferece métodos que verificam as regras. Services coordenam essas verificações e os Repositories persistem os dados. Classes, construtores, objetos, métodos e atributos privados são usados nessa separação.

Gravações de pagamentos, alterações e exclusões de encomendas usam transações. O bloqueio SELECT FOR UPDATE na encomenda serializa essas operações para que pagamentos simultâneos enviados pela API respeitem o saldo. As regras de saldo e cancelamento pertencem aos Services; acesso SQL externo não deve contornar a API.

## Estrutura

```text
src/
  config/        conexão PostgreSQL
  controllers/   validação das requisições e respostas HTTP
  docs/          especificação OpenAPI
  errors/        erros da aplicação
  middlewares/   tratamento de erros e operações assíncronas
  models/        entidades, DTOs e comportamento de domínio
  repositories/  SQL parametrizado e transações
  routes/        endpoints
  services/      regras de negócio e coordenação
  validators/    schemas Zod
  app.ts         aplicação Express
  server.ts      inicialização e verificação do banco
database/        criação e atualização do banco
tests/
  unit/          domínio e Services com dependências isoladas
  integration/   endpoints, banco temporário, atualização SQL e servidor
docs/            evidências de cobertura e roteiro de demonstração
public/          interface Doce Gestão (HTML, CSS e JavaScript)
scripts/         demonstração local com PGlite
```

## Configuração e execução

```powershell
git clone https://github.com/hhenriquehhenneberg-crypto/confectionery-orders-api.git
cd confectionery-orders-api
npm ci
Copy-Item .env.example .env
```

No Linux/macOS, use `cp .env.example .env`.

Preencha o .env local:

```dotenv
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=verify-full
# Somente se a conexão exigir certificado raiz:
# PGSSLROOTCERT=database/certs/supabase-root-2021.crt
```

No Supabase, obtenha a conexão PostgreSQL em Connect. Use o pooler de sessão se necessário para sua rede e configure TLS conforme o painel. O servidor acessa o banco por pg; não utiliza chave pública nem service_role do Supabase. As tabelas têm RLS habilitada sem políticas públicas; use uma credencial de servidor com permissões adequadas e mantenha-a somente no .env ou na hospedagem.

### Preparar o banco

- **Banco novo:** execute `database/create_tables.sql` no SQL Editor do Supabase ou no PostgreSQL.
- **Banco da primeira entrega, com customers e orders:** execute somente `database/upgrade_payments.sql`, uma vez. A atualização preserva os registros existentes e adiciona payments, índice, trigger e RLS.
- Não execute os dois scripts no mesmo banco. São scripts transacionais: uma falha reverte as alterações daquela execução.

Inicie a API:

```powershell
npm run dev
```

Ou compile e execute:

```powershell
npm run build
npm start
```

Endereço padrão: http://localhost:3000. O servidor verifica a conexão ao iniciar. GET /health informa apenas se o processo HTTP está atendendo; não testa novamente o banco.

## Endpoints

| Método | Rota | Finalidade |
| --- | --- | --- |
| GET | /customers | Listar clientes |
| GET | /customers/:id | Consultar cliente |
| POST | /customers | Cadastrar cliente |
| PUT | /customers/:id | Atualizar cliente |
| DELETE | /customers/:id | Excluir cliente sem encomendas |
| GET | /customers/:id/orders | Listar encomendas do cliente |
| GET | /orders | Listar encomendas |
| GET | /orders/:id | Consultar encomenda |
| POST | /orders | Cadastrar encomenda |
| PUT | /orders/:id | Atualizar encomenda |
| DELETE | /orders/:id | Excluir encomenda sem pagamentos |
| GET | /orders/:id/payments | Listar pagamentos da encomenda |
| GET | /payments | Listar pagamentos |
| GET | /payments/:id | Consultar pagamento |
| POST | /payments | Registrar pagamento |
| PUT | /payments/:id | Corrigir valor ou método |
| DELETE | /payments/:id | Excluir registro de pagamento |
| GET | /api-docs/ | Abrir Swagger interativo |
| GET | /openapi.json | Obter a especificação |
| GET | /health | Verificar processo HTTP |

Requisições de escrita usam Content-Type: application/json. Respostas: 200 para consulta/atualização, 201 para criação (com Location), 204 para exclusão sem corpo, 400 para dados/UUID/JSON inválidos, 404 para registro ou rota inexistente, 409 para conflito de negócio, 413 para corpo acima de 100 KB e 500 para falha interna sem detalhes sensíveis.

### Exemplos de requisições

POST /customers:

```json
{
  "name": "Mariana Souza",
  "phone": "41999999999",
  "email": "mariana@example.com"
}
```

POST /orders (substitua customer_id pelo UUID retornado):

```json
{
  "customer_id": "11111111-1111-4111-8111-111111111111",
  "title": "Bolo de aniversário",
  "description": "Chocolate para 30 pessoas",
  "occasion": "birthday",
  "delivery_date": "2026-12-10T15:00:00-03:00",
  "total_price": 280,
  "status": "pending"
}
```

POST /payments (substitua order_id pelo UUID retornado):

```json
{
  "order_id": "22222222-2222-4222-8222-222222222222",
  "amount": 100,
  "method": "pix"
}
```

Exemplos de PUT: `/customers/:id` com `{"phone":"41988888888"}`, `/orders/:id` com `{"status":"confirmed"}` e `/payments/:id` com `{"amount":120,"method":"cash"}`.

## Swagger

Com o servidor ativo, abra http://localhost:3000/api-docs/. Escolha a operação, clique em Try it out e forneça o JSON ou UUID. Crie primeiro um cliente, depois uma encomenda e então um pagamento. Os schemas documentam campos, formatos, valores permitidos e respostas. A especificação também está em /openapi.json.

## Testes e cobertura

```powershell
npm run typecheck
npm run test:unit
npm run test:integration
npm run test:coverage
```

`npm test` executa todos os testes. Os comandos de integração, cobertura e suíte completa compilam primeiro o servidor usado no teste de inicialização.

- Unitários: Vitest com mocks para isolar Services, regras de domínio, falhas e transações.
- Integração: Supertest exercita os endpoints Express, os Repositories e o SQL em PGlite, um PostgreSQL temporário embutido. Também verifica a atualização do esquema anterior e a inicialização em processo separado.
- Por padrão, os testes não usam o Supabase real, não exigem DATABASE_URL e não alteram registros da aplicação. Cada arquivo de integração possui banco temporário próprio, fechado ao terminar.
- PGlite usa uma conexão; o adaptador de testes serializa transações. Para verificar bloqueios com várias conexões PostgreSQL reais, defina TEST_DATABASE_URL para um PostgreSQL de testes e execute npm run test:integration. O teste cria um schema exclusivo e o remove ao terminar. O usuário precisa de permissão para criar schemas. Use um banco de testes.
- Cobertura V8 mede todo src, incluindo Models, Controllers, Services, Repositories, Routes e servidor. Apenas configuração do banco é excluída. Código executado em subprocesso aparece sem cobertura no processo principal.
- As regras financeiras, a busca e a exportação CSV do front-end também têm testes unitários. public/domain.js é incluído na cobertura. A renderização e os formulários de public/app.js foram verificados manualmente no navegador; não entram no percentual de cobertura do back-end.
- O comando falha se linhas, instruções, funções ou ramificações ficarem abaixo de 60%.
- O relatório HTML fica em `coverage/index.html`; métricas estão em `coverage/coverage-summary.json`. O resumo da última execução validada está em [docs/COVERAGE.md](docs/COVERAGE.md).
- GitHub Actions sobe PostgreSQL 17 temporário e executa compilação, verificação de tipos e testes com cobertura, incluindo os pagamentos concorrentes em conexões reais. O relatório completo é disponibilizado como artefato do workflow.

## Entrega e demonstração

Consulte [docs/DEMONSTRACAO.md](docs/DEMONSTRACAO.md). O professor deve conseguir executar o projeto, acessar o Swagger e reproduzir os testes. Envie o link deste repositório na atividade correta do AVA; publicar no GitHub não registra a entrega no AVA.

O .env com credenciais reais não é versionado. A API é uma demonstração acadêmica sem autenticação; mantenha dados fictícios. O registro de pagamentos não integra adquirentes, Pix ou instituições financeiras.
