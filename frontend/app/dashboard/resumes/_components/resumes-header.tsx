import { UploadResumeButton } from './upload-resume-button';
import { Upload } from 'lucide-react';

type ResumesHeaderProps = {
  resumeCount: number;
};

export function ResumesHeader({ resumeCount }: ResumesHeaderProps) {
  const capacity = Math.min(100, (resumeCount / 10) * 100);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02]">
      <div className="grid lg:grid-cols-[minmax(0,1.4fr)_20rem]">
        <div className="p-6 sm:p-8 xl:p-10">
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-white/35">
            Личный кабинет · Мои резюме
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] text-foreground sm:text-5xl">
            Мои резюме
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Храните версии в одном месте, быстро находите нужную и продолжайте
            работу с актуального действия.
          </p>
        </div>

        <aside className="border-t border-white/10 bg-black/15 p-6 sm:p-8 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Хранилище</span>
            <span className="font-medium text-white">{resumeCount}/10</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-white/70 transition-[width] duration-500"
              style={{ width: `${capacity}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Можно хранить до 10 резюме одновременно.
          </p>
          <UploadResumeButton
            currentResumeCount={resumeCount}
            icon={<Upload className="h-4 w-4" />}
            className="mt-6 w-full"
            errorAlign="left"
          />
        </aside>
      </div>
    </section>
  );
}
