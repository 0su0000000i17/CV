import Link from "next/link";
import Image from "next/image";
import { Header } from "@/src/widgets";
import { TelegramLogo } from "@/src/shared";
import { GmailLogo } from "@/src/shared";
import { BackArrow } from "@/src/shared";

export default function ContactsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black selection:bg-white selection:text-black">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-[1400px] px-6 md:px-12 py-16 md:py-24">
        
        <div className="border-b border-neutral-800 pb-20">
          {/* Хлебные крошки */}
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium mb-8">
            Контакты / Contacts
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto] gap-12">
            {/* Левая часть: заголовок и контакты */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-[1.1] text-neutral-100">
                Свяжитесь с нами
              </h1>
              
              {/* Контакты в колонку */}
              <div className="space-y-3 pt-4">
                {/* Telegram */}
                <div className="flex items-center gap-3">
                  <Link href="/" className="hover:opacity-80 transition-opacity">
                    <Image 
                      src={TelegramLogo} 
                      alt="CV Profit" 
                      className="w-7 h-7"
                    />
                  </Link>
                  <span className="text-neutral-700 text-lg">/</span>
                  <a 
                    href="https://t.me/cvprophet" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg text-neutral-400 hover:text-neutral-100 transition-colors font-light"
                  >
                    @cvprophet
                  </a>
                </div>

                {/* Gmail */}
                <div className="flex items-center gap-3">
                  <Image 
                    src={GmailLogo} 
                    alt="Gmail" 
                    className="w-6 h-6"
                  />
                  <span className="text-neutral-700 text-lg">/</span>
                  <a 
                    href="mailto:support@cv-profit.ru" 
                    className="text-lg text-neutral-400 hover:text-neutral-100 transition-colors font-light"
                  >
                    support@cv-profit.ru
                  </a>
                </div>
              </div>
            </div>

            {/* Правая часть: стрелка "Назад" */}
          <BackArrow /> 
          </div>
        </div>

        <div className="pt-8 flex justify-between items-center text-xs uppercase tracking-widest text-neutral-500 font-medium">
          <span>v1.0.0</span>
          <span>© 2026 CV PROHPET</span>
        </div>

      </main>
    </div>
  );
}