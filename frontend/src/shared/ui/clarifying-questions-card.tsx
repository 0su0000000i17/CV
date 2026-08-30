'use client';

import { useState } from 'react';
import type { ClarifyingAnswer } from '@/src/shared/api/resume-improvement-questions';
import { ClarifyingNavigation } from './clarifying-navigation';
import { ClarifyingQuestionOptions } from './clarifying-question-options';
import { ClarifyingSkipConfirm } from './clarifying-skip-confirm';
import { MIN_CUSTOM_TEXT_LENGTH, type QuestionsSession } from './clarifying-questions-types';
import { useClarifyingAnswers } from './use-clarifying-answers';

export function ClarifyingQuestionsCard(props: {
  session: QuestionsSession; isSubmitting: boolean; description?: string;
  skipWarning?: string; submitLabel?: string;
  onSubmit: (answers: ClarifyingAnswer[]) => void; onSkip: () => void;
}) {
  const answers = useClarifyingAnswers(props.session);
  const [index, setIndex] = useState(0);
  const [skipVisible, setSkipVisible] = useState(false);
  const total = props.session.questions.length;
  const question = props.session.questions[index];
  const answer = answers.answers[question.id];
  const selected = answer?.optionKeys ?? [];
  const hasCustom = question.options.some((option) => option.custom && selected.includes(option.key));
  const answered = Boolean(selected.length && (!hasCustom ||
    (answer?.customText ?? '').trim().length >= MIN_CUSTOM_TEXT_LENGTH));
  const last = index === total - 1;
  const next = () => last ? props.onSubmit(answers.serialize())
    : setIndex((value) => Math.min(value + 1, total - 1));
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.018] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Уточнение {index + 1} из {total}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">{props.description ?? 'Ответы помогут усилить резюме реальными фактами, а не только формулировками.'}</p></div>
        {!skipVisible ? <button type="button" onClick={() => setSkipVisible(true)} disabled={props.isSubmitting}
          className="shrink-0 cursor-pointer text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:cursor-not-allowed">Пропустить всё</button> : null}
      </div>
      <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
        <div className="h-full rounded-full bg-white/70 transition-[width] duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
      {skipVisible ? <ClarifyingSkipConfirm
        warning={props.skipWarning ?? 'Без ответов усиление ограничится переформулировкой — цифры, инструменты и риск-факторы, скорее всего, не изменятся.'}
        submitting={props.isSubmitting} onSkip={props.onSkip} onCancel={() => setSkipVisible(false)} /> : <>
        <p key={question.id} className="mt-7 animate-in fade-in slide-in-from-bottom-1 text-xl font-medium leading-snug text-foreground duration-300">{question.question}</p>
        {question.multiple ? <p className="mt-2 text-xs text-muted-foreground">Можно выбрать несколько вариантов</p> : null}
        <ClarifyingQuestionOptions question={question} answer={answer}
          onSelect={(key) => answers.selectOption(question, key)}
          onCustomText={(value) => answers.setCustomText(question.id, value)} />
        <ClarifyingNavigation first={index === 0} last={last} answered={answered}
          submitting={props.isSubmitting} submitLabel={props.submitLabel ?? 'Улучшить резюме'}
          onBack={() => setIndex((value) => Math.max(value - 1, 0))} onNext={next} />
      </>}
    </div>
  );
}
