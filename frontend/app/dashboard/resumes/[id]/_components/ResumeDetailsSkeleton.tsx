export function ResumeDetailsSkeleton() {
  return (
    <div>
      <div className="mb-8">
        <div className="mb-6 h-5 w-32 animate-pulse rounded bg-muted/60" />
        <div className="h-12 w-full max-w-2xl animate-pulse rounded bg-muted/60" />
        <div className="mt-4 h-5 w-80 animate-pulse rounded bg-muted/60" />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-2xl bg-muted/60"
          />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    </div>
  );
}