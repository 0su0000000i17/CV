import { BackArrow } from "@/src/shared";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-8">
          Главная / Home
        </p>

        {/* Грид: заголовок + стрелка */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto] gap-6 lg:gap-12">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.1] text-foreground">
              Интеллектуальный сервис <br className="hidden sm:inline" />
              для создания, анализа <br className="hidden sm:inline" />
              и кастомизации твоего <br className="hidden sm:inline" />
              <span className="text-foreground font-medium">IT-резюме.</span>
            </h1>
          </div>

          <div className="flex justify-end items-start pt-1">
            <BackArrow />
          </div>
        </div>
      </div>

      {/* Полоска — только на главной */}
      {/* <div className="border-t border-border pt-8 h-[72px] flex items-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          Разделы сервиса
        </p>
      </div> */}
    </div>
  );
}













// import { BackArrow } from "@/src/shared";

// export default function Home() {
//   return (
//     <>
//       <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-8">
//         Главная / Home
//       </p>

//       <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto] gap-12">
//         <div className="space-y-6">
//           <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.1] text-foreground">
//             Интеллектуальный сервис <br className="hidden sm:inline" />
//             для создания, анализа <br className="hidden sm:inline" />
//             и кастомизации твоего <br className="hidden sm:inline" />
//             <span className="text-foreground font-medium">IT-резюме.</span>
//           </h1>
//         </div>

//         <div className="flex justify-end pt-1">
//           <BackArrow />
//         </div>
//       </div>
//     </>
//   );
// }