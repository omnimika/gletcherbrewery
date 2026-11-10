"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LK_NAV, type LkPanelId } from "@/content/members-lk";
import { LkAgentPanel } from "./panels/agent-panel";
import { LkCheckPanel } from "./panels/check-panel";
import { LkInfoPanel, type LkInfoModel } from "./panels/info-panel";
import { LkPlaceholderPanel } from "./panels/placeholder-panel";
import { LkPurchasesPanel, type LkReceiptRow } from "./panels/purchases-panel";
import styles from "./lk-shell.module.css";

type Props = {
  info: LkInfoModel;
  receipts: LkReceiptRow[];
  defaultCity?: string;
  onLogout: () => void;
};

export function MembersLkShell({
  info,
  receipts,
  defaultCity,
  onLogout,
}: Props) {
  const [panel, setPanel] = useState<LkPanelId>("info");

  return (
    <div className={styles.root}>
      <aside className={styles.nav} aria-label="Разделы кабинета">
        <p className={styles.brand}>Агент Глетчер</p>
        <nav className={styles.navList}>
          {LK_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                panel === item.id ? styles.navBtnActive : styles.navBtn
              }
              onClick={() => setPanel(item.id)}
              aria-current={panel === item.id ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={styles.logout}
          onClick={onLogout}
        >
          Выйти
        </Button>
      </aside>

      <div className={styles.main}>
        {panel === "info" ? <LkInfoPanel info={info} /> : null}
        {panel === "check" ? (
          <LkCheckPanel defaultCity={defaultCity} />
        ) : null}
        {panel === "agent" ? <LkAgentPanel /> : null}
        {panel === "purchases" ? (
          <LkPurchasesPanel receipts={receipts} />
        ) : null}
        {panel === "shop" ? (
          <LkPlaceholderPanel
            title="Магазин"
            body="Спецпредложения и списание биркоинов — после правил spend (Open)."
          />
        ) : null}
        {panel === "statuses" ? (
          <LkPlaceholderPanel
            title="Статусы и призы"
            body="Лестница статусов из Airtable-формул ещё не перенесена. Пока уровень считается временно: +1 за каждые 1000₿."
          />
        ) : null}
      </div>
    </div>
  );
}
