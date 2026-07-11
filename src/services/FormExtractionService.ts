import { httpClient } from "./httpClient";
import { Config } from "../config/Config";
import { ExtractionResult } from "../types/FormExtraction";
import {
  optimizeScanImageWithMetadata,
  ScanImageOptimizationResult,
  ScanImagePreprocessOptions,
} from "./scanImagePreprocessor";

/**
 * Presupuesto que el backend se da para leer el formulario: prueba varios
 * modelos de visión en cadena (GEMINI_TOTAL_TIMEOUT_MS, 26 s por defecto) y
 * Gemini le factura cada intento.
 */
export const EXTRACTION_BACKEND_BUDGET_MS = 26000;

/**
 * El cliente debe esperar MÁS que el presupuesto del backend. Al revés —como
 * estaba— cortábamos la cadena justo antes de que el último modelo respondiera:
 * se pagaban todos los intentos y se descartaba el resultado. El margen cubre la
 * subida de la imagen y la latencia de red.
 *
 *     presupuesto backend  <  timeout HTTP  <  timeout de la UI
 */
export const EXTRACTION_HTTP_TIMEOUT_MS = EXTRACTION_BACKEND_BUDGET_MS + 4000;

export interface FormExtractionOptions extends ScanImagePreprocessOptions {
  onOptimizedImage?: (result: ScanImageOptimizationResult) => void;
  /**
   * Aborta la petición HTTP (p. ej. cuando el timeout de la UI gana la
   * carrera). El backend escucha el corte de la conexión y detiene la cadena de
   * modelos: sin esto seguiría pagando llamadas a Gemini para una respuesta que
   * ya nadie va a leer.
   */
  signal?: AbortSignal;
}

/**
 * Sends a photo of a J.A.A.G receipt form to the backend, which reads it with a
 * vision model and returns normalised fields ready to pre-fill a purchase.
 * The image is processed in memory and never persisted.
 */
export class FormExtractionService {
  private readonly url = `${Config.LOGIC_URL}purchases/extract`;

  async extractFromImage(
    file: File,
    options: FormExtractionOptions = {},
  ): Promise<ExtractionResult> {
    const { onOptimizedImage, signal, ...preprocessOptions } = options;
    const optimized = await optimizeScanImageWithMetadata(
      file,
      preprocessOptions,
    );
    onOptimizedImage?.(optimized);
    const formData = new FormData();
    formData.append("image", optimized.file);
    formData.append(
      "optimizedSizeBytes",
      String(optimized.metadata.output.sizeBytes),
    );
    formData.append("optimizedWidth", String(optimized.metadata.output.width));
    formData.append(
      "optimizedHeight",
      String(optimized.metadata.output.height),
    );
    formData.append("cropX", String(optimized.metadata.cropRect.x));
    formData.append("cropY", String(optimized.metadata.cropRect.y));
    formData.append("cropWidth", String(optimized.metadata.cropRect.width));
    formData.append("cropHeight", String(optimized.metadata.cropRect.height));

    const response = await httpClient.post<ExtractionResult>(
      this.url,
      formData,
      {
        timeout: EXTRACTION_HTTP_TIMEOUT_MS,
        signal,
        transformRequest: [
          (data, headers) => {
            headers.setContentType(false);
            return data;
          },
        ],
      },
    );
    return response.data;
  }
}

export const formExtractionService = new FormExtractionService();
