# Instruções do projeto home-ia-shared

- Pacote TypeScript compartilhado entre `home-ia-web` e `home-ia-monitoring-web`.
- Não adicionar dependência de rede, banco, DOM global ou segredo. O pacote deve permanecer puro e testável.
- `styles.css` é o CSS global do portal; alterações exigem revisão visual/a11y nos dois apps.
- O `I18nProvider` e o catálogo são compartilhados como singleton pelo Module Federation; não duplicar o contexto nos consumidores.
- Verificações pela raiz: `./garage verify-home-shared`, `format-home-shared`, `lock-home-shared`.
- Executar verificações por Compose; não instalar Node no host como requisito.

## Estilos Visuais (ADR111)

Temas de cor usam `[data-theme]`; estilos de forma usam `[data-theme-style]` com tokens `--style-*` definidos no topo de `src/styles.css`. Componentes devem consumir esses tokens (borda, raio, sombra, tipografia, movimento, foco) e nunca duplicar regras por estilo. O preview em `THEME_STYLES.preview` deve refletir a personalidade real. Preserve `prefers-reduced-motion` e contraste.
