import Image from "next/image";
import { ZbAppear, ZbMouseParallax } from "@/components/agent/zb-motion";
import {
  TOURS_REVIEW_STICKERS,
  type ToursCopy,
} from "@/content/tours";
import styles from "./tours-reviews.module.css";

const ctaStyle = {
  background:
    "radial-gradient(circle at center, rgba(252,59,64,1) 3%, rgba(254,36,42,1) 46%, rgba(254,36,42,0.98) 80%, rgba(213,16,22,1) 100%)",
} as const;

/**
 * ZB `750881518` — «Поделитесь впечатлениями».
 * Stickers: mouse parallax (animprxdx/dy from source). Typography stack + CTA.
 */
export function ToursReviewsSection({ copy }: { copy: ToursCopy["reviews"] }) {
  return (
    <section
      id="reviews"
      tabIndex={-1}
      className={`${styles.screen} ds-snap-start`}
      aria-labelledby="tours-reviews-title"
    >
      <div className={styles.stage}>
        {/* Stickers — z 5–7, mouse parallax */}
        <ZbMouseParallax
          className={`${styles.sticker} ${styles.stickerWow}`}
          dx={-70}
          dy={-50}
        >
          <Image
            src={TOURS_REVIEW_STICKERS.wow}
            alt=""
            width={232}
            height={213}
            className="h-auto w-full"
            sizes="(max-width:640px) 30vw, 200px"
          />
        </ZbMouseParallax>

        <ZbMouseParallax
          className={`${styles.sticker} ${styles.stickerPeace}`}
          dx={50}
          dy={50}
        >
          <Image
            src={TOURS_REVIEW_STICKERS.peace}
            alt=""
            width={220}
            height={231}
            className="h-auto w-full"
            sizes="(max-width:640px) 28vw, 200px"
          />
        </ZbMouseParallax>

        <ZbMouseParallax
          className={`${styles.sticker} ${styles.stickerEyes}`}
          dx={-100}
          dy={50}
        >
          <Image
            src={TOURS_REVIEW_STICKERS.eyes}
            alt=""
            width={160}
            height={182}
            className="h-auto w-full"
            sizes="(max-width:640px) 22vw, 140px"
          />
        </ZbMouseParallax>

        <div className={styles.copy}>
          <div className={styles.rule} aria-hidden />

          <ZbAppear anim="fadeinup" duration={0.8} distance={40} mobile>
            <p className={styles.lead}>{copy.lead}</p>
          </ZbAppear>

          <div className={styles.hairline} aria-hidden />

          <ZbAppear anim="zoomin" duration={0.7} scale={0.92} mobile>
            <p className={styles.line1}>{copy.line1}</p>
          </ZbAppear>
          <ZbAppear
            as="h2"
            id="tours-reviews-title"
            className={styles.line2}
            anim="zoomin"
            duration={0.85}
            scale={0.88}
            delay={0.05}
            mobile
          >
            {copy.line2}
          </ZbAppear>
          <ZbAppear anim="fadeinup" duration={0.7} distance={30} delay={0.1} mobile>
            <p className={styles.line3}>{copy.line3}</p>
          </ZbAppear>
          <ZbAppear anim="fadeinup" duration={0.7} distance={30} delay={0.15} mobile>
            <p className={styles.line4}>{copy.line4}</p>
          </ZbAppear>

          <ZbAppear anim="fadeinup" duration={0.6} distance={24} delay={0.2} mobile>
            <p className={styles.note}>{copy.note}</p>
          </ZbAppear>

          <ZbAppear anim="fadeinup" duration={0.7} distance={40} delay={0.25} mobile>
            <a
              href={copy.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={styles.cta}
              style={ctaStyle}
            >
              {copy.cta}
            </a>
          </ZbAppear>
        </div>
      </div>
    </section>
  );
}

function InfoGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 64"
      className="mt-0.5 h-8 w-8 shrink-0 sm:h-9 sm:w-9"
      fill="none"
    >
      <circle cx="32" cy="32" r="30" stroke="#0d0f49" strokeWidth="3" />
      <path
        d="M32 28v18M32 18.5v3"
        stroke="#0d0f49"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DangerGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 64"
      className="mt-0.5 h-8 w-8 shrink-0 sm:h-9 sm:w-9"
      fill="none"
    >
      <path
        d="M32 6 58 54H6L32 6Z"
        stroke="#0d0f49"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M32 24v16M32 46v2"
        stroke="#0d0f49"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ToursLegalNotice({
  notice,
}: {
  notice: NonNullable<ToursCopy["legalNotice"]>;
}) {
  return (
    <section
      id="legal-notice"
      tabIndex={-1}
      className="bg-[#e6eefc]"
      aria-label={notice.operator}
    >
      <div className="mx-auto max-w-[1200px] px-[var(--page-gutter)] py-6 sm:py-8">
        <ZbAppear anim="fadeinup" duration={0.7} distance={30} mobile>
          <div className="rounded-[10px] border border-gletcher-navy/70 px-4 py-5 opacity-70 sm:px-8 sm:py-6">
            <div className="flex gap-3 sm:gap-5">
              <InfoGlyph />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug sm:text-base">
                  {notice.operator}
                </p>
                <div className="mt-3 grid gap-3 text-[0.8rem] leading-snug sm:grid-cols-3 sm:text-[0.8125rem]">
                  <p>{notice.inn}</p>
                  <p>{notice.bank}</p>
                  <p>{notice.corr}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-3 sm:gap-5">
              <DangerGlyph />
              <p className="text-sm leading-snug sm:text-base">
                {notice.warning}
              </p>
            </div>
          </div>
        </ZbAppear>
      </div>
    </section>
  );
}
