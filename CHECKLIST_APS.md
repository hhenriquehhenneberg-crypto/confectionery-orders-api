# Checklist da APS — Confectionery Orders API

Itens marcados foram confirmados no código e/ou nos testes locais. O Supabase hospedado foi validado separadamente por HTTP e consultas ao catálogo PostgreSQL; veja VALIDACAO_SUPABASE.md.

## Requisitos

- [x] Node.js — scripts dev/build/start e servidor iniciado em teste.
- [x] TypeScript — strict; build e typecheck sem erros.
- [x] Express — rotas HTTP e express.json().
- [x] Persistência PostgreSQL compatível com Supabase — pg, DATABASE_URL e SQL executado em PostgreSQL embarcado.
- [x] Supabase hospedado — conexão TLS e CRUD real confirmados; esquema preexistente inspecionado sem executar DDL.
- [x] Duas entidades principais relacionadas: Customer 1:N Order.
- [x] UUID automático nas duas entidades.
- [x] Primary Keys e Foreign Key obrigatória.
- [x] CRUD Customer completo.
- [x] CRUD Order completo.
- [x] GET todos.
- [x] GET por ID.
- [x] POST.
- [x] PUT.
- [x] DELETE.
- [x] Models.
- [x] Controllers.
- [x] Routes.
- [x] Repositories; SQL fora dos controllers.
- [x] JSON nas requisições e respostas com corpo.
- [x] HTTP status 200, 201, 204, 400, 404, 409, 500.
- [x] Validação de entradas com Zod.
- [x] Tratamento centralizado de erros sem stack trace na resposta.
- [x] Variáveis de ambiente.
- [x] .env protegido: git check-ignore confirmou .env e .env.local.
- [x] .env.example sem credenciais reais.
- [x] Git existente preservado, branch main e três commits originais intactos.
- [x] README completo e correspondente à implementação.
- [x] Banco documentado e script SQL fornecido.
- [x] Endpoints documentados.
- [x] Exemplos de requisições.
- [x] Postman Collection JSON com 11 requisições e variáveis.
- [x] Guia de apresentação com conceitos e roteiro.
- [x] Domínio antigo removido do código de aplicação e do SQL final.

## Endpoints verificados por HTTP com PostgreSQL embarcado

- [x] GET /customers
- [x] GET /customers/:id
- [x] POST /customers
- [x] PUT /customers/:id
- [x] DELETE /customers/:id
- [x] GET /orders
- [x] GET /orders/:id
- [x] POST /orders
- [x] PUT /orders/:id
- [x] DELETE /orders/:id
- [x] GET /customers/:id/orders
- [x] GET / e GET /health

## Regras verificadas

- [x] Customer e Order recebem UUID do banco.
- [x] Order possui customer_id obrigatório com FK.
- [x] Cliente inexistente não recebe encomenda: 404 na API e FK no banco.
- [x] Troca de customer_id valida o novo cliente.
- [x] Cliente com encomendas não é excluído: 409 e ON DELETE RESTRICT.
- [x] FK protege também contra alteração concorrente após a consulta prévia.
- [x] Preço negativo é recusado na API e pelo CHECK.
- [x] Preço não numérico, fora do limite ou com mais de duas casas é recusado.
- [x] Status e ocasião inválidos são recusados na API e no banco.
- [x] UUID inválido retorna 400; UUID válido inexistente retorna 404.
- [x] Nome, telefone e título vazios são recusados.
- [x] Email inválido e data impossível são recusados.
- [x] JSON malformado retorna 400.
- [x] Falha inesperada retorna 500 sem detalhes internos.
- [x] PUT preserva campos omitidos e rejeita corpo vazio.
- [x] Campos opcionais podem ser limpos com null.
- [x] Timestamps são atualizados por triggers.
- [x] Exclusões bem-sucedidas retornam 204 sem corpo.

## Validação executada

- [x] npm install — instalação concluída; auditoria inicial sem vulnerabilidades.
- [x] npm run build — sem erros.
- [x] npm run typecheck — sem erros.
- [x] npm test — testes HTTP, SQL e inicialização em processo separado.
- [x] Revisão de diff, arquivos novos e padrões de credenciais.
- [x] Roteiro de CRUD e erros executado por script HTTP contra a API conectada ao Supabase real.
- [ ] Apresentação manual no Postman — atividade de demonstração; coleção fornecida.
- [x] URL real do GitHub configurada e branch main publicada no repositório final.

O teste de inicialização utiliza o servidor compilado e adapta o transporte de pg para PGlite. Não comprova rede, TLS ou permissões de um projeto Supabase. Os testes não alteram bancos externos.

A validação externa posterior confirmou rede, autenticação e TLS verify-full com o certificado público incluído. Dados de teste foram removidos; tabelas antigas permaneceram intactas.
