import { BackArrow } from '@/src/shared';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1">
        <p className="mb-8 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Главная / Home
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_auto] lg:gap-12">
          <div className="space-y-6">
            <h1 className="text-4xl font-normal leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Интеллектуальный сервис <br className="hidden sm:inline" />
              для создания, анализа <br className="hidden sm:inline" />
              и кастомизации твоего <br className="hidden sm:inline" />
              <span className="font-medium text-foreground">IT-резюме.</span>
            </h1>
          </div>

          <div className="flex items-start justify-end pt-1">
            <BackArrow />
          </div>
        </div>
      </div>
    </div>
  );
}
