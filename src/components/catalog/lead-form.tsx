"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

type Status = "idle" | "ok" | "error";

export function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (!form.reportValidity()) {
      event.preventDefault();
      setStatus("error");
      return;
    }
    event.preventDefault();
    // Stub until server handler + consent flow (stage 4+)
    setStatus("ok");
    form.reset();
  };

  return (
    <section className="border-t border-gletcher-navy/10 bg-gletcher-ice">
      <div className="mx-auto grid max-w-[1100px] gap-10 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:items-end">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-gletcher-navy/70 uppercase">
            Есть идеи?
          </p>
          <h2 className="font-display mt-3 text-4xl text-gletcher-navy sm:text-5xl">
            Напишите нам!
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-gletcher-navy/75 sm:text-base">
            Хотите вернуть полюбившийся сорт или предложить свой рецепт для
            ограниченной серии?
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="sr-only">Имя</span>
            <input
              name="name"
              placeholder="Имя"
              autoComplete="name"
              className="w-full border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy"
              required
            />
          </label>
          <label className="block">
            <span className="sr-only">Email</span>
            <input
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="w-full border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy"
              required
            />
          </label>
          <label className="block">
            <span className="sr-only">Комментарий</span>
            <textarea
              name="comment"
              placeholder="Комментарий"
              rows={4}
              className="w-full resize-y border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy"
            />
          </label>
          <Button type="submit" variant="secondary" className="w-full sm:w-auto">
            Отправить
          </Button>
          {status === "ok" ? (
            <p className="text-sm text-gletcher-navy" role="status">
              Спасибо! (заглушка — отправка на сервер ещё не подключена)
            </p>
          ) : null}
          {status === "error" ? (
            <p className="text-sm text-gletcher-red" role="alert">
              Проверьте имя и корректный email.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
