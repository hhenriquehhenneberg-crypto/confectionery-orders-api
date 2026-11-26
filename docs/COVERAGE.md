# Evidência de cobertura e verificação

Execução local validada em 25/11/2026: **34 testes aprovados**.

Comando: npm run test:coverage (Vitest + V8).

| Métrica | Cobertura | Mínimo |
| --- | ---: | ---: |
| Linhas | 91.63% | 60% |
| Instruções | 90.57% | 60% |
| Funções | 94.06% | 60% |
| Ramificações | 85.82% | 60% |

O teste local usa PGlite. O workflow executa os endpoints com PostgreSQL 17 e publica o relatório HTML completo como artefato.

Todo o código relevante de src é medido; apenas src/config é excluído. O servidor é verificado em subprocesso e aparece sem cobertura no relatório principal. public/domain.js também é medido; public/app.js contém a renderização verificada manualmente no navegador e não entra na cobertura do back-end.

## Verificação manual da interface

- Cadastro de cliente e encomenda pelos formulários.
- Pagamento de R$ 75,50 em encomenda de R$ 200: saldo exibido de R$ 124,50.
- Correção do pagamento para R$ 100: saldo exibido de R$ 100.
- Redução do preço para R$ 50 recusada com mensagem da regra de negócio.
- Exclusão dos registros fictícios na ordem pagamento, encomenda e cliente.
- Busca, navegação, detalhes relacionados e layout móvel de 390 px verificados.
- Sem erros ou avisos no console durante a verificação.
