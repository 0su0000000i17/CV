import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleAlert,
  GitBranch,
  ShieldCheck,
  Sparkles,
  Target,
  TriangleAlert,
} from 'lucide-react';

import type {
  ResumeVacancyFitResponse,
  ResumeVacancyFitRiskFlag,
} from '@/src/shared/api/resumeVacancyFit';

type Props = {
  fitResponse?: ResumeVacancyFitResponse;
  isChecking: boolean;
  isError: boolean;
  errorMessage?: string;
};

const fitLabels: Record<string, string> = {
  impossible: 'Не подходит',
  weak: 'Слабое совпадение',
  partial: 'Частично подходит',
  solid: 'Хорошо подходит',
  strong: 'Сильно подходит',
};

const careerMoveLabels: Record<string, string> = {
  same_role: 'Та же роль',
  adjacent_role: 'Смежная роль',
  stretch_role: 'Растяжка роли',
  career_change: 'Смена профессии',
  unknown: 'Не определено',
};

const adaptationModeLabels: Record<string, string> = {
  safe: 'Можно адаптировать',
  limited: 'Можно осторожно',
  blocked: 'Адаптация заблокирована',
};

const riskFlagLabels: Record<ResumeVacancyFitRiskFlag['type'], string> = {
  role_mismatch: 'Несоответствие роли',
  missing_core_experience: 'Нет ключевого опыта',
  missing_required_skill: 'Нет обязательного навыка',
  level_mismatch: 'Несовпадение уровня',
  domain_mismatch: 'Другая доменная область',
  weak_evidence: 'Слабая доказательность',
  career_change: 'Смена профессии',
  over_adaptation_risk: 'Риск выдумывания опыта',
};

const severityClasses: Record<ResumeVacancyFitRiskFlag['severity'], string> = {
  minor: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300',
  major: 'border-orange-500/20 bg-orange-500/10 text-orange-300',
  critical: 'border-red-500/20 bg-red-500/10 text-red-300',
};

const severityLabels: Record<ResumeVacancyFitRiskFlag['severity'], string> = {
  minor: 'Низкий риск',
  major: 'Средний риск',
  critical: 'Критичный риск',
};

function getScoreClass(score: number) {
  if (score >= 80) {
    return 'text-emerald-400';
  }

  if (score >= 60) {
    return 'text-amber-400';
  }

  if (score >= 40) {
    return 'text-orange-400';
  }

  return 'text-red-400';
}

function getStatusBadgeClass(canAdapt: boolean) {
  return canAdapt
    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
    : 'border-red-500/20 bg-red-500/10 text-red-300';
}

function InlineMeta({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border/70 py-2 first:border-t-0 first:pt-0 last:pb-0">
      <p className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>

      <div className="flex min-w-0 max-w-[65%] items-center justify-end gap-2 text-right text-sm font-medium text-foreground">
        {icon}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

function CompactListBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'green' | 'orange' | 'red';
}) {
  if (!items.length) {
    return null;
  }

  const titleClass = {
    green: 'text-emerald-300',
    orange: 'text-orange-300',
    red: 'text-red-300',
  }[tone];

  return (
    <div className="border-t border-border py-4 first:border-t-0 first:pt-0 last:pb-0">
      <h3 className={`text-sm font-medium ${titleClass}`}>{title}</h3>

      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />

            <p className="text-sm leading-relaxed text-muted-foreground">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResumeVacancyFitCard({
  fitResponse,
  isChecking,
  isError,
  errorMessage,
}: Props) {
  if (isChecking) {
    return (
      <section className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-muted p-3">
            <Sparkles className="h-5 w-5 animate-pulse text-foreground" />
          </div>

          <div>
            <h2 className="text-xl font-medium text-foreground">
              Проверяем резюме и вакансию
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Смотрим, можно ли адаптировать опыт кандидата под эту вакансию без
              выдумывания навыков, должностей и проектов.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-red-500/10 p-3 text-red-300 ring-1 ring-red-500/20">
            <CircleAlert className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-medium text-foreground">
              Не удалось проверить совместимость
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {errorMessage ||
                'Попробуйте ещё раз. Если ошибка повторится, проверим backend-логи.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!fitResponse) {
    return (
      <section className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-muted p-3">
            <Target className="h-5 w-5 text-foreground" />
          </div>

          <div>
            <h2 className="text-xl font-medium text-foreground">
              Проверка перед адаптацией
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Сначала сервис проверит, подходит ли выбранное резюме под вакансию.
              Если адаптация потребует выдумывания опыта, мы её заблокируем.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const { fit } = fitResponse;

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex items-start gap-4">
          <div
            className={`rounded-xl p-3 ring-1 ${
              fit.canAdapt
                ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20'
                : 'bg-red-500/10 text-red-300 ring-red-500/20'
            }`}
          >
            {fit.canAdapt ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <Ban className="h-5 w-5" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-medium text-foreground">
                {fit.canAdapt
                  ? 'Резюме можно адаптировать'
                  : 'Адаптация заблокирована'}
              </h2>

              <span
                className={`rounded-full border px-2.5 py-1 text-xs ${getStatusBadgeClass(
                  fit.canAdapt
                )}`}
              >
                {adaptationModeLabels[fit.adaptationMode]}
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {fit.reason}
            </p>
          </div>
        </div>

        <div className="shrink-0 md:text-right">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Совпадение
          </p>

          <p className={`mt-1 text-3xl font-semibold ${getScoreClass(fit.score)}`}>
            {fit.score}/100
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {fitLabels[fit.fit]}
          </p>
        </div>
      </div>

      <div className="mt-4">
  <InlineMeta label="Резюме" value={fit.resumeRole || 'Роль не определена'} />

  <InlineMeta
    label="Вакансия"
    value={fit.vacancyRole || 'Роль не определена'}
  />

  <InlineMeta
    label="Тип перехода"
    value={careerMoveLabels[fit.careerMove]}
    icon={<GitBranch className="h-4 w-4 shrink-0 text-muted-foreground" />}
  />
</div>

      {fit.safeAdaptationDirection ? (
        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <h3 className="text-sm font-medium text-emerald-300">
            Безопасное направление адаптации
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {fit.safeAdaptationDirection}
          </p>
        </div>
      ) : null}

      <div className="mt-5 rounded-xl border border-border px-4 py-4">
        <CompactListBlock
          title="Что совпало"
          items={fit.matchedRequirements}
          tone="green"
        />

        <CompactListBlock
          title="Переносимый опыт"
          items={fit.transferableExperience}
          tone="green"
        />

        <CompactListBlock title="Пробелы" items={fit.gaps} tone="orange" />

        <CompactListBlock
          title="Блокирующие пробелы"
          items={fit.blockingGaps}
          tone="red"
        />
      </div>

      {fit.riskFlags.length > 0 ? (
        <div className="mt-5 border-t border-border pt-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-yellow-500/10 p-2.5 text-yellow-300 ring-1 ring-yellow-500/20">
              <TriangleAlert className="h-4 w-4" />
            </div>

            <h3 className="font-medium text-foreground">Риск-факторы</h3>
          </div>

          <div className="space-y-3">
            {fit.riskFlags.map((flag) => (
              <div
                key={`${flag.type}-${flag.explanation}`}
                className="rounded-xl border border-border bg-background/60 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">
                    {riskFlagLabels[flag.type]}
                  </span>

                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] ${severityClasses[flag.severity]}`}
                  >
                    {severityLabels[flag.severity]}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {flag.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {fit.canAdapt ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />

          <p className="text-sm leading-relaxed text-muted-foreground">
            Проверка пройдена. Теперь можно создать адаптированный черновик
            резюме.
          </p>
        </div>
      ) : (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />

          <p className="text-sm leading-relaxed text-muted-foreground">
            Сервис не будет создавать адаптацию, если для неё нужно придумать
            опыт, которого нет в резюме.
          </p>
        </div>
      )}
    </section>
  );
}