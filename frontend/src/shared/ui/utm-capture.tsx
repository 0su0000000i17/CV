'use client';

import { useEffect } from 'react';

import { captureUtmFromUrl } from '@/src/shared/lib/utm-attribution';

export function UtmCapture() {
  useEffect(() => {
    captureUtmFromUrl();
  }, []);

  return null;
}
