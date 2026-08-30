import { X } from 'lucide-react';

type Props = {
  inputValue: string;
  skills: string[];
  onAdd: () => void;
  onFinish: () => void;
  onInputChange: (value: string) => void;
  onInputKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  onRemove: (index: number) => void;
};

export function SkillsEditor(props: Props) {
  return (
    <div className="space-y-4">
      <div
        className="min-h-[150px] rounded-xl border border-border bg-background p-3 transition-colors focus-within:border-blue-500"
        onClick={() => document.getElementById('resume-skills-input')?.focus()}
      >
        <div className="flex flex-wrap gap-2">
          {props.skills.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-sm text-foreground"
            >
              {skill}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  props.onRemove(index);
                }}
                className="cursor-pointer rounded-full text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Удалить навык ${skill}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <input
            id="resume-skills-input"
            value={props.inputValue}
            onChange={(event) => props.onInputChange(event.target.value)}
            onBlur={props.onAdd}
            onKeyDown={props.onInputKeyDown}
            placeholder={props.skills.length ? '' : 'Введите навык'}
            className="min-w-[180px] flex-1 bg-transparent px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Добавляйте навыки через Enter, запятую или новую строку. Языки в этом блоке не отображаются.
      </p>
      <button
        type="button"
        onClick={props.onFinish}
        className="cursor-pointer rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
      >
        Готово
      </button>
    </div>
  );
}
