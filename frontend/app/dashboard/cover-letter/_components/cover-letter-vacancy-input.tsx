import { Pencil } from 'lucide-react';

function getVacancyPreview(value: string) {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (!normalized) return 'Вакансия не добавлена';
  return normalized.length <= 120 ? normalized : `${normalized.slice(0, 120)}...`;
}

type Props = {
  compact: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  onExpand: () => void;
};

export function CoverLetterVacancyInput({ compact, textareaRef, value, onChange, onExpand }: Props) {
  if (!compact) {
    return (
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Ссылка на вакансию или полный текст описания"
        className="min-h-[44px] w-full resize-none rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition-[background-color,border-color] placeholder:text-muted-foreground focus:border-white/25 focus:bg-white/[0.035]"
      />
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 truncate text-sm text-muted-foreground">{getVacancyPreview(value)}</p>
        <button
          type="button"
          onClick={onExpand}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-foreground transition-[background-color,border-color] hover:border-white/20 hover:bg-white/[0.035]"
        >
          <Pencil className="h-3.5 w-3.5" />
          Изменить
        </button>
      </div>
    </div>
  );
}
