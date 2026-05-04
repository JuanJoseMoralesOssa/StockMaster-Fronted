import type { LabelHTMLAttributes } from "react"
import { cn } from "../../lib/utils"

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function Label({ required, className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-(--color-text-primary) mb-label",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="ml-0.5 text-danger-500">
          *
        </span>
      )}
    </label>
  )
}
