import type { HTMLAttributes } from "react"
import { cn } from "../../lib/utils"

type SkeletonProps = HTMLAttributes<HTMLDivElement>

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-(--color-bg-muted)",
        className
      )}
      {...props}
    />
  )
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "p-4 rounded-md border border-(--color-border) bg-(--color-bg-surface) space-y-3",
        className
      )}
      {...props}
    >
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

interface TableSkeletonProps {
  rows?: number
  cols?: number
  className?: string
}

export function TableSkeleton({ rows = 5, cols = 4, className }: TableSkeletonProps) {
  return (
    <div aria-hidden="true" className={cn("w-full space-y-2", className)}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div
          key={rIdx}
          className="flex gap-3 p-3 rounded-md bg-(--color-bg-surface) border border-(--color-border)"
        >
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton key={cIdx} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
