import { LogOut, ShieldAlert, Trash2 } from 'lucide-react';

export function AccountSettingsCards(props: {
  onLogout: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-2xl border border-white/10 bg-white/[0.018] p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5"><ShieldAlert className="h-4 w-4 text-white/55" /></div>
          <div className="min-w-0 flex-1"><h2 className="text-lg font-medium text-foreground">Сессия</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Выход завершит текущую сессию только на этом устройстве.</p></div>
        </div>
        <button type="button" onClick={props.onLogout}
          className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium text-white/60 transition-[background-color,border-color,color] hover:border-white/20 hover:bg-white/[0.035] hover:text-white">
          <LogOut className="h-4 w-4" />Выйти из аккаунта
        </button>
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.018] p-5">
        <p className="text-sm font-medium text-foreground">Безопасность данных</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Резюме, профиль и данные личного кабинета хранятся в вашем аккаунте. Если аккаунт удалить, восстановить эти данные будет нельзя.</p>
      </section>
      <section className="rounded-2xl border border-red-500/20 bg-red-500/[0.035] p-5 md:col-span-2">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-red-500/10 p-2.5"><Trash2 className="h-4 w-4 text-red-500" /></div>
          <div className="min-w-0 flex-1"><h2 className="text-lg font-medium text-foreground">Удаление аккаунта</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Удалим профиль, загруженные резюме и сохранённые данные личного кабинета. Действие нельзя отменить.</p></div>
        </div>
        <button type="button" onClick={props.onDelete}
          className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 text-sm font-medium text-red-200 transition-[background-color,border-color] hover:border-red-500/40 hover:bg-red-500/15">
          <Trash2 className="h-4 w-4" />Удалить аккаунт
        </button>
      </section>
    </div>
  );
}
