import Image from "next/image";
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

function BottleVideo({ className = "" }: { className?: string }) {
  const v = AGENT_PAGE.videos.bottle;
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
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
 * Hero ZB 711680591 — z-order Confirmed:
 * title 3 → brand 4 → pills 8–10 → CTA 14 → bottle video 15 → seal 16.
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
        <h1 id="agent-hero-title" className={styles.heroTitle}>
          {h.title}
        </h1>
        <p className={styles.heroBrand}>{h.brand}</p>

        <div className={styles.heroMobileLines} aria-hidden>
          {h.mobileLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        {/* Pills: left alone | bottle gap | 2025 + right (source lefts 20 / 790 / 875) */}
        <div className={styles.heroPills}>
          <span className={`${styles.pill} ${styles.pillLeft}`}>{h.pills[0]}</span>
          <div className={styles.pillRightCluster}>
            <span className={`${styles.pill} ${styles.pillYear}`}>{h.pills[1]}</span>
            <span className={`${styles.pill} ${styles.pillRight}`}>{h.pills[2]}</span>
          </div>
        </div>

        <div className={styles.heroCta}>
          <SignupCta label={h.cta} />
        </div>

        <div className={styles.heroVideo}>
          <BottleVideo />
        </div>

        <div className={styles.heroSeal}>
          <Image
            src={a.slogan}
            alt=""
            fill
            className="object-contain"
            sizes="120px"
            priority
          />
        </div>
      </div>
    </section>
  );
}

/** Purchases ZB 720411103 — title 220 / kicker 120 */
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
          <p
            className={`${styles.display} ${styles.fadeUp} text-center text-[clamp(2.625rem,10vw,7.5rem)] font-extrabold`}
          >
            {s.kicker}
          </p>

          <div className="relative mt-[-0.12em]">
            <Image
              src={a.purchasesL}
              alt=""
              width={269}
              height={251}
              className={`${styles.fadeRight} pointer-events-none absolute top-[-12%] left-[-4%] z-[3] w-[clamp(5.5rem,18vw,16.8rem)] rotate-[-8deg] sm:rotate-0`}
            />
            <Image
              src={a.purchasesR}
              alt=""
              width={256}
              height={244}
              className={`${styles.fadeLeft} pointer-events-none absolute top-[-38%] right-[-4%] z-[4] w-[clamp(5rem,16vw,16rem)] rotate-[-8deg] sm:rotate-0`}
            />

            <p
              aria-hidden
              className={`${styles.display} absolute inset-x-0 top-0 z-[5] text-center text-[clamp(5.125rem,18vw,13.75rem)] font-extrabold opacity-0`}
            >
              {s.titleGhost}
            </p>
            <h2
              id="agent-purchases-title"
              className={`${styles.display} ${styles.fadeUp} relative z-[2] text-center text-[clamp(5.125rem,18vw,13.75rem)] font-extrabold`}
            >
              {s.title}
            </h2>
          </div>

          <p
            className={`${styles.display} ${styles.fadeUpDelay} mx-auto mt-6 max-w-[23.5rem] text-center text-[clamp(0.8rem,1.6vw,1.25rem)] leading-none font-extrabold`}
          >
            {s.body}
          </p>
        </div>

        <div className={`${styles.fadeUpDelay} relative z-[9] mt-10`}>
          <SignupCta label={s.cta} />
        </div>
      </div>
    </section>
  );
}

/** Bircoins ZB 720628054 — title 230 / kicker 80 */
function CoinsSection() {
  const s = AGENT_PAGE.coins;
  const coins = AGENT_PAGE.assets.coins;
  const bounce = [
    styles.bounceIn,
    styles.bounceIn2,
    styles.bounceIn3,
    styles.bounceIn,
    styles.bounceIn2,
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
          {coins.map((src, i) => {
            const slots = [
              "left-[2%] top-[4%] z-[10]",
              "right-[2%] top-[12%] z-[7]",
              "left-[48%] top-[42%] z-[8]",
              "left-[10%] top-[48%] z-[9]",
              "left-[34%] top-[2%] z-[6]",
            ];
            return (
              <Image
                key={src}
                src={src}
                alt=""
                width={144}
                height={144}
                className={`${bounce[i]} pointer-events-none absolute size-[clamp(3.5rem,10vw,9rem)] ${slots[i]}`}
              />
            );
          })}

          <p
            className={`${styles.display} ${styles.fadeUp} text-center text-[clamp(2rem,6.5vw,5rem)] font-[100]`}
          >
            {s.kicker}
          </p>
          <h2
            id="agent-coins-title"
            className={`${styles.display} ${styles.fadeUpDelay} relative z-[3] mt-[-0.05em] text-center text-[clamp(5.75rem,19vw,14.375rem)] font-[300]`}
          >
            {s.title}
          </h2>
          <p
            className={`${styles.display} ${styles.fadeUpDelay} relative z-[5] mx-auto mt-8 max-w-[23.5rem] text-center text-[clamp(0.8rem,1.6vw,1.25rem)] leading-none font-extrabold`}
          >
            {s.body}
          </p>
        </div>
        <div className={`${styles.fadeUpDelay} relative z-[12] mt-10`}>
          <SignupCta label={s.cta} />
        </div>
      </div>
    </section>
  );
}

/** Partner ZB 720648821 — title 182 / subtitle 64 */
function PartnerSection() {
  const s = AGENT_PAGE.partner;
  const imgs = AGENT_PAGE.assets.partners;
  const delays = [styles.fadeUp, styles.fadeUpDelay, styles.fadeUpDelay2];

  return (
    <section
      id="partner"
      tabIndex={-1}
      className={`${styles.screen} ds-snap-start`}
      aria-labelledby="agent-partner-title"
    >
      <div className={`${styles.stage} flex flex-col items-center justify-center px-4 py-10`}>
        <h2
          id="agent-partner-title"
          className={`${styles.display} ${styles.fadeUp} text-center text-[clamp(4.25rem,15vw,11.375rem)] font-[300]`}
        >
          {s.title}
        </h2>
        <p
          className={`${styles.display} ${styles.fadeUpDelay} mt-2 text-center text-[clamp(1.5rem,5vw,4rem)] font-extrabold`}
        >
          {s.subtitle}
        </p>

        <ul className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-8 sm:mt-12 sm:grid-cols-3 sm:gap-6">
          {s.cards.map((label, i) => (
            <li
              key={label}
              className={`${delays[i]} flex flex-col items-center text-center`}
            >
              <div className="relative aspect-[5/4] w-full max-w-[12.5rem]">
                <Image
                  src={imgs[i]!}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="200px"
                />
              </div>
              <p
                className={`${styles.display} mt-3 max-w-[16rem] text-[clamp(0.7rem,1.4vw,1.25rem)] leading-none font-extrabold`}
              >
                {label}
              </p>
            </li>
          ))}
        </ul>

        <div className={`${styles.fadeUpDelay2} relative z-[12] mt-10`}>
          <SignupCta label={s.cta} />
        </div>
      </div>
    </section>
  );
}

/** Status ZB 720675280 — kicker 90 / title 158 / subtitle 30 */
function StatusSection() {
  const s = AGENT_PAGE.status;
  const imgs = AGENT_PAGE.assets.status;
  const delays = [styles.fadeUpDelay, styles.fadeUpDelay2, styles.fadeUpDelay3];

  return (
    <section
      id="status"
      tabIndex={-1}
      className={`${styles.screen} ds-snap-start`}
      aria-labelledby="agent-status-title"
    >
      <div className={`${styles.stage} flex flex-col items-center justify-center px-4 py-10`}>
        <p
          className={`${styles.display} ${styles.fadeUp} text-center text-[clamp(3rem,7.5vw,5.625rem)] font-[200]`}
        >
          {s.kicker}
        </p>
        <h2
          id="agent-status-title"
          className={`${styles.display} ${styles.fadeUpDelay} mt-[-0.05em] text-center text-[clamp(3.75rem,13vw,9.875rem)] font-bold`}
        >
          {s.title}
        </h2>
        <p
          className={`${styles.display} ${styles.fadeUpDelay2} mt-3 text-center text-[clamp(1rem,2.5vw,1.875rem)] leading-[0.79] font-extrabold`}
        >
          {s.subtitle}
        </p>

        <ul className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-8 sm:mt-12 sm:grid-cols-3 sm:gap-6">
          {s.cards.map((label, i) => (
            <li
              key={label}
              className={`${delays[i]} flex flex-col items-center text-center`}
            >
              <div className="relative aspect-[3/2] w-full max-w-[15rem]">
                <Image
                  src={imgs[i]!}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="240px"
                />
              </div>
              <p
                className={`${styles.display} mt-3 max-w-[15rem] text-[clamp(0.7rem,1.4vw,1.25rem)] leading-none font-extrabold`}
              >
                {label}
              </p>
            </li>
          ))}
        </ul>

        <div className={`${styles.fadeUpDelay3} relative z-[16] mt-10`}>
          <SignupCta label={s.cta} />
        </div>
      </div>
    </section>
  );
}

/** Finale ZB 720952281 — title 76 / lines 124 */
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
        <div
          className={`${styles.zoomin} relative z-[5] mb-2 h-[clamp(5rem,10vw,7.5rem)] w-[clamp(5rem,10vw,7.5rem)]`}
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
        </div>

        <div
          className={`${styles.zoomin} relative z-[11] mb-4 h-[clamp(5rem,7.5vw,5.625rem)] w-full max-w-[35.625rem]`}
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
        </div>

        <h2
          id="agent-finale-title"
          className={`${styles.display} ${styles.zoomin} text-center text-[clamp(1.75rem,6.3vw,4.75rem)] font-[300]`}
        >
          {s.title}
        </h2>
        <p
          className={`${styles.display} ${styles.zoominSlow} mt-1 text-center text-[clamp(2.875rem,10.3vw,7.75rem)] font-[100]`}
        >
          {s.line1}
        </p>
        <p
          className={`${styles.display} ${styles.zoominLater} mt-[-0.05em] text-center text-[clamp(2.875rem,10.3vw,7.75rem)] font-[100]`}
        >
          {s.line2}
        </p>

        <div
          className={`${styles.zoominLater} relative z-[13] mt-8 flex w-full max-w-sm flex-col items-center gap-3`}
        >
          <SignupCta label={s.cta} />
          <a href={abs(AGENT_PAGE.loginHref)} className={styles.ctaGhost}>
            {s.login}
          </a>
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
