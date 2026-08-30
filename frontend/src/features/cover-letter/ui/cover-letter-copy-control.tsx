import { CheckCircle2, CircleAlert, Clipboard } from 'lucide-react';

import type { ClipboardCopyStatus } from '@/src/shared/hooks/use-clipboard-copy';

export function CoverLetterCopyControl({
  compact,
  copyStatus,
  onCopy,
}: {
  compact: boolean;
  copyStatus: ClipboardCopyStatus;
  onCopy: () => void;
}) {
  const label = copyStatus === 'copied' ? 'Скопировано' : copyStatus === 'error' ? 'Ошибка' : 'Скопировать';
  const Icon = copyStatus === 'copied' ? CheckCircle2 : copyStatus === 'error' ? CircleAlert : Clipboard;
  const tone = copyStatus === 'copied'
    ? 'border-brand-400/45 bg-brand-500/25 text-brand-300 shadow-lg shadow-brand-950/20'
    : copyStatus === 'error'
      ? 'border-red-400/30 bg-red-500/10 text-red-300'
      : 'border-white/10 text-foreground hover:border-white/20 hover:bg-white/[0.035]';
  return (
    <button
      type="button"
      onClick={onCopy}
      className={`${compact ? 'w-full justify-center' : ''} ${tone} inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium transition-[background-color,border-color,color,box-shadow]`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span aria-live="polite">{label}</span>
    </button>
  );
}

export function CoverLetterCopyError() {
  return (
    <div role="alert" className="mb-4 flex items-start gap-3 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-red-200">
      <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-medium">Не удалось скопировать письмо</p>
        <p className="mt-0.5 text-xs leading-relaxed opacity-75">
          Попробуйте ещё раз или выделите и скопируйте текст вручную.
        </p>
      </div>
    </div>
  );
}
