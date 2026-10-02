# Confectionery Orders API

API REST desenvolvida para gerenciar clientes e encomendas de uma confeitaria.

O projeto foi feito como APS da disciplina de Back-End Development e trabalha com duas entidades relacionadas: `Customer` e `Order`.

## Integrantes

- Henrique Henneberg
- Carlos Bueno

## Tecnologias

- Node.js
- TypeScript
- Express
- PostgreSQL
- Supabase
- Zod
- Git e GitHub

## Relacionamento

```text
Customer 1 ---- N Order

customers.id <- orders.customer_id
```

Um cliente pode ter várias encomendas. Cada encomenda pertence a um cliente por meio do campo `customer_id`.

### Customer

- `id`: UUID
- `name`: nome
- `phone`: telefone
- `email`: e-mail opcional
- `created_at`
- `updated_at`

### Order

- `id`: UUID
- `customer_id`: UUID do cliente
- `title`: título da encomenda
- `description`: descrição
- `occasion`: ocasião
- `delivery_date`: data de entrega
- `total_price`: preço
- `status`: situação da encomenda
- `created_at`
- `updated_at`

## Estrutura do projeto

```text
src/
├── config/
│   └── database.ts
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
├── validators/
├── middlewares/
├── errors/
├── app.ts
└── server.ts
```

As `routes` definem os caminhos da API. Os `controllers` recebem e tratam as requisições. Os `repositories` fazem o acesso ao banco. Os `models` representam os dados usados pela aplicação.

## Como rodar pelo terminal do VS Code

### 1. Abrir o projeto

No VS Code, abra a pasta do projeto em:

`File > Open Folder`

Depois abra o terminal:

`Terminal > New Terminal`

### 2. Instalar as dependências

No terminal do VS Code:

```powershell
npm install
```

### 3. Criar o arquivo .env

No PowerShell:

```powershell
Copy-Item .env.example .env
```

Edite o arquivo `.env` e coloque a conexão do PostgreSQL/Supabase:

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=verify-full
```

O arquivo `.env` não deve ser enviado para o GitHub.

### 4. Criar as tabelas

No painel do Supabase, abra o SQL Editor e execute:

```text
database/create_tables.sql
```

Esse arquivo cria as tabelas `customers` e `orders`, incluindo a chave estrangeira entre elas.

### 5. Iniciar a API

No terminal do VS Code:

```powershell
npm run dev
```

Com `PORT=3000`, a API fica disponível em:

```text
http://localhost:3000
```

Para conferir:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000"
```

## API publicada

A versão publicada pode ser acessada em:

https://confectionery-orders-api.onrender.com

Exemplo:

```powershell
Invoke-RestMethod -Uri "https://confectionery-orders-api.onrender.com/customers"
```

## Testando o CRUD pelo terminal do VS Code

Os comandos abaixo usam a API publicada no Render.

Abra um terminal PowerShell no VS Code e comece definindo o endereço:

```powershell
$baseUrl = "https://confectionery-orders-api.onrender.com"
```

### Criar cliente

```powershell
$email = "cliente.teste.$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"

$customerBody = @{
  name = "Cliente Teste"
  phone = "41999990000"
  email = $email
} | ConvertTo-Json

$customer = Invoke-RestMethod -Method Post `
  -Uri "$baseUrl/customers" `
  -ContentType "application/json" `
  -Body $customerBody

$customerId = $customer.id
$customer | Format-List
```

### Consultar cliente

```powershell
Invoke-RestMethod -Uri "$baseUrl/customers/$customerId" | Format-List
```

### Criar encomenda

```powershell
$orderBody = @{
  customer_id = $customerId
  title = "Bolo de aniversario"
  description = "Bolo de chocolate para 30 pessoas"
  occasion = "birthday"
  delivery_date = "2026-10-25T15:00:00-03:00"
  total_price = 280
  status = "pending"
} | ConvertTo-Json

$order = Invoke-RestMethod -Method Post `
  -Uri "$baseUrl/orders" `
  -ContentType "application/json" `
  -Body $orderBody

$orderId = $order.id
$order | Format-List
```

### Consultar encomendas do cliente

```powershell
Invoke-RestMethod -Uri "$baseUrl/customers/$customerId/orders" | ConvertTo-Json -Depth 5
```

### Atualizar encomenda

```powershell
$updateBody = @{
  title = "Bolo de aniversario personalizado"
  description = "Bolo de chocolate para 40 pessoas"
  occasion = "birthday"
  delivery_date = "2026-10-25T16:00:00-03:00"
  total_price = 320
  status = "confirmed"
} | ConvertTo-Json

Invoke-RestMethod -Method Put `
  -Uri "$baseUrl/orders/$orderId" `
  -ContentType "application/json" `
  -Body $updateBody
```

### Testar a proteção do relacionamento

Enquanto a encomenda existir, tente excluir o cliente:

```powershell
Invoke-WebRequest -Method Delete -Uri "$baseUrl/customers/$customerId"
```

O retorno esperado é `409 Conflict`, porque ainda existe uma encomenda vinculada ao cliente.

### Excluir a encomenda

```powershell
Invoke-WebRequest -Method Delete -Uri "$baseUrl/orders/$orderId"
```

O retorno esperado é `204 No Content`.

### Excluir o cliente

```powershell
Invoke-WebRequest -Method Delete -Uri "$baseUrl/customers/$customerId"
```

Agora o retorno esperado também é `204 No Content`.

## Endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/customers` | Lista clientes |
| GET | `/customers/:id` | Consulta um cliente |
| POST | `/customers` | Cria um cliente |
| PUT | `/customers/:id` | Atualiza um cliente |
| DELETE | `/customers/:id` | Exclui um cliente |
| GET | `/orders` | Lista encomendas |
| GET | `/orders/:id` | Consulta uma encomenda |
| POST | `/orders` | Cria uma encomenda |
| PUT | `/orders/:id` | Atualiza uma encomenda |
| DELETE | `/orders/:id` | Exclui uma encomenda |
| GET | `/customers/:id/orders` | Lista as encomendas de um cliente |

## Códigos HTTP usados

| Código | Significado |
|---|---|
| 200 | Operação realizada com sucesso |
| 201 | Registro criado |
| 204 | Registro excluído |
| 400 | Dados inválidos |
| 404 | Registro não encontrado |
| 409 | Conflito de relacionamento |
| 500 | Erro interno |

## Validações

A API valida os dados recebidos antes de gravar no banco.

Algumas regras:

- nome e telefone do cliente são obrigatórios;
- e-mail, quando informado, precisa ser válido;
- `customer_id` precisa ser um UUID de cliente existente;
- preço não pode ser negativo;
- status deve estar entre os valores aceitos pela aplicação;
- um cliente com encomendas não pode ser excluído.

## Testes do projeto

No terminal do VS Code:

```powershell
npm run typecheck
npm run build
npm test
```

## Postman

A pasta `postman` contém uma collection pronta para quem preferir testar a API pelo Postman. O fluxo principal deste README usa o terminal do VS Code.

## Repositório

https://github.com/hhenriquehhenneberg-crypto/confectionery-orders-api
