/** Skeleton loader for client-side profile pages */
export function ProfileSkeleton() {
  return (
    <div className="p-6 lg:p-10 max-w-xl mx-auto animate-pulse">
      <div className="h-8 w-40 bg-[var(--border)] rounded-xl mb-8" />
      <div className="bg-white rounded-2xl border border-[var(--border)] p-7 space-y-5">
        <div className="pb-5 border-b border-[var(--border)] space-y-2">
          <div className="h-3 w-12 bg-[var(--border)] rounded" />
          <div className="h-4 w-48 bg-[var(--border)] rounded" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 bg-[var(--border)] rounded" />
            <div className="h-10 bg-[var(--border)] rounded-xl" />
          </div>
        ))}
        <div className="h-12 bg-[var(--border)] rounded-xl" />
      </div>
    </div>
  )
}
