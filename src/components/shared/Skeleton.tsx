export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-surface-800 animate-pulse rounded ${className}`} />
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-900 border border-surface-800">
      <Skeleton className="w-2 h-2 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

export function SkeletonMetrics() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-surface-900 border border-surface-800 rounded-lg p-4 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  )
}
