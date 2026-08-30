import { useEffect, type RefObject } from 'react';

export function useAutoResizeTextarea(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  disabled: boolean
) {
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || disabled) return;

    const minHeight = 44;
    const maxHeight = 220;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [disabled, textareaRef, value]);
}
