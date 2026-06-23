import { FileText } from 'lucide-react';

export function ResumeEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="rounded-2xl bg-muted p-4">
        <FileText className="h-7 w-7 text-muted-foreground" />
      </div>

      <h3 className="mt-5 text-xl font-medium text-foreground">
        У вас пока нет резюме
      </h3>

      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Загрузите первое резюме в формате PDF, DOCX или RTF, чтобы начать
        анализировать и адаптировать его под вакансии.
      </p>
    </div>
  );
}
