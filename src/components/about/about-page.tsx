"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  ZbAppear,
  ZbMouseParallax,
  ZbScrollLinked,
  ZbSbs,
  type ZbSbsStep,
} from "@/components/agent/zb-motion";
import { ManagedVideo } from "@/components/media/managed-video";
import { ABOUT_PAGE } from "@/content/about";
import { AboutGallery } from "@/components/about/about-gallery";
import { MovePhoto } from "@/components/about/move-photo";
import styles from "./about-page.module.css";

/** Interactive / content targets — background click advances past these. */
const SLIDE_ADVANCE_IGNORE =
  "a,button,input,textarea,select,iframe,video,audio,label,summary,[role='tab'],[role='button'],[role='link'],[data-slide-content],[data-no-slide-advance]";

const HERO_EXIT = [
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 0, di: 0, dd: 0 },
  { mx: 0, my: -1500, sx: 1, sy: 1, op: 1, ro: 0, di: 1000, dd: 0 },
] as const;

const HERO_EXIT_FAR = [
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 0, di: 0, dd: 0 },
  { mx: 0, my: -3000, sx: 1, sy: 1, op: 1, ro: 0, di: 1000, dd: 0 },
] as const;

const HERO_EXIT_MID = [
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 0, di: 0, dd: 0 },
  { mx: 0, my: -2000, sx: 1, sy: 1, op: 1, ro: 0, di: 1000, dd: 0 },
] as const;

const HERO_VIDEO_EXIT = [
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 0, di: 0, dd: 0 },
  { mx: 0, my: -1000, sx: 1, sy: 1, op: 1, ro: 0, di: 1000, dd: 0 },
] as const;

const SLOGAN_SPIN = [
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 0, ti: 0, ea: "0", dt: 0 },
  { mx: 0, my: 0, sx: 1, sy: 1, op: 0, ro: 0, ti: 0, ea: "easeOut", dt: 0 },
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: -120, ti: 500, ea: "", dt: 1000 },
] as const;

/** Card fill from Tilda ZB Shape 1 — Confirmed via MCP 06.11 */
type SlideTone =
  | "hero"
  | "bare"
  | "sky" /* #e6eefc */
  | "white" /* #ffffff */
  | "mist" /* #b7cbea */
  | "dark" /* #1d1d1d */
  | "navy" /* #0d0f49 */
  | "orange"; /* #de781a */

const TONE_CLASS: Record<SlideTone, string> = {
  hero: `${styles.card} ${styles.cardBare}`,
  bare: `${styles.card} ${styles.cardBare}`,
  sky: styles.card,
  white: `${styles.card} ${styles.cardWhite}`,
  mist: `${styles.card} ${styles.cardMist}`,
  dark: `${styles.card} ${styles.cardDark}`,
  navy: `${styles.card} ${styles.cardNavy}`,
  orange: `${styles.card} ${styles.cardOrange}`,
};

function AboutSlide({
  id,
  num,
  title,
  titleId,
  tone = "sky",
  titleClassName = "",
  chromeExtra,
  /** Rising stack order — Tilda NLM129 zIndexBlock (500, 600, …) → 0-based here */
  stack = 0,
  children,
}: {
  id?: string;
  num?: string;
  title?: ReactNode;
  titleId?: string;
  tone?: SlideTone;
  titleClassName?: string;
  chromeExtra?: ReactNode;
  stack?: number;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      tabIndex={id ? -1 : undefined}
      className={`${styles.slide} ${tone === "hero" ? styles.slideHero : styles.slidePad}`}
      style={{ ["--about-stack" as string]: stack }}
      aria-labelledby={titleId}
      data-tone={tone}
      data-about-slide=""
    >
      <div className={TONE_CLASS[tone]} data-tone={tone}>
        {(num || title || chromeExtra) && (
          <header className={styles.chrome}>
            {num ? <p className={styles.num}>{num}</p> : <span />}
            <div className={styles.chromeEnd}>
              {chromeExtra}
              {title ? (
                <h2
                  id={titleId}
                  className={`${styles.title} ${titleClassName}`.trim()}
                >
                  {title}
                </h2>
              ) : null}
            </div>
          </header>
        )}
        <div data-slide-content="" className={styles.slideContent}>
          {children}
        </div>
      </div>
    </section>
  );
}

function ScrollExit({
  steps,
  triggerLine = 1,
  children,
}: {
  steps: readonly {
    mx?: number;
    my?: number;
    sx?: number;
    sy?: number;
    op?: number;
    ro?: number;
    di?: number;
    dd?: number;
  }[];
  triggerLine?: 0 | 0.5 | 1;
  children: ReactNode;
}) {
  return (
    <ZbScrollLinked steps={[...steps]} triggerLine={triggerLine} mobile>
      {children}
    </ZbScrollLinked>
  );
}

function HeroSection() {
  const h = ABOUT_PAGE.hero;
  const v = ABOUT_PAGE.videos.hero;
  const a = ABOUT_PAGE.assets;

  return (
    <AboutSlide id="hero" tone="hero" titleId="about-hero-brand" stack={0}>
      <div className={styles.heroStage}>
        <ScrollExit steps={HERO_EXIT_FAR}>
          <p className={styles.heroLine}>{h.line1}</p>
        </ScrollExit>
        <ScrollExit steps={HERO_EXIT_MID}>
          <h1 id="about-hero-brand" className={styles.heroBrand}>
            {h.brand}
          </h1>
        </ScrollExit>
        <ScrollExit steps={HERO_VIDEO_EXIT} triggerLine={0.5}>
          <div className={styles.heroVideoWrap}>
            <ManagedVideo
              className={styles.heroVideo}
              aria-hidden
              fallback={
                <Image
                  src={a.logoMark}
                  alt=""
                  width={192}
                  height={192}
                  className={styles.heroVideo}
                />
              }
            >
              <source src={v.hevc} type='video/mp4; codecs="hvc1"' />
              <source src={v.webm} type="video/webm" />
            </ManagedVideo>
          </div>
        </ScrollExit>
        <div className={styles.heroTags}>
          <ScrollExit steps={HERO_EXIT}>
            <p className={`${styles.heroTag} ${styles.heroTagLight}`}>
              {h.tagLeft}
            </p>
          </ScrollExit>
          <ScrollExit steps={HERO_EXIT}>
            <p className={styles.heroTag}>{h.tagMid}</p>
          </ScrollExit>
          <ScrollExit steps={HERO_EXIT}>
            <p className={styles.heroTag}>{h.tagRight}</p>
          </ScrollExit>
        </div>
        <ScrollExit steps={HERO_VIDEO_EXIT}>
          <Image
            src={a.logoMark}
            alt=""
            width={60}
            height={60}
            className={styles.heroMark}
          />
        </ScrollExit>
      </div>
    </AboutSlide>
  );
}

function IntroSection() {
  const s = ABOUT_PAGE.intro;
  const a = ABOUT_PAGE.assets;

  return (
    <AboutSlide
      id={s.anchor}
      num={s.num}
      title={s.latin}
      titleId="about-intro-title"
      titleClassName={styles.titleGradient}
      stack={1}
      chromeExtra={
        <ZbSbs
          steps={[...SLOGAN_SPIN]}
          trigger="block"
          triggerLine={1}
          baseRotate={125}
          mobile
          aria-hidden
        >
          <Image
            src={a.slogan}
            alt=""
            width={120}
            height={120}
            className={styles.sloganImg}
          />
        </ZbSbs>
      }
    >
      <div className={`${styles.body} ${styles.split}`}>
        <div className={styles.panel}>
          <p className={styles.slogan}>{s.slogan}</p>
          <div className={styles.panelMedia} style={{ flex: 1 }}>
            <Image
              src={a.introPhoto}
              alt="Пивоварня Gletcher"
              width={880}
              height={356}
              className={styles.photoFill}
            />
          </div>
        </div>
        <div className={styles.panel}>
          {s.body.map((p) => (
            <p key={p.slice(0, 24)} className={`${styles.copy} ${styles.copyDense}`}>
              {p}
            </p>
          ))}
          <div className={styles.ctaRow}>
            <a className={styles.muted} href={s.emailHref}>
              {s.emailLabel}
            </a>
          </div>
        </div>
      </div>
    </AboutSlide>
  );
}

function HistorySection() {
  const s = ABOUT_PAGE.history;
  const [year, setYear] = useState<(typeof s.years)[number]>("2011");
  const card = s.cards[year];
  const activeIndex = Math.max(0, s.years.indexOf(year));
  const lastIndex = s.years.length - 1;
  const folderRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [seam, setSeam] = useState({ left: 0, width: 0 });

  const measureSeam = useCallback(() => {
    const folder = folderRef.current;
    const tab = tabRefs.current[activeIndex];
    if (!folder || !tab) return;
    const folderBox = folder.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    setSeam({
      left: Math.round(tabBox.left - folderBox.left),
      width: Math.round(tabBox.width),
    });
  }, [activeIndex]);

  useLayoutEffect(() => {
    measureSeam();
  }, [measureSeam, year]);

  useEffect(() => {
    const folder = folderRef.current;
    if (!folder || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measureSeam());
    ro.observe(folder);
    window.addEventListener("resize", measureSeam);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureSeam);
    };
  }, [measureSeam]);

  const edge =
    activeIndex === 0 ? "start" : activeIndex === lastIndex ? "end" : "mid";

  return (
    <AboutSlide
      id={s.anchor}
      num={s.num}
      title={s.title}
      titleId="about-history-title"
      stack={2}
    >
      {/*
        Folder: rounded panel border; measured --seam-* eraser under the
        active spine so tab + panel share fill (no stroke through the tab).
      */}
      <div
        ref={folderRef}
        className={styles.historyFolder}
        data-active-edge={edge}
        style={
          {
            "--seam-left": `${seam.left}px`,
            "--seam-width": `${seam.width}px`,
          } as CSSProperties
        }
      >
        <div className={styles.yearRow} role="tablist" aria-label="Годы истории">
          {s.years.map((y, i) => {
            const selected = year === y;
            return (
              <button
                key={y}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`${styles.yearBtn} ${selected ? styles.yearBtnActive : ""}`}
                onClick={() => setYear(y)}
              >
                {y}
              </button>
            );
          })}
        </div>
        <div className={styles.historyCard} role="tabpanel">
          <div className={styles.panel}>
            <p className={styles.historyYear}>{card.year}</p>
            <p className={`${styles.copy} ${styles.copyDense}`}>{card.body}</p>
            <p className={styles.muted}>{card.brand}</p>
          </div>
          <div className={styles.panelMedia}>
            <Image
              key={card.photo}
              src={card.photo}
              alt=""
              width={1000}
              height={648}
              className={styles.historyPhoto}
            />
          </div>
        </div>
      </div>
    </AboutSlide>
  );
}

function TeamSection() {
  const s = ABOUT_PAGE.team;

  return (
    <AboutSlide
      id={s.anchor}
      num={s.num}
      title={s.title}
      titleId="about-team-title"
      stack={3}
    >
      <div className={`${styles.body} ${styles.stack}`}>
        <div className={styles.teamIntro}>
          <p className={styles.lead}>{s.lead}</p>
          <p className={`${styles.copy} ${styles.copyDense}`}>{s.sub}</p>
        </div>
        <ul className={styles.teamGrid}>
          {s.members.map((m) => (
            <li key={m.name} className={styles.member} title={m.bio}>
              <div className={styles.memberPhotoWrap}>
                <Image
                  src={m.photo}
                  alt=""
                  width={320}
                  height={320}
                  className={styles.memberPhoto}
                />
              </div>
              <div className={styles.memberText}>
                <p className={styles.memberName}>{m.name}</p>
                <p className={styles.memberRole}>{m.role}</p>
                <p className={styles.memberBio}>{m.bio}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AboutSlide>
  );
}

function VideoTourSection() {
  const s = ABOUT_PAGE.videoTour;
  const a = ABOUT_PAGE.assets;
  const [oid, vid] = s.vkVideoId.split("_");
  const vkSrc = `https://vk.com/video_ext.php?oid=${oid}&id=${vid}&hd=2`;

  return (
    <AboutSlide
      id={s.anchor}
      num={s.num}
      title={s.title}
      titleId="about-video-title"
      tone="white"
      titleClassName={styles.titleLight}
      stack={4}
    >
      {/* Landscape VK: width-bound 16:9 band — avoid tall letterbox column */}
      <div className={`${styles.body} ${styles.videoSlide}`}>
        <div className={styles.panel}>
          <p className={styles.welcome}>{s.welcome}</p>
          <div className={styles.stats}>
            {s.stats.map((st) => (
              <div key={st.label}>
                <p className={styles.statValue}>{st.value}</p>
                <p className={styles.statLabel}>{st.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.videoBand}>
          <div className={styles.videoFrame}>
            <iframe
              src={vkSrc}
              title="Видео-тур по пивоварне Gletcher"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;"
              allowFullScreen
              loading="lazy"
              style={{
                backgroundImage: `url(${a.videoPoster})`,
                backgroundSize: "cover",
              }}
            />
          </div>
        </div>
      </div>
    </AboutSlide>
  );
}

function BeerSection() {
  const s = ABOUT_PAGE.beer;

  return (
    <AboutSlide
      id={s.anchor}
      num={s.num}
      title={s.title}
      titleId="about-beer-title"
      titleClassName={styles.titleLight}
      tone="white"
      stack={5}
    >
      <div className={styles.catGrid}>
        {s.categories.map((c, i) => (
          <ZbAppear
            key={c.id}
            anim="fadeinup"
            duration={0.8}
            delay={i * 0.08}
            distance={60}
            mobile
            style={{ minHeight: 0, display: "flex" }}
          >
            <div className={styles.catCard}>
              <p className={styles.catBody}>{c.body}</p>
              <Link href={c.href} className={styles.catName}>
                {c.name}
              </Link>
              <div className={styles.catMedia}>
                <AboutGallery
                  label={`${c.name} — сорта`}
                  slides={c.bottles}
                  accent="red"
                  variant="bottle"
                  arrows={c.bottles.length > 1 ? "under" : "none"}
                  autoplayMs={c.autoplayMs}
                  className={styles.catGallery}
                />
              </div>
            </div>
          </ZbAppear>
        ))}
      </div>
    </AboutSlide>
  );
}

const AGENT_SBS_IDENTITY: ZbSbsStep = {
  mx: 0,
  my: 0,
  sx: 1,
  sy: 1,
  op: 1,
  ro: 0,
  ti: 0,
  ea: "0",
  dt: 0,
};

/** ZB title band (~06 + heading) sits in AboutSlide chrome — remap Y into body. */
const AGENT_ZB_H = 662;
const AGENT_TITLE_BAND = 100;
const AGENT_BODY_H = AGENT_ZB_H - AGENT_TITLE_BAND;

/** `topPct` is % of full ZB artboard height (662). */
function agentTopFromPct(topPct: number) {
  const px = (topPct / 100) * AGENT_ZB_H;
  return ((px - AGENT_TITLE_BAND) / AGENT_BODY_H) * 100;
}

function AgentSection() {
  const s = ABOUT_PAGE.agent;
  const collage = ABOUT_PAGE.assets.agentCollage;

  return (
    <AboutSlide
      id={s.anchor}
      num={s.num}
      title={s.title}
      titleId="about-agent-title"
      titleClassName={styles.titleLight}
      tone="mist"
      stack={6}
    >
      <div className={styles.agentBody}>
        <div className={styles.agentStage} aria-hidden>
          {collage.receipts.map((item) => (
            <MovePhoto
              key={item.src}
              className={styles.agentItem}
              style={{
                left: `${item.left}%`,
                top: `${agentTopFromPct(item.top)}%`,
                width: `${item.width}%`,
                zIndex: item.z,
              }}
            >
              <ZbAppear
                anim={item.appear}
                duration={1}
                distance={100}
                trigger="block"
                triggerLine={0.5}
                triggerOffset={150}
                mobile
              >
                <ZbMouseParallax dx={item.dx} dy={item.dy}>
                  <Image
                    src={item.src}
                    alt=""
                    width={270}
                    height={250}
                    draggable={false}
                    className={styles.agentImg}
                  />
                </ZbMouseParallax>
              </ZbAppear>
            </MovePhoto>
          ))}

          {collage.polaroids.map((item, i) => (
            <MovePhoto
              key={item.src}
              className={styles.agentItem}
              style={{
                left: `${item.left}%`,
                top: `${agentTopFromPct(item.top)}%`,
                width: `${item.width}%`,
                zIndex: item.z,
              }}
            >
              <ZbAppear
                anim={i % 2 === 0 ? "fadeinleft" : "fadeinright"}
                duration={0.9}
                distance={80}
                delay={0.05 * i}
                trigger="block"
                triggerLine={0.5}
                triggerOffset={120}
                mobile
              >
                <Image
                  src={item.src}
                  alt=""
                  width={270}
                  height={300}
                  draggable={false}
                  className={styles.agentImg}
                />
              </ZbAppear>
            </MovePhoto>
          ))}

          {collage.stickers.map((item) => (
            <div
              key={item.src}
              className={`${styles.agentItem} ${styles.agentItemDecor}`}
              style={{
                left: `${item.left}%`,
                top: `${agentTopFromPct(item.top)}%`,
                width: `${item.width}%`,
                zIndex: item.z,
              }}
            >
              <ZbSbs
                className={styles.agentSbs}
                trigger="block"
                triggerLine={0.5}
                triggerOffset={50}
                mobile
                steps={[
                  AGENT_SBS_IDENTITY,
                  { ...item.from, ti: 0, ea: "0", dt: 0 },
                  item.to,
                ]}
              >
                <Image
                  src={item.src}
                  alt=""
                  width={122}
                  height={122}
                  className={styles.agentImg}
                />
              </ZbSbs>
            </div>
          ))}
        </div>

        <div className={styles.agentPanel}>
          <ZbAppear
            anim="fadeinright"
            duration={1}
            distance={100}
            trigger="block"
            triggerLine={0.5}
            mobile
          >
            <p className={`${styles.pill} ${styles.pillSoft}`}>{s.program}</p>
          </ZbAppear>
          <p className={`${styles.copy} ${styles.copyDense}`}>{s.body}</p>
          <ZbAppear
            anim="fadeinup"
            duration={0.8}
            distance={30}
            delay={0.2}
            trigger="block"
            triggerLine={0.5}
            mobile
          >
            <p className={styles.lead}>{s.coins}</p>
          </ZbAppear>
          <p className={`${styles.copy} ${styles.copyDense}`}>{s.lead}</p>
          <div className={styles.ctaRow}>
            <p className={`${styles.pill} ${styles.pillSoft}`}>{s.kicker}</p>
            <ZbAppear
              anim="fadeinup"
              duration={1}
              distance={100}
              trigger="block"
              triggerLine={0.5}
              mobile
            >
              <Link href={s.href} className={`${styles.cta} ${styles.ctaFill}`}>
                {s.cta}
              </Link>
            </ZbAppear>
          </div>
        </div>
      </div>
    </AboutSlide>
  );
}

function ToursSection() {
  const s = ABOUT_PAGE.tours;
  const a = ABOUT_PAGE.assets;

  return (
    <AboutSlide
      id={s.anchor}
      num={s.num}
      title={s.title}
      titleId="about-tours-title"
      titleClassName={styles.titleLight}
      tone="white"
      stack={7}
    >
      <div className={`${styles.body} ${styles.split}`}>
        <AboutGallery
          label="Фото с экскурсий по пивоварне"
          slides={a.toursGallery.map((src) => ({ src }))}
          accent="red"
          className={styles.aboutGallery}
        />
        <div className={styles.panel}>
          <ZbAppear anim="fadeinup" duration={0.8} distance={60} mobile>
            <p className={styles.lead}>{s.lead}</p>
          </ZbAppear>
          <p className={`${styles.copy} ${styles.copyDense}`}>{s.body}</p>
          <div className={styles.ctaRow}>
            <Link href={s.href} className={`${styles.cta} ${styles.ctaFill}`}>
              {s.cta}
            </Link>
          </div>
        </div>
      </div>
    </AboutSlide>
  );
}

function BrewersHouseSection() {
  const s = ABOUT_PAGE.brewersHouse;
  const a = ABOUT_PAGE.assets;
  const iconSrc = {
    vk: a.brewersHouseVk,
    telegram: a.brewersHouseTelegram,
  } as const;

  return (
    <AboutSlide
      id={s.anchor}
      num={s.num}
      title={s.title}
      titleId="about-bh-title"
      tone="dark"
      stack={8}
    >
      <div className={styles.bhLayout}>
        <div className={`${styles.body} ${styles.split} ${styles.splitBh}`}>
          <div className={styles.bhAside}>
            <AboutGallery
              label="Brewer's House — фото локации"
              slides={a.brewersHouseGallery.map((src) => ({ src }))}
              accent="red"
              className={styles.aboutGallery}
              aspectRatio="444 / 250"
            />
            <ZbAppear
              anim="fadeinup"
              duration={1}
              distance={30}
              delay={0.2}
              mobile
            >
              <p className={styles.bhAsideCopy}>{s.aside}</p>
            </ZbAppear>
          </div>
          <div className={styles.bhPanel}>
            <ZbAppear anim="fadeinright" duration={1} distance={100} mobile>
              <p className={`${styles.pill} ${styles.bhPill}`}>{s.tagline}</p>
            </ZbAppear>
            <p className={`${styles.copy} ${styles.copyDense}`}>{s.body[0]}</p>
            <p className={`${styles.copy} ${styles.copyDense}`}>{s.body[1]}</p>
          </div>
        </div>
        <div className={styles.bhCta}>
          <Image
            src={a.brewersHouseCrest}
            alt=""
            width={87}
            height={122}
            className={styles.bhCrest}
          />
          <div className={styles.bhCtaBar}>
            <span className={styles.bhCtaLabel}>{s.ctaLabel}</span>
            <div className={styles.bhSocials}>
              {s.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.bhSocial}
                  aria-label={l.label}
                >
                  <Image src={iconSrc[l.icon]} alt="" width={40} height={40} />
                </a>
              ))}
            </div>
            <Image
              src={a.brewersHouseWordmark}
              alt="Brewer's House"
              width={104}
              height={40}
              className={styles.bhWordmark}
            />
          </div>
        </div>
      </div>
    </AboutSlide>
  );
}

function KlinFestSection() {
  const s = ABOUT_PAGE.klinFest;
  const a = ABOUT_PAGE.assets;
  const [oid, vid] = s.vkVideoId.split("_");
  const vkSrc = `https://vk.com/video_ext.php?oid=${oid}&id=${vid}&hd=2`;

  return (
    <AboutSlide
      id="klin-may-fest"
      num={s.num}
      title={s.title}
      titleId="about-klin-title"
      tone="navy"
      stack={9}
    >
      {/* Landscape VK full content width; copy/stats below — no tall grey letterbox */}
      <div className={`${styles.body} ${styles.festLayout}`}>
        <div className={styles.videoBand}>
          <div className={styles.videoFrame}>
            <iframe
              src={vkSrc}
              title="Клин Май Fest"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;"
              allowFullScreen
              loading="lazy"
              style={{
                backgroundImage: `url(${a.festMayPoster})`,
                backgroundSize: "cover",
              }}
            />
          </div>
        </div>
        <div className={styles.festCopy}>
          <p className={styles.muted}>{s.body}</p>
          <div className={styles.panel}>
            <p className={styles.pill}>{s.tagline}</p>
            <p
              className={`${styles.copy} ${styles.copyDense} ${styles.festLead}`}
            >
              {s.lead}
            </p>
            <ul className={styles.listPlain}>
              {s.stats.map((row) => (
                <li key={row.year}>
                  {row.year} — {row.guests} гостей — {row.volume} пива и мёда
                </li>
              ))}
            </ul>
            <div className={styles.ctaBar}>
              <p className={styles.ctaBarLabel}>подробнее:</p>
              <Link href={s.href}>{s.cta}</Link>
              <ZbAppear anim="zoomin" duration={0.8} scale={0.75} mobile>
                <Image
                  src={a.festMayLogo}
                  alt=""
                  width={120}
                  height={120}
                  className={styles.festLogo}
                />
              </ZbAppear>
            </div>
          </div>
        </div>
      </div>
    </AboutSlide>
  );
}

function BrainstormSection() {
  const s = ABOUT_PAGE.brainstorm;
  const a = ABOUT_PAGE.assets;

  return (
    <AboutSlide
      num={s.num}
      title={
        <>
          BRAINSTORM <span className={styles.titleBrainSoft}>MOTOR </span>
          <span className={styles.titleBrainFest}>FEST</span>
        </>
      }
      titleId="about-brainstorm-title"
      titleClassName={styles.titleBrain}
      tone="orange"
      stack={10}
    >
      <div className={`${styles.body} ${styles.split}`}>
        <div className={styles.festAside}>
          <AboutGallery
            label="Brainstorm Motor Fest — фото"
            slides={a.brainstormGallery.map((src) => ({ src }))}
            accent="black"
            className={styles.aboutGallery}
          />
          <p className={styles.muted}>{s.body.split("\n\n")[1] ?? s.body}</p>
        </div>
        <div className={styles.panel}>
          <p className={`${styles.pill} ${styles.pillLight}`}>{s.tagline}</p>
          <p className={`${styles.copy} ${styles.copyDense}`}>{s.lead}</p>
          <p className={`${styles.copy} ${styles.copyDense}`}>
            {s.body.split("\n\n")[0]}
          </p>
          <div className={`${styles.ctaBar} ${styles.ctaBarDark}`}>
            <p className={styles.ctaBarLabel}>подробнее:</p>
            <a href={s.href} target="_blank" rel="noopener noreferrer">
              {s.cta}
            </a>
            <Image
              src={a.brainstormLogo}
              alt=""
              width={120}
              height={120}
              className={styles.festLogo}
            />
          </div>
        </div>
      </div>
    </AboutSlide>
  );
}

function WhereSection() {
  const s = ABOUT_PAGE.where;
  const a = ABOUT_PAGE.assets;
  const [klin, moscow] = s.shops;

  return (
    <AboutSlide
      id={s.anchor}
      num={s.num}
      title={s.title}
      titleId="about-where-title"
      tone="sky"
      stack={11}
    >
      <div className={styles.whereBody}>
        <p className={`${styles.pill} ${styles.whereTag}`}>{s.tagline}</p>
        <div className={styles.shopCards}>
          <article className={styles.shopCard}>
            <p className={styles.shopCity}>{moscow.city}</p>
            <h3 className={styles.shopTitle}>{moscow.title}</h3>
            <p className={styles.shopMeta}>{moscow.address}</p>
            <div className={styles.shopLinks}>
              <a className={styles.inlineLink} href={moscow.phoneHref}>
                {moscow.phone}
              </a>
              <a
                className={styles.inlineLink}
                href={moscow.shopHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                svamgroup.ru
              </a>
              <a
                className={styles.inlineLink}
                href={moscow.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Яндекс.Карты
              </a>
            </div>
          </article>

          <article className={`${styles.shopCard} ${styles.shopCardChains}`}>
            <h3 className={styles.shopTitle}>ТОРГОВЫЕ СЕТИ</h3>
            <p className={styles.shopMeta}>{s.chainsLead}</p>
            <div className={styles.chainGrid}>
              {a.chains.map((c) => (
                // Remote SVG — next/image optimizer does not accept SVG by default.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={c.alt}
                  src={c.src}
                  alt={c.alt}
                  width={120}
                  height={40}
                  className={styles.chainLogo}
                />
              ))}
            </div>
            <div className={styles.ctaRow}>
              <Link href={s.mapHref} className={`${styles.cta} ${styles.ctaFill}`}>
                {s.mapCta}
              </Link>
            </div>
          </article>

          <article className={styles.shopCard}>
            <p className={styles.shopCity}>{klin.city}</p>
            <h3 className={styles.shopTitle}>{klin.title}</h3>
            <p className={styles.shopMeta}>{klin.address}</p>
            <div className={styles.shopLinks}>
              <a className={styles.inlineLink} href={klin.phoneHref}>
                {klin.phone}
              </a>
              <a className={styles.inlineLink} href={klin.shopHref}>
                shop
              </a>
              <a
                className={styles.inlineLink}
                href={klin.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Яндекс.Карты
              </a>
            </div>
          </article>
        </div>
      </div>
    </AboutSlide>
  );
}

function ExportSection() {
  const s = ABOUT_PAGE.export;
  const a = ABOUT_PAGE.assets;

  return (
    <AboutSlide
      num={s.num}
      title={s.title}
      titleId="about-export-title"
      tone="mist"
      stack={12}
    >
      <div className={`${styles.body} ${styles.split}`}>
        <div className={styles.panelMedia}>
          <Image
            src={a.exportMap}
            alt="Карта экспорта Gletcher"
            width={1200}
            height={700}
            className={styles.exportMap}
          />
        </div>
        <div className={styles.panel}>
          <p className={styles.lead}>{s.tagline}</p>
          <p className={`${styles.copy} ${styles.copyDense}`}>{s.body}</p>
          <p className={styles.memberRole}>{s.contactRole}</p>
          <p className={styles.memberName}>{s.contactName}</p>
          <div className={styles.shopLinks}>
            <a className={styles.inlineLink} href={`mailto:${s.email}`}>
              {s.email}
            </a>
            <a className={styles.inlineLink} href={s.phoneHref}>
              {s.phone}
            </a>
          </div>
          <p className={styles.kicker}>Представлено в:</p>
          <ul className={styles.countryList}>
            {s.countries.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </AboutSlide>
  );
}

function ThanksSection() {
  const s = ABOUT_PAGE.thanks;
  const a = ABOUT_PAGE.assets;

  return (
    <AboutSlide
      num={s.num}
      title={s.title}
      titleId="about-thanks-title"
      titleClassName={styles.thanksTitle}
      tone="sky"
      stack={13}
    >
      <div className={styles.thanksShell}>
        <div className={styles.panel}>
          <ZbAppear anim="fadeinright" duration={0.8} distance={60} mobile>
            <p className={`${styles.pill} ${styles.whereTag}`}>{s.lead}</p>
          </ZbAppear>
          <p className={`${styles.copy} ${styles.copyDense}`}>{s.body}</p>
          <div className={styles.mediaFrame}>
            <Image
              src={a.thanks}
              alt=""
              width={800}
              height={422}
              className={styles.photoFill}
            />
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.ctaRow}>
            <a
              className={`${styles.cta} ${styles.ctaFill}`}
              href="mailto:info@gletcherbrewery.com"
            >
              ОТПРАВИТЬ
            </a>
          </div>
        </div>
      </div>
    </AboutSlide>
  );
}

/** Document Y of a sticky slide — offsetParent is BODY on /about. */
function slideFlowTop(el: HTMLElement): number {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return Math.round(y);
}

export function AboutPageView() {
  const pageRef = useRef<HTMLDivElement>(null);

  /*
   * Sticky stack pins at top: 0. Site `html { scroll-padding-top }` (header)
   * leaves a ~header gap on hash jumps and fights click-advance seating.
   */
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.scrollPaddingTop;
    root.style.scrollPaddingTop = "0px";
    return () => {
      root.style.scrollPaddingTop = prev;
    };
  }, []);

  /** Re-seat after #hash on load / in-page hashchange (no scroll-padding). */
  useEffect(() => {
    const seatHash = () => {
      const id = location.hash.replace(/^#/, "");
      if (!id || !pageRef.current) return;
      const el = pageRef.current.querySelector<HTMLElement>(
        `#${CSS.escape(id)}[data-about-slide]`,
      );
      if (!el) return;
      window.scrollTo({ top: slideFlowTop(el), behavior: "auto" });
    };
    seatHash();
    window.addEventListener("hashchange", seatHash);
    return () => window.removeEventListener("hashchange", seatHash);
  }, []);

  const onBackgroundClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target || !pageRef.current) return;
    if (target.closest(SLIDE_ADVANCE_IGNORE)) return;
    if (window.getSelection()?.toString()) return;

    const current = target.closest("[data-about-slide]");
    if (!current || !pageRef.current.contains(current)) return;

    const slides = [
      ...pageRef.current.querySelectorAll<HTMLElement>("[data-about-slide]"),
    ];
    const index = slides.indexOf(current as HTMLElement);
    const next = index >= 0 ? slides[index + 1] : undefined;
    if (!next) return;

    const targetY = slideFlowTop(next);
    if (Math.abs(window.scrollY - targetY) < 1) return;

    /* replaceState — assigning location.hash re-triggers padded fragment scroll */
    if (next.id) {
      history.replaceState(null, "", `#${next.id}`);
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const settle = () => {
      const y = slideFlowTop(next);
      if (Math.abs(window.scrollY - y) > 1) {
        window.scrollTo({ top: y, behavior: "auto" });
      }
    };

    window.scrollTo({ top: targetY, behavior: reduce ? "auto" : "smooth" });
    if (reduce) {
      settle();
      return;
    }
    const onEnd = () => {
      settle();
      window.removeEventListener("scrollend", onEnd);
    };
    window.addEventListener("scrollend", onEnd, { once: true });
    window.setTimeout(settle, 600);
  }, []);

  return (
    <div
      ref={pageRef}
      className={styles.page}
      onClick={onBackgroundClick}
    >
      <HeroSection />
      <IntroSection />
      <HistorySection />
      <TeamSection />
      <VideoTourSection />
      <BeerSection />
      <AgentSection />
      <ToursSection />
      <BrewersHouseSection />
      <KlinFestSection />
      <BrainstormSection />
      <WhereSection />
      <ExportSection />
      <ThanksSection />
      {/* Sticky stack (NLM129) replaces proximity snap — they fight each other. */}
    </div>
  );
}
