import { Check, PencilLine } from 'lucide-react';
import styles from './login.module.css';

export function LoginSuccessCard(props: {
  sentTo: string; motionClass: string; onChangeEmail: () => void;
}) {
  return <section aria-labelledby="login-success-title"
    className={`${styles.loginCard} ${props.motionClass} w-full max-w-[31rem] rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.3)] sm:p-9`}>
    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-white/80"><Check className="h-5 w-5" strokeWidth={1.7} /></div>
    <p className="mt-6 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-white/35">Ссылка отправлена</p>
    <h1 id="login-success-title" className="mt-2 text-3xl font-medium tracking-[-0.035em] text-foreground sm:text-4xl">Проверьте почту</h1>
    <p className="mt-4 text-sm leading-6 text-muted-foreground">Ссылка для входа отправлена на{' '}
      <span className="font-medium text-foreground">{props.sentTo}</span>. Откройте письмо — после входа вы вернётесь в нужный раздел.</p>
    <button type="button" onClick={props.onChangeEmail}
      className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-[background-color,transform] hover:bg-brand-600 active:scale-[0.985]">
      <PencilLine className="h-4 w-4" strokeWidth={1.8} />Изменить email
    </button>
  </section>;
}
