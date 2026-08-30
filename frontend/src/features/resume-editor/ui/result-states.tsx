import { AlertCircle } from 'lucide-react';

const genericErrorMessage = 'Упс, что-то пошло не так. Повторите попытку.';

function getSafeErrorMessage(errorMessage?: string) {
  const value = errorMessage?.trim();

  if (!value) return genericErrorMessage;

  const isTechnicalError =
    /HTTP\s*\d+/i.test(value) ||
    /Yandex|async request|resource-manager|organization-manager|Permission/i.test(value) ||
    /\{[\s\S]*\}/.test(value) ||
    /stack|trace|exception|failed/i.test(value);

  return isTechnicalError ? genericErrorMessage : value;
}

export function ErrorState({
  title = 'Не удалось создать адаптацию',
  errorMessage,
}: {
  title?: string;
  errorMessage?: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start gap-4">
        <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300 ring-1 ring-red-500/20">
          <AlertCircle className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-medium text-foreground">{title}</h2>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {getSafeErrorMessage(errorMessage)}
          </p>
        </div>
      </div>
    </section>
  );
}
