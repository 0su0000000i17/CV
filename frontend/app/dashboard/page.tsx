export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-[1200px]">
        <h1 className="text-4xl font-normal tracking-tight">
          Личный кабинет
        </h1>

        <p className="mt-4 text-neutral-400">
          Вы вошли в аккаунт. Здесь скоро будут ваши резюме, анализ и адаптация под вакансии.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="text-xl">Загрузить резюме</h2>
            <p className="mt-3 text-sm text-neutral-400">
              PDF или DOCX файл для анализа.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="text-xl">Оценить резюме</h2>
            <p className="mt-3 text-sm text-neutral-400">
              Проверка структуры, опыта и формулировок.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="text-xl">Адаптировать под вакансию</h2>
            <p className="mt-3 text-sm text-neutral-400">
              Вставьте ссылку или текст вакансии.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}