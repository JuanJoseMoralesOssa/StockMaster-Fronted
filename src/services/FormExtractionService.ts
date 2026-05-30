import { httpClient } from './httpClient'
import { Config } from '../config/Config'
import { ExtractionResult } from '../types/FormExtraction'

/**
 * Sends a photo of a J.A.A.G receipt form to the backend, which reads it with a
 * vision model and returns normalised fields ready to pre-fill a purchase.
 * The image is processed in memory and never persisted.
 */
export class FormExtractionService {
  private readonly url = `${Config.LOGIC_URL}purchases/extract`

  async extractFromImage(file: File): Promise<ExtractionResult> {
    const formData = new FormData()
    formData.append('image', file)

    const response = await httpClient.post<ExtractionResult>(this.url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      // Vision extraction can take a few seconds — allow more than the default timeout.
      timeout: 60000,
    })
    return response.data
  }
}

export const formExtractionService = new FormExtractionService()
