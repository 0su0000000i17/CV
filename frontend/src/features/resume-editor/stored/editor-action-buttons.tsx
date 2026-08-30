import { Download, Loader2, Save } from 'lucide-react';

type Props = {
  canDownload: boolean;
  downloadStatus: 'idle' | 'loading' | 'error';
  saveDisabled: boolean;
  isSaving: boolean;
  onDownload: () => void;
  onSave: () => void;
};

export function EditorActionButtons(props: Props) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap md:w-auto md:shrink-0 md:justify-end">
      <button
        type="button"
        onClick={props.onSave}
        disabled={props.saveDisabled}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[136px]"
      >
        {props.isSaving
          ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          : <Save className="h-4 w-4 shrink-0" />}
        <span>{props.isSaving ? 'Сохраняем...' : 'Сохранить'}</span>
      </button>
      <button
        type="button"
        onClick={props.onDownload}
        disabled={!props.canDownload || props.downloadStatus === 'loading'}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[120px]"
      >
        {props.downloadStatus === 'loading'
          ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          : <Download className="h-4 w-4 shrink-0" />}
        <span>Скачать</span>
      </button>
    </div>
  );
}
