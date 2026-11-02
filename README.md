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
