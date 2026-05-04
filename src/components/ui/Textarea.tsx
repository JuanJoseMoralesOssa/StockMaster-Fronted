import type { TextareaHTMLAttributes } from "react"
import { cn } from "../../lib/utils"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
}

export function Textarea({ hasError, className, rows = 3, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={hasError || undefined}
      className={cn(
        "w-full px-3 py-2 rounded-md border bg-(--color-bg-surface)",
        "text-(--color-text-primary) text-sm",
        "placeholder:text-(--color-text-muted)",
        "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)",
        "disabled:bg-(--color-bg-subtle) disabled:cursor-not-allowed disabled:opacity-60",
        "transition-colors resize-y",
        hasError
          ? "border-danger-500"
          : "border-(--color-border) hover:border-(--color-border-strong)",
        className
      )}
      {...props}
    />
  )
}
