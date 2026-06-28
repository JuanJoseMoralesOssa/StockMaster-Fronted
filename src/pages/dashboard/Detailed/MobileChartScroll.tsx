import type { ReactNode } from 'react'

/**
 * Wraps a chart so it scrolls horizontally on phones instead of crushing
 * multi-series bars into a ~290px width. From `md` up it behaves normally:
 * full width, no scroll, no min-width.
 */
export function MobileChartScroll({ children }: { readonly children: ReactNode }) {
  return (
    <div className="overflow-x-auto md:overflow-x-visible">
      <div className="min-w-120 md:min-w-0">{children}</div>
    </div>
  )
}
