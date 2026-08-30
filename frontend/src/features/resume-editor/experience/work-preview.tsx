'use client';

import { useId, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const COLLAPSED_HEIGHT_PX = 182;

type Props = {
  description?: string | null;
  focus?: string | null;
  bullets: string[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
};

export function WorkPreview({
  description,
  focus,
  bullets,
  isExpanded,
  onToggleExpanded,
}: Props) {
  const contentId = useId();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const content = contentRef.current;

    if (!content) return;

    const updateContentHeight = () => setContentHeight(content.scrollHeight);
    const resizeObserver = new ResizeObserver(updateContentHeight);

    updateContentHeight();
    resizeObserver.observe(content);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <>
      <div
        id={contentId}
        className={`mt-4 overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          isExpanded
            ? ''
            : 'max-h-[182px] [mask-image:linear-gradient(to_bottom,black_0%,black_calc(100%_-_32px),transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_calc(100%_-_32px),transparent_100%)]'
        }`}
        style={{
          maxHeight: isExpanded
            ? contentHeight
              ? `${contentHeight}px`
              : undefined
            : `${COLLAPSED_HEIGHT_PX}px`,
        }}
      >
        <div
          ref={contentRef}
          className="space-y-2.5 text-sm leading-relaxed text-foreground"
        >
          {description ? (
            <p className="whitespace-pre-wrap text-foreground">{description}</p>
          ) : focus ? (
            <p className="whitespace-pre-wrap text-muted-foreground">{focus}</p>
          ) : null}

          {!description &&
            bullets.map((bullet, bulletIndex) => (
              <p key={`${bullet}-${bulletIndex}`}>- {bullet}</p>
            ))}
        </div>
      </div>

      {(bullets.length > 3 || Boolean(focus) || Boolean(description)) && (
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-controls={contentId}
          aria-expanded={isExpanded}
          className="mt-3 inline-flex cursor-pointer items-center gap-1 text-sm text-brand-500 transition-colors hover:text-brand-400"
        >
          {isExpanded ? 'Свернуть' : 'Развернуть'}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 motion-reduce:transition-none ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}
    </>
  );
}
