# Reporte de Integración de Skills (Copilot vs .claude)

## 1. Resumen de análisis de la carpeta files

Se analizaron todos los archivos actuales en la carpeta `files`:

- `files/ARCHITECTURE.md`
- `files/button.tsx`
- `files/badge.tsx`
- `files/modal.tsx`
- `files/form.tsx`
- `files/data-table.tsx`
- `files/feedback.tsx`
- `files/globals.css`
- `files/utils.ts`
- `files/index.ts`

### Hallazgos clave

- Existe una guía de arquitectura y diseño muy completa orientada a:
  - diseño por tokens semánticos
  - componentes UI reutilizables
  - accesibilidad
  - reducción de carga cognitiva
- Los archivos de componentes en `files/` funcionan como referencia de design system (button, modal, table, form, feedback, badge).
- `files/ARCHITECTURE.md` está orientado a una estructura tipo Next.js App Router, mientras que el proyecto real (`package.json`) usa React 18 + Vite.
- El contenido de `files/` es útil como estándar de UI/UX, pero no debe asumirse como arquitectura literal del runtime actual.

## 2. Skill/configuración actual en copilot instructions (antes de consolidar)

Archivo base previo:

- `.github/copilot-instructions.md`

Características previas:

- Muy enfocado en frontend moderno y buenas prácticas generales.
- Incluía reglas de React 19 (incluyendo nota de `ref` como prop y evitar `forwardRef`).
- Incluía lineamientos sólidos de HTML/CSS/accesibilidad/testing.

Limitaciones detectadas:

- Tenía desalineación con stack real del repo (React 18 + Vite).
- No reflejaba reglas críticas de arquitectura del proyecto (GenericPage y flujo config-driven).
- No incorporaba prioridades técnicas/arquitectónicas de mejora presentes en `.claude/commands/improve.md`.

## 3. Skills disponibles en .claude

Se analizaron todos los archivos en `.claude/commands`:

- `.claude/commands/frontend.md`
- `.claude/commands/designer.md`
- `.claude/commands/improve.md`

### Qué aporta cada skill

- `frontend.md`:
  - estándares frontend amplios (HTML semántico, CSS moderno, TS estricto, testing, seguridad, performance)
  - recomendaciones de React 19/modern web
- `designer.md`:
  - filosofía visual y de tokens
  - reglas de uso para Button/Badge/Modal/Form/DataTable/Feedback
  - checklist de revisión visual y carga cognitiva
- `improve.md`:
  - reglas específicas del proyecto my-inventory
  - prioridad de seguridad, tipado, estabilidad, validación
  - invariantes de arquitectura y flujo de datos

## 4. Comparación detallada (copilot instructions vs .claude)

## Cobertura coincidente

- HTML semántico y accesibilidad básica
- TS estricto y evitar `any`
- foco en testing por comportamiento
- buenas prácticas de performance y seguridad

## Diferencias principales

1. React 19 vs realidad del proyecto

- Copilot previo y `frontend.md` incluyen varias directrices React 19.
- Proyecto actual usa React 18 (validado en `package.json`).
- Riesgo: sugerencias incompatibles o no aplicables.

2. Arquitectura del proyecto

- `.claude/commands/improve.md` define claramente que el CRUD es config-driven y debe pasar por GenericPage.
- Copilot previo no lo reflejaba de forma explícita.

3. Invariantes de servicios/estado

- `.claude/commands/improve.md` exige no saltarse capa de servicios ni patrones de estado/cache.
- Copilot previo no lo codificaba con suficiente fuerza.

4. Prioridades de mejora del repo

- `improve.md` aporta prioridades P0/P1/P2/P3 concretas.
- Copilot previo no tenía ese backlog técnico específico del repositorio.

5. Design system contextual

- `designer.md` y `files/*.tsx` describen reglas de uso concretas para componentes.
- Copilot previo hablaba de lineamientos generales, pero no conectaba explícitamente con esos artefactos de referencia.

## Conflictos detectados

- Conflicto de versión/convenio: React 19 (instrucción) vs React 18 (runtime real).
- Posible conflicto de arquitectura conceptual: ejemplo de Next App Router en `files/ARCHITECTURE.md` vs aplicación real basada en Vite + react-router.

## Redundancias detectadas

- Reglas de accesibilidad, testing y CSS moderno repetidas en `copilot-instructions` y `frontend.md`.
- Se consolidaron sin duplicaciones innecesarias en la nueva versión.

## 5. Cambios aplicados

Se actualizó:

- `.github/copilot-instructions.md`

Integración realizada:

- Alineación explícita al stack real (React 18 + Vite).
- Inclusión de regla crítica de arquitectura config-driven (GenericPage).
- Inclusión de invariantes de capa de servicio y manejo de errores.
- Integración de principios de tokens y design system referenciando `files/`.
- Integración de reglas de seguridad prácticas del proyecto.
- Integración de expectativas de testing enfocadas al repositorio.
- Inclusión de Definition of Done para consistencia operativa.

## 6. Lista de cambios recomendados adicionales

1. Crear instrucciones modulares en `.github/instructions/` para separar:

- frontend base
- design system
- project improvement invariants

2. Incorporar una nota explícita en `files/ARCHITECTURE.md` aclarando que es referencia conceptual y no refleja literalmente el runtime actual Vite.

3. Si se planea migración a React 19, documentar un plan formal (fases y cambios de patrones) antes de reactivar reglas React 19.

4. En una fase posterior, trasladar prioridades P0/P1/P2/P3 a issues o roadmap ejecutable para seguimiento técnico.

## 7. Versión final consolidada

La versión consolidada quedó establecida en:

- `.github/copilot-instructions.md`

Ese archivo ahora combina:

- estándares frontend de calidad
- reglas específicas de arquitectura de my-inventory
- guías de design system alineadas con `files/`
- restricciones de seguridad, testing y delivery

y evita conflictos con el stack actual.
