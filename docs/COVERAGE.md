# Evidência de cobertura

Execução local validada em 25/11/2026: 30 testes aprovados.

Comando: npm run test:coverage (Vitest + V8).

| Métrica | Cobertura | Mínimo |
| --- | ---: | ---: |
| Linhas | 90.97% | 60% |
| Instruções | 89.73% | 60% |
| Funções | 93.13% | 60% |
| Ramificações | 87.39% | 60% |

O teste local usa PGlite. O workflow no GitHub executa os endpoints com PostgreSQL 17 e publica o relatório HTML completo como artefato. Reexecute o comando para obter os resultados do seu ambiente.

Todo o código relevante de src é medido; apenas src/config é excluído. O servidor é verificado em subprocesso e aparece sem cobertura no relatório principal, sem exclusão artificial.
