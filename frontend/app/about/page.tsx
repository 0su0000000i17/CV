import { BackArrow } from "@/src/shared";

export default function AboutPage() {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-8">
          О проекте / About us
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto] gap-6 lg:gap-12">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-[1.1] text-foreground">
              Мы создаем новое поколение <br className="hidden sm:inline" />
              инструментов для карьерного <br className="hidden sm:inline" />
              роста в индустрии технологий.
            </h1>

            <p className="text-base md:text-lg text-muted-foreground font-light tracking-tight max-w-2xl leading-relaxed pt-4">
              CV Service — это интеллектуальная платформа, разработанная для того, чтобы убрать хаос из процесса создания резюме. Мы анализируем лучшие практики рынка, помогая инженерам и специалистам кастомизировать свои навыки под требования современных IT-компаний.
            </p>
          </div>

          <div className="flex justify-end items-start pt-1">
            <BackArrow />
          </div>
        </div>
      </div>
    </div>
  );
}
