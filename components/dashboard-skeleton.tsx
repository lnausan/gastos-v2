export default function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="rounded-lg bg-muted animate-pulse h-32" />
        ))}
      </div>
      <div className="rounded-lg bg-muted animate-pulse h-96" />
      <div className="rounded-lg bg-muted animate-pulse h-96" />
    </div>
  )
} 