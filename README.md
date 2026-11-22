# home-ia-shared

Pacote compartilhado do Home IA para o shell `home-ia-web` e o remote `home-ia-monitoring-web`.

## Conteúdo

- `i18n` e catálogo tipado pt-BR/en-US.
- Tokens e aplicação de temas.
- Cliente HTTP same-origin (`request`, `getJson`, `postJson`, `ApiError`).
- Emissor de eventos de navegação do EventStore (`createPlatformEventEmitter`, `createCorrelationId`) com `fetch`/relógio/IDs injetáveis, fila limitada e falha silenciosa.
- Tipos de domínio compartilhados (`CameraStatus`, `UserRole`, etc.).
- `StatusBadge`.
- `styles.css` global do portal.

## Uso

Os dois apps declaram a dependência local:

```json
"home-ia-shared": "file:../home-ia-shared"
```

O pacote é compilado para `dist/` por `tsc`. Em Module Federation, `home-ia-shared` é compartilhado como singleton para que o `I18nProvider` do shell seja o mesmo contexto consumido pelo remote.

## Eventos de navegação

`createPlatformEventEmitter` envia `navigation.viewed`/`ui.action` para `/api/v1/events` com `source=shell`,
`emitter=browser`, `X-Correlation-Id` e fila limitada (descarte contabilizado). O servidor deriva ator e sessão
e só aceita esses tipos de sessão same-origin; falha de envio nunca lança para a UI e aparece em `getStats()`.
O helper não decide autorização, não registra ator e não deve receber dados pessoais ou mídia em `metadata`.

## Verificações

A partir da raiz do contexto:

```bash
./garage verify-home-shared
./garage format-home-shared
./garage lock-home-shared
```

O Compose fixa Node por digest e roda lint, formatação e build. Não há runtime próprio, banco, segredo ou serviço de produção.

## Temas e estilos visuais (ADR111/ADR135)

Revisão `T16-UI-THEMES-REFINE`: `--style-enter-animation` define o movimento de
entrada por perfil; controles, superfícies internas e tabelas usam o mesmo
contrato. Use `.style-inset` em contêineres internos, não utilitários de raio/borda
fixos. Movimento reduzido elimina animações/transformações decorativas, sem
remover transforms funcionais da matriz. A paleta ajusta a luminosidade de
acentos extremos para preservar contraste de links e seleção/hover.

O shell executa `e2e/themeStyles.spec.ts` pelo comando raiz
`./home-ia test-federation-web`: onze estilos × dois modos, remotes reais,
sentinelas de CSS computado, 320 px, axe e capturas locais. Não representa
homologação de câmera, dispositivo físico ou todos os fluxos de negócio.

A cor primária e o modo claro/escuro derivam as cores complementares. O shell oferece matriz HSV, prévia/HEX e switch de modo; os presets não são visíveis e seus IDs permanecem apenas para compatibilidade. CSS da matriz/switch e textos pt-BR/en-US são compartilhados, sem nova API ou dependência. Os onze estilos de forma/superfície permanecem um eixo independente e são definidos por um único bloco `[data-theme-style="<id>"]` de tokens `--style-*` (superfícies e cabeçalho, bordas, sombras, textura, tipografia, controles, movimento e foco). Shell e módulos federados consomem os mesmos tokens: não duplique regras por personalidade nos componentes. `prefers-reduced-motion` continua respeitado, inclusive no switch. Testes contratuais de CSS verificam a unicidade dos blocos, diversidade das superfícies, o uso dos tokens e assinaturas dos estilos. Verificações pela raiz: `./home-ia verify-home-shared`, `format-home-shared` e `lock-home-shared`.
