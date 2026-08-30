import { Loader2, User } from 'lucide-react';

type Props = {
  errorMessage: string;
  isSaving: boolean;
  name: string;
  onNameChange: (value: string) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
};

export function OnboardingForm({ errorMessage, isSaving, name, onNameChange, onSubmit }: Props) {
  return (
    <section className="w-full rounded-3xl border border-border bg-card/60 p-6 md:p-8">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
        <User className="h-5 w-5" />
      </div>
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Первый вход
      </p>
      <h1 className="text-3xl font-normal tracking-tight text-foreground md:text-4xl">
        Как к вам обращаться?
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Имя будет отображаться в личном кабинете. Фамилию указывать не нужно.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="onboarding-name" className="text-sm font-medium text-foreground">Имя</label>
          <input
            id="onboarding-name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            maxLength={100}
            autoComplete="given-name"
            autoFocus
            placeholder="Например, Никита"
            className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
          />
        </div>
        {errorMessage ? <p className="text-sm text-red-500" role="alert">{errorMessage}</p> : null}
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isSaving ? 'Сохраняем...' : 'Продолжить'}
        </button>
      </form>
    </section>
  );
}
