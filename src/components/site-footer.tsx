import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-gletcher-navy/10 bg-gletcher-ice">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl text-gletcher-navy">Gletcher</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-gletcher-navy/75">
            Пивоварня с 2011 года. Классика, крафт и ограниченные серии.
          </p>
          <p className="mt-6 text-xs font-semibold tracking-widest text-gletcher-navy uppercase">
            18+ Пейте культурно!
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold tracking-wide text-gletcher-navy uppercase">
            Контакты
          </p>
          <a
            href="mailto:info@gletcherbrewery.com"
            className="block text-gletcher-navy/80 underline-offset-4 hover:underline"
          >
            info@gletcherbrewery.com
          </a>
          <a
            href="tel:+74959892414"
            className="block text-gletcher-navy/80 underline-offset-4 hover:underline"
          >
            +7 (495) 989-24-14
          </a>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold tracking-wide text-gletcher-navy uppercase">
            Документы
          </p>
          <Link
            href="/policy"
            className="block text-gletcher-navy/80 underline-offset-4 hover:underline"
          >
            Политика конфиденциальности
          </Link>
          <a
            href="https://yandex.ru/maps/"
            className="block text-gletcher-navy/80 underline-offset-4 hover:underline"
            rel="noreferrer"
            target="_blank"
          >
            Рейтинг организации в Яндексе
          </a>
        </div>
      </div>
    </footer>
  );
}
