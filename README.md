# home-ia-shared

Pacote compartilhado do Home IA para o shell `home-ia-web` e o remote `home-ia-monitoring-web`.

## Conteúdo

- `i18n` e catálogo tipado pt-BR/en-US.
- Tokens e aplicação de temas.
- Cliente HTTP same-origin (`request`, `getJson`, `postJson`, `ApiError`).
- Tipos de domínio compartilhados (`CameraStatus`, `UserRole`, etc.).
- `StatusBadge`.
- `styles.css` global do portal.

## Uso

Os dois apps declaram a dependência local:

```json
"home-ia-shared": "file:../home-ia-shared"
```

O pacote é compilado para `dist/` por `tsc`. Em Module Federation, `home-ia-shared` é compartilhado como singleton para que o `I18nProvider` do shell seja o mesmo contexto consumido pelo remote.

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
