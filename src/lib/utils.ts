import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Compose class names and resolve conflicting Tailwind utilities so the last
 * one wins (e.g. a caller's `rounded-lg` overrides a component's `rounded-md`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatDate(
  d: Date | string | number,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
): string {
  return new Intl.DateTimeFormat("es-CO", options).format(new Date(d))
}
