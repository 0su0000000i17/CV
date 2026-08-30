import { parseEducationNotes } from './parse-education-notes';

export function EducationDisplay({ notes }: { notes: string[] }) {
  const groups = parseEducationNotes(notes);
  if (!groups.length) {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        Образование не найдено в исходном резюме.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map((group, groupIndex) => (
        <div key={`${group.title}-${groupIndex}`} className="space-y-3">
          <p className="text-sm font-medium text-foreground">{group.title}</p>
          <div className="space-y-4">
            {group.entries.map((entry, entryIndex) => (
              <div
                key={`${entry.year}-${entry.title}-${entryIndex}`}
                className="grid gap-2 text-sm md:grid-cols-[96px_minmax(0,1fr)]"
              >
                <div className="text-muted-foreground">
                  {entry.year ? <p>{entry.year}</p> : null}
                  {entry.level ? <p>{entry.level}</p> : null}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{entry.title}</p>
                  {entry.details.length ? (
                    <p className="mt-1 leading-relaxed text-foreground">{entry.details.join(', ')}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
