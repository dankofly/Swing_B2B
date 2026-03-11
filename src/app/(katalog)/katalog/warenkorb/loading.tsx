export default function WarenkorbLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Cart layout skeleton */}
      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        {/* Items */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card flex items-center gap-4 p-4">
              <div className="h-16 w-16 shrink-0 animate-pulse rounded bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-50" />
              </div>
              <div className="h-8 w-16 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>

        {/* Summary sidebar */}
        <div className="card h-fit p-5">
          <div className="mb-4 h-5 w-24 animate-pulse rounded bg-gray-200" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-12 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="flex justify-between">
              <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
          <div className="mt-5 h-10 w-full animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
