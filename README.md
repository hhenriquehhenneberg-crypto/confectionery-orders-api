# Confectionery Orders API

API REST para uma confeitaria organizar clientes e encomendas personalizadas, registrando ocasião, data de entrega, preço e situação de cada encomenda. APS desenvolvida sobre a base técnica e o histórico Git das aulas, com domínio próprio e duas entidades principais.

## Integrantes

- Henrique Henneberg
- Outros integrantes: ____________________

## Tecnologias

Node.js 22+, TypeScript (strict), Express 4, PostgreSQL hospedado no Supabase, `pg`, Zod, dotenv e Git. Postman é usado por meio da coleção incluída. Os testes usam o runner do Node.js e PGlite (PostgreSQL compilado para WASM, somente desenvolvimento).

A URL real do GitHub não foi fornecida. O `origin` desta cópia aponta para um bundle local; não é um endereço de publicação e não deve receber push. GitHub será o destino de versionamento quando sua URL real for configurada.

## Entidades e relacionamento

```text
Customer 1 ───── N Order
customers.id ← orders.customer_id
```

Um cliente pode realizar várias encomendas. Cada encomenda pertence obrigatoriamente a um cliente.

| Entidade | Campos |
|---|---|
| Customer | id (UUID/PK), name, phone, email opcional, created_at, updated_at |
| Order | id (UUID/PK), customer_id (UUID/FK), title, description opcional, occasion opcional, delivery_date, total_price, status, created_at, updated_at |

UUIDs são gerados pelo PostgreSQL com `gen_random_uuid()`. A FK impede encomendas órfãs. `ON DELETE RESTRICT` protege o cliente com encomendas. Datas são `timestamptz`; triggers atualizam `updated_at`, inclusive em alterações diretas no banco. `total_price` é `numeric(10,2)` no banco e número no JSON.

## Estrutura

```text
restaurant-ordering-system-backend-codex/
├── .env.example
├── .gitignore
├── README.md
├── GUIA_APRESENTACAO.md
├── CHECKLIST_APS.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── database/create_tables.sql
├── postman/Confectionery Orders API.postman_collection.json
├── tests/
│   ├── api.test.cjs
│   ├── server.test.cjs
│   └── helpers/pglite-preload.cjs
└── src/
    ├── app.ts
    ├── server.ts
    ├── config/database.ts
    ├── controllers/
    │   ├── CustomerController.ts
    │   └── OrderController.ts
    ├── models/
    │   ├── Customer.ts
    │   └── Order.ts
    ├── repositories/
    │   ├── CustomerRepository.ts
    │   ├── OrderRepository.ts
    │   └── HealthRepository.ts
    ├── routes/
    │   ├── customerRoutes.ts
    │   └── orderRoutes.ts
    ├── middlewares/
    │   ├── asyncHandler.ts
    │   └── errorHandler.ts
    ├── errors/AppError.ts
    └── validators/schemas.ts
```

`config` configura a conexão. `models` define tipos e DTOs. `routes` conecta URLs aos controllers. `controllers` valida entradas e coordena regras. `repositories` contém todas as consultas SQL parametrizadas. `validators` centraliza esquemas Zod. `middlewares` encaminha erros assíncronos do Express 4 e padroniza respostas; `errors` define erros esperados. `app.ts` monta o Express e `server.ts` verifica a conexão antes de escutar HTTP. `HealthRepository` apenas verifica a conexão; não representa uma terceira entidade.

## Configuração e execução

Pré-requisitos: Node.js 22+, npm e um banco PostgreSQL/Supabase configurado.

Para clonar futuramente, substitua o marcador pela URL real; não use o caminho do bundle:

```bash
git clone URL_REAL_DO_REPOSITORIO
cd NOME_DA_PASTA_CLONADA
npm install
```

Se já extraiu esta cópia, entre na pasta existente:

```bash
cd restaurant-ordering-system-backend-codex
npm install
```

Copie `.env.example` para `.env` (PowerShell: `Copy-Item .env.example .env`; bash: `cp .env.example .env`) e configure a conexão. Execute o SQL conforme a próxima seção.

```bash
npm run dev
```

Build e execução compilada:

```bash
npm run build
npm start
```

A API usa `http://localhost:3000`. O servidor só começa a escutar após uma consulta de conexão bem-sucedida. `GET /` retorna `{"message":"Confectionery Orders API","status":"running"}`. `GET /health` retorna `{"status":"ok"}` e indica que o processo HTTP está vivo; não testa a disponibilidade atual do banco.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| PORT | Porta HTTP, padrão 3000, inteiro entre 1 e 65535 |
| DATABASE_URL | String PostgreSQL privada copiada de Connect no Supabase |
| PGSSLROOTCERT | Opcional: caminho do certificado raiz do Supabase se exigido pelo ambiente |

Exemplo sem credenciais reais:

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=verify-full
```

Para PostgreSQL local sem TLS, use uma URL local sem `sslmode`. Para Supabase, mantenha validação TLS; se houver erro de certificado, configure o certificado raiz fornecido pelo painel. Não desative a validação. Senhas com caracteres reservados devem ser codificadas para URL. `.env`, variações locais, `node_modules` e `dist` são ignorados; `.env.example` é versionado.

## Banco no Supabase

1. Crie ou abra seu projeto de desenvolvimento no Supabase.
2. Execute **uma vez** `database/create_tables.sql` no SQL Editor. O script usa transação e não apaga tabelas anteriores nem migra seus dados. Se as tabelas já existirem, não repita o script: ele falhará sem sobrescrevê-las.
3. Em **Connect**, copie a conexão direta se houver IPv6, ou **Session pooler** para uma rede IPv4. Use host, usuário e porta exatos do painel.
4. Preencha o `.env` local com a senha do banco e configure TLS conforme acima.
5. Inicie a API e execute a sequência da coleção Postman.

O backend usa `pg` com a conexão administrativa (`postgres`) do Supabase. As duas tabelas têm RLS habilitado sem políticas públicas: a Data API não libera suas linhas para usuários anônimos. A conexão administrativa do backend tem acesso. Não são necessárias chaves `anon` ou `service_role` na aplicação.

Não foi fornecida conexão Supabase nesta entrega: a execução hospedada ainda deve ser confirmada. Nenhuma tabela remota foi alterada. Caso já existam tabelas antigas no projeto hospedado, elas permanecem intactas e não são usadas pela API; sua eventual remoção deve ser avaliada separadamente.

Referência: [conexão PostgreSQL no Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).

## Endpoints

| Método | Endpoint | Sucesso | Descrição |
|---|---|---|---|
| GET | `/customers` | 200 | Lista clientes |
| GET | `/customers/:id` | 200 | Consulta cliente |
| POST | `/customers` | 201 | Cadastra cliente |
| PUT | `/customers/:id` | 200 | Atualiza cliente |
| DELETE | `/customers/:id` | 204 | Exclui cliente sem encomendas |
| GET | `/orders` | 200 | Lista encomendas |
| GET | `/orders/:id` | 200 | Consulta encomenda |
| POST | `/orders` | 201 | Cadastra encomenda |
| PUT | `/orders/:id` | 200 | Atualiza encomenda |
| DELETE | `/orders/:id` | 204 | Exclui encomenda |
| GET | `/customers/:id/orders` | 200 | Lista encomendas do cliente |

Listas retornam arrays, inclusive `[]`. Consultas, criação e atualização retornam o objeto da entidade. POST também retorna `Location`. DELETE bem-sucedido não retorna corpo.

### Regras de atualização e validação

Os endpoints PUT aceitam **atualização parcial**, conforme o exemplo da APS: campos omitidos são preservados, e o corpo precisa conter ao menos um campo. `email`, `description` e `occasion` podem ser limpos com `null`. IDs e timestamps não podem ser enviados. Campos desconhecidos são recusados.

- Customer: `name` (1–120) e `phone` (1–30) obrigatórios, após remover espaços nas extremidades. Email opcional, válido e com até 150 caracteres.
- Order: `customer_id` UUID existente, `title` (1–150), `delivery_date` ISO 8601 com horário/fuso e `total_price` numérico entre 0 e 99.999.999,99, com até duas casas decimais. Não se exige data futura.
- `description`: até 500 caracteres. `occasion`: `birthday`, `wedding`, `party`, `corporate`, `other` ou null.
- `status`: `pending`, `confirmed`, `in_production`, `ready`, `delivered`, `cancelled`. Na criação, omissão usa `pending`.
- Alterar `customer_id` exige outro cliente existente. Excluir cliente com qualquer encomenda, inclusive cancelada, retorna 409.

## Exemplos de requisições

Envie `Content-Type: application/json`. Substitua `:id` pelo UUID retornado na criação.

### POST /customers

```json
{
  "name": "Mariana Souza",
  "phone": "41999999999",
  "email": "mariana@example.com"
}
```

### PUT /customers/:id

```json
{
  "name": "Mariana Souza",
  "phone": "41988888888",
  "email": "mariana.souza@example.com"
}
```

### POST /orders

```json
{
  "customer_id": "UUID_RETORNADO_AO_CRIAR_CLIENTE",
  "title": "Bolo de aniversário",
  "description": "Bolo de chocolate com brigadeiro para 30 pessoas",
  "occasion": "birthday",
  "delivery_date": "2026-10-25T15:00:00-03:00",
  "total_price": 280,
  "status": "pending"
}
```

### PUT /orders/:id

```json
{
  "title": "Bolo de aniversário personalizado",
  "description": "Bolo de chocolate para 40 pessoas",
  "occasion": "birthday",
  "delivery_date": "2026-10-25T16:00:00-03:00",
  "total_price": 320,
  "status": "confirmed"
}
```



## Códigos HTTP

| Código | Uso |
|---|---|
| 200 | Consulta ou atualização bem-sucedida |
| 201 | Entidade criada |
| 204 | Exclusão concluída, sem corpo |
| 400 | UUID, JSON ou dados inválidos |
| 404 | Registro/rota inexistente, inclusive cliente de uma encomenda |
| 409 | Cliente possui encomendas e não pode ser excluído |
| 413 | Corpo excede o limite de 100 KB |
| 500 | Falha inesperada, sem stack trace ou detalhes privados |

Erro esperado: `{"message":"Cliente não encontrado."}`. Validação: `{"message":"Dados inválidos.","errors":[{"field":"name","message":"Campo não pode ficar vazio."}]}`.

## Postman e apresentação

Importe `postman/Confectionery Orders API.postman_collection.json`. A coleção define `baseUrl`, `customerId` e `orderId`. POST salva automaticamente os IDs retornados. Execute manualmente o roteiro de `GUIA_APRESENTACAO.md`: crie cliente, crie encomenda, consulte, atualize e exclua a encomenda antes do cliente. As pastas agrupam recursos e não são uma sequência pronta para o Collection Runner.

## Testes e limites de verificação

```bash
npm run typecheck
npm run build
npm test
```

Os testes HTTP executam o SQL real em PGlite, sem credenciais nem acesso ao Supabase. Cobrem os 11 endpoints, regras de validação, integridade referencial, timestamps e erros. O teste de inicialização executa `dist/server.js` em processo separado com transporte de banco adaptado para PGlite. Isso valida o servidor e a lógica SQL, mas **não** valida rede, TLS, permissões ou conectividade do Supabase; confirme esses pontos com `.env` real e Postman.

Não há frontend, autenticação, pagamentos ou estoque. A API destina-se à demonstração acadêmica em ambiente controlado.

## Git

Histórico original preservado: `96b31b3`, `7f9520b`, `c6fef4c`. Branch `main`. O remote local foi mantido e nenhum push foi realizado. Após receber a URL real do repositório, confira o destino antes de substituir `origin` e publicar normalmente, sem force push.
