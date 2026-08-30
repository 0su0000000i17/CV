import type { ReactNode } from 'react';

export function ResultStateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div>{children}</div>
      <div className="hidden xl:block" />
    </div>
  );
}
