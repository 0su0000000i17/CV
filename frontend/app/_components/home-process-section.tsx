import type { PointerEventHandler } from 'react';

import { HomeProcessHeader } from './home-process-header';
import { HomeProcessResults } from './home-process-results';
import { HomeProcessSteps } from './home-process-steps-grid';
import { HomeProcessTools } from './home-process-tools';
import { HomeProcessVerification } from './home-process-verification';

type Props = { onSurfacePointerMove: PointerEventHandler<HTMLElement> };

export function HomeProcessSection({ onSurfacePointerMove }: Props) {
  return (
    <section className="pt-24 md:pt-32">
      <HomeProcessHeader />
      <HomeProcessVerification />
      <HomeProcessSteps onSurfacePointerMove={onSurfacePointerMove} />
      <HomeProcessResults onSurfacePointerMove={onSurfacePointerMove} />
      <HomeProcessTools onSurfacePointerMove={onSurfacePointerMove} />
    </section>
  );
}
