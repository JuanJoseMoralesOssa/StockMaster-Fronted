import type { ButtonHTMLAttributes, ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "../../lib/utils"

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "link"
type Size = "xs" | "sm" | "md" | "lg" | "icon-sm" | "icon-md"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring) " +
  "disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap"

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-(--color-action-bg) text-(--color-action-text) hover:bg-(--color-action-bg-hover)",
  secondary:
    "bg-(--color-bg-subtle) text-(--color-text-primary) hover:bg-(--color-bg-muted) border border-(--color-border)",
  outline:
    "bg-transparent text-(--color-text-primary) border border-(--color-border-strong) hover:bg-(--color-bg-subtle)",
  ghost:
    "bg-transparent text-(--color-text-primary) hover:bg-(--color-bg-subtle)",
  danger:
    "bg-danger-500 text-(--color-text-inverted) hover:bg-danger-700",
  link:
    "bg-transparent text-(--color-text-link) hover:underline underline-offset-2 px-0",
}

const sizeClasses: Record<Size, string> = {
  xs: "h-7 px-2 text-xs",
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm [@media(pointer:coarse)]:h-11",
  lg: "h-12 px-6 text-base",
  "icon-sm": "h-8 w-8 p-0",
  "icon-md": "h-10 w-10 p-0",
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  )
}
