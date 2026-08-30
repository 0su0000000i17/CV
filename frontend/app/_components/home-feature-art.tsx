'use client';

import { useId } from 'react';

import { FeatureArtShape } from './home-feature-art-shape';
import type { HomeFeatureArtKind } from './home-feature-art-types';
import styles from './home-feature-art.module.css';

export type { HomeFeatureArtKind } from './home-feature-art-types';

type Props = { kind: HomeFeatureArtKind };

export function HomeFeatureArt({ kind }: Props) {
  const haloId = useId().replace(/:/g, '');

  return (
    <div aria-hidden className={`${styles.art} relative h-[9.5rem] w-full overflow-hidden`}>
      <svg viewBox="0 0 320 210" className="h-full w-full" fill="none" role="presentation">
        <defs>
          <radialGradient id={haloId}>
            <stop stopColor="var(--feature-art-halo)" />
            <stop offset="1" stopColor="var(--feature-art-halo)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="160" cy="108" rx="118" ry="88" fill={`url(#${haloId})`} />
        <FeatureArtShape kind={kind} />
      </svg>
    </div>
  );
}
