# Restaurant Ordering System - Back-End

Projeto incremental da disciplina de Back-End Development para um sistema de autoatendimento em restaurantes.

## Tecnologias

- Node.js
- TypeScript
- Express
- PostgreSQL
- Arquitetura MVC

## Recursos atuais

- Categorias
- Produtos
- Relação 1:N entre categoria e produto
- `GET /categories`
- `POST /categories`
- `GET /products`
- `POST /products`

## Como executar

1. Crie um banco PostgreSQL chamado `restaurant_ordering`.
2. Execute o script `database/create_tables.sql`.
3. Copie `.env.example` para `.env` e ajuste `DATABASE_URL`.
4. Instale as dependências:

```bash
npm install
```

5. Inicie em modo de desenvolvimento:

```bash
npm run dev
```

A API ficará disponível em `http://localhost:3000`.

## Exemplos

### Criar categoria

`POST /categories`

```json
{
  "name": "Pizzas",
  "description": "Pizzas do cardápio",
  "icon": "🍕",
  "display_order": 1
}
```

### Criar produto

`POST /products`

```json
{
  "category_id": "UUID_DA_CATEGORIA",
  "title": "Pizza Calabresa",
  "description": "Pizza de calabresa com cebola",
  "price": 49.90,
  "image": "calabresa.jpg",
  "available": true
}
```
