export default function LagerLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-36 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-52 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4">
            <div className="mb-2 h-3 w-16 animate-pulse rounded bg-gray-100" />
            <div className="h-7 w-12 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="card overflow-hidden">
        <div className="border-b p-4">
          <div className="h-10 w-44 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                <div className="flex flex-1 gap-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-8 w-16 animate-pulse rounded bg-gray-50" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
