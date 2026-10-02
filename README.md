# Confectionery Orders API

API REST para cadastro de clientes e encomendas de uma confeitaria.

## Tecnologias

- Node.js
- TypeScript
- Express
- PostgreSQL
- Supabase
- Zod

## Entidades

```text
Customer 1 ---- N Order
customers.id <- orders.customer_id
```

Um cliente pode ter várias encomendas. Cada encomenda pertence a um cliente pelo campo `customer_id`.

## Estrutura

```text
src/
├── config/
├── controllers/
├── errors/
├── middlewares/
├── models/
├── repositories/
├── routes/
├── validators/
├── app.ts
└── server.ts

database/
tests/
```

- `routes`: endpoints da API
- `controllers`: recebem e tratam as requisições
- `repositories`: acesso ao banco
- `models`: tipos de Customer e Order
- `validators`: validação dos dados
- `config/database.ts`: conexão com PostgreSQL

## Como rodar

Pré-requisitos:

- Node.js 22+
- npm
- PostgreSQL ou projeto no Supabase

Clone o repositório:

```powershell
git clone https://github.com/hhenriquehhenneberg-crypto/confectionery-orders-api.git
cd confectionery-orders-api
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```powershell
Copy-Item .env.example .env
```

Preencha a conexão com o banco:

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=verify-full
```

No Supabase, execute o arquivo:

```text
database/create_tables.sql
```

Depois inicie a API:

```powershell
npm run dev
```

Por padrão ela fica em:

```text
http://localhost:3000
```

Para verificar:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000"
```

## API online

A versão publicada está em:

https://confectionery-orders-api.onrender.com

Exemplo de consulta:

```powershell
Invoke-RestMethod -Uri "https://confectionery-orders-api.onrender.com/customers"
```

## Endpoints

### Customers

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/customers` | Lista clientes |
| GET | `/customers/:id` | Busca um cliente |
| POST | `/customers` | Cria um cliente |
| PUT | `/customers/:id` | Atualiza um cliente |
| DELETE | `/customers/:id` | Exclui um cliente |

### Orders

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/orders` | Lista encomendas |
| GET | `/orders/:id` | Busca uma encomenda |
| POST | `/orders` | Cria uma encomenda |
| PUT | `/orders/:id` | Atualiza uma encomenda |
| DELETE | `/orders/:id` | Exclui uma encomenda |
| GET | `/customers/:id/orders` | Lista encomendas de um cliente |

## Exemplo de cliente

```json
{
  "name": "Mariana Souza",
  "phone": "41999999999",
  "email": "mariana@example.com"
}
```

## Exemplo de encomenda

```json
{
  "customer_id": "UUID_DO_CLIENTE",
  "title": "Bolo de aniversario",
  "description": "Bolo de chocolate para 30 pessoas",
  "occasion": "birthday",
  "delivery_date": "2026-10-25T15:00:00-03:00",
  "total_price": 280,
  "status": "pending"
}
```

## Status disponíveis

```text
pending
confirmed
in_production
ready
delivered
cancelled
```

## Testes

```powershell
npm run typecheck
npm run build
npm test
```

## Scripts

```text
npm run dev       inicia em modo de desenvolvimento
npm run build     compila o TypeScript
npm start         executa a versão compilada
npm run typecheck verifica os tipos
npm test          executa os testes
```

O arquivo `.env` não é versionado.
