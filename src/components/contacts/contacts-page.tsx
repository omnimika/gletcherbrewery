import Image from "next/image";
import type { ReactNode } from "react";
import { ContactsForm } from "@/components/contacts/contacts-form";
import {
  CompositionGrid,
  CompositionPanel,
  SectionFrame,
} from "@/components/layout";
import { DocumentProximitySnap } from "@/components/motion/document-proximity-snap";
import { Reveal } from "@/components/motion/reveal";
import { CONTACTS_PAGE } from "@/content/contacts";
import { CONTACTS_SECTIONS } from "@/content/contacts-sections";

function B2bMeasure({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-[var(--page-gutter)]">
      {children}
    </div>
  );
}

export function ContactsPageView() {
  const p = CONTACTS_PAGE;
  const nav = CONTACTS_SECTIONS.filter((s) => s.id !== "hero");

  return (
    <div className="bg-gletcher-ice text-gletcher-navy">
      <DocumentProximitySnap />

      <SectionFrame
        id="hero"
        mode="banner"
        snap
        aria-labelledby="contacts-hero-title"
        className="relative isolate overflow-hidden border-b border-gletcher-navy/10 !py-0"
      >
        <Image
          src={p.heroImage.src}
          alt=""
          fill
          priority
          className="object-cover object-bottom"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gletcher-deep/90" aria-hidden />
        <B2bMeasure>
          <div className="relative flex min-h-[220px] items-center justify-center py-16">
            <h1
              id="contacts-hero-title"
              className="font-display rounded-full border-[5px] border-[#ff8462] px-8 py-3 text-center text-[clamp(1.75rem,5vw,3.75rem)] leading-none font-extrabold tracking-wide text-gletcher-white uppercase"
            >
              {p.heroTitle}
            </h1>
          </div>
        </B2bMeasure>
      </SectionFrame>

      <SectionFrame
        id="details"
        mode="content"
        snap
        aria-labelledby="contacts-details-heading"
      >
        <B2bMeasure>
          <nav
            aria-label="Разделы страницы контактов"
            className="mb-8 flex flex-wrap gap-2"
          >
            {nav.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="type-caption rounded-[var(--radius-pill)] border border-gletcher-navy/25 px-3 py-1.5 hover:border-gletcher-navy"
              >
                {s.labelRu}
              </a>
            ))}
          </nav>

          <CompositionGrid preset="halves-x" className="items-start">
            <CompositionPanel>
              <Reveal>
                <div className="rounded-[var(--radius-card)] border border-gletcher-navy bg-[#263354] p-6 text-gletcher-white sm:p-8">
                  <h2
                    id="contacts-details-heading"
                    className="type-heading-card text-gletcher-sky"
                  >
                    {p.companyName}
                  </h2>
                  <p className="type-body-small mt-4">{p.inn}</p>
                  <p className="type-body-small mt-2 leading-relaxed">
                    {p.address}
                  </p>

                  <ul className="mt-8 space-y-5 type-body-small">
                    {p.people.map((person) => (
                      <li key={person.phone}>
                        <p className="font-extrabold tracking-wide uppercase">
                          {person.role}
                        </p>
                        <a
                          href={person.phoneHref}
                          className="mt-1 inline-block text-[#ff8462] hover:underline"
                        >
                          {person.phone}
                        </a>
                        <p className="mt-1">{person.name}</p>
                      </li>
                    ))}
                    {p.phones.map((item) => (
                      <li key={item.href}>
                        <p className="font-extrabold tracking-wide uppercase">
                          {item.label}
                        </p>
                        <a
                          href={item.href}
                          className="mt-1 inline-block text-[#ff8462] hover:underline"
                        >
                          {item.phone}
                        </a>
                      </li>
                    ))}
                  </ul>

                  <ul className="mt-8 space-y-2 type-body-small">
                    {p.emails.map((email) => (
                      <li key={email.address}>
                        <a
                          href={email.href}
                          className="text-[#ff8462] hover:underline"
                        >
                          {email.address}
                        </a>
                      </li>
                    ))}
                  </ul>

                  <ul className="mt-8 space-y-2 type-body-small">
                    {p.travel.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-[#ff8462]/70 underline-offset-2 hover:decoration-[#ff8462]"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </CompositionPanel>

            <CompositionPanel id="form">
              <Reveal>
                <h2
                  id="contacts-form-heading"
                  className="type-display-section text-gletcher-navy"
                >
                  {p.formTitle}
                </h2>
                <p className="type-body mt-3 text-gletcher-navy/75">
                  {p.formLead}
                </p>
                <div className="mt-6">
                  <ContactsForm />
                </div>
              </Reveal>
            </CompositionPanel>
          </CompositionGrid>
        </B2bMeasure>
      </SectionFrame>
    </div>
  );
}
