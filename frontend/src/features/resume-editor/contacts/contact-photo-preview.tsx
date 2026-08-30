import { UserRound } from 'lucide-react';

type Props = {
  photoUrl: string | null;
};

export function ContactPhotoPreview({ photoUrl }: Props) {
  return (
    <div className="flex min-h-24 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted p-1">
      {photoUrl ? (
        // Uploaded data URLs are local editor state and cannot use the Next image optimizer.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          className="max-h-32 max-w-full object-contain"
        />
      ) : (
        <UserRound className="h-9 w-9 text-muted-foreground" />
      )}
    </div>
  );
}
