export default function ProdukteLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Product list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card flex items-center gap-4 p-4">
            <div className="h-12 w-12 shrink-0 animate-pulse rounded bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-32 animate-pulse rounded bg-gray-50" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded bg-gray-100" />
              <div className="h-6 w-16 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
