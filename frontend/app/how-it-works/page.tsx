import { BackArrow } from "@/src/shared";

export default function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      title: "Загрузи резюме",
      description:
        "Загрузи своё резюме в формате PDF, DOCX или просто заполни анкету на сайте. Мы поддерживаем все популярные форматы.",
    },
    {
      number: "02",
      title: "ИИ проанализирует твои навыки",
      description:
        "Нейросеть оценит твой опыт, найдет сильные стороны и подскажет, что можно улучшить. Анализ занимает меньше минуты.",
    },
    {
      number: "03",
      title: "Найди идеальные вакансии",
      description:
        "Платформа подберет релевантные вакансии с hh.ru на основе твоего профиля. Ты получишь только те предложения, которые подходят именно тебе.",
    },
    {
      number: "04",
      title: "Откликайся и получай работу!",
      description:
        "Откликайся в один клик, отслеживай статус заявок и получай предложения от ведущих IT-компаний.",
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-8">
          Как это работает / How it works
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto] gap-6 lg:gap-12">
          <div className="space-y-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-[1.1] text-foreground">
              Всего 4 шага <br className="hidden sm:inline" />
              к твоей новой <br className="hidden sm:inline" />
              <span className="text-foreground font-medium">работе мечты</span>
            </h1>

            <div className="space-y-8">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-border flex items-center justify-center text-sm font-medium text-muted-foreground">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-medium text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base mt-1 max-w-2xl">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end items-start pt-1">
            <BackArrow />
          </div>
        </div>
      </div>
    </div>
  );
}