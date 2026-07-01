import { UploadResumeButton } from './upload-resume-button';

type ResumesHeaderProps = {
  resumeCount: number;
};

export function ResumesHeader({ resumeCount }: ResumesHeaderProps) {
  return (
    <div className="mb-10">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Личный кабинет / Мои резюме
      </p>

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-normal tracking-tight text-foreground md:text-5xl">
            Мои резюме
          </h1>

          <p className="mt-4 max-w-2xl text-muted-foreground">
            Храните несколько версий резюме, отслеживайте статус анализа и
            открывайте нужный файл для работы.
          </p>
        </div>

        <UploadResumeButton currentResumeCount={resumeCount} />
      </div>
    </div>
  );
}
