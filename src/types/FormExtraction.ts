// Mirrors the backend ExtractionResult returned by POST /purchases/extract
// (backend-inventory/src/services/form-extraction.service.ts)

export interface ExtractedDetail {
  fieldName: 'pieles' | 'sebo' | 'hueso'
  productId?: number
  productName: string
  weightLb: number
  weightKg: number
  confidence: number
  needsReview: boolean
}

export interface SupplierMatch {
  rawName: string | null
  personId?: number
  confidence: number
  needsReview: boolean
  candidates: Array<{ id: number; name: string; score: number }>
}

export interface ExtractionResult {
  date: { value: string | null; confidence: number; needsReview: boolean }
  librasTotal: { value: number | null; confidence: number }
  supplier: SupplierMatch
  details: ExtractedDetail[]
  totalWeightCheck: { passed: boolean; formTotalLb: number | null; sumLb: number }
  needsReview: boolean
  reviewReasons: string[]
}
