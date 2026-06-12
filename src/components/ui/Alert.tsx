import type { ReactNode } from "react"
import { Info, CheckCircle2, AlertTriangle, AlertOctagon, X } from "lucide-react"
import { cn } from "../../lib/utils"

type Variant = "info" | "success" | "warning" | "danger"

interface AlertProps {
  variant?: Variant
  title?: string
  children?: ReactNode
  action?: ReactNode
  onDismiss?: () => void
  className?: string
}

const variantClasses: Record<Variant, string> = {
  info: "bg-brand-50 border-brand-200 text-brand-700",
  success: "bg-success-50 border-success-200 text-success-700",
  warning: "bg-warning-50 border-warning-200 text-warning-700",
  danger: "bg-danger-50 border-danger-200 text-danger-700",
}

const variantIcon: Record<Variant, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertOctagon,
}

export function Alert({
  variant = "info",
  title,
  children,
  action,
  onDismiss,
  className,
}: AlertProps) {
  const Icon = variantIcon[variant]
  const isAlertRole = variant === "danger" || variant === "warning"
  return (
    <div
      role={isAlertRole ? "alert" : "status"}
      className={cn(
        "flex gap-3 p-3 rounded-md border text-sm",
        variantClasses[variant],
        className
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children && <div className="text-sm">{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar"
          className="shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
