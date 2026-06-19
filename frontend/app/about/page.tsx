import { Header } from "@/src/widgets";
import { BackArrow } from "@/src/shared";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black selection:bg-white selection:text-black">
      {/* Шапка сайта */}
      <Header />

      <main className="flex-1 mx-auto w-full max-w-[1400px] px-6 md:px-12 py-16 md:py-24 flex flex-col justify-between">
        
        {/* Главный текстовый блок страницы About */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-start gap-12 border-b border-neutral-800 pb-20">
          
          <div className="space-y-8 max-w-4xl">
            {/* Хлебные крошки / Категория */}
            <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
              О проекте / About us
            </p>

            {/* Большой журнальный заголовок-манифест */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-[1.1] text-neutral-100">
              Мы создаем новое поколение <br className="hidden sm:inline" />
              инструментов для карьерного <br className="hidden sm:inline" />
              роста в индустрии технологий.
            </h1>

            {/* Дополнительное описание мелким шрифтом */}
            <p className="text-base md:text-lg text-neutral-400 font-light tracking-tight max-w-2xl leading-relaxed pt-4">
              CV Service — это интеллектуальная платформа, разработанная для того, чтобы убрать хаос из процесса создания резюме. Мы анализируем лучшие практики рынка, помогая инженерам и специалистам кастомизировать свои навыки под требования современных IT-компаний.
            </p>
          </div>

          {/* Кнопка "Назад" в виде стрелки */}
          <BackArrow />
        </div>

        {/* Футер-заглушка с версией или копирайтом */}
        <div className="pt-8 flex justify-between items-center text-xs uppercase tracking-widest text-neutral-500 font-medium">
          <span>v1.0.0</span>
          <span>© 2026 CV PROHPET</span>
        </div>

      </main>
    </div>
  );
}