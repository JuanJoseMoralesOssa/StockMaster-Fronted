/**
 * Formas mínimas compartidas por los documentos con detalles (compras y gastos).
 * Permiten escribir componentes genéricos (crear/editar/filtrar) una sola vez.
 */

/** Campos mínimos de un detalle de documento (línea de compra/gasto). */
export type DocumentDetailLike = {
  id?: number
  productId?: number
  personId?: number
  weight_kg?: number
  toCreate?: boolean
  toUpdate?: boolean
  toDelete?: boolean
}

/** Campos mínimos de un documento con sus detalles bajo la clave `K`. */
export type DocumentLike<K extends string, TDetail extends DocumentDetailLike = DocumentDetailLike> = {
  id?: number
  version?: number
  date: string
  total_kg?: number
} & Partial<Record<K, TDetail[]>>
