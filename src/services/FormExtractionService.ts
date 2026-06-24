import { httpClient } from "./httpClient";
import { Config } from "../config/Config";
import { ExtractionResult } from "../types/FormExtraction";
import {
  optimizeScanImageWithMetadata,
  ScanImageOptimizationResult,
  ScanImagePreprocessOptions,
} from "./scanImagePreprocessor";

export interface FormExtractionOptions extends ScanImagePreprocessOptions {
  onOptimizedImage?: (result: ScanImageOptimizationResult) => void;
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
    const { onOptimizedImage, ...preprocessOptions } = options;
    const optimized = await optimizeScanImageWithMetadata(
      file,
      preprocessOptions,
    );
    onOptimizedImage?.(optimized);
    const formData = new FormData();
    formData.append("image", optimized.file);

    const response = await httpClient.post<ExtractionResult>(
      this.url,
      formData,
      {
        // Vision extraction can take a few seconds, but should fail fast enough
        // to return control to the review screen instead of leaving a long spinner.
        timeout: 25000,
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
