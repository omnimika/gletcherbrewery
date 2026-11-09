"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import {
  CompositionGrid,
  CompositionPanel,
  Container,
  SectionFrame,
} from "@/components/layout";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import {
  CATALOG_LEAD_FORM_ID,
  POLICY_SITE_VERSION,
} from "@/content/forms/form-ids";
import {
  clearIdempotencyKey,
  ensureIdempotencyKey,
  postFormSubmission,
} from "@/lib/forms/client-submit";

type Status = "idle" | "pending" | "accepted" | "unavailable" | "error";

export function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const t = useTranslations("leadForm");
  const locale = useLocale();
  const pathname = usePathname();
  const formDomId = useId();
  const storageKey = `catalog-lead-idempotency:${formDomId}`;
  const submittingRef = useRef(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (!form.reportValidity()) {
      setStatus("error");
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStatus("pending");

    const data = new FormData(form);
    const fields = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      comment: String(data.get("comment") ?? ""),
    };
    const idempotencyKey = ensureIdempotencyKey(storageKey);

    try {
      const result = await postFormSubmission({
        schemaVersion: "catalog-lead-v1",
        formId: CATALOG_LEAD_FORM_ID,
        locale,
        sourcePath: pathname || "/beer",
        placement: "catalog_lead",
        idempotencyKey,
        fields,
        consent: { accepted: true, policyVersion: POLICY_SITE_VERSION },
      });

      if (result.ok) {
        setSubmissionId(result.submissionId);
        setStatus("accepted");
        clearIdempotencyKey(storageKey);
        return;
      }
      if (result.status === 503 || result.status === 0) {
        setStatus("unavailable");
        return;
      }
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  };

  const locked = status === "pending" || status === "accepted";

  return (
    <SectionFrame
      id="lead"
      mode="content"
      tone="ice"
      snap
      aria-labelledby="lead-title"
      className="border-t border-gletcher-navy/10"
    >
      <Container wide className="max-w-[1100px]">
        <CompositionGrid preset="halves-x">
          <CompositionPanel>
            <Reveal>
              <p className="text-sm font-semibold tracking-[0.2em] text-gletcher-navy/70 uppercase">
                {t("eyebrow")}
              </p>
              <h2
                id="lead-title"
                className="font-display mt-3 text-4xl text-gletcher-navy sm:text-5xl"
              >
                {t("title")}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-gletcher-navy/75 sm:text-base">
                {t("lead")}
              </p>
            </Reveal>
          </CompositionPanel>

          <CompositionPanel>
            <Reveal>
              <form
                className="space-y-4"
                onSubmit={onSubmit}
                noValidate
                aria-busy={status === "pending"}
              >
                <label className="block">
                  <span className="sr-only">{t("name")}</span>
                  <input
                    name="name"
                    placeholder={t("name")}
                    autoComplete="name"
                    className="w-full border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy disabled:opacity-70"
                    required
                    disabled={locked}
                  />
                </label>
                <label className="block">
                  <span className="sr-only">{t("email")}</span>
                  <input
                    name="email"
                    type="email"
                    placeholder={t("email")}
                    autoComplete="email"
                    className="w-full border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy disabled:opacity-70"
                    required
                    disabled={locked}
                  />
                </label>
                <label className="block">
                  <span className="sr-only">{t("comment")}</span>
                  <textarea
                    name="comment"
                    placeholder={t("comment")}
                    rows={4}
                    disabled={locked}
                    className="w-full resize-y border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy disabled:opacity-70"
                  />
                </label>
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  disabled={locked}
                >
                  {status === "pending" ? "…" : t("submit")}
                </Button>
                <p className="text-xs text-gletcher-navy/60">{t("note")}</p>
                {status === "accepted" && submissionId ? (
                  <p className="text-sm text-gletcher-navy" role="status">
                    OK · <span className="font-mono text-xs">{submissionId}</span>
                  </p>
                ) : null}
                {status === "unavailable" ? (
                  <p className="text-sm text-gletcher-navy" role="status">
                    {t("unavailable")}{" "}
                    <a
                      href="mailto:info@gletcherbrewery.com"
                      className="underline underline-offset-2"
                    >
                      info@gletcherbrewery.com
                    </a>
                  </p>
                ) : null}
                {status === "error" ? (
                  <p className="text-sm text-gletcher-red" role="alert">
                    {t("error")}
                  </p>
                ) : null}
              </form>
            </Reveal>
          </CompositionPanel>
        </CompositionGrid>
      </Container>
    </SectionFrame>
  );
}
