export function ResumeListSkeleton() {
  return (
    <div className="divide-y divide-border">
      {[1, 2].map((item) => (
        <div
          key={item}
          className="grid grid-cols-1 gap-5 px-6 py-5 xl:grid-cols-[1fr_220px_220px]"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 animate-pulse rounded-xl bg-muted/60" />

            <div className="flex-1">
              <div className="h-5 w-56 animate-pulse rounded bg-muted/60" />

              <div className="mt-3 h-4 w-32 animate-pulse rounded bg-muted/60" />

              <div className="mt-4 flex gap-2">
                <div className="h-6 w-32 animate-pulse rounded-full bg-muted/60" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-muted/60" />
              </div>
            </div>
          </div>

          <div>
            <div className="h-3 w-24 animate-pulse rounded bg-muted/60" />
            <div className="mt-4 h-7 w-28 animate-pulse rounded bg-muted/60" />
          </div>

          <div className="flex items-center gap-2 xl:justify-end">
            <div className="h-10 w-24 animate-pulse rounded-xl bg-muted/60" />
            <div className="h-10 w-10 animate-pulse rounded-xl bg-muted/60" />
            <div className="h-10 w-10 animate-pulse rounded-xl bg-muted/60" />
            <div className="h-10 w-10 animate-pulse rounded-xl bg-muted/60" />
          </div>
        </div>
      ))}
    </div>
  );
}
