'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type ClipboardCopyStatus = 'idle' | 'copied' | 'error';

const DEFAULT_RESET_DELAY_MS = 5000;

export function useClipboardCopy(resetDelayMs = DEFAULT_RESET_DELAY_MS) {
  const resetTimeoutRef = useRef<number | null>(null);
  const [copyStatus, setCopyStatus] = useState<ClipboardCopyStatus>('idle');

  const clearResetTimeout = useCallback(() => {
    if (resetTimeoutRef.current === null) return;

    window.clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = null;
  }, []);

  const resetCopyStatus = useCallback(() => {
    clearResetTimeout();
    setCopyStatus('idle');
  }, [clearResetTimeout]);

  const copyText = useCallback(
    async (value: string) => {
      clearResetTimeout();

      try {
        await navigator.clipboard.writeText(value);
        setCopyStatus('copied');
      } catch {
        setCopyStatus('error');
      }

      resetTimeoutRef.current = window.setTimeout(() => {
        setCopyStatus('idle');
        resetTimeoutRef.current = null;
      }, resetDelayMs);
    },
    [clearResetTimeout, resetDelayMs]
  );

  useEffect(() => clearResetTimeout, [clearResetTimeout]);

  return { copyStatus, copyText, resetCopyStatus };
}
