# Guia de apresentação — Confectionery Orders API

## Conceitos em linguagem simples

1. **API REST:** interface HTTP para consultar e modificar recursos, aqui clientes e encomendas.
2. **Node.js:** executa JavaScript no servidor.
3. **TypeScript:** adiciona tipos ao JavaScript para detectar erros durante o desenvolvimento; o build gera JavaScript.
4. **Express:** organiza rotas HTTP e o processamento de requisições e respostas.
5. **PostgreSQL:** banco relacional que armazena as tabelas e garante as restrições.
6. **Supabase:** plataforma que hospeda o PostgreSQL usado pela API.
7. **CRUD:** Create, Read, Update e Delete: criar, consultar, atualizar e excluir.
8. **UUID:** identificador de 128 bits, como os IDs gerados automaticamente pelo banco.
9. **Primary Key:** chave que identifica exclusivamente cada registro: id.
10. **Foreign Key:** referência validada pelo banco para um registro de outra tabela.
11. **Relacionamento 1:N:** um cliente pode ter várias encomendas; cada encomenda possui um cliente.
12. **customer_id:** identifica quem fez a encomenda e aponta para customers.id.
13. **Model:** define os tipos e campos da entidade em TypeScript; não executa consultas.
14. **Controller:** recebe a entrada da rota, valida, aplica regras e chama repositories.
15. **Route:** associa método e caminho HTTP à função do controller.
16. **Repository:** concentra o SQL parametrizado e devolve dados ao controller.
17. **GET:** lê dados sem alterá-los.
18. **POST:** cadastra um novo recurso.
19. **PUT:** atualiza um recurso. Nesta API aceita apenas os campos que deseja alterar, como documentado.
20. **DELETE:** remove um recurso respeitando as regras do banco.
21. **200:** consulta ou atualização concluída.
22. **201:** novo registro criado.
23. **204:** exclusão concluída, sem JSON na resposta.
24. **400:** dados, UUID ou JSON inválidos.
25. **404:** cliente, encomenda ou rota não encontrados.
26. **409:** conflito: cliente com encomendas não pode ser excluído.
27. **500:** falha inesperada. O cliente recebe uma mensagem genérica.
28. **Como a entrada chega:** Express interpreta JSON com express.json(); a Route encaminha req ao Controller.
29. **Como Controller chama Repository:** após validar com Zod, chama create, findAll, findById, update ou delete e escolhe o status HTTP.
30. **Como Repository acessa PostgreSQL:** usa o pool pg e parâmetros $1, $2 etc.; a conexão vem de DATABASE_URL. Isso evita concatenar valores no SQL.
31. **Como demonstrar no Postman:** importe a coleção, confira baseUrl e siga a sequência abaixo. Os POSTs preenchem os IDs automaticamente.

## Antes da apresentação

Configure o Supabase conforme o README, execute o SQL uma única vez, preencha `.env` e inicie `npm run dev`. Importe a coleção Postman e confira `baseUrl=http://localhost:3000`. Não mostre a senha do `.env` na apresentação.

## Roteiro de demonstração

1. `GET /`: mostrar o nome da API.
2. `POST /customers`: cadastrar Mariana, mostrar 201 e UUID. A coleção salva `customerId`.
3. `GET /customers` e `GET /customers/{{customerId}}`: mostrar as duas leituras.
4. `PUT /customers/{{customerId}}`: alterar telefone e mostrar 200.
5. `POST /orders`: criar o bolo com `customer_id={{customerId}}`; mostrar 201. A coleção salva `orderId`.
6. Opcional: criar uma segunda encomenda para o mesmo cliente, anotando os dois UUIDs; o POST sobrescreve `orderId`.
7. `GET /customers/{{customerId}}/orders`: mostrar o relacionamento 1:N.
8. `GET /orders`: listar encomendas.
9. `PUT /orders/{{orderId}}`: enviar `{"status":"confirmed"}` para alterar a situação.
10. `GET /orders/{{orderId}}`: confirmar a alteração e o novo `updated_at`.
11. `DELETE /customers/{{customerId}}`: demonstrar 409, pois existem encomendas. O teste da coleção espera 204 para o caso de sucesso; nesta etapa o 409 é proposital.
12. Tentar preço negativo ou status inválido: mostrar 400. Consultar UUID válido inexistente: mostrar 404.
13. `DELETE /orders/{{orderId}}`: mostrar 204 sem corpo. Se criou uma segunda encomenda, exclua também a primeira pelo UUID anotado.
14. `DELETE /customers/{{customerId}}`: agora mostrar 204.
15. Consultar novamente o cliente excluído: mostrar 404.

## Explicação do caminho de uma requisição

```text
Postman → Route → Controller → Repository → PostgreSQL no Supabase
Postman ← JSON + status HTTP ← Controller ← resultado do Repository
```

Abra `OrderController.ts` e mostre a validação do cliente. Abra `OrderRepository.ts` e mostre INSERT com parâmetros. Abra `create_tables.sql` e mostre FK, `ON DELETE RESTRICT` e CHECK de preço. Explique que a FK mantém a integridade mesmo se houver requisições simultâneas.

## O que dizer sobre os testes

O build e typecheck verificam TypeScript. `npm test` verifica o comportamento HTTP e o SQL usando PostgreSQL embarcado. A conexão externa foi posteriormente validada com CRUD real no Supabase. Consulte VALIDACAO_SUPABASE.md. Nesta máquina, use baseUrl=http://localhost:3001, pois a porta 3000 está ocupada.
