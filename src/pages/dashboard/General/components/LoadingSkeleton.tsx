function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-(--color-bg-surface) p-6 rounded-lg shadow">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-6 bg-(--color-bg-muted) rounded mb-4 w-48"></div>

          {/* Summary stats skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-(--color-bg-subtle) p-4 rounded-lg">
                <div className="h-8 bg-(--color-bg-muted) rounded mb-2"></div>
                <div className="h-4 bg-(--color-bg-muted) rounded"></div>
              </div>
            ))}
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={`card-skeleton-${i}`} className="bg-(--color-bg-subtle) p-4 rounded-lg border border-(--color-border)">
                <div className="h-5 bg-(--color-bg-muted) rounded mb-3 w-40"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={`item-${i}-${j}`} className="flex justify-between">
                      <div className="h-4 bg-(--color-bg-muted) rounded w-32"></div>
                      <div className="h-4 bg-(--color-bg-muted) rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Insights skeleton */}
          <div className="bg-(--color-bg-subtle) p-6 rounded-lg">
            <div className="h-5 bg-(--color-bg-muted) rounded mb-4 w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={`insight-${i}`} className="bg-(--color-bg-surface) p-3 rounded border-l-4 border-(--color-border-strong)">
                  <div className="h-4 bg-(--color-bg-muted) rounded mb-2 w-32"></div>
                  <div className="h-3 bg-(--color-bg-muted) rounded mb-1 w-24"></div>
                  <div className="h-3 bg-(--color-bg-muted) rounded w-36"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSkeleton;
