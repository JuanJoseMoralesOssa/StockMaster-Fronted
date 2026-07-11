# my-inventory

SPA de inventario (Vite + React 19 + TypeScript + Tailwind v4). Consume el API
LoopBack4 del repo hermano `../backend-inventory`.

## Comandos

| Acción     | Comando        |
| ---------- | -------------- |
| Dev        | `npm run dev`  |
| Typecheck  | `npx tsc -b`   |
| Lint       | `npm run lint` |
| Tests      | `npm test`     |

Antes de dar por cerrado un cambio: typecheck + lint + tests en verde.

## Convenciones no deducibles del código

- **Decimales con punto en toda la app.** `utils/format.ts` fija `en-US` sin
  separador de miles; los inputs numéricos son `type="number"` nativos. No
  introduzcas formato con coma ni máscaras de entrada.
- **Los `numeric` de Postgres llegan como string** (`weight_kg`, `balance`).
  Convertí con `Number(...)` antes de operar: un `+=` sobre el string concatena.
- **Caché solo en memoria.** Los stores no persisten a disco/localStorage: la
  recarga dura debe traer datos frescos. `useAutoRefresh` (5 min) es el
  mecanismo de refresco; no agregues caché persistente.
- **Alias `@/`** resuelto por `paths` en `tsconfig.json` (sin `baseUrl` ni
  `vite-tsconfig-paths`).

## Escaneo de formularios (`/compras/escanear`)

Una foto del formulario se lee con un modelo de visión **en el backend**
(`POST /purchases/extract`) y pre-llena la compra; la persona revisa antes de
guardar. La imagen no se persiste.

El backend prueba varios modelos en cadena y **paga cada intento**. De ahí la
invariante de timeouts, que los tests protegen:

    presupuesto backend  <  timeout HTTP  <  timeout de la UI

Cortar antes que el backend tira a la basura una cadena ya facturada. Si
recalibrás uno de los tres, movelos juntos (`services/FormExtractionService.ts`).
Detalle del flujo: [docs/form-scan-feature.md](docs/form-scan-feature.md).
