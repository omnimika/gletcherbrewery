import { ReadingContainer, SectionFrame } from "@/components/layout";
import { SHOPPING_RULES_PAGE } from "@/content/shopping-rules";

/**
 * Legal reading page — content mode + ReadingContainer (ADR 0010).
 * Decorative source ZB login/signup CTAs deferred with `/shop` / members.
 */
export function ShoppingRulesPageView() {
  const p = SHOPPING_RULES_PAGE;

  return (
    <article className="bg-gletcher-ice text-gletcher-navy">
      <SectionFrame
        id="shopping-rules"
        mode="content"
        tone="ice"
        aria-labelledby="shopping-rules-title"
      >
        <ReadingContainer>
          <p className="text-xs font-semibold tracking-[0.2em] text-gletcher-navy/60 uppercase">
            {p.pageTitle}
          </p>
          <h1
            id="shopping-rules-title"
            className="font-display mt-3 text-[clamp(1.5rem,3.5vw,2.5rem)] leading-tight font-extrabold tracking-wide"
          >
            {p.documentTitle}
          </h1>

          <div className="mt-8 space-y-3 text-sm leading-relaxed text-gletcher-navy/85 sm:text-[0.95rem]">
            {p.definitions.map((para) => (
              <p key={para.slice(0, 48)}>{para}</p>
            ))}
          </div>

          <div className="mt-10 space-y-10">
            {p.sections.map((section) => (
              <section
                key={section.heading}
                aria-labelledby={section.heading}
              >
                <h2
                  id={section.heading}
                  className="font-display text-lg font-extrabold tracking-wide sm:text-xl"
                >
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-gletcher-navy/85 sm:text-[0.95rem]">
                  {section.paragraphs.map((para) =>
                    para.startsWith("- ") ? (
                      <p key={para} className="pl-4">
                        {para}
                      </p>
                    ) : (
                      <p key={para.slice(0, 48)}>{para}</p>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>
        </ReadingContainer>
      </SectionFrame>
    </article>
  );
}
