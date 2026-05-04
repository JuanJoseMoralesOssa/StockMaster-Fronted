import type { HTMLAttributes } from "react"
import { cn } from "../../lib/utils"

type Variant = "default" | "success" | "warning" | "danger" | "brand" | "outline"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
  withDot?: boolean
}

const variantClasses: Record<Variant, string> = {
  default:
    "bg-(--color-bg-subtle) text-(--color-text-secondary) border border-(--color-border)",
  success:
    "bg-success-50 text-success-700 border border-success-500/30",
  warning:
    "bg-warning-50 text-warning-700 border border-warning-500/30",
  danger:
    "bg-danger-50 text-danger-700 border border-danger-500/30",
  brand:
    "bg-brand-50 text-brand-700 border border-brand-500/30",
  outline:
    "bg-transparent text-(--color-text-secondary) border border-(--color-border-strong)",
}

const dotClasses: Record<Variant, string> = {
  default: "bg-(--color-text-muted)",
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  brand: "bg-brand-500",
  outline: "bg-(--color-text-muted)",
}

export function Badge({
  variant = "default",
  withDot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {withDot && (
        <span
          aria-hidden="true"
          className={cn("inline-block w-1.5 h-1.5 rounded-full", dotClasses[variant])}
        />
      )}
      {children}
    </span>
  )
}
