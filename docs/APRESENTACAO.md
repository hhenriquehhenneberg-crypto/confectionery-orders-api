# Roteiro de apresentação

ROTEIRO DE APRESENTAÇÃO — DOCE GESTÃO
Henrique Henneberg Nurdim e Carlos Bueno · Desenvolvimento Back-End
Avaliação: 26/11/2026 · Entrega no AVA até 22h10

ANTES DE SAIR PARA A AULA
1. Leve o projeto completo e o .env privado no computador em que irá executar.
2. Na pasta do projeto, rode npm ci (se as dependências ainda não estiverem instaladas).
3. Rode npm run doctor para conferir a conexão real e as três tabelas.
4. Rode npm run dev e abra o endereço exibido pelo terminal, acrescentando /app/.
   Neste computador, a configuração de apresentação usa http://localhost:3200/app/.
5. Deixe também o Swagger em http://localhost:3200/api-docs/ e o GitHub abertos.
6. Rode npm run test:coverage e abra coverage/index.html.
7. Confira a internet e tenha npm run demo como alternativa local.
   A demonstração usa dados fictícios; explique isso se precisar dela. Ela não comprova sozinha a conexão com Supabase.
8. Não abra o .env ou mostre senhas na apresentação.

FALA E DEMONSTRAÇÃO — CERCA DE 5 MINUTOS

0:00–0:35 — O problema e a evolução
“Meu projeto é o Doce Gestão, um sistema para organizar clientes, encomendas e pagamentos de uma confeitaria. Na primeira entrega eu tinha clientes e encomendas. Nesta etapa acrescentei pagamentos, regras de negócio, Services, testes automatizados, Swagger e uma interface para utilizar a API.”

0:35–1:10 — Entidades e banco
“Um cliente pode ter várias encomendas, e uma encomenda pode ter vários pagamentos. Os identificadores são UUIDs. As chaves estrangeiras mantêm a integridade: orders.customer_id aponta para customers.id, e payments.order_id aponta para orders.id. Os registros ficam persistidos em PostgreSQL no Supabase.”
Mostre o relacionamento no README e execute npm run doctor. Não mostre a conexão privada.

1:10–2:15 — Fluxo principal
No painel, cadastre um cliente fictício. Abra os detalhes dele e crie uma encomenda de R$ 280 para amanhã. Registre R$ 100 por Pix. Mostre que o saldo fica em R$ 180. Edite o pagamento para R$ 120 e mostre o saldo de R$ 160. Mostre consulta, edição e os detalhes relacionados.

2:15–2:50 — Regras de negócio
“A API impede valor negativo, pagamento acima do saldo e pagamento de encomenda cancelada. Também não deixa reduzir o preço abaixo do total já pago, nem excluir um cliente que ainda tenha encomendas.”
Tente reduzir o preço da encomenda para R$ 99 e mostre a mensagem. Explique que a validação também ocorre no servidor, portanto não depende apenas do formulário.

2:50–3:25 — Organização do código e POO
“Routes associam caminhos e métodos HTTP. Controllers tratam requisições e respostas. Services coordenam regras de negócio. Models representam os dados e comportamentos. Repositories executam SQL parametrizado. A classe OrderRules encapsula o estado da encomenda e o total pago, usando atributos privados e métodos para validar as operações.”
Abra OrderService.ts e OrderRules.ts. Explique um método que você compreendeu.

3:25–4:10 — Testes e cobertura
“Uso Vitest para testes unitários e Supertest para os endpoints. Nos unitários, isolo dependências com mocks. Na integração, exercito API, persistência e restrições. Localmente uso PGlite temporário; a CI usa PostgreSQL 17 com múltiplas conexões, incluindo pagamentos concorrentes.”
Execute npm run test:coverage. Mostre os 34 testes e as quatro métricas, todas acima dos 60% exigidos. Os resultados atuais estão em docs/COVERAGE.md. Abra o relatório HTML.

4:10–4:40 — Swagger e HTTP
Abra /api-docs/. Mostre uma consulta e um POST.
“GET consulta; POST cria; PUT atualiza os campos informados; DELETE exclui. Uso 200 para consulta/atualização, 201 para criação, 204 para exclusão, 400 para dados inválidos, 404 para registro não encontrado e 409 para conflito de negócio.”

4:40–5:00 — Fechamento e limpeza
“O repositório inclui instruções para executar, scripts de banco e testes. A atualização preservou o histórico e os registros da primeira entrega.”
Exclua somente os registros fictícios criados por você, na ordem pagamento, encomenda e cliente. Não é necessário apagar dados existentes.

PERGUNTAS QUE VOCÊ PRECISA SABER RESPONDER

Por que uma terceira entidade?
Para registrar pagamentos parciais de uma encomenda. Ela possui identidade própria e relação com Order.

Por que Services?
Para separar as regras de negócio do transporte HTTP e do SQL, facilitando testes e manutenção.

O que demonstra POO?
Classes de Services e Repositories, construtores e objetos; OrderRules usa atributos privados e métodos que representam o comportamento do domínio.

Como evita SQL injection?
Os valores são enviados como parâmetros $1, $2 etc. Atualizações dinâmicas usam uma lista fixa de campos permitidos.

Por que transação e SELECT FOR UPDATE?
Para fazer a verificação de saldo e a gravação como uma operação coordenada. O bloqueio da encomenda serializa pagamentos concorrentes enviados pela API.

Por que usar centavos nos cálculos?
Para evitar diferenças de ponto flutuante nas comparações financeiras. No banco, os valores usam NUMERIC(10,2).

Qual a diferença entre unitário e integração?
Unitário isola uma regra ou Service. Integração verifica os componentes trabalhando juntos, incluindo requisição HTTP, Repository e banco de teste.

60% significa que o sistema não tem bugs?
Não. A cobertura mostra código exercitado; também são necessários cenários relevantes de sucesso, falha e regras de negócio.

O front-end substitui o Swagger?
Não. O front-end demonstra o uso. O Swagger documenta e permite testar os endpoints diretamente.

A API cobra Pix ou cartão?
Não. Ela registra administrativamente um pagamento recebido. Não integra bancos nem realiza estornos.

POR ONDE ENTREGAR
Abra o AVA → Desenvolvimento Back-End → Avaliação 2 → Avaliação – API finalizada.
A atividade abre em 26/11/2026 às 18h e encerra às 22h10.
Cole o link do repositório na atividade e confirme o envio. Confira o status final.
Email e mensagem não substituem o AVA. Vídeo/LinkedIn é opcional e não dispensa presença.
