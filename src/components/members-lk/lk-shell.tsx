"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { controlClassName } from "@/components/ui/control-recipe";
import { LK_COPY } from "@/content/members-lk";
import { LkAgentForm } from "./agent-form";
import { LkReceiptList } from "./receipt-list";
import type {
  LkAgentApplicationRow,
  LkInfoModel,
  LkReceiptRow,
} from "./types";
import { LkUploadForm } from "./upload-form";
import styles from "./lk-shell.module.css";

type Props = {
  info: LkInfoModel;
  receipts: LkReceiptRow[];
  pendingAgent: LkAgentApplicationRow | null;
  defaultCity?: string;
  defaultPhone?: string;
  onLogout: () => void;
};

export function MembersLkShell({
  info,
  receipts,
  pendingAgent,
  defaultCity,
  defaultPhone,
  onLogout,
}: Props) {
  const [copied, setCopied] = useState(false);
  const name = info.displayName?.trim() || info.email;

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
    <div className={styles.root}>
      <header className={styles.top}>
        <div>
          <p className={styles.kicker}>{LK_COPY.kicker}</p>
          <h1 className={styles.title}>{LK_COPY.title}</h1>
          <p className={styles.identity}>{name}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onLogout}>
          {LK_COPY.logout}
        </Button>
      </header>

      <section id="balance" className={styles.section} aria-labelledby="lk-balance">
        <div className={styles.balanceBlock}>
          <p id="lk-balance" className={styles.balanceValue}>
            {info.spendable}
            <span className={styles.coin}>₿</span>
          </p>
          <p className={styles.lead}>{LK_COPY.balanceHint}</p>
          {info.lifetimeEarn > 0 ? (
            <p className={styles.lifetime}>
              {info.lifetimeEarn} ₿ {LK_COPY.lifetimeHint}
            </p>
          ) : null}
          <div className={styles.actions}>
            <a href="#upload" className={controlClassName("primary", "md")}>
              {LK_COPY.uploadCta}
            </a>
          </div>
        </div>
      </section>

      <section id="upload" className={styles.section} aria-labelledby="lk-upload">
        <h2 id="lk-upload" className={styles.sectionTitle}>
          {LK_COPY.uploadTitle}
        </h2>
        <p className={styles.lead}>{LK_COPY.uploadLead}</p>
        <div className={styles.surface}>
          <LkUploadForm defaultCity={defaultCity} />
        </div>
      </section>

      <section id="history" className={styles.section} aria-labelledby="lk-history">
        <h2 id="lk-history" className={styles.sectionTitle}>
          {LK_COPY.historyTitle}
        </h2>
        {receipts.length === 0 ? (
          <LkReceiptList receipts={receipts} />
        ) : (
          <div className={styles.surface}>
            <LkReceiptList receipts={receipts} />
          </div>
        )}
      </section>

      <section id="progress" className={styles.section} aria-labelledby="lk-progress">
        <h2 id="lk-progress" className={styles.sectionTitle}>
          {LK_COPY.progressTitle}
        </h2>
        <p className={styles.lead}>{LK_COPY.progressLead}</p>
        <div className={styles.surface}>
          <dl className={styles.statusGrid}>
            <div>
              <dt>{LK_COPY.statusLabel}</dt>
              <dd className={styles.statusName}>{info.status}</dd>
            </div>
            <div>
              <dt>{LK_COPY.prizeLabel}</dt>
              <dd>{info.prize}</dd>
            </div>
          </dl>
          <div className={styles.progressMeta}>
            <span>
              {LK_COPY.levelLabel} {info.level}
            </span>
            <span>
              {LK_COPY.toNextLabel}: {info.toNextLevel} ₿
            </span>
          </div>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={info.progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Прогресс до следующего уровня"
          >
            <span style={{ width: `${info.progressPct}%` }} />
          </div>
        </div>
      </section>

      <section id="invite" className={styles.section} aria-labelledby="lk-invite">
        <h2 id="lk-invite" className={styles.sectionTitle}>
          {LK_COPY.inviteTitle}
        </h2>
        <p className={styles.lead}>{LK_COPY.inviteLead}</p>
        <div className={styles.referralRow}>
          <p className={styles.referralUrl}>{info.referralUrl}</p>
          <Button type="button" variant="secondary" onClick={copyLink}>
            {copied ? LK_COPY.inviteCopied : LK_COPY.inviteCta}
          </Button>
        </div>
      </section>

      <section id="agent" className={styles.section} aria-labelledby="lk-agent">
        <h2 id="lk-agent" className={styles.sectionTitle}>
          {LK_COPY.agentTitle}
        </h2>
        <p className={styles.lead}>{LK_COPY.agentLead}</p>
        <div className={styles.surface}>
          <LkAgentForm
            defaultCity={defaultCity}
            defaultPhone={defaultPhone}
            pending={pendingAgent}
          />
        </div>
      </section>

      <section id="more" className={styles.section} aria-labelledby="lk-more">
        <h2 id="lk-more" className={styles.sectionTitle}>
          {LK_COPY.moreTitle}
        </h2>
        <ul className={styles.soonList}>
          <li>{LK_COPY.moreShop}</li>
        </ul>
        <div className={styles.help}>
          <p>
            <strong>{LK_COPY.helpTitle}</strong>
            <br />
            {LK_COPY.helpName}
            <br />
            <a href={`tel:${LK_COPY.helpPhone.replace(/\s/g, "")}`}>
              {LK_COPY.helpPhone}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
