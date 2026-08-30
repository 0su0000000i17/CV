import { FileText, Upload } from 'lucide-react';

import { UploadResumeButton } from './upload-resume-button';

export function ResumeEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center sm:py-16">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025] text-white/50">
        <FileText className="h-5 w-5" strokeWidth={1.6} />
      </span>

      <h3 className="mt-5 text-xl font-medium text-foreground">
        Здесь появятся ваши резюме
      </h3>

      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Загрузите PDF, чтобы оценить его и продолжить улучшение или адаптацию.
      </p>

      <div className="mt-6">
        <UploadResumeButton
          currentResumeCount={0}
          icon={<Upload className="h-4 w-4" />}
          errorAlign="left"
        />
      </div>
    </div>
  );
}
