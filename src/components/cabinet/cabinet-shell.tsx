"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { controlClassName } from "@/components/ui/control-recipe";
import { CABINET_COPY } from "@/content/cabinet";
import { CabinetAgentForm } from "./agent-form";
import { CabinetReceiptList } from "./receipt-list";
import type {
  CabinetAgentApplicationRow,
  CabinetInfoModel,
  CabinetReceiptRow,
} from "./types";
import { CabinetUploadForm } from "./upload-form";
import styles from "./cabinet-shell.module.css";

type Props = {
  info: CabinetInfoModel;
  receipts: CabinetReceiptRow[];
  agentApplications: CabinetAgentApplicationRow[];
  buyPlaces: readonly string[];
  defaultCity?: string;
  defaultPhone?: string;
  onLogout: () => void;
};

export function CabinetShell({
  info,
  receipts,
  agentApplications,
  buyPlaces,
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
          <p className={styles.kicker}>{CABINET_COPY.kicker}</p>
          <h1 className={styles.title}>{CABINET_COPY.title}</h1>
          <p className={styles.identity}>{name}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onLogout}>
          {CABINET_COPY.logout}
        </Button>
      </header>

      <section id="balance" className={styles.section} aria-labelledby="cabinet-balance">
        <div className={styles.balanceBlock}>
          <p id="cabinet-balance" className={styles.balanceValue}>
            {info.spendable}
            <span className={styles.coin}>₿</span>
          </p>
          <p className={styles.lead}>{CABINET_COPY.balanceHint}</p>
          {info.lifetimeEarn > 0 ? (
            <p className={styles.lifetime}>
              {info.lifetimeEarn} ₿ {CABINET_COPY.lifetimeHint}
            </p>
          ) : null}
          <div className={styles.actions}>
            <a href="#upload" className={controlClassName("primary", "md")}>
              {CABINET_COPY.uploadCta}
            </a>
          </div>
        </div>
      </section>

      <section id="upload" className={styles.section} aria-labelledby="cabinet-upload">
        <h2 id="cabinet-upload" className={styles.sectionTitle}>
          {CABINET_COPY.uploadTitle}
        </h2>
        <p className={styles.lead}>{CABINET_COPY.uploadLead}</p>
        <div className={styles.surface}>
          <CabinetUploadForm defaultCity={defaultCity} buyPlaces={buyPlaces} />
        </div>
      </section>

      <section id="history" className={styles.section} aria-labelledby="cabinet-history">
        <h2 id="cabinet-history" className={styles.sectionTitle}>
          {CABINET_COPY.historyTitle}
        </h2>
        {receipts.length === 0 ? (
          <CabinetReceiptList receipts={receipts} />
        ) : (
          <div className={styles.surface}>
            <CabinetReceiptList receipts={receipts} />
          </div>
        )}
      </section>

      <section id="progress" className={styles.section} aria-labelledby="cabinet-progress">
        <h2 id="cabinet-progress" className={styles.sectionTitle}>
          {CABINET_COPY.progressTitle}
        </h2>
        <p className={styles.lead}>{CABINET_COPY.progressLead}</p>
        <div className={styles.surface}>
          <dl className={styles.statusGrid}>
            <div>
              <dt>{CABINET_COPY.statusLabel}</dt>
              <dd className={styles.statusName}>{info.status}</dd>
            </div>
            <div>
              <dt>{CABINET_COPY.prizeLabel}</dt>
              <dd>{info.prize}</dd>
            </div>
          </dl>
          <div className={styles.progressMeta}>
            <span>
              {CABINET_COPY.levelLabel} {info.level}
            </span>
            <span>
              {CABINET_COPY.toNextLabel}: {info.toNextLevel} ₿
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

      <section id="invite" className={styles.section} aria-labelledby="cabinet-invite">
        <h2 id="cabinet-invite" className={styles.sectionTitle}>
          {CABINET_COPY.inviteTitle}
        </h2>
        <p className={styles.lead}>{CABINET_COPY.inviteLead}</p>
        <div className={styles.referralRow}>
          <p className={styles.referralUrl}>{info.referralUrl}</p>
          <Button type="button" variant="secondary" onClick={copyLink}>
            {copied ? CABINET_COPY.inviteCopied : CABINET_COPY.inviteCta}
          </Button>
        </div>
      </section>

      <section id="agent" className={styles.section} aria-labelledby="cabinet-agent">
        <h2 id="cabinet-agent" className={styles.sectionTitle}>
          {CABINET_COPY.agentTitle}
        </h2>
        <p className={styles.lead}>{CABINET_COPY.agentLead}</p>
        <div className={styles.surface}>
          <CabinetAgentForm
            defaultCity={defaultCity}
            defaultPhone={defaultPhone}
            applications={agentApplications}
          />
        </div>
      </section>

      <section id="more" className={styles.section} aria-labelledby="cabinet-more">
        <h2 id="cabinet-more" className={styles.sectionTitle}>
          {CABINET_COPY.moreTitle}
        </h2>
        <ul className={styles.soonList}>
          <li>{CABINET_COPY.moreShop}</li>
        </ul>
        <div className={styles.help}>
          <p>
            <strong>{CABINET_COPY.helpTitle}</strong>
            <br />
            {CABINET_COPY.helpName}
            <br />
            <a href={`tel:${CABINET_COPY.helpPhone.replace(/\s/g, "")}`}>
              {CABINET_COPY.helpPhone}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
