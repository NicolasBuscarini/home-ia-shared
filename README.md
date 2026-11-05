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

## Estilos visuais (ADR111)

Os temas de cor ficam em blocos `[data-theme="<id>"]`; as personalidades visuais ficam em `[data-theme-style="<id>"]` e expõem somente custom properties `--style-*` (raio, borda e espessura, divisor, sombra, blur, textura, tipografia, botão, altura de controle, movimento, foco e acento). Componentes consomem esses tokens; um estilo novo é um bloco novo, não CSS por componente. Verificações: `./garage verify-home-shared`, `format-home-shared` e `lock-home-shared`.
