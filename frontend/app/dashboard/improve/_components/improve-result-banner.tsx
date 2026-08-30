import { ArrowRight, CheckCircle2, Save } from 'lucide-react';
import Link from 'next/link';

export function ImproveResultBanner({
  saved,
  resumeId,
}: {
  saved: boolean;
  resumeId?: string;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.018] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-white/70">
            {saved ? <CheckCircle2 className="h-5 w-5" /> : <Save className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="font-medium text-white">
              {saved ? 'Резюме улучшено и сохранено' : 'Улучшенная версия готова'}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-white/40">
              {saved
                ? 'Новая версия уже в профиле. Повторная оценка проверит именно улучшенный текст.'
                : 'Проверьте изменения и сохраните новую версию в профиль перед повторной оценкой.'}
            </p>
          </div>
        </div>
        {saved && resumeId ? (
          <Link
            href={`/dashboard/analyze?resumeId=${encodeURIComponent(resumeId)}&autoRun=1`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.075] px-4 py-3 text-sm font-medium text-white transition-[background-color,border-color,transform] hover:border-white/25 hover:bg-white/[0.11] active:scale-[0.98]"
          >
            Оценить новую версию
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
