import type { InputHTMLAttributes } from "react"
import { cn } from "../../lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export function Input({ hasError, className, ...props }: InputProps) {
  return (
    <input
      aria-invalid={hasError || undefined}
      className={cn(
        "w-full h-input px-3 rounded-md border bg-(--color-bg-surface)",
        "text-(--color-text-primary) text-sm",
        "placeholder:text-(--color-text-muted)",
        "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)",
        "disabled:bg-(--color-bg-subtle) disabled:cursor-not-allowed disabled:opacity-60",
        "transition-colors",
        hasError
          ? "border-danger-500"
          : "border-(--color-border) hover:border-(--color-border-strong)",
        className
      )}
      {...props}
    />
  )
}
