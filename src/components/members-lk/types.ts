export type LkInfoModel = {
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

export type LkReceiptRow = {
  id: string;
  purchaseAt: string | null;
  city: string | null;
  venue: string | null;
  sum: string | null;
  proposedEarn: number | null;
  status: string;
};

export type LkAgentApplicationRow = {
  id: string;
  status: string;
  venueName: string;
  createdAt: string | Date;
};
