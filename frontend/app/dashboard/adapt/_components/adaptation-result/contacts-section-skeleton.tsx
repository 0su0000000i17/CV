function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-muted ${className}`}
      aria-hidden="true"
    />
  );
}

function SkeletonField() {
  return (
    <div>
      <SkeletonLine className="h-3 w-24" />
      <SkeletonLine className="mt-2 h-4 w-32" />
    </div>
  );
}

export function ContactsSectionSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_96px] md:items-start">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
        </div>

        <SkeletonLine className="h-10 w-64 rounded-xl" />
      </div>

      <div className="-mt-1 h-24 w-24 animate-pulse rounded-2xl bg-muted justify-self-start md:-mt-10 md:justify-self-end" />
    </div>
  );
}