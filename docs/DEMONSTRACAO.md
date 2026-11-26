# Demonstração da avaliação final

1. Execute o script SQL adequado ao seu banco, configure o .env e inicie com npm run dev.
2. Abra /api-docs/ e mostre as três entidades: clientes, encomendas e pagamentos.
3. Cadastre um cliente e copie seu UUID.
4. Cadastre uma encomenda de R$ 280 usando customer_id.
5. Registre um pagamento de R$ 100 por Pix usando order_id.
6. Consulte as listas e os registros por ID. Mostre /customers/:id/orders e /orders/:id/payments.
7. Tente registrar mais R$ 181: a API deve responder 409. O saldo é R$ 180.
8. Tente reduzir o preço para R$ 99, cancelar ou excluir a encomenda: deve retornar 409.
9. Corrija o pagamento para R$ 120 e o método para cash. Atualize o telefone do cliente e a descrição da encomenda.
10. Exclua o pagamento, depois a encomenda e por último o cliente. Cada exclusão retorna 204.
11. Execute npm run test:unit, npm run test:integration e npm run test:coverage.
12. Abra coverage/index.html e mostre os percentuais das quatro métricas.
13. Explique o fluxo Routes → Controllers → Services → Repositories → PostgreSQL e a classe OrderRules.
14. Mostre database/upgrade_payments.sql e explique como ele preserva o projeto anterior.
15. Confira no AVA se o link do repositório foi enviado e confirmado antes do prazo.

Não mostre credenciais durante a apresentação. Use somente registros fictícios.
