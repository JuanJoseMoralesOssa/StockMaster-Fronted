export function cn(...inputs: Array<string | undefined | null | false>): string {
  return inputs.filter(Boolean).join(" ")
}

export function formatDate(
  d: Date | string | number,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
): string {
  return new Intl.DateTimeFormat("es-CO", options).format(new Date(d))
}
