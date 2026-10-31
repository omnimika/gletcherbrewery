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
    <div className="relative flex size-[clamp(4.5rem,10svh,7.75rem)] shrink-0 items-center justify-center rounded-full border border-gletcher-navy px-[0.35em] text-center xl:size-[clamp(5rem,10.5svh,8.5rem)]">
      {/* Value sits on the geometric center; label hangs just below */}
      <p className="font-display text-[clamp(1.35rem,3.4svh,2.15rem)] leading-none font-extrabold tracking-tight text-gletcher-navy xl:text-[clamp(1.5rem,3.7svh,2.45rem)]">
        {value}
      </p>
      <p className="absolute bottom-[16%] left-1/2 w-full -translate-x-1/2 text-[clamp(0.5rem,1svh,0.625rem)] font-semibold tracking-[0.1em] text-gletcher-navy/70 uppercase">
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
    <div className="mt-[clamp(0.25rem,1svh,0.75rem)] space-y-[clamp(0.75rem,2.2svh,1.5rem)]">
      <p className="font-display text-[clamp(1.5rem,calc(4.8svh+0.5vw),3.15rem)] leading-none tracking-wide text-gletcher-navy uppercase xl:text-[clamp(1.65rem,calc(5.2svh+0.6vw),3.5rem)]">
        {style}
      </p>

      <div className="grid gap-[clamp(0.85rem,2.2svh,1.75rem)] sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] sm:items-start">
        <div className="space-y-[clamp(0.75rem,2svh,1.4rem)]">
          <div className="flex flex-wrap gap-[clamp(0.65rem,1.7svh,1.35rem)]">
            <SpecCircle value={abvDisp} label={labels.strength} />
            <SpecCircle value={ogDisp} label={labels.gravity} />
            <SpecCircle value={ibuDisp} label={labels.bitterness} />
          </div>

          <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
            <p className="font-display max-w-[9rem] text-[clamp(0.95rem,2.2svh,1.25rem)] leading-tight font-extrabold tracking-wide text-gletcher-navy uppercase">
              {fermentation}
            </p>

            <div className="flex flex-wrap gap-x-7 gap-y-2 text-[clamp(0.9rem,1.9svh,1.1rem)] font-semibold text-gletcher-navy">
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

        <div className="space-y-[clamp(0.7rem,1.9svh,1.25rem)]">
          <div>
            <p className="text-[clamp(0.7rem,1.35svh,0.8rem)] font-semibold tracking-[0.16em] text-gletcher-navy/55 uppercase">
              {labels.malts}
            </p>
            <p className="mt-1.5 text-[clamp(0.95rem,2.15svh,1.3rem)] font-semibold tracking-wide text-gletcher-navy uppercase xl:text-[clamp(1.05rem,2.3svh,1.45rem)]">
              {malts}
            </p>
          </div>
          <div>
            <p className="text-[clamp(0.7rem,1.35svh,0.8rem)] font-semibold tracking-[0.16em] text-gletcher-navy/55 uppercase">
              {labels.hops}
            </p>
            <p className="mt-1.5 text-[clamp(0.95rem,2.15svh,1.3rem)] font-semibold tracking-wide text-gletcher-navy uppercase xl:text-[clamp(1.05rem,2.3svh,1.45rem)]">
              {hops}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
