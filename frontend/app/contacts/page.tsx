import Image from "next/image";
import { BackArrow } from "@/src/shared";
import { TelegramLogo } from "@/src/shared";
import { GmailLogo } from "@/src/shared";

export default function ContactsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1">
        <p className="mb-8 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Контакты / Contacts
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_auto] lg:gap-12">
          <div className="space-y-6">
            <h1 className="text-4xl font-normal leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Свяжитесь с нами
            </h1>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <Image
                  src={TelegramLogo}
                  alt="Telegram"
                  className="h-7 w-7"
                />

                <span className="text-lg text-muted-foreground">/</span>

                <a
                  href="https://t.me/cvprophet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-light text-muted-foreground transition-colors hover:text-foreground"
                >
                  @cvprophet
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Image
                  src={GmailLogo}
                  alt="Gmail"
                  className="h-6 w-6"
                />

                <span className="text-lg text-muted-foreground">/</span>

                <a
                  href="mailto:support@cv-profit.ru"
                  className="text-lg font-light text-muted-foreground transition-colors hover:text-foreground"
                >
                  support@cv-profit.ru
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-end pt-1">
            <BackArrow />
          </div>
        </div>
      </div>
    </div>
  );
}