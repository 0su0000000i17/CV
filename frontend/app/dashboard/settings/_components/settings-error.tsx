export function SettingsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-[720px] rounded-2xl border border-red-500/25 bg-red-500/[0.035] p-6">
      <p className="text-sm font-medium text-white">Не удалось открыть настройки</p>
      <p className="mt-2 text-sm leading-6 text-white/45">
        Проверьте соединение и попробуйте загрузить профиль ещё раз.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-white/12 px-4 text-sm font-medium text-white transition-colors hover:bg-white/[0.05]"
      >
        Повторить
      </button>
    </div>
  );
}
