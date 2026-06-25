import type { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function EditorSection({ title, description, children }: Props) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="mb-4">
        <h2 className="text-2xl font-medium tracking-tight text-foreground">
          {title}
        </h2>

        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}
