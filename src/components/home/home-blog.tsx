import { HomeWindowStage } from "@/components/home/home-window-stage";
import type { HomeBlogTeaser } from "@/content/home";

type HomeBlogProps = {
  title: string;
  items: HomeBlogTeaser[];
};

export function HomeBlog({ title, items }: HomeBlogProps) {
  return (
    <section className="border-t border-gletcher-navy/10 bg-gletcher-ice">
      <HomeWindowStage>
        <div className="px-5 py-14 @[640px]:px-8 @[960px]:py-16 @[1200px]:px-10 @[1200px]:py-20">
          <h2 className="font-display text-[28px] font-extrabold tracking-wide text-gletcher-navy uppercase @[960px]:text-[36px] @[1200px]:text-[44px]">
            {title}
          </h2>
          <ul className="mt-10 grid grid-cols-1 gap-8 @[640px]:grid-cols-2 @[960px]:grid-cols-4">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className="group flex h-full flex-col gap-3"
                >
                  <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-gletcher-navy/55 uppercase">
                    {item.category}
                    {item.date ? (
                      <span className="ml-2 text-gletcher-navy/40">
                        {item.date}
                      </span>
                    ) : null}
                  </p>
                  <p className="font-display text-[16px] leading-snug font-extrabold tracking-wide text-gletcher-navy uppercase transition-colors group-hover:text-gletcher-red @[1200px]:text-[19px]">
                    {item.title}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </HomeWindowStage>
    </section>
  );
}
