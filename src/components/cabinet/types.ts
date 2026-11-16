export type CabinetInfoModel = {
  email: string;
  displayName: string | null;
  city: string | null;
  spendable: number;
  lifetimeEarn: number;
  level: number;
  toNextLevel: number;
  progressPct: number;
  status: string;
  prize: string;
  referralUrl: string;
};

export type CabinetReceiptRow = {
  id: string;
  purchaseAt: string | null;
  city: string | null;
  venue: string | null;
  sum: string | null;
  proposedEarn: number | null;
  status: string;
  /** Local object key or legacy external URL for viewing. */
  photoHref: string | null;
  /** Open in new tab (legacy external hosts). */
  photoExternal: boolean;
};

export type CabinetAgentApplicationRow = {
  id: string;
  status: string;
  statusLabel: string;
  venueName: string;
  publicNote: string | null;
  createdAt: string | Date;
};
