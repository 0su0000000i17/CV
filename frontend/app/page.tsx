import { Header } from "@/src/widgets";
import { BackArrow } from "@/src/shared";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black selection:bg-white selection:text-black">
      {/* Подключаем нашу шапку */}
      <Header />

      <main className="flex-1 mx-auto w-full max-w-[1400px] px-6 md:px-12 py-16 md:py-24 flex flex-col justify-between">
        {/* Главный блок с текстом и стрелкой */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-start gap-12 border-b border-neutral-800 pb-20">
          {/* Текст заголовка в стиле Frame & Form */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.1] max-w-[4xl] text-neutral-100">
            Интеллектуальный сервис <br className="hidden sm:inline" />
            для создания, анализа <br className="hidden sm:inline" />
            и кастомизации твоего <br className="hidden sm:inline" />
            <span className="text-white font-medium">IT-резюме.</span>
          </h1>

          <BackArrow />
        </div>

        {/* Нижний технический блок (заглушка "Our Work" из референса) */}
        <div className="pt-8">
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
            Разделы сервиса
          </p>
        </div>
      </main>
    </div>
  );
}
