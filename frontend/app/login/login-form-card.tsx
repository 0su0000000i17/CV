import Link from 'next/link';
import { Mail } from 'lucide-react';
import type { LoginFlow } from './use-login-flow';
import styles from './login.module.css';

const legalLink = 'font-medium text-foreground underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white/70';

export function LoginFormCard({ flow, motionClass }: {
  flow: LoginFlow; motionClass: string;
}) {
  const { errors, isSubmitting, isValid } = flow.form.formState;
  return <section aria-labelledby="login-title"
    className={`${styles.loginCard} ${motionClass} w-full max-w-[31rem] rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.3)] sm:p-9`}>
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-white/80"><Mail className="h-5 w-5" strokeWidth={1.6} /></div>
      <div><p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-white/35">Личный кабинет</p>
        <h1 id="login-title" className="mt-1 text-3xl font-medium tracking-[-0.035em] text-foreground sm:text-4xl">Вход без пароля</h1></div>
    </div>
    <p className="mb-7 mt-5 max-w-md text-sm leading-6 text-muted-foreground">Введите email — отправим одноразовую ссылку для безопасного входа.</p>
    <form onSubmit={flow.form.handleSubmit(flow.submit)} className="space-y-3" noValidate>
      <div className="pb-1"><label htmlFor="email" className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-white/45">Email</label>
        <input id="email" type="email" inputMode="email" autoComplete="email" placeholder="name@example.ru"
          aria-invalid={Boolean(errors.email)}
          className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-[0.95rem] text-foreground outline-none transition-[background-color,border-color,box-shadow] placeholder:text-white/25 hover:border-white/15 focus:border-brand-400/60 focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(71,121,173,0.12)]"
          {...flow.form.register('email')} />
        {errors.email ? <p className="mt-2 text-xs text-red-400">{errors.email.message}</p> : null}
      </div>
      <ConsentField register={flow.form.register('legalAccepted')} error={errors.legalAccepted?.message}>
        Я принимаю <Link href="/terms" className={legalLink}>Условия использования</Link> и{' '}
        <Link href="/offer" className={legalLink}>Оферту</Link>.
      </ConsentField>
      <ConsentField register={flow.form.register('pdnAccepted')} error={errors.pdnAccepted?.message}>
        Даю <Link href="/personal-data" className={legalLink}>согласие на обработку персональных данных</Link>{' '}
        в соответствии с <Link href="/privacy" className={legalLink}>Политикой конфиденциальности</Link>.
      </ConsentField>
      <button type="submit" disabled={!isValid || isSubmitting}
        className="mt-2 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-[background-color,transform,opacity] hover:bg-brand-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45">
        {isSubmitting ? 'Отправляем...' : 'Получить ссылку'}
      </button>
      <div aria-live="polite">{flow.message ? <p className="pt-1 text-center text-sm text-red-400">{flow.message}</p> : null}</div>
    </form>
  </section>;
}

function ConsentField(props: { register: object; error?: string; children: React.ReactNode }) {
  return <><label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.018] p-3.5 text-xs leading-5 text-muted-foreground transition-[background-color,border-color] hover:border-white/15 hover:bg-white/[0.03]">
    <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-transparent accent-brand-500" {...props.register} />
    <span>{props.children}</span></label>{props.error ? <p className="text-xs text-red-400">{props.error}</p> : null}</>;
}
