import { BackArrow } from "@/src/shared";

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1">
        <p className="mb-8 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          О проекте / About us
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_auto] lg:gap-12">
          <div className="space-y-6">
            <h1 className="text-4xl font-normal leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Мы создаем новое поколение <br className="hidden sm:inline" />
              инструментов для карьерного <br className="hidden sm:inline" />
              роста в индустрии технологий.
            </h1>

            <p className="max-w-2xl pt-4 text-base font-light leading-relaxed tracking-tight text-muted-foreground md:text-lg">
              CV Service — это интеллектуальная платформа, разработанная для
              того, чтобы убрать хаос из процесса создания резюме. Мы
              анализируем лучшие практики рынка, помогая инженерам и
              специалистам кастомизировать свои навыки под требования
              современных IT-компаний.
            </p>

            <p className="max-w-2xl pt-4 text-base font-light leading-relaxed tracking-tight text-muted-foreground md:text-lg">
              В основе платформы — современные языковые модели, которые помогают
              анализировать резюме, находить скрытые сильные стороны и
              адаптировать содержание под конкретные вакансии. Мы не просто
              проверяем грамматику — мы помогаем упаковать твой опыт так, чтобы
              он звучал убедительно для работодателя.
            </p>

            <p className="max-w-2xl pt-4 text-base font-light leading-relaxed tracking-tight text-muted-foreground md:text-lg">
              Особое внимание мы уделяем ATS-фильтрам — автоматическим системам,
              которые используют рекрутеры для первичного отбора. Наши алгоритмы
              помогают адаптировать резюме так, чтобы оно проходило эти фильтры,
              сохраняя при этом естественный и читаемый язык.
            </p>
          </div>

          <div className="flex items-start justify-end pt-1">
            <BackArrow />
          </div>
        </div>
      </div>
    </div>
  );
}