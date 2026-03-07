export default function KatalogLoading() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="dash-hero rounded-xl px-8 py-9">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
            <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
          </div>
          <div className="h-10 w-64 animate-pulse rounded-lg bg-white/10" />
        </div>
      </div>

      {/* Filter skeleton */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="h-24 animate-pulse bg-gray-100" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              <div className="flex gap-2 pt-2">
                <div className="h-6 w-12 animate-pulse rounded bg-gray-100" />
                <div className="h-6 w-12 animate-pulse rounded bg-gray-100" />
                <div className="h-6 w-12 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
