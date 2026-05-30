# Escaneo de formularios (Form Scan → Compra)

Escanea una foto del formulario de papel **J.A.A.G** y pre-llena una compra que el
usuario revisa antes de guardar. La imagen se procesa en memoria y **nunca se persiste**.

## Por qué este diseño (y por qué seguirlo)

El documento de arquitectura original proponía un microservicio Python con OpenCV +
PaddleOCR/TrOCR y el LLM solo como _fallback_. Para este proyecto eso es 2–3× más pesado
de lo necesario. Decisiones clave y su justificación:

1. **LLM primero, no OCR especializado.** La letra es legible, el volumen es bajo, hay
   pocos campos y un humano revisa siempre. Un modelo multimodal lee campos cortos sobre
   un formato fijo igual o mejor que PaddleOCR/TrOCR, sin montar un tercer despliegue.
   OCR/OpenCV se añaden _después_ solo si fotos reales lo justifican.
2. **Todo en el stack actual (Node + React).** Sin microservicio Python: menos superficie
   de operación para un equipo pequeño. La clave del API vive en el backend (nunca en el
   front, porque las env de Vite viajan al navegador).
3. **El humano confirma antes de guardar.** La extracción solo _pre-llena_ el formulario
   existente. Esto reutiliza toda la validación y el `createWithDetails` actual y hace que
   la precisión cruda no sea crítica: el feature degrada a "captura más rápida", nunca a
   "datos incorrectos guardados en silencio".
4. **El parser (normalizer) es puro y testeado.** La lógica de valor (fechas, lb→kg,
   match de proveedor/producto, chequeo de total) es TypeScript puro, sin I/O, con 20
   tests unitarios. Es la parte más barata y de mayor retorno.
5. **Proveedor de visión detrás de una interfaz.** Claude por defecto; Gemini es un
   cambio de un archivo. Lo durable es el parser + la UI de revisión, no el proveedor.

> Principio rector: **la extracción nunca guarda datos directamente; solo pre-llena un
> formulario que el usuario confirma.**

## Arquitectura

```
React PurchaseCreate (Compras)
  [Crear] -> modal manual (sin cambios)
  [Escanear] -> /compras/escanear (página dedicada, 3 pasos)
       1. Subir/tomar foto (preview, sin compresión obligatoria)
       2. POST multipart/form-data -> LoopBack /purchases/extract
            -> multer memoryStorage (sin disco)
            -> FormVisionProvider.readForm (Claude) -> campos crudos
            -> normalize(): fecha->ISO, lb->kg, match proveedor/producto,
               chequeo suave de total, confianza + needs_review por campo
            -> JSON de prefill
       3. Revisar/corregir en la MISMA tabla de detalles -> Guardar
            -> purchaseService.createWithDetails (sin cambios)
  -> la imagen se descarta tras la extracción (sin persistencia)
```

## Archivos

**Backend (`backend-inventory`)**
- `src/controllers/rest/purchase/purchase-extract.controller.ts` — `POST /purchases/extract`
  (auth JWT, multer en memoria, carga people/products y delega al servicio).
- `src/services/form-extraction.provider.ts` — interfaz `FormVisionProvider`,
  `ClaudeFormVisionProvider` (forced tool use), `GeminiFormVisionProvider` (stub) y
  `createFormVisionProvider()`.
- `src/services/form-extraction.normalizer.ts` — lógica de dominio pura (sin LLM).
- `src/services/form-extraction.service.ts` — orquesta proveedor + normalizer.
- `src/__tests__/unit/form-extraction.normalizer.unit.ts` — 20 tests unitarios.

**Frontend (`my-inventory`)**
- `src/pages/purchase/scan/ScanPurchase.tsx` — página de 3 pasos.
- `src/pages/purchase/components/ScanFormButton.tsx` — botón "Escanear" del header.
- `src/services/FormExtractionService.ts` — subida multipart.
- `src/types/FormExtraction.ts` — tipos que reflejan el `ExtractionResult` del backend.
- Ruta `compras/escanear` en `src/App.tsx`; botón inyectado vía
  `renderHeaderActions` en `src/config/purchasePageConfig.tsx`.

## Configuración (backend `.env`)

```
FORM_VISION_PROVIDER=claude          # "claude" (default) | "gemini" (stub)
ANTHROPIC_API_KEY=sk-ant-...         # requerido para el proveedor Claude
ANTHROPIC_VISION_MODEL=              # opcional, default claude-haiku-4-5-20251001
```

## Mapeo del formulario

| Campo impreso | Significado | Destino |
|---|---|---|
| Fecha: | fecha | `date` de la compra |
| LIBRAS | total de libras (cross-check opcional) | solo validación suave |
| PIELES | libras de pieles | detalle: producto Piel, `weight_kg` |
| Recibí del Sr. | proveedor | `personId` (match difuso) |
| Libra de Sebo | libras de sebo (Sebo/Cebo) | detalle: producto Sebo, `weight_kg` |
| Hueso | libras de hueso | detalle: producto Hueso, `weight_kg` |
| Firma: | firma | ignorado |

Reglas: la letra es legible; las libras admiten decimales (coma o punto); LIBRAS es un
total **opcional** (puede faltar o igualar un único producto) — chequeo suave, nunca falla
duro; `weight_kg = libras × 0.45359237`.

## Cómo extender a Gemini

1. Implementa `GeminiFormVisionProvider.readForm()` en `form-extraction.provider.ts`
   (Google GenAI SDK + `responseSchema`), devolviendo el mismo `RawExtractionFields`.
2. `FORM_VISION_PROVIDER=gemini` en el `.env`.
3. El normalizer y la UI no cambian.

## Pruebas

```bash
# Backend (parser puro)
cd backend-inventory
npm run build
node_modules/.bin/lb-mocha --allow-console-logs "dist/__tests__/unit/form-extraction.normalizer.unit.js"

# Frontend
cd my-inventory
npm test
```

**Pendiente / siguiente paso (no automatizable aquí):** probar fotos reales contra el
endpoint en vivo (requiere `ANTHROPIC_API_KEY` + backend + DB) y medir precisión por campo
y tasa de `needs_review`. La precisión de lectura es lo único aún no validado.
