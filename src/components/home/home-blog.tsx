import type { HomeBlogTeaser } from "@/content/home";

type HomeBlogProps = {
  title: string;
  items: HomeBlogTeaser[];
};

export function HomeBlog({ title, items }: HomeBlogProps) {
  return (
    <section className="border-t border-gletcher-navy/10 bg-gletcher-ice px-4 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-[1440px]">
        <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold tracking-wide text-gletcher-navy uppercase">
          {title}
        </h2>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                className="group flex h-full flex-col gap-3"
              >
                <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-gletcher-navy/55 uppercase">
                  {item.category}
                  {item.date ? (
                    <span className="ml-2 text-gletcher-navy/40">{item.date}</span>
                  ) : null}
                </p>
                <p className="font-display text-[clamp(1rem,1.8vw,1.2rem)] leading-snug font-extrabold tracking-wide text-gletcher-navy uppercase transition-colors group-hover:text-gletcher-red">
                  {item.title}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
