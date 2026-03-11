export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="dash-hero rounded-xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative z-10 space-y-3">
          <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
        </div>
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4">
            <div className="mb-2 h-3 w-16 animate-pulse rounded bg-gray-100" />
            <div className="h-7 w-12 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Content sections skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 h-4 w-36 animate-pulse rounded bg-gray-100" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-gray-50" />
            ))}
          </div>
        </div>
        <div className="card p-5">
          <div className="mb-4 h-4 w-32 animate-pulse rounded bg-gray-100" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-gray-50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
