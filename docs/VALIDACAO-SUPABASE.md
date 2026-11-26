# Validação no banco real

Validação executada em 25/11/2026 (America/Sao_Paulo).

O banco original da confeitaria foi localizado no projeto Supabase denominado restaurant-ordering-system, região São Paulo. Apesar do nome do projeto, as tabelas customers e orders já eram utilizadas na primeira entrega.

## Atualização

- Projeto reativado e disponibilidade confirmada.
- Estrutura anterior inspecionada antes da alteração.
- Aplicado database/upgrade_payments.sql, adicionando payments, chave estrangeira, índice, trigger e RLS.
- Tabelas e registros existentes preservados.
- Conexão PostgreSQL pelo Session Pooler com TLS e certificado verificado.
- Credenciais mantidas apenas no .env local ignorado pelo Git.

## Verificação

npm run doctor confirmou conexão, TLS, certificado e as três tabelas.

Foram executadas as 22 requisições da coleção Postman contra o Express conectado ao Supabase real, verificando:

- CRUD de clientes, encomendas e pagamentos.
- Consultas por ID e relacionamentos.
- Atualização de pagamento persistida no banco.
- HTTP 409 para pagamento acima do saldo, redução de preço abaixo do valor pago, cancelamento com pagamento e exclusão de cliente com encomenda.
- UUIDs retornados pela API encontrados por consulta direta ao banco.
- Limpeza somente dos registros fictícios desta execução.
- Contagens finais iguais às anteriores: nenhum registro anterior foi removido.

Os testes automatizados continuam isolados do banco da aplicação.

## RLS e acesso

As tabelas possuem RLS habilitada e nenhuma política pública. Isso é intencional nesta arquitetura: o navegador utiliza o Express, e o Express acessa PostgreSQL com a credencial de servidor. O diagnóstico do Supabase indicou apenas avisos informativos sobre ausência de políticas; não foi criado acesso público para contorná-los.

## Apresentação neste computador

- Interface conectada ao banco real: http://localhost:3200/app/
- Swagger: http://localhost:3200/api-docs/
- Demonstração local com dados fictícios: http://localhost:3100/app/

A porta é uma configuração local e pode variar em outro computador. Execute npm run doctor para conferir a conexão antes da apresentação.
