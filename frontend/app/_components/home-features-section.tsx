import type { PointerEventHandler } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { homeFeatures } from './home-content';
import { HomeFeatureArt } from './home-feature-art';
import styles from '../page.module.css';

export function HomeFeaturesSection({
  onPointerMove,
}: {
  onPointerMove: PointerEventHandler<HTMLElement>;
}) {
  return (
    <section id="features" className="scroll-mt-24 pt-12 md:pt-16">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        {homeFeatures.map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            data-reveal
            onPointerMove={onPointerMove}
            className={`${styles.interactiveSurface} ${styles.revealItem} group relative flex min-h-[19.5rem] flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card/50 p-5 sm:p-6`}
          >
            <div className="relative z-10 max-w-lg">
              <h2
                data-reveal
                className={`${styles.revealHeading} text-2xl font-medium tracking-tight text-foreground sm:text-[1.75rem]`}
              >
                {feature.title}
              </h2>
              <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground/65 group-hover:text-foreground">
                Открыть <ArrowRight className="h-4 w-4" />
              </span>
            </div>
            <div className={`${styles.featureArtwork} relative z-10 -mx-3 -mb-5 mt-auto pt-3 sm:-mx-4 sm:-mb-6`}>
              <HomeFeatureArt kind={feature.art} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
