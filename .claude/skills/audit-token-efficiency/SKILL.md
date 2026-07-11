---
name: audit-token-efficiency
description: Audita y valida la eficiencia de tokens del repositorio sin sacrificar calidad. Usar al revisar AGENTS.md, CLAUDE.md, skills, documentación bajo demanda, prompts, RAG, llamadas LLM, límites de salida, caché, telemetría o cambios que prometan reducir costo o latencia; también cuando el usuario pida optimizar tokens, contexto, prompts o consumo de IA.
---

# Auditoría de eficiencia de tokens

Evaluar **costo por tarea correcta**, no tokens mínimos. Rechazar recortes que reduzcan precisión, tasa de éxito, mantenibilidad o capacidad de validación.

## Flujo obligatorio

### 1. Delimitar la superficie

Separar el análisis en las capas que apliquen:

- **Contexto de agentes**: `CLAUDE.md`, skills (`.claude/skills/`), comandos (`.claude/commands/`), hooks y documentación referenciada.
- **Runtime LLM**: el escaneo de formularios. Cruza dos repos: el cliente en `src/services/FormExtractionService.ts` y la llamada real al proveedor en `../backend-inventory/src/modules/form-extraction/` (provider → transport → quota tracker).
- **Observabilidad**: registro de input/output tokens, llamadas facturadas por tarea, éxito, latencia y costo.

Declarar el flujo concreto que se valida. No extrapolar una conclusión de una capa a otra.

### 2. Levantar una línea base

Ejecutar desde la raíz:

```bash
python .claude/skills/audit-token-efficiency/scripts/context_audit.py .
```

Usar `--json` cuando se necesite comparar mediciones antes/después. La estimación `caracteres / 4` solo sirve como indicador relativo; llamarla siempre **estimación**, nunca conteo exacto del proveedor.

Para runtime, localizar primero los puntos de entrada con `rg`; leer únicamente la composición completa de las solicitudes relevantes y sus dependencias directas. Registrar, si existen:

- tokens de entrada, salida y cacheados;
- número de solicitudes y llamadas a herramientas;
- latencia y tasa de éxito;
- reintentos/fallbacks por tarea;
- costo por tarea exitosa.

Si no hay datos, señalar el hueco de medición antes de recomendar microoptimizaciones.

### 3. Revisar el contexto de agentes

Comprobar con evidencia:

1. `AGENTS.md` contiene solo reglas universales, comandos críticos y rutas de conocimiento.
2. `CLAUDE.md` importa `AGENTS.md` y conserva únicamente reglas específicas de Claude.
3. Las reglas de un área viven cerca de esa área; no se cargan globalmente sin necesidad.
4. Los procedimientos largos viven en skills bajo demanda; la descripción de cada skill permite activarla sin cargar su cuerpo.
5. La documentación extensa vive en `docs/` y tiene rutas explícitas desde la capa que sabe cuándo leerla.
6. No hay reglas duplicadas, contradictorias ni ya impuestas de forma determinista por lint, tipos o tests.
7. Las búsquedas preceden a la lectura de archivos completos salvo que una auditoría integral la exija.

Los umbrales del script son señales de revisión, no objetivos mecánicos. Un archivo corto pero ambiguo puede ser peor que uno algo mayor y preciso.

### 4. Revisar el runtime LLM

Seguir cada caso de uso desde el dato fuente hasta la llamada al proveedor y la respuesta:

1. Separar prefijo estable de contenido variable; mantener el contenido estático primero cuando el proveedor pueda cachearlo.
2. Enviar solo evidencia necesaria. En RAG, limitar fragmentos, truncar de forma explícita y conservar trazabilidad a la fuente.
3. Definir límites de salida acordes al formato esperado. Priorizar reducir salida verbosa sobre podar contexto necesario.
4. Evitar repetir instrucciones equivalentes entre system prompt, user prompt y wrappers de proveedor.
5. Contabilizar el multiplicador de fallback/reintentos: una tarea lógica puede producir varias llamadas facturables.
6. Preferir modelos menores solo después de comprobar calidad con casos representativos.
7. No añadir memoria, RAG, MCP, compresión o caché sin medir que su complejidad mejora el costo por éxito.
8. Preservar las reglas del repo: I/O externo degrada sin crashear y nunca expone secretos en logs.

En este proyecto, inspeccionar según el alcance:

- `../backend-inventory/src/modules/form-extraction/gemini/gemini-transport.ts` — composición de la solicitud (system prompt, `responseSchema`, `maxOutputTokens`, `thinkingLevel`, `mediaResolution`) y lectura del `usageMetadata` oficial.
- `../backend-inventory/src/modules/form-extraction/form-extraction.provider.ts` — cadena de fallback: es el multiplicador que convierte UNA tarea lógica en varias llamadas facturadas (`billedAttempts` en los logs).
- `../backend-inventory/src/modules/form-extraction/gemini/gemini-quota-tracker.ts` — guard local de RPM/TPM/RPD; `reserve` es estimación, `settle` la reemplaza por el usage real.
- `src/services/FormExtractionService.ts` — recorte/reescalado de la imagen y la escalera de timeouts.

Reglas duras al leer esto: la estimación (`estimateGeminiRequestTokens`) NO es usage; solo `usageMetadata` lo es. Y un timeout del cliente no cancela el gasto salvo que el abort llegue al backend.

### 5. Validar una propuesta

Comparar antes/después sobre las mismas tareas representativas. Exigir:

- igual o mejor tasa de éxito y exactitud;
- tests y validadores del área en verde;
- reducción demostrable de costo, tokens, latencia o llamadas;
- ausencia de contexto crítico perdido y de nuevos reintentos;
- complejidad operativa proporcional al ahorro.

Gates: en `my-inventory`, `npx tsc -b`, `npm run lint` y `npm test`. En `../backend-inventory`, `npm run build` y `npx lb-mocha --allow-console-logs "dist/__tests__/unit"` (más `npm run lint`).

## Formato de salida

Entregar:

1. **Veredicto**: optimizado, parcialmente optimizado o no demostrado.
2. **Línea base**: métricas disponibles y método de medición.
3. **Hallazgos**: severidad, evidencia con archivo/línea, impacto y corrección mínima.
4. **Validación**: comparación antes/después y comandos ejecutados.
5. **Huecos**: datos que faltan para afirmar ahorro real.

No presentar porcentajes inventados, estimaciones como mediciones exactas ni recomendaciones genéricas sin señalar el punto concreto del repositorio que las justifica.
