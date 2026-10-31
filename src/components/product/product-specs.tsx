import { formatSpecNumber } from "@/lib/format-spec";

type ProductSpecsPanelProps = {
  locale: string;
  abv: string;
  og: string;
  ibu: string;
  style: string;
  fermentation: string;
  malts: string;
  hops: string;
  bottleVol?: string;
  kegVol?: string;
  labels: {
    strength: string;
    gravity: string;
    bitterness: string;
    malts: string;
    hops: string;
    bottle: string;
    keg: string;
  };
};

function SpecCircle({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="flex size-[clamp(3.75rem,8svh,5.75rem)] shrink-0 flex-col items-center justify-center rounded-full border border-gletcher-navy text-center">
      <p className="font-display text-[clamp(0.9rem,2.1svh,1.15rem)] leading-none font-extrabold text-gletcher-navy">
        {value}
      </p>
      <p className="mt-[0.35em] text-[clamp(0.55rem,1.15svh,0.65rem)] font-semibold tracking-[0.12em] text-gletcher-navy/70 uppercase">
        {label}
      </p>
    </div>
  );
}

/** Specs block — scales with viewport, sits tight under the taste copy. */
export function ProductSpecsPanel({
  locale,
  abv,
  og,
  ibu,
  style,
  fermentation,
  malts,
  hops,
  bottleVol,
  kegVol,
  labels,
}: ProductSpecsPanelProps) {
  const abvFmt = formatSpecNumber(abv, locale);
  const ogFmt = formatSpecNumber(og, locale);
  const ibuFmt = formatSpecNumber(ibu, locale, { maximumFractionDigits: 0 });
  const isNumeric = (raw: string) =>
    Number.isFinite(Number.parseFloat(raw.replace(",", ".")));
  const abvDisp = isNumeric(abv) ? `${abvFmt}%` : abvFmt;
  const ogDisp = isNumeric(og) ? `${ogFmt}%` : ogFmt;
  const ibuDisp = isNumeric(ibu) ? `${ibuFmt} IBU` : ibuFmt;

  return (
    <div className="mt-[clamp(0.25rem,1svh,0.75rem)] space-y-[clamp(0.65rem,2svh,1.25rem)]">
      <p className="font-display text-[clamp(1.35rem,4svh,2.4rem)] leading-none tracking-wide text-gletcher-navy uppercase">
        {style}
      </p>

      <div className="grid gap-[clamp(0.75rem,2svh,1.5rem)] sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] sm:items-start">
        <div className="space-y-[clamp(0.65rem,1.8svh,1.25rem)]">
          <div className="flex flex-wrap gap-[clamp(0.55rem,1.5svh,1.1rem)]">
            <SpecCircle value={abvDisp} label={labels.strength} />
            <SpecCircle value={ogDisp} label={labels.gravity} />
            <SpecCircle value={ibuDisp} label={labels.bitterness} />
          </div>

          <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
            <p className="font-display max-w-[8rem] text-[clamp(0.85rem,2svh,1.1rem)] leading-tight font-extrabold tracking-wide text-gletcher-navy uppercase">
              {fermentation}
            </p>

            <div className="flex flex-wrap gap-x-7 gap-y-2 text-[clamp(0.8rem,1.75svh,0.95rem)] font-semibold text-gletcher-navy">
              {bottleVol ? (
                <p className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/svg_bottle.svg"
                    alt=""
                    width={14}
                    height={28}
                    className="h-[1.55em] w-auto"
                  />
                  <span className="sr-only">{labels.bottle}</span>
                  <span className="border-b border-gletcher-navy/40 pb-0.5">
                    {formatSpecNumber(bottleVol, locale)}&nbsp;l
                  </span>
                </p>
              ) : null}
              {kegVol ? (
                <p className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/svg_keg.svg"
                    alt=""
                    width={18}
                    height={22}
                    className="h-[1.3em] w-auto"
                  />
                  <span className="sr-only">{labels.keg}</span>
                  <span>
                    {formatSpecNumber(kegVol, locale, {
                      maximumFractionDigits: 0,
                    })}
                    &nbsp;l
                  </span>
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-[clamp(0.55rem,1.6svh,1rem)]">
          <div>
            <p className="text-[clamp(0.6rem,1.2svh,0.7rem)] font-semibold tracking-[0.16em] text-gletcher-navy/55 uppercase">
              {labels.malts}
            </p>
            <p className="mt-1 text-[clamp(0.8rem,1.75svh,0.95rem)] font-semibold tracking-wide text-gletcher-navy uppercase">
              {malts}
            </p>
          </div>
          <div>
            <p className="text-[clamp(0.6rem,1.2svh,0.7rem)] font-semibold tracking-[0.16em] text-gletcher-navy/55 uppercase">
              {labels.hops}
            </p>
            <p className="mt-1 text-[clamp(0.8rem,1.75svh,0.95rem)] font-semibold tracking-wide text-gletcher-navy uppercase">
              {hops}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
