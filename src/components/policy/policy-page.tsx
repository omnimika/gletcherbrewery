import { POLICY_PAGE } from "@/content/policy";

export function PolicyPageView() {
  const p = POLICY_PAGE;

  return (
    <article className="bg-gletcher-ice text-gletcher-navy">
      <div className="mx-auto max-w-[820px] px-6 py-12 sm:px-10 sm:py-16">
        <h1 className="font-display text-[clamp(1.5rem,3.5vw,2.5rem)] leading-tight font-extrabold tracking-wide">
          {p.title}
        </h1>
        <div className="mt-10 space-y-10">
          {p.sections.map((section) => (
            <section key={section.heading} aria-labelledby={section.heading}>
              <h2
                id={section.heading}
                className="font-display text-lg font-extrabold tracking-wide sm:text-xl"
              >
                {section.heading}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-gletcher-navy/85 sm:text-[0.95rem]">
                {section.paragraphs.map((para) => (
                  <p key={para.slice(0, 48)}>{para}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
