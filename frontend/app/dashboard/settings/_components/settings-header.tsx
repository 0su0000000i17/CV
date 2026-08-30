import { Settings2, SlidersHorizontal } from 'lucide-react';

export function SettingsHeader() {
  return (
    <header className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.17em] text-white/35">
          <Settings2 className="h-3.5 w-3.5" strokeWidth={1.7} />
          Аккаунт
        </div>
        <h1 className="mt-3 text-3xl font-medium tracking-[-0.045em] text-white sm:text-4xl">
          Настройки
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
          Личные данные, доступ к сервису и безопасность — без лишних экранов.
        </p>
      </div>

      <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-white/45">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Все изменения под вашим контролем
      </div>
    </header>
  );
}
