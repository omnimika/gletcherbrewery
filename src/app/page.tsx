import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col bg-stone-50 text-stone-950">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-6 py-20 sm:px-10">
        <div className="max-w-2xl">
          <p className="mb-6 text-sm font-medium tracking-widest text-stone-600 uppercase">
            Пивоварня Глетчер
          </p>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
            Gletcher Brewery
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-stone-600">
            Скоро здесь появится обновлённый сайт пивоварни.
          </p>
        </div>
      </main>
    </div>
  );
}
