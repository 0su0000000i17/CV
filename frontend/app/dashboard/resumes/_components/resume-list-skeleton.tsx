export function ResumeListSkeleton() {
  return (
    <div className="divide-y divide-white/10">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="grid grid-cols-1 gap-5 px-5 py-5 sm:px-6 xl:grid-cols-[1fr_9rem_21rem]"
        >
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.05]" />

            <div className="flex-1">
              <div className="h-5 w-56 max-w-full animate-pulse rounded bg-white/[0.05]" />

              <div className="mt-3 h-4 w-32 animate-pulse rounded bg-white/[0.05]" />

              <div className="mt-3 h-3 w-28 animate-pulse rounded bg-white/[0.04]" />
            </div>
          </div>

          <div>
            <div className="h-7 w-20 animate-pulse rounded bg-white/[0.05]" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-white/[0.04]" />
          </div>

          <div className="flex items-center gap-2 xl:justify-end">
            <div className="h-10 w-24 animate-pulse rounded-xl bg-white/[0.05]" />
            <div className="h-10 w-20 animate-pulse rounded-xl bg-white/[0.05]" />
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.05]" />
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.05]" />
          </div>
        </div>
      ))}
    </div>
  );
}
