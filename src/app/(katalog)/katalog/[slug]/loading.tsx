export default function ProductDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back link skeleton */}
      <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />

      {/* Product header skeleton */}
      <div className="card overflow-hidden">
        <div className="p-5 sm:p-7">
          <div className="space-y-3">
            <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
            <div className="h-7 w-64 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full max-w-lg animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>

      {/* Color designs skeleton */}
      <div className="card p-5 sm:p-7">
        <div className="mb-4 h-5 w-32 animate-pulse rounded bg-gray-200" />
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 w-20 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </div>

      {/* Sizes table skeleton */}
      <div className="card p-5 sm:p-7">
        <div className="mb-4 h-5 w-48 animate-pulse rounded bg-gray-200" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
              <div className="h-6 w-6 animate-pulse rounded-full bg-gray-100" />
              <div className="flex-1" />
              <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
