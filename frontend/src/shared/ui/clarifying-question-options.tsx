import { Check } from 'lucide-react';
import type { ClarifyingQuestion } from '@/src/shared/api/resume-improvement-questions';
import type { DraftAnswer } from './clarifying-questions-types';

export function ClarifyingQuestionOptions(props: {
  question: ClarifyingQuestion;
  answer?: DraftAnswer;
  onSelect: (key: string) => void;
  onCustomText: (value: string) => void;
}) {
  const selectedKeys = props.answer?.optionKeys ?? [];
  return (
    <div key={`${props.question.id}-options`} className="mt-5 animate-in fade-in space-y-2.5 duration-300">
      {props.question.options.map((option) => {
        const selected = selectedKeys.includes(option.key);
        return <div key={option.key}>
          <button type="button" onClick={() => props.onSelect(option.key)}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${selected ? 'border-white/25 bg-white/[0.065] text-foreground' : 'border-white/10 bg-white/[0.015] text-foreground hover:border-white/20 hover:bg-white/[0.035]'}`}>
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-colors ${props.question.multiple ? 'rounded-md' : 'rounded-full'} ${selected ? 'border-white bg-white text-black' : 'border-white/15'}`}>
              {selected && <Check className="h-3 w-3" />}
            </span>{option.label}
          </button>
          {option.custom && selected ? <div className="mt-2.5 animate-in fade-in duration-200">
            <textarea autoFocus value={props.answer?.customText ?? ''}
              onChange={(event) => props.onCustomText(event.target.value)} maxLength={500} rows={3}
              placeholder="Опишите своими словами — конкретика и цифры сделают резюме сильнее"
              className="w-full resize-none rounded-xl border border-white/15 bg-white/[0.025] px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition-[background-color,border-color] placeholder:text-muted-foreground/70 hover:border-white/20 focus:border-white/30 focus:bg-white/[0.04]" />
            <p className="mt-1 text-right text-xs text-muted-foreground">{(props.answer?.customText ?? '').length}/500</p>
          </div> : null}
        </div>;
      })}
    </div>
  );
}
