'use client';

import { LoginFormCard } from './login-form-card';
import { LoginSuccessCard } from './login-success-card';
import { useLoginFlow } from './use-login-flow';
import styles from './login.module.css';

export default function LoginPage() {
  const flow = useLoginFlow();
  const motionClass = flow.motion === 'entering' ? styles.cardEntering
    : flow.motion === 'leaving' ? styles.cardLeaving : '';
  return <div className="flex flex-1 items-center justify-center py-8 sm:py-14">
    {flow.screen === 'success'
      ? <LoginSuccessCard sentTo={flow.sentTo} motionClass={motionClass} onChangeEmail={flow.showForm} />
      : <LoginFormCard flow={flow} motionClass={motionClass} />}
  </div>;
}
