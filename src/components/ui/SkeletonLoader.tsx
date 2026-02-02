// Skeleton loader components for better loading UX

export function MarketCardSkeleton() {
  return (
    <div className="card bg-base-200 border-2 border-base-300 h-full animate-pulse">
      <div className="card-body p-5 gap-3">
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-base-300 rounded-md"></div>
            <div className="h-6 w-14 bg-base-300 rounded-md"></div>
          </div>
          <div className="h-4 w-12 bg-base-300 rounded"></div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 bg-base-300 rounded w-3/4"></div>
          <div className="h-6 bg-base-300 rounded w-1/2"></div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-base-300 rounded w-full"></div>
          <div className="h-3 bg-base-300 rounded w-2/3"></div>
        </div>

        {/* Outcomes */}
        <div className="space-y-2 my-2">
          <div className="h-16 bg-base-300 rounded-lg"></div>
          <div className="h-16 bg-base-300 rounded-lg"></div>
        </div>

        {/* Pool value */}
        <div className="flex items-center justify-between pt-2 border-t-2 border-base-300">
          <div className="h-3 w-16 bg-base-300 rounded"></div>
          <div className="h-4 w-24 bg-base-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function MarketDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex gap-2 mb-6">
        <div className="h-4 w-12 bg-base-300 rounded"></div>
        <div className="h-4 w-16 bg-base-300 rounded"></div>
        <div className="h-4 w-32 bg-base-300 rounded"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Header */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="h-8 w-24 bg-base-300 rounded-lg"></div>
                <div className="h-8 w-20 bg-base-300 rounded-lg"></div>
              </div>

              <div className="h-10 bg-base-300 rounded mb-4 w-3/4"></div>

              <div className="space-y-2 mb-6">
                <div className="h-4 bg-base-300 rounded w-full"></div>
                <div className="h-4 bg-base-300 rounded w-2/3"></div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="stat bg-base-300 rounded-lg p-4">
                    <div className="h-3 bg-base-200 rounded mb-2 w-1/2"></div>
                    <div className="h-6 bg-base-200 rounded mb-1 w-3/4"></div>
                    <div className="h-3 bg-base-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Distribution */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="h-6 bg-base-300 rounded mb-4 w-48"></div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <div className="h-4 bg-base-300 rounded w-16"></div>
                      <div className="h-4 bg-base-300 rounded w-32"></div>
                    </div>
                    <div className="h-2 bg-base-300 rounded-full w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="h-6 bg-base-300 rounded mb-4 w-32"></div>
              <div className="space-y-4">
                <div className="h-20 bg-base-300 rounded-xl"></div>
                <div className="h-20 bg-base-300 rounded-xl"></div>
                <div className="h-14 bg-base-300 rounded-xl"></div>
                <div className="h-64 bg-base-300 rounded-xl"></div>
                <div className="h-14 bg-base-300 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i}>
          <div className="h-4 bg-base-300 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );
}

export function FormSkeleton() {
  return (
    <div className="card bg-base-200 shadow-xl animate-pulse">
      <div className="card-body space-y-6">
        <div className="h-8 bg-base-300 rounded w-48"></div>

        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-base-300 rounded w-32"></div>
            <div className="h-12 bg-base-300 rounded w-full"></div>
          </div>
        ))}

        <div className="flex gap-4">
          <div className="h-12 bg-base-300 rounded flex-1"></div>
          <div className="h-12 bg-base-300 rounded flex-1"></div>
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat bg-base-200 rounded-lg p-4 animate-pulse">
      <div className="h-3 bg-base-300 rounded mb-2 w-1/2"></div>
      <div className="h-8 bg-base-300 rounded mb-1 w-3/4"></div>
      <div className="h-3 bg-base-300 rounded w-1/3"></div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
  };

  return (
    <div className="flex justify-center items-center py-12">
      <span className={`loading loading-spinner ${sizeClasses[size]} text-primary`}></span>
    </div>
  );
}
