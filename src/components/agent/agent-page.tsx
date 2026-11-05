import Image from "next/image";
import {
  COINS_KICKER_SBS,
  COINS_TITLE_SBS,
  COIN_BOUNCE_SBS,
  HERO_SEAL_SBS,
  PARTNER_SUB_SBS,
  PARTNER_TITLE_SBS,
  PURCHASES_GHOST_SBS,
  PURCHASES_KICKER_SBS,
  PURCHASES_TITLE_SBS,
  STATUS_KICKER_SBS,
  STATUS_SUB_SBS,
  STATUS_TITLE_SBS,
} from "@/components/agent/agent-zb-steps";
import {
  ZbAppear,
  ZbMouseParallax,
  ZbSbs,
  ZbScrollParallax,
} from "@/components/agent/zb-motion";
import { DocumentProximitySnap } from "@/components/motion/document-proximity-snap";
import { AGENT_PAGE } from "@/content/agent";
import { PRODUCTION_ORIGIN } from "@/lib/site-links";
import styles from "./agent-page.module.css";

function abs(path: string) {
  return `${PRODUCTION_ORIGIN}${path}`;
}

function SignupCta({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <a
      href={abs(AGENT_PAGE.signupHref)}
      className={`${styles.cta} ${className}`}
    >
      {label}
    </a>
  );
}

function BottleVideo() {
  const v = AGENT_PAGE.videos.bottle;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        className={styles.videoFill}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      >
        <source src={v.hevc} type='video/mp4; codecs="hvc1"' />
        <source src={v.webm} type="video/webm" />
      </video>
    </div>
  );
}

/**
 * Hero ZB 711680591 — appear + SBS + scroll parallax from source keys.
 * z: title 3 → brand 4 → pills 8–10 → CTA 14 → video 15 → seal 16.
 */
function HeroSection() {
  const h = AGENT_PAGE.hero;
  const a = AGENT_PAGE.assets;

  return (
    <section
      id="hero"
      tabIndex={-1}
      className={`${styles.screen} ds-snap-start`}
      aria-labelledby="agent-hero-title"
      style={{ marginTop: "calc(-1 * var(--hh, 84px))" }}
    >
      <div className={`${styles.stage} ${styles.heroStage}`}>
        <ZbAppear
          as="h1"
          id="agent-hero-title"
          className={styles.heroTitle}
          anim="zoomin"
          duration={0.5}
          scale={0.8}
          mobile
        >
          {h.title}
        </ZbAppear>

        <ZbAppear
          as="p"
          className={styles.heroBrand}
          anim="zoomin"
          duration={1}
          scale={0.7}
          mobile
        >
          {h.brand}
        </ZbAppear>

        <div className={styles.heroMobileLines} aria-hidden>
          {h.mobileLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <div className={styles.heroPills}>
          <ZbAppear anim="fadeinright" duration={1} distance={100}>
            <span className={styles.pill}>{h.pills[0]}</span>
          </ZbAppear>
          <div className={styles.pillRightCluster}>
            <ZbAppear anim="fadeinleft" duration={1} distance={100} mobile>
              <span className={styles.pill}>{h.pills[1]}</span>
            </ZbAppear>
            <ZbAppear anim="fadeinleft" duration={1} distance={100}>
              <span className={styles.pill}>{h.pills[2]}</span>
            </ZbAppear>
          </div>
        </div>

        <div className={styles.heroVideo}>
          <ZbAppear
            className="absolute inset-0"
            anim="fadeinup"
            duration={1.2}
            distance={100}
            mobile
          >
            <ZbScrollParallax speed={120} className="absolute inset-0">
              <BottleVideo />
            </ZbScrollParallax>
          </ZbAppear>

          <ZbSbs
            className={styles.heroSeal}
            steps={HERO_SEAL_SBS}
            trigger="block"
            triggerLine={1}
            mobile
          >
            <Image
              src={a.slogan}
              alt=""
              fill
              className="object-contain"
              sizes="120px"
              priority
            />
          </ZbSbs>
        </div>

        <div className={styles.heroCta}>
          <ZbAppear anim="fadeinup" duration={1} distance={100} mobile>
            <SignupCta label={h.cta} />
          </ZbAppear>
        </div>
      </div>
    </section>
  );
}

/** Purchases ZB 720411103 */
function PurchasesSection() {
  const s = AGENT_PAGE.purchases;
  const a = AGENT_PAGE.assets;

  return (
    <section
      id="purchases"
      tabIndex={-1}
      className={`${styles.screen} ds-snap-start`}
      aria-labelledby="agent-purchases-title"
    >
      <div className={`${styles.stage} flex flex-col items-center justify-center px-4 py-10`}>
        <div className="relative w-full max-w-[56rem]">
          <ZbSbs
            as="p"
            className={`${styles.display} text-center text-[clamp(2.625rem,10vw,7.5rem)] font-extrabold`}
            steps={PURCHASES_KICKER_SBS}
            trigger="block"
            triggerLine={0.5}
            mobile
          >
            {s.kicker}
          </ZbSbs>

          <div className="relative mt-[-0.12em]">
            <ZbAppear
              className="pointer-events-none absolute top-[-6%] left-[6%] z-[3] w-[clamp(3.25rem,18vw,16.8rem)] max-sm:left-[8%] sm:top-[-12%] sm:left-[-4%] sm:w-[clamp(5.5rem,18vw,16.8rem)]"
              anim="fadeinright"
              duration={1}
              distance={100}
              triggerOffset={150}
              mobile
            >
              <ZbMouseParallax dx={-40} dy={40}>
                <Image
                  src={a.purchasesL}
                  alt=""
                  width={269}
                  height={251}
                  className="h-auto w-full rotate-[-8deg] sm:rotate-0"
                />
              </ZbMouseParallax>
            </ZbAppear>

            <ZbAppear
              className="pointer-events-none absolute top-[-14%] right-[6%] z-[4] w-[clamp(3rem,16vw,16rem)] max-sm:right-[8%] sm:top-[-38%] sm:right-[-4%] sm:w-[clamp(5rem,16vw,16rem)]"
              anim="fadeinleft"
              duration={1}
              distance={100}
              triggerOffset={150}
              mobile
            >
              <ZbMouseParallax dx={40} dy={-40}>
                <Image
                  src={a.purchasesR}
                  alt=""
                  width={256}
                  height={244}
                  className="h-auto w-full rotate-[-8deg] sm:rotate-0"
                />
              </ZbMouseParallax>
            </ZbAppear>

            <ZbSbs
              as="p"
              aria-hidden
              className={`${styles.display} absolute inset-x-0 top-0 z-[5] text-center text-[clamp(5.125rem,18vw,13.75rem)] font-extrabold`}
              steps={PURCHASES_GHOST_SBS}
              trigger="block"
              triggerLine={0.5}
              mobile
            >
              {s.titleGhost}
            </ZbSbs>

            <ZbSbs
              as="h2"
              id="agent-purchases-title"
              className={`${styles.display} relative z-[2] text-center text-[clamp(5.125rem,18vw,13.75rem)] font-extrabold`}
              steps={PURCHASES_TITLE_SBS}
              trigger="block"
              triggerLine={0.5}
              mobile
            >
              {s.title}
            </ZbSbs>
          </div>

          <ZbAppear
            as="p"
            className={`${styles.display} mx-auto mt-6 max-w-[23.5rem] text-center text-[clamp(0.8rem,1.6vw,1.25rem)] leading-none font-extrabold`}
            anim="fadeinup"
            duration={1}
            delay={0.2}
            distance={30}
            mobile
          >
            {s.body}
          </ZbAppear>
        </div>

        <ZbAppear
          className="relative z-[9] mt-10"
          anim="fadeinup"
          duration={1}
          distance={100}
          mobile
        >
          <SignupCta label={s.cta} />
        </ZbAppear>
      </div>
    </section>
  );
}

/** Bircoins ZB 720628054 */
function CoinsSection() {
  const s = AGENT_PAGE.coins;
  const coins = AGENT_PAGE.assets.coins;
  const slots = [
    "left-[2%] top-[4%] z-[10]",
    "right-[2%] top-[12%] z-[7]",
    "left-[48%] top-[42%] z-[8]",
    "left-[10%] top-[48%] z-[9]",
    "left-[34%] top-[2%] z-[6]",
  ];

  return (
    <section
      id="bircoins"
      tabIndex={-1}
      className={`${styles.screen} ds-snap-start`}
      aria-labelledby="agent-coins-title"
    >
      <div className={`${styles.stage} flex flex-col items-center justify-center px-4 py-10`}>
        <div className="relative w-full max-w-[56rem]">
          {coins.map((src, i) => (
            <ZbSbs
              key={src}
              className={`pointer-events-none absolute size-[clamp(3.5rem,10vw,9rem)] ${slots[i]}`}
              steps={COIN_BOUNCE_SBS[i]!}
              trigger="block"
              triggerLine={0.5}
              triggerOffset={50}
              mobile
            >
              <Image
                src={src}
                alt=""
                width={144}
                height={144}
                className="size-full object-contain"
              />
            </ZbSbs>
          ))}

          <ZbSbs
            as="p"
            className={`${styles.display} text-center text-[clamp(2rem,6.5vw,5rem)] font-[100]`}
            steps={COINS_KICKER_SBS}
            trigger="block"
            triggerLine={0.5}
            mobile
          >
            {s.kicker}
          </ZbSbs>

          <ZbSbs
            as="h2"
            id="agent-coins-title"
            className={`${styles.display} relative z-[3] mt-[-0.05em] text-center text-[clamp(5.75rem,19vw,14.375rem)] font-[300]`}
            steps={COINS_TITLE_SBS}
            trigger="block"
            triggerLine={0.5}
            mobile
          >
            {s.title}
          </ZbSbs>

          <ZbAppear
            as="p"
            className={`${styles.display} relative z-[5] mx-auto mt-8 max-w-[23.5rem] text-center text-[clamp(0.8rem,1.6vw,1.25rem)] leading-none font-extrabold`}
            anim="fadeinup"
            duration={1}
            delay={0.2}
            distance={30}
            mobile
          >
            {s.body}
          </ZbAppear>
        </div>

        <ZbAppear
          className="relative z-[12] mt-10"
          anim="fadeinup"
          duration={1}
          distance={100}
          mobile
        >
          <SignupCta label={s.cta} />
        </ZbAppear>
      </div>
    </section>
  );
}

/** Partner ZB 720648821 */
function PartnerSection() {
  const s = AGENT_PAGE.partner;
  const imgs = AGENT_PAGE.assets.partners;
  const delays = [0.1, 0.2, 0.3];

  return (
    <section
      id="partner"
      tabIndex={-1}
      className={`${styles.screen} ds-snap-start`}
      aria-labelledby="agent-partner-title"
    >
      <div className={`${styles.stage} flex flex-col items-center justify-center px-4 py-10`}>
        <ZbSbs
          as="h2"
          id="agent-partner-title"
          className={`${styles.display} text-center text-[clamp(4.25rem,15vw,11.375rem)] font-[300]`}
          steps={PARTNER_TITLE_SBS}
          trigger="block"
          triggerLine={0.5}
          mobile
        >
          {s.title}
        </ZbSbs>

        <ZbSbs
          as="p"
          className={`${styles.display} mt-2 text-center text-[clamp(1.5rem,5vw,4rem)] font-extrabold`}
          steps={PARTNER_SUB_SBS}
          trigger="block"
          triggerLine={0.5}
          mobile
        >
          {s.subtitle}
        </ZbSbs>

        <ul className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-8 sm:mt-12 sm:grid-cols-3 sm:gap-6">
          {s.cards.map((label, i) => (
            <li key={label} className="flex flex-col items-center text-center">
              <ZbAppear
                className="relative aspect-[5/4] w-full max-w-[12.5rem]"
                anim="fadeinup"
                duration={1}
                delay={delays[i]}
                distance={100}
                mobile
              >
                <Image
                  src={imgs[i]!}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="200px"
                />
              </ZbAppear>
              <ZbAppear
                as="p"
                className={`${styles.display} mt-3 max-w-[16rem] text-[clamp(0.7rem,1.4vw,1.25rem)] leading-none font-extrabold`}
                anim="fadeinup"
                duration={1}
                delay={delays[i]}
                distance={100}
                mobile
              >
                {label}
              </ZbAppear>
            </li>
          ))}
        </ul>

        <ZbAppear
          className="relative z-[12] mt-10"
          anim="fadeinup"
          duration={1}
          distance={100}
          mobile
        >
          <SignupCta label={s.cta} />
        </ZbAppear>
      </div>
    </section>
  );
}

/** Status ZB 720675280 */
function StatusSection() {
  const s = AGENT_PAGE.status;
  const imgs = AGENT_PAGE.assets.status;
  const delays = [0.2, 0.4, 0.4];

  return (
    <section
      id="status"
      tabIndex={-1}
      className={`${styles.screen} ds-snap-start`}
      aria-labelledby="agent-status-title"
    >
      <div className={`${styles.stage} flex flex-col items-center justify-center px-4 py-10`}>
        <ZbSbs
          as="p"
          className={`${styles.display} text-center text-[clamp(3rem,7.5vw,5.625rem)] font-[200]`}
          steps={STATUS_KICKER_SBS}
          trigger="block"
          triggerLine={0.5}
          mobile
        >
          {s.kicker}
        </ZbSbs>

        <ZbSbs
          as="h2"
          id="agent-status-title"
          className={`${styles.display} mt-[-0.05em] text-center text-[clamp(3.75rem,13vw,9.875rem)] font-bold`}
          steps={STATUS_TITLE_SBS}
          trigger="block"
          triggerLine={0.5}
          mobile
        >
          {s.title}
        </ZbSbs>

        <ZbSbs
          as="p"
          className={`${styles.display} mt-3 text-center text-[clamp(1rem,2.5vw,1.875rem)] leading-[0.79] font-extrabold`}
          steps={STATUS_SUB_SBS}
          trigger="block"
          triggerLine={0.5}
          mobile
        >
          {s.subtitle}
        </ZbSbs>

        <ul className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-8 sm:mt-12 sm:grid-cols-3 sm:gap-6">
          {s.cards.map((label, i) => (
            <li key={label} className="flex flex-col items-center text-center">
              <ZbAppear
                className="relative aspect-[3/2] w-full max-w-[15rem]"
                anim="fadeinup"
                duration={1}
                delay={delays[i]}
                distance={100}
                mobile
              >
                <Image
                  src={imgs[i]!}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="240px"
                />
              </ZbAppear>
              <ZbAppear
                as="p"
                className={`${styles.display} mt-3 max-w-[15rem] text-[clamp(0.7rem,1.4vw,1.25rem)] leading-none font-extrabold`}
                anim="fadeinup"
                duration={1}
                delay={delays[i]}
                distance={100}
                mobile
              >
                {label}
              </ZbAppear>
            </li>
          ))}
        </ul>

        <ZbAppear
          className="relative z-[16] mt-10"
          anim="fadeinup"
          duration={1}
          distance={100}
          mobile
        >
          <SignupCta label={s.cta} />
        </ZbAppear>
      </div>
    </section>
  );
}

/** Finale ZB 720952281 */
function FinaleSection() {
  const s = AGENT_PAGE.finale;
  const coin = AGENT_PAGE.videos.coin;
  const reg = AGENT_PAGE.videos.registration;

  return (
    <section
      id="join"
      tabIndex={-1}
      className={`${styles.screen} ds-snap-start`}
      aria-labelledby="agent-finale-title"
    >
      <div className={`${styles.stage} flex flex-col items-center justify-center px-4 py-12`}>
        <ZbAppear
          className="relative z-[5] mb-2 h-[clamp(5rem,10vw,7.5rem)] w-[clamp(5rem,10vw,7.5rem)]"
          anim="zoomin"
          duration={1}
          scale={0.9}
        >
          <video
            className={styles.videoFill}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          >
            <source src={coin.hevc} type='video/mp4; codecs="hvc1"' />
            <source src={coin.webm} type="video/webm" />
          </video>
        </ZbAppear>

        <ZbAppear
          className="relative z-[11] mb-4 h-[clamp(5rem,7.5vw,5.625rem)] w-full max-w-[35.625rem]"
          anim="zoomin"
          duration={1}
          scale={0.9}
          mobile
        >
          <video
            className={styles.videoFill}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Регистрация"
          >
            <source src={reg.webm} type="video/webm" />
            <source src={reg.mp4} type="video/mp4" />
          </video>
        </ZbAppear>

        <ZbAppear
          as="h2"
          id="agent-finale-title"
          className={`${styles.display} text-center text-[clamp(1.75rem,6.3vw,4.75rem)] font-[300]`}
          anim="zoomin"
          duration={1}
          scale={0.9}
        >
          {s.title}
        </ZbAppear>

        <ZbAppear
          as="p"
          className={`${styles.display} mt-1 text-center text-[clamp(2.875rem,10.3vw,7.75rem)] font-[100]`}
          anim="zoomin"
          duration={1}
          delay={0.1}
          scale={0.9}
        >
          {s.line1}
        </ZbAppear>

        <ZbAppear
          as="p"
          className={`${styles.display} mt-[-0.05em] text-center text-[clamp(2.875rem,10.3vw,7.75rem)] font-[100]`}
          anim="zoomin"
          duration={1}
          delay={0.2}
          scale={0.9}
        >
          {s.line2}
        </ZbAppear>

        <div className="relative z-[13] mt-8 flex w-full max-w-sm flex-col items-center gap-3">
          <ZbAppear
            anim="zoomin"
            duration={1}
            delay={0.2}
            scale={0.9}
            mobile
          >
            <SignupCta label={s.cta} />
          </ZbAppear>
          <ZbAppear anim="zoomin" duration={1} delay={0.3} scale={0.9}>
            <a href={abs(AGENT_PAGE.loginHref)} className={styles.ctaGhost}>
              {s.login}
            </a>
          </ZbAppear>
        </div>

        <p
          className={`${styles.display} mt-10 max-w-xl text-center text-[clamp(0.7rem,1.3vw,1rem)] font-extrabold opacity-50`}
        >
          {s.legal}
        </p>
      </div>
    </section>
  );
}

export function AgentPageView() {
  return (
    <div className="bg-[#e6eefc] text-[#0d0f49]">
      <DocumentProximitySnap />
      <HeroSection />
      <PurchasesSection />
      <CoinsSection />
      <PartnerSection />
      <StatusSection />
      <FinaleSection />
    </div>
  );
}
