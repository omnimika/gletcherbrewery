import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type FieldProps = {
  id: string;
  label: string;
  help?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function Field({
  id,
  label,
  help,
  error,
  children,
  className = "",
}: FieldProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="type-label text-gletcher-navy">
        {label}
      </label>
      <div data-field-control="" className="[&_[data-control]]:w-full">
        {/* Clone description ids onto control via data attribute contract */}
        <div
          data-describedby={describedBy}
          className="contents [&_[data-control]]:aria-[invalid=true]:border-gletcher-action"
        >
          {children}
        </div>
      </div>
      {help ? (
        <p id={helpId} className="type-caption text-gletcher-navy/70">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="type-caption text-gletcher-action" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const controlSurface =
  "data-control w-full rounded-[var(--radius-control)] border border-gletcher-navy/40 bg-gletcher-white px-3 py-2.5 text-sm text-gletcher-navy outline-none transition-colors placeholder:text-gletcher-navy/45 focus-visible:border-gletcher-navy disabled:cursor-not-allowed disabled:bg-gletcher-frost/50 disabled:opacity-70 read-only:bg-gletcher-frost/40";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function TextInput({
  className = "",
  invalid,
  ...props
}: TextInputProps) {
  return (
    <input
      data-control=""
      aria-invalid={invalid || undefined}
      className={`${controlSurface} ${className}`}
      {...props}
    />
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function TextArea({
  className = "",
  invalid,
  ...props
}: TextAreaProps) {
  return (
    <textarea
      data-control=""
      aria-invalid={invalid || undefined}
      className={`${controlSurface} min-h-28 resize-y ${className}`}
      {...props}
    />
  );
}
