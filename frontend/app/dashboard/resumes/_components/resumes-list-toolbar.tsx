import { Search } from 'lucide-react';

import { resumeFilters, type ResumeFilter } from './resume-list-filter';

type Props = {
  filter: ResumeFilter;
  hasResumes: boolean;
  query: string;
  onFilterChange: (filter: ResumeFilter) => void;
  onQueryChange: (query: string) => void;
};

export function ResumesListToolbar({ filter, hasResumes, query, onFilterChange, onQueryChange }: Props) {
  return (
    <div className="border-b border-white/10 p-5 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-xl font-medium tracking-[-0.025em] text-foreground">Резюме</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Найдите файл и продолжите работу с ним
          </p>
        </div>
        {hasResumes ? (
          <label className="relative block min-w-0 sm:w-64">
            <span className="sr-only">Найти резюме</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Название или роль"
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.025] pl-10 pr-3 text-sm text-white outline-none transition-[background-color,border-color] placeholder:text-white/25 hover:border-white/15 focus:border-white/25 focus:bg-white/[0.04]"
            />
          </label>
        ) : null}
      </div>
      {hasResumes ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {resumeFilters.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => onFilterChange(item.value)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-[background-color,border-color,color] ${
                filter === item.value
                  ? 'border-white/20 bg-white text-black'
                  : 'border-white/10 text-white/45 hover:border-white/20 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
