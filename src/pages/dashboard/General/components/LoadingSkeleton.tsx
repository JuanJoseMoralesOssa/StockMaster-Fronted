function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-6 bg-gray-200 rounded mb-4 w-48"></div>

          {/* Summary stats skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-gray-100 p-4 rounded-lg">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={`card-skeleton-${i}`} className="bg-gray-50 p-4 rounded-lg border">
                <div className="h-5 bg-gray-200 rounded mb-3 w-40"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={`item-${i}-${j}`} className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Insights skeleton */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="h-5 bg-gray-200 rounded mb-4 w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={`insight-${i}`} className="bg-white p-3 rounded border-l-4 border-gray-300">
                  <div className="h-4 bg-gray-200 rounded mb-2 w-32"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1 w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-36"></div>
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
