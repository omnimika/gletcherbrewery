import { Link } from "@/i18n/navigation";
import { PartnershipForm } from "@/components/partnership/partnership-form";
import type { PartnershipCopy } from "@/content/partnership";

type PartnershipPageViewProps = {
  copy: PartnershipCopy;
};

export function PartnershipPageView({ copy }: PartnershipPageViewProps) {
  return (
    <div className="bg-gletcher-ice text-gletcher-navy">
      <section className="mx-auto w-full max-w-[1100px] px-6 pt-10 pb-8 sm:px-10 sm:pt-14">
        <h1 className="font-display animate-hero-rise text-[clamp(2rem,5.5vw,3.75rem)] leading-[0.95] font-extrabold tracking-wide uppercase">
          {copy.heroTitle}
        </h1>
        <p
          className="animate-hero-rise mt-5 max-w-3xl text-sm leading-relaxed text-gletcher-navy/80 sm:text-base"
          style={{ animationDelay: "60ms" }}
        >
          {copy.lead}
        </p>
        {copy.leadAccent ? (
          <p
            className="animate-hero-rise mt-4 max-w-3xl text-sm leading-relaxed text-gletcher-navy/80 sm:text-base"
            style={{ animationDelay: "100ms" }}
          >
            <span className="text-gletcher-red">{copy.leadAccent}</span>
          </p>
        ) : null}
        {copy.discount ? (
          <a
            href={copy.discount.href}
            className="animate-hero-rise mt-6 inline-flex items-center gap-3 border border-gletcher-red px-4 py-2 text-sm font-extrabold tracking-wide text-gletcher-red uppercase transition-colors hover:bg-gletcher-red hover:text-gletcher-white"
            style={{ animationDelay: "140ms" }}
          >
            {copy.discount.label}
          </a>
        ) : null}
      </section>

      {copy.pillars.length > 0 ? (
        <section
          aria-label="Benefits"
          className="mx-auto grid w-full max-w-[1100px] gap-8 px-6 pb-12 sm:px-10 lg:grid-cols-3"
        >
          {copy.pillars.map((pillar) => (
            <div key={pillar.title}>
              <h2 className="font-display text-xl font-extrabold tracking-wide text-gletcher-red uppercase sm:text-2xl">
                {pillar.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gletcher-navy/80">
                {pillar.body}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      {copy.materials.length > 0 ? (
        <section
          aria-label={copy.materialsIntro}
          className="border-y border-gletcher-navy/10 bg-gletcher-ice"
        >
          <div className="mx-auto w-full max-w-[1100px] px-6 py-10 sm:px-10 sm:py-12">
            <p className="font-display max-w-3xl text-2xl leading-tight font-extrabold tracking-wide uppercase sm:text-3xl">
              {copy.materialsIntro}
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {copy.materials.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full min-h-[140px] flex-col justify-between border border-gletcher-navy bg-gletcher-ice p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-gletcher-red"
                  >
                    <div>
                      <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-none font-light tracking-wide uppercase">
                        {item.title}
                      </h2>
                      <p className="mt-3 text-sm text-gletcher-navy/75">
                        {item.description}
                      </p>
                    </div>
                    <span
                      className="font-display mt-5 inline-flex h-10 w-fit items-center justify-center px-4 text-xs font-extrabold tracking-wide text-white uppercase"
                      style={{
                        background:
                          "radial-gradient(circle at center, rgba(246,112,116,1) 0%, rgba(254,36,42,1) 48%, rgba(223,30,35,1) 100%)",
                      }}
                    >
                      {copy.downloadLabel}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid w-full max-w-[1100px] gap-10 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="font-display text-3xl font-extrabold tracking-wide uppercase sm:text-4xl">
            {copy.formTitle}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gletcher-navy/75">
            {copy.leadAccent ?? copy.lead}
          </p>
          <Link
            href={copy.catalogHref}
            className="mt-8 inline-flex border border-gletcher-navy px-5 py-3 text-sm font-extrabold tracking-wide uppercase transition-colors hover:border-gletcher-red hover:bg-gletcher-red hover:text-gletcher-white"
          >
            {copy.catalogCta}
          </Link>
        </div>
        <PartnershipForm copy={copy} />
      </section>
    </div>
  );
}
