import { Pencil } from 'lucide-react';

export function SkillsDisplay({ skills, onEdit }: { skills: string[]; onEdit: () => void }) {
  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">Продвинутый уровень</p>
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 cursor-pointer rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Редактировать навыки"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span key={`${skill}-${index}`} className="rounded-lg bg-muted px-3 py-1.5 text-sm text-foreground">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
