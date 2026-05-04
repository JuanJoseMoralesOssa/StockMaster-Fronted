import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  secondaryAction?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
    >
      {icon && (
        <div
          aria-hidden="true"
          className="mb-4 text-(--color-text-muted) [&_svg]:h-12 [&_svg]:w-12"
        >
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-(--color-text-primary) mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-(--color-text-secondary) max-w-md mb-4">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 mt-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
