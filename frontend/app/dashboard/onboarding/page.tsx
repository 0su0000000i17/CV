'use client';

import { Loader2 } from 'lucide-react';

import { OnboardingForm } from './onboarding-form';
import { useOnboardingProfile } from './use-onboarding-profile';

export default function OnboardingPage() {
  const state = useOnboardingProfile();
  if (state.isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-160px)] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-5 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Подготавливаем профиль...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-xl items-center">
      <OnboardingForm
        errorMessage={state.errorMessage}
        isSaving={state.isSaving}
        name={state.name}
        onNameChange={state.handleNameChange}
        onSubmit={state.handleSubmit}
      />
    </div>
  );
}
