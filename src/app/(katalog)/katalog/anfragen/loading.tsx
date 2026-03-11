export default function AnfragenLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-56 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Inquiry cards skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
              </div>
              <div className="h-3 w-16 animate-pulse rounded bg-gray-50" />
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
