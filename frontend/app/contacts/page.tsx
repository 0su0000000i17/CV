import Image from "next/image";
import { BackArrow } from "@/src/shared";
import { TelegramLogo } from "@/src/shared";
import { GmailLogo } from "@/src/shared";

export default function ContactsPage() {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-8">
          Контакты / Contacts
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto] gap-6 lg:gap-12">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-[1.1] text-foreground">
              Свяжитесь с нами
            </h1>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <Image src={TelegramLogo} alt="Telegram" className="w-7 h-7" />
                <span className="text-muted-foreground text-lg">/</span>
                <a
                  href="https://t.me/cvprophet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-muted-foreground hover:text-foreground transition-colors font-light"
                >
                  @cvprophet
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Image src={GmailLogo} alt="Gmail" className="w-6 h-6" />
                <span className="text-muted-foreground text-lg">/</span>
                <a
                  href="mailto:support@cv-profit.ru"
                  className="text-lg text-muted-foreground hover:text-foreground transition-colors font-light"
                >
                  support@cv-profit.ru
                </a>
              </div>
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
