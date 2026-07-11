---
name: clean-code-maintainability
description: Clean code, mantenibilidad y arquitectura de my-inventory (Vite + React + TS estricto). Úsala al escribir o revisar código - al nombrar cosas, al decidir en qué capa va algo (componente / hook / service / util / store), al manejar errores o estados async, al abstraer, al ver duplicación; y cuando el usuario diga "está feo", "refactor", "limpiar" o "arquitectura".
---

# Clean Code & Mantenibilidad — my-inventory

Skill transversal de este repo: SPA de inventario (Vite + React 19 + TS estricto
+ Tailwind v4 + zustand + axios) contra el API LoopBack4 de
`../backend-inventory`.

## Principio guía

> Escribí el código pensando en quien lo va a cambiar en 6 meses con la mitad del
> contexto que vos tenés ahora. Esa persona puede ser tu yo futuro.

Optimizamos para **comprensión y modificabilidad**, no para elegancia. Código
aburrido y predecible > código clever.

La forma operativa es **ETC — Easier To Change**: ante cualquier decisión, la
pregunta paraguas es *"¿esto hace el sistema más fácil o más difícil de
cambiar?"*. Si dos reglas de acá chocan en un caso concreto, gana la que deje el
sistema más fácil de cambiar.

## Las 4 reglas del código sostenible

1. **Cobertura de tests.** La lógica con decisiones (formateo de números, parseo
   de fechas, transformaciones para gráficos, límites, recortes) SIEMPRE tiene
   test. Que un módulo sea chico no lo exime. La disciplina es **TDD**: para
   lógica nueva y para todo fix de bug el test va ANTES — en un bug, primero el
   test rojo que lo reproduce. Las capas humildes (componentes de presentación)
   quedan fuera del mandato: su lógica se mueve a `utils/`/`hooks/`, donde sí se
   testea.
2. **Tests de calidad.** Útiles y mantenibles, no cobertura vacía. Afirman
   comportamiento observable, no implementación: nada de asertar detalles
   privados ni configuración literal. Un test que clava un número mágico se rompe
   con cualquier recalibración; asertá la **relación** que importa (que el
   timeout de la UI sea mayor que el del HTTP, no que valga 32000).
3. **Abstracciones precisas.** Del tamaño del problema: ni primitivos crudos
   cruzando capas, ni generalidad especulativa.
4. **Intención explícita.** Cada línea con una razón contable. Números de dominio
   con constante nombrada, orquestadores largos partidos en helpers con nombre de
   intención, comentarios que explican el **porqué**.

### POLA — Principio del Menor Asombro

El código hace exactamente lo que su nombre promete; la sorpresa es un bug de
mantenibilidad.

- Un `get`/`find`/`is`/`format` no muta, no persiste, no hace I/O sorpresa.
- Efecto extra inevitable → el nombre o el comentario lo declaran.
- Un `should*` devuelve booleano; si devuelve otra cosa, se renombra por lo que
  devuelve.
- Un helper cuyo nombre describe solo una de sus ramas miente en las demás.

### Lenguaje del dominio y obsesión por los primitivos

El núcleo habla el idioma del negocio (compra, pago, kardex, balance,
proveedor); los primitivos (`string`, `number`, objetos anónimos) se quedan en
los bordes: HTTP, formularios, UI.

- Concepto de dominio comparado contra un string literal en 2+ sitios → enum o
  union type (`src/enums/`, `src/types/`).
- Dato compuesto viajando como objeto anónimo entre capas → tipo en
  `src/types/`.
- La misma normalización/parseo reescrita por capa → UNA función en `src/utils/`.
- **Los `numeric` de Postgres llegan como string** (`weight_kg`, `balance`):
  convertí con `Number(...)` en el borde. Un `+=` sobre el string concatena — ese
  fue el bug de "3 compras / 0 kg" del dashboard.
- La vara es abstracción **precisa**, no máxima: si una función alcanza, no
  construyas una clase.

### Complejidad accidental — síntomas

- **Código "por si acaso"**: props que nadie pasa, flags que bifurcan un
  componente en dos, config de features inexistentes. Se borra; git lo recuerda.
- **Solución enrevesada**: implementar la primera idea en vez de la más simple.
  Antes de escribir: ¿hay un camino más corto que resuelva exactamente esto?
- **Sobre-generalización**: nombres marcianos sin semántica de dominio
  (Manager/Processor/Data), típicos de querer servir "para cualquier cosa".
- **Indirección sin motivo**: un wrapper de una línea que solo reenvía es ruido.
- **Edición-escopeta**: cambiar UN concepto obliga a tocar N archivos → falta una
  abstracción.
- **Anti-megalomanía**: proyecto de un usuario. Antes de agregar amplitud (otra
  librería, otra capa, otro patrón), preguntá si el problema real lo pide HOY.
  Profundidad por restricciones reales, sí; amplitud especulativa, no.

### Refactorización diaria, no anual

Mejoras de minutos (rename, extract, inline) cada vez que se toca un archivo.
Condición innegociable: la suite en verde antes y después. Un refactor sin tests
que lo protejan no es refactor, es apuesta.

**Dos sombreros — nunca a la vez**: refactorizar y agregar funcionalidad son
actividades distintas; un mismo commit hace una u otra. Si en medio de una
feature aparece un refactor necesario, se hace como paso propio, con la suite en
verde entre medio.

## Arquitectura — la regla de dependencia

Las dependencias apuntan hacia adentro, hacia la lógica de dominio:

| Capa                            | Qué es                          | Regla                                                                       |
| ------------------------------- | ------------------------------- | --------------------------------------------------------------------------- |
| `src/pages/`, `src/components/` | Presentación (humble object)    | Muestran y delegan. Sin reglas de negocio.                                  |
| `src/hooks/`                    | Orquestación reutilizable       | `useApiRequest`, `useEntityCrud`, `useAutoRefresh`, `useToast`.              |
| `src/services/`                 | Frontera de I/O (`httpClient`)  | Un service por recurso. Único lugar que conoce el API.                       |
| `src/utils/`                    | Lógica pura                     | `format`, `date`, `error`, `form`, `chartTransforms`. Sin React, sin axios.  |
| `src/stores/`                   | Estado compartido (zustand)     | Solo memoria. `createEntityStore` es la base.                                |
| `src/types/`                    | Contratos                       | Espejo del API + tipos de dominio.                                          |

- Un componente que calcula reglas de negocio se corrige moviendo la regla a
  `utils/` o a un hook, donde se testea sin renderizar.
- Que un componente sea pass-through hacia un hook/service es el diseño, no un
  defecto: no le agregues lógica para "que haga algo".
- `utils/` no importa React ni axios. Si lo necesita, no era `utils/`.

**Las 4 preguntas de validación** para todo cambio estructural:

1. ¿La estructura grita el dominio (compras, pagos, kardex, inventario) o grita
   el framework?
2. ¿La lógica se testea **sin** los detalles — sin red, sin render?
3. ¿Cuánto cuesta el cambio? Un requisito chico que obliga a tocar N archivos =
   frontera que falta.
4. ¿Cada módulo responde a un solo interesado (SRP) y se extiende sin modificar
   lo que ya funciona (OCP)?

## Reglas duras del repo

- **Decimales con punto.** `utils/format.ts` fija `en-US` sin separador de miles;
  inputs numéricos `type="number"` nativos. Nada de comas ni máscaras.
- **Caché solo en memoria.** Los stores no persisten: la recarga dura trae datos
  frescos. `useAutoRefresh` (5 min) refresca. No agregues caché persistente.
- **Alias `@/`** por `paths` en `tsconfig.json`.
- **`any` prohibido.** Si tenés que escapar: `unknown` + type guard.
  `@ts-expect-error` solo con comentario que explique por qué.
- **Secretos**: solo `VITE_*` llega al bundle; nunca una API key real ahí (las
  del proveedor de visión viven en el backend).

## TypeScript y React

- `strict: true` ya está en `tsconfig.app.json`. No lo bajes.
- Boundaries (props públicas, respuestas del API) con tipos explícitos; el
  inference está bien para lo interno.
- Componentes con función nombrada. `key` de listas: id estable del dominio,
  nunca el índice.
- `const` por defecto; no mutes props ni state (`set(prev => ...)`).
- `async/await` sobre cadenas de `.then`. Fetches independientes, en paralelo.
- Imports: externos → absolutos (`@/`) → relativos. `import type` para tipos.
- Disparadores de inspección: función > ~40 líneas, componente > ~150, más de 3
  argumentos posicionales (pasá un objeto), anidamiento > 3 niveles.
  **Early returns siempre.**

### Errores y estados async

- Errores esperables (API caído, 4xx, dato faltante): capturalos y mostrá estado
  de error. `extractErrorInfo(error)` (`utils/error.ts`) normaliza el error de
  axios a `ErrorInfo`; no repitas ese `instanceof` inline en cada página.
- Para el ciclo completo de una mutación (loading + toasts + error) usá
  `useApiRequest`, no un `try/catch` + `useState` rearmado a mano.
- Toda UI con datos async contempla los **4 estados**: loading (`Skeleton`),
  vacío (`EmptyState`), error (`Alert`) y éxito. Si tu componente solo tiene
  éxito, está incompleto.
- Catch siempre con `unknown`.

### Logging y comentarios

- `console.error` con el módulo entre corchetes para errores reales. Sin
  `console.log` en código mergeado. Nunca loguear credenciales.
- Comentarios: **por qué, no qué**. El que explica una restricción no obvia (por
  qué este timeout debe ser mayor que aquel) vale oro; el que narra la línea
  siguiente es ruido. Un comentario que miente es peor que ninguno: si tocás el
  código, tocá el comentario.

## Reutilización con cabeza

**Rule of three**: la primera vez lo escribís, la segunda lo duplicás, la tercera
—cuando la duplicación dolió— abstraés. No abstraigas prematuro: una abstracción
mala cuesta más que duplicar. Si dos cosas se parecen pero **evolucionan por
razones distintas**, no las unifiques.

## Checklist antes de commitear

- [ ] `npx tsc -b` pasa
- [ ] `npm run lint` pasa
- [ ] `npm test` pasa
- [ ] Sin `any`, sin `console.log`, sin TODOs sin contexto
- [ ] Estados loading/vacío/error/éxito presentes si hay datos async
- [ ] Lógica con decisiones testeada (y el test escrito primero, si era nueva)
- [ ] Una idea por commit; commits convencionales (`feat(scan): ...`)

## Cómo decidir entre alternativas

Preguntá en orden: ¿cuál es más fácil de **leer** sin contexto? ¿más fácil de
**borrar** mañana? ¿tiene menos **acoplamiento**? ¿es más fácil de **testear**?
¿es más **simple**? Si una opción gana 3+ de 5, esa.

## La pregunta antes de mergear

> Si mañana entra alguien nuevo, ¿puede leer este código sin preguntarle a nadie
> y entender qué hace y por qué?

Si la respuesta es no, faltó claridad: rename, comentario "por qué", separación o
documentación.
