export default function AnfragenLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Kanban columns skeleton */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-8 animate-pulse rounded-full bg-gray-100" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="card p-4">
                  <div className="space-y-3">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-20 animate-pulse rounded bg-gray-50" />
                    <div className="h-8 w-full animate-pulse rounded bg-gray-50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
