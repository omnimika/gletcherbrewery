"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LK_INFO_COPY } from "@/content/members-lk";
import styles from "./panel.module.css";

export type LkInfoModel = {
  email: string;
  displayName: string | null;
  city: string | null;
  spendable: number;
  lifetimeEarn: number;
  level: number;
  toNextLevel: number;
  progressPct: number;
  referralUrl: string;
};

export function LkInfoPanel({ info }: { info: LkInfoModel }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(info.referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.stack}>
      <section className={styles.card}>
        <h2 className={styles.h2}>Профиль</h2>
        <dl className={styles.dl}>
          <div>
            <dt>Имя</dt>
            <dd>{info.displayName || "—"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{info.email}</dd>
          </div>
          <div>
            <dt>Город</dt>
            <dd>{info.city || "—"}</dd>
          </div>
        </dl>
        <p className={styles.balance}>
          {info.spendable}{" "}
          <span className={styles.coin}>₿</span>
        </p>
        <p className={styles.caption}>Доступно к трате</p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.h2}>{LK_INFO_COPY.levelsIntro}</h2>
        <p className={styles.body}>{LK_INFO_COPY.levelsBody}</p>
        <div className={styles.levelBlock}>
          <p className={styles.label}>Уровень (временно)</p>
          <p className={styles.levelValue}>{info.level}</p>
          <p className={styles.label}>Статус / приз</p>
          <p className={styles.muted}>
            Пока Open — формулы Airtable не перенесены
          </p>
          <div
            className={styles.progress}
            role="progressbar"
            aria-valuenow={info.progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Прогресс до следующего уровня"
          >
            <span style={{ width: `${info.progressPct}%` }} />
          </div>
          <p className={styles.caption}>
            До следующего уровня: {info.toNextLevel} ₿ · накоплено{" "}
            {info.lifetimeEarn} ₿
          </p>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.h2}>{LK_INFO_COPY.friendsTitle}</h2>
        <p className={styles.body}>{LK_INFO_COPY.friendsBody}</p>
        <p className={styles.referral}>{info.referralUrl}</p>
        <Button type="button" variant="secondary" onClick={copyLink}>
          {copied ? "Скопировано" : "Поделиться ссылкой"}
        </Button>
      </section>

      <section className={styles.card}>
        <h2 className={styles.h2}>{LK_INFO_COPY.bircoinTitle}</h2>
        <p className={styles.body}>{LK_INFO_COPY.bircoinBody}</p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.h2}>{LK_INFO_COPY.prizesContactPhone}</h2>
        <p className={styles.body}>
          {LK_INFO_COPY.prizesContactName}
          <br />
          {LK_INFO_COPY.prizesContactNote}
        </p>
      </section>
    </div>
  );
}
