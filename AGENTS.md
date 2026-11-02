# Instruções do projeto home-ia-shared

- Pacote TypeScript compartilhado entre `home-ia-web` e `home-ia-monitoring-web`.
- Não adicionar dependência de rede, banco, DOM global ou segredo. O pacote deve permanecer puro e testável.
- `styles.css` é o CSS global do portal; alterações exigem revisão visual/a11y nos dois apps.
- O `I18nProvider` e o catálogo são compartilhados como singleton pelo Module Federation; não duplicar o contexto nos consumidores.
- Verificações pela raiz: `./garage verify-home-shared`, `format-home-shared`, `lock-home-shared`.
- Executar verificações por Compose; não instalar Node no host como requisito.
