"use client";

type YclientsEmbedProps = {
  src: string;
  title: string;
  className?: string;
};

/**
 * Temporary YCLIENTS iframe (UI_COMPONENT_AUDIT P2).
 * No secrets in client — public widget URLs only.
 */
export function YclientsEmbed({
  src,
  title,
  className = "",
}: YclientsEmbedProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-gletcher-navy bg-gletcher-white ${className}`}
    >
      <iframe
        src={src}
        title={title}
        className="h-[min(70svh,36rem)] w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
