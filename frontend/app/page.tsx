'use client';

import { useAuth } from '@/src/shared/hooks/use-auth';
import { HomeAboutSection } from './_components/home-about-section';
import { HomeAssessmentSection } from './_components/home-assessment-section';
import { HomeFeaturesSection } from './_components/home-features-section';
import { HomeFinalCta } from './_components/home-final-cta';
import { HomeHeroSection } from './_components/home-hero-section';
import { HomePricingSection } from './_components/home-pricing-section';
import { HomeProcessSection } from './_components/home-process-section';
import { HomeRays } from './_components/home-rays';
import { useHomeMotion } from './_components/use-home-motion';
import styles from './page.module.css';

export default function Home() {
  const { rootRef, handleSurfacePointerMove } = useHomeMotion();
  const { user } = useAuth();
  const billingHref = user ? '/dashboard/billing' : '/login?next=/dashboard/billing';

  return (
    <div
      ref={rootRef}
      data-motion-ready="true"
      className={`${styles.motionRoot} -mt-12 mx-auto flex w-full max-w-[1028px] flex-1 flex-col`}
    >
      <div className="relative isolate flex-1">
        <HomeRays />
        <HomeHeroSection onPointerMove={handleSurfacePointerMove} />
        <HomeFeaturesSection onPointerMove={handleSurfacePointerMove} />
        <HomeProcessSection onSurfacePointerMove={handleSurfacePointerMove} />
        <HomeAboutSection onSurfacePointerMove={handleSurfacePointerMove} />
        <HomeAssessmentSection onPointerMove={handleSurfacePointerMove} />
        <HomePricingSection
          billingHref={billingHref}
          onPointerMove={handleSurfacePointerMove}
        />
        <HomeFinalCta onPointerMove={handleSurfacePointerMove} />
      </div>
    </div>
  );
}
