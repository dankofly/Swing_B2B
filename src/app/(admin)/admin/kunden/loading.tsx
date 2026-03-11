export default function KundenLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-28 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Search skeleton */}
      <div className="h-10 w-full max-w-sm animate-pulse rounded bg-gray-100" />

      {/* Customer cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-20 animate-pulse rounded bg-gray-50" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-gray-50" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-gray-50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
