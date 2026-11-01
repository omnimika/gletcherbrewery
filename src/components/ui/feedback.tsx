import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "navy" | "red" | "new" | "muted";
  className?: string;
};

const badgeTones = {
  navy: "border-gletcher-navy bg-gletcher-navy text-gletcher-white",
  red: "border-gletcher-red bg-gletcher-ice text-gletcher-red",
  new: "border-gletcher-navy bg-gletcher-new text-gletcher-navy",
  muted: "border-gletcher-navy/30 bg-gletcher-frost text-gletcher-navy",
};

export function Badge({
  children,
  tone = "muted",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`type-caption inline-flex items-center rounded-[var(--radius-pill)] border px-2.5 py-0.5 font-bold tracking-wide uppercase ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

type StatusProps = {
  children: ReactNode;
  tone?: "info" | "error" | "neutral";
  className?: string;
  role?: "status" | "alert";
};

export function FormStatus({
  children,
  tone = "neutral",
  className = "",
  role = "status",
}: StatusProps) {
  const tones = {
    info: "border-gletcher-sky/60 bg-gletcher-sky/15 text-gletcher-navy",
    error: "border-gletcher-action/50 bg-gletcher-action/10 text-gletcher-action",
    neutral: "border-gletcher-navy/20 bg-gletcher-frost/80 text-gletcher-navy",
  };
  return (
    <p
      role={role}
      className={`type-body-small rounded-[var(--radius-control)] border px-3 py-2 ${tones[tone]} ${className}`}
    >
      {children}
    </p>
  );
}

export function EmptyState({
  title,
  body,
  className = "",
}: {
  title: string;
  body?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-dashed border-gletcher-navy/30 bg-gletcher-frost/40 px-5 py-8 text-center ${className}`}
    >
      <p className="type-heading-card text-gletcher-navy">{title}</p>
      {body ? (
        <p className="type-body-small mt-2 text-gletcher-navy/75">{body}</p>
      ) : null}
    </div>
  );
}

export function LoadingState({
  label = "Loading",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-24 items-center justify-center rounded-[var(--radius-card)] border border-gletcher-navy/15 bg-gletcher-frost/30 ${className}`}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="type-label text-gletcher-navy/60">{label}</p>
    </div>
  );
}

export function InlineError({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      role="alert"
      className={`type-body-small text-gletcher-action ${className}`}
    >
      {children}
    </p>
  );
}
