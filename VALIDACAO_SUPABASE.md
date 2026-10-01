# Validação real do Supabase

Executada em 30/09/2026 (America/Sao_Paulo), equivalente ao registro UTC 2026-10-01T02:25:59.673Z.

- Projeto: restaurant-ordering-system (`uxrixrkhrvzgitsjfgml`).
- Região: sa-east-1.
- Host: aws-0-sa-east-1.pooler.supabase.com; porta 5432; Session Pooler.
- Banco: postgres.
- Conexão: pg / DATABASE_URL com TLS verify-full e certificado raiz público Supabase.
- API: npm run dev, http://localhost:3001 (3000 já ocupada).
- /health é liveness HTTP; a conexão foi comprovada pelo início do servidor, CRUD persistido e consultas diretas.

## Resultados HTTP

| Método | Endpoint | Status obtido |
|---|---|---|
| GET | `/` | 200 |
| GET | `/health` | 200 |
| POST | `/customers` | 201 |
| GET | `/customers` | 200 |
| GET | `/customers/:id` | 200 |
| PUT | `/customers/:id` | 200 |
| POST | `/orders` | 201 |
| GET | `/orders` | 200 |
| GET | `/orders/:id` | 200 |
| PUT | `/orders/:id` | 200 |
| GET | `/customers/:id/orders` | 200 |
| DELETE | `/customers/:id` | 409 |
| GET | `/customers/abc` | 400 |
| GET | `/customers/:id` | 404 |
| POST | `/orders` | 404 |
| PUT | `/orders/:id` | 400 |
| PUT | `/orders/:id` | 400 |
| DELETE | `/orders/:id` | 204 |
| GET | `/orders/:id` | 404 |
| DELETE | `/customers/:id` | 204 |
| GET | `/customers/:id` | 404 |

As duas respostas 400 em PUT /orders/:id correspondem a preço negativo e status banana. O POST /orders com 404 utilizou um customer_id inexistente. O DELETE de cliente com 409 foi executado enquanto havia uma encomenda relacionada.

## Banco verificado

Nas tabelas public.customers e public.orders foram confirmados UUID com gen_random_uuid(), PK, FK orders.customer_id → customers.id com ON DELETE RESTRICT, CHECKs de total_price/status/occasion, timestamps com fuso, triggers BEFORE UPDATE que alteram updated_at, índice em customer_id e RLS habilitado. Os timestamps também foram verificados antes/depois das atualizações HTTP. O status atualizado foi conferido diretamente no banco.

Nenhum DDL foi executado. Nenhuma tabela antiga foi removida. Apenas os registros criados neste teste foram modificados/excluídos. As exclusões retornaram 204 e as consultas posteriores retornaram 404.

## Testes locais

Após a validação remota: npm run build, npm run typecheck e npm test executados com sucesso; sete testes locais aprovados. Esses testes locais continuam usando PGlite, separados desta validação remota.

## Segurança e publicação

Senha somente no .env ignorado; certificado versionado é público e não contém chave privada. Não houve desativação de TLS. Origin continua apontando para bundle local e não recebeu push. Para publicar, falta a URL real do GitHub.
