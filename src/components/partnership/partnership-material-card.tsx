import Image from "next/image";
import type { PartnershipMaterial } from "@/content/partnership";

type PartnershipMaterialCardProps = {
  item: PartnershipMaterial;
  downloadLabel: string;
};

/** Source Group_93.svg — rest state cue; fades out on hover as CTA appears. */
function PartnershipArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 81 49"
      fill="none"
      aria-hidden
      className={className}
    >
      <path d="M0 25H80" stroke="currentColor" />
      <path d="M56 1L79.5 24.5L56 48" stroke="currentColor" />
    </svg>
  );
}

/**
 * Download tile with Tilda ZB `751210595` hover (~200ms):
 * rest → arrow; hover → preview + «Скачать». Catalog has no preview.
 */
export function PartnershipMaterialCard({
  item,
  downloadLabel,
}: PartnershipMaterialCardProps) {
  const hasPreview = Boolean(item.previewSrc);

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-full min-h-[160px] flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border border-gletcher-navy bg-gletcher-ice p-5 transition-[border-color] duration-200 ease-linear hover:border-gletcher-red focus-visible:border-gletcher-red focus-visible:outline focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-offset-[var(--focus-offset)] focus-visible:outline-[var(--focus-ring)]"
    >
      <div className={`relative z-[1] min-w-0 ${hasPreview ? "pr-[38%]" : ""}`}>
        <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-none font-light tracking-wide uppercase">
          {item.title}
        </h2>
        <p className="mt-3 text-sm text-gletcher-navy/75">{item.description}</p>
      </div>

      <div className="relative z-[1] mt-5 flex min-h-10 items-center justify-between gap-3">
        <span
          className="font-display inline-flex h-10 w-fit items-center justify-center px-4 text-xs font-extrabold tracking-wide text-white uppercase opacity-100 transition-opacity duration-200 ease-linear [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-focus-visible:opacity-100 motion-reduce:opacity-100 motion-reduce:transition-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(246,112,116,1) 0%, rgba(254,36,42,1) 48%, rgba(223,30,35,1) 100%)",
          }}
        >
          {downloadLabel}
        </span>

        <PartnershipArrow className="h-8 w-[3.25rem] shrink-0 text-gletcher-navy opacity-0 transition-opacity duration-200 ease-linear [@media(hover:hover)_and_(pointer:fine)]:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-focus-visible:opacity-0 motion-reduce:opacity-0 motion-reduce:transition-none" />
      </div>

      {item.previewSrc ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-3 right-2 flex w-[42%] max-w-[11rem] items-center justify-end sm:right-3"
        >
          <Image
            src={item.previewSrc}
            alt=""
            width={item.previewWidth ?? 200}
            height={item.previewHeight ?? 200}
            className="h-auto max-h-full w-auto max-w-full object-contain opacity-100 transition-opacity duration-200 ease-linear [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-focus-visible:opacity-100 motion-reduce:opacity-100 motion-reduce:transition-none"
            sizes="(max-width: 640px) 40vw, 180px"
          />
        </span>
      ) : null}
    </a>
  );
}
