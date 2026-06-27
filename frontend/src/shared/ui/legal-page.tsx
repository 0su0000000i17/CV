import Link from 'next/link';
import type { ReactNode } from 'react';

type LegalSection = {
  title: string;
  children: ReactNode;
};

type Props = {
  title: string;
  description: string;
  updatedAt?: string;
  sections: LegalSection[];
};

export function LegalPage({ title, description, updatedAt, sections }: Props) {
  return (
    <article className="mx-auto max-w-4xl">
      <Link
        href="/"
        className="mb-10 inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← На главную
      </Link>

      <header className="border-b border-border pb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          CV Pro / Правовая информация
        </p>

        <h1 className="mt-6 max-w-4xl text-3xl font-normal tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>

        <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
          {description}
        </p>

        {updatedAt ? (
          <p className="mt-5 text-xs text-muted-foreground">
            Последнее обновление: {updatedAt}
          </p>
        ) : null}
      </header>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.title} className="max-w-3xl">
            <h2 className="text-xl font-medium text-foreground">
              {section.title}
            </h2>

            <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground md:text-base">
              {section.children}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
