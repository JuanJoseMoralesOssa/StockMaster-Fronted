// Formato numérico de la app: PUNTO decimal, sin separador de miles y sin ceros
// decimales sobrantes. Centralizado para que displays, dashboard, charts y la
// exportación CSV se vean igual, y para tolerar valores que el backend serializa
// como string (las columnas `numeric(14,3)` de Postgres llegan como texto).
// Usamos punto en todo (no coma) para que los Excel/CSV se importen sin
// ambigüedad. No agrupamos miles: con punto decimal, un punto de miles sería
// ambiguo y una coma de miles reintroduciría comas.

const KG_FORMATTER = new Intl.NumberFormat('en-US', {
  useGrouping: false,
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
})

const INT_FORMATTER = new Intl.NumberFormat('en-US', {
  useGrouping: false,
  maximumFractionDigits: 0,
})

/** Convierte number | string | null a un número finito (0 si no es válido). */
export function toNumber(value: number | string | null | undefined): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

/**
 * Peso con punto decimal sin ceros sobrantes: 12 → "12", 12.5 → "12.5",
 * 1234.05 → "1234.05". Acepta string (numeric del backend) y lo coacciona.
 */
export function formatKg(value: number | string | null | undefined): string {
  return KG_FORMATTER.format(toNumber(value))
}

/** Entero sin separador de miles, p. ej. conteos de documentos. */
export function formatInt(value: number | string | null | undefined): string {
  return INT_FORMATTER.format(toNumber(value))
}

/** Porcentaje con punto decimal: formatPercent(33.33, 1) → "33.3%". El valor es
 *  una magnitud 0–100 (no una fracción). */
export function formatPercent(value: number | string | null | undefined, digits = 0): string {
  return `${toNumber(value).toFixed(digits)}%`
}
