import { UserRound } from 'lucide-react';

type Props = {
  photoUrl: string | null;
};

export function ContactPhotoPreview({ photoUrl }: Props) {
  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <UserRound className="h-9 w-9 text-muted-foreground" />
      )}
    </div>
  );
}