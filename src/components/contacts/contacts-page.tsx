import Image from "next/image";
import { ContactsForm } from "@/components/contacts/contacts-form";
import { CONTACTS_PAGE } from "@/content/contacts";

export function ContactsPageView() {
  const p = CONTACTS_PAGE;

  return (
    <div className="bg-gletcher-ice text-gletcher-navy">
      <section className="relative isolate overflow-hidden border-b border-gletcher-navy/10">
        <Image
          src={p.heroImage.src}
          alt=""
          fill
          priority
          className="object-cover object-bottom"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#213561]/90" aria-hidden />
        <div className="relative mx-auto flex min-h-[220px] max-w-[1100px] items-center justify-center px-6 py-16 sm:px-10">
          <h1 className="font-display rounded-full border-[5px] border-[#ff8462] px-8 py-3 text-center text-[clamp(1.75rem,5vw,3.75rem)] leading-none font-extrabold tracking-wide text-gletcher-white uppercase">
            {p.heroTitle}
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1100px] gap-10 px-6 py-12 sm:px-10 lg:grid-cols-2">
        <div className="border border-gletcher-navy bg-[#263354] p-6 text-gletcher-white sm:p-8">
          <h2 className="font-display text-2xl font-extrabold tracking-wide text-[#93cce6] uppercase">
            {p.companyName}
          </h2>
          <p className="mt-4 text-sm">{p.inn}</p>
          <p className="mt-2 text-sm leading-relaxed">{p.address}</p>

          <ul className="mt-8 space-y-5 text-sm">
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

          <ul className="mt-8 space-y-2 text-sm">
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

          <ul className="mt-8 space-y-2 text-sm">
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

        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-wide uppercase sm:text-3xl">
            {p.formTitle}
          </h2>
          <p className="mt-3 text-sm text-gletcher-navy/75 sm:text-base">
            {p.formLead}
          </p>
          <div className="mt-6">
            <ContactsForm />
          </div>
        </div>
      </section>
    </div>
  );
}
