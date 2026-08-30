import { useCallback, useEffect, useRef, useState } from 'react';

export type CopyStatus = 'idle' | 'copied' | 'error';

export function useCopyResumeText(plainResumeText: string) {
  const timeoutRef = useRef<number | null>(null);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  async function copyResumeText() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    try {
      await navigator.clipboard.writeText(plainResumeText);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
    timeoutRef.current = window.setTimeout(() => {
      setCopyStatus('idle');
      timeoutRef.current = null;
    }, 1800);
  }

  const resetCopyStatus = useCallback(() => setCopyStatus('idle'), []);
  return { copyResumeText, copyStatus, resetCopyStatus };
}
