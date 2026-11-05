import Image from "next/image";
import { ZbAppear } from "@/components/agent/zb-motion";
import { ManagedVideo } from "@/components/media/managed-video";
import { ToursRequestForm } from "@/components/tours/tours-request-form";
import type { ToursCopy } from "@/content/tours";
import styles from "./tours-contact.module.css";

const VIDEO = {
  webm: "https://files.gletcherbrewery.com/vid/registration-vp9-chrome-l.webm",
  mp4: "https://files.gletcherbrewery.com/vid/registration.mp4",
} as const;

/**
 * ZB `750698486` — guide card + phone + contact form + registration video.
 */
export function ToursContactSection({ copy }: { copy: ToursCopy }) {
  const c = copy.contact;
  return (
    <section
      id="request"
      tabIndex={-1}
      className={`${styles.screen} ds-snap-start`}
      aria-labelledby="tours-request"
    >
      <div className={styles.stage}>
        <ZbAppear
          className={styles.videoWrap}
          anim="zoomin"
          duration={1}
          scale={0.9}
          mobile
        >
          <div className={styles.videoFrame}>
            <ManagedVideo className={styles.video} aria-hidden>
              <source src={VIDEO.webm} type="video/webm" />
              <source src={VIDEO.mp4} type="video/mp4" />
            </ManagedVideo>
          </div>
        </ZbAppear>

        <div className={styles.grid}>
          {c.lead ? (
            <ZbAppear className={styles.leadCol} anim="fadeinup" duration={0.8} mobile>
              <p className={styles.lead}>{c.lead}</p>
            </ZbAppear>
          ) : (
            <div className={styles.leadCol} aria-hidden />
          )}

          <ZbAppear
            className={styles.formCol}
            anim="zoomin"
            duration={1}
            scale={0.9}
            delay={0.3}
            mobile
          >
            <ToursRequestForm
              fields={copy.requestFields}
              phone={copy.phone}
              variant="contact"
            />
          </ZbAppear>

          <article className={styles.guideCard}>
            <div className={styles.guideHead}>
              <p className={styles.guideName}>{c.guideName}</p>
              <p className={styles.guideRole}>{c.guideRole}</p>
            </div>
            <div className={styles.guidePhoto}>
              <Image
                src="/tours/guide-inna.png"
                alt={c.guideName}
                width={1008}
                height={560}
                className="h-full w-full object-cover"
                sizes="(max-width:640px) 90vw, 300px"
              />
            </div>
          </article>

          <div className={styles.titleCol}>
            <ZbAppear anim="fadeinup" duration={0.7} mobile>
              <h2 id="tours-request" className={styles.title}>
                {c.title}
              </h2>
            </ZbAppear>
            <ZbAppear anim="fadeinup" duration={0.7} delay={0.05} mobile>
              <p className={styles.callHelp}>{c.callHelp}</p>
            </ZbAppear>
          </div>

          <ZbAppear className={styles.phoneCol} anim="fadeinup" duration={0.8} delay={0.1} mobile>
            <a href={copy.phone.href} className={styles.phone}>
              {copy.phone.label}
            </a>
          </ZbAppear>
        </div>
      </div>
    </section>
  );
}
