import { ChevronDown, ChevronUp } from 'lucide-react';

type Props = {
  focus?: string | null;
  bullets: string[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
};

export function WorkPreview({
  focus,
  bullets,
  isExpanded,
  onToggleExpanded,
}: Props) {
  return (
    <>
      <div
        className={`mt-4 space-y-2.5 overflow-hidden text-sm leading-relaxed text-foreground ${
          isExpanded ? '' : 'max-h-[190px]'
        }`}
      >
        {focus ? <p className="text-muted-foreground">{focus}</p> : null}

        {bullets.map((bullet, bulletIndex) => (
          <p key={`${bullet}-${bulletIndex}`}>- {bullet}</p>
        ))}
      </div>

      {(bullets.length > 3 || Boolean(focus)) && (
        <button
          type="button"
          onClick={onToggleExpanded}
          className="mt-3 inline-flex cursor-pointer items-center gap-1 text-sm text-blue-400 transition-colors hover:text-blue-300"
        >
          {isExpanded ? 'Свернуть' : 'Развернуть'}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      )}
    </>
  );
}
