import { ImagePlus, UserRound, X } from 'lucide-react';
import type { ChangeEvent } from 'react';

type Props = {
  photoUrl: string | null;
  onChangePhoto: (photoUrl: string | null) => void;
};

export function PhotoControl({ photoUrl, onChangePhoto }: Props) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      onChangePhoto(typeof reader.result === 'string' ? reader.result : null);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-start gap-4">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-9 w-9 text-muted-foreground" />
        )}
      </div>

      <div className="space-y-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted">
          <ImagePlus className="h-4 w-4" />
          {photoUrl ? 'Заменить фото' : 'Добавить фото'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {photoUrl ? (
          <button
            type="button"
            onClick={() => onChangePhoto(null)}
            className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Убрать фото
          </button>
        ) : null}
      </div>
    </div>
  );
}
