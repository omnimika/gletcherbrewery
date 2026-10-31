import Link from "next/link";

type LocaleSwitchProps = {
  locale?: "ru" | "en";
  className?: string;
};

export function LocaleSwitch({ locale = "ru", className = "" }: LocaleSwitchProps) {
  const ruActive = locale === "ru";
  return (
    <div
      className={`inline-flex items-center rounded-full border border-gletcher-navy/25 bg-gletcher-white/70 p-0.5 text-xs font-semibold tracking-wide ${className}`}
      role="group"
      aria-label="Язык"
    >
      <Link
        href="/"
        className={`rounded-full px-2.5 py-1 transition-colors ${
          ruActive
            ? "bg-gletcher-navy text-gletcher-white"
            : "text-gletcher-navy/70 hover:text-gletcher-navy"
        }`}
        aria-current={ruActive ? "page" : undefined}
      >
        RU
      </Link>
      <Link
        href="/en"
        className={`rounded-full px-2.5 py-1 transition-colors ${
          !ruActive
            ? "bg-gletcher-navy text-gletcher-white"
            : "text-gletcher-navy/70 hover:text-gletcher-navy"
        }`}
        aria-current={!ruActive ? "page" : undefined}
      >
        EN
      </Link>
    </div>
  );
}
