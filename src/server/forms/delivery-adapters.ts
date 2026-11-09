/**
 * B1: delivery adapter contracts + fault-test interfaces.
 * Live Telegram/Sheets delivery is B2 — mocks are not live PASS.
 */

import type { DeliveryDestination } from "./contracts";

export type DeliveryJobSnapshot = {
  id: string;
  submissionId: string;
  destination: DeliveryDestination;
  status: string;
  attempts: number;
};

export type DeliveryAttemptResult =
  | { outcome: "delivered"; remoteReference: string }
  | { outcome: "retryable"; sanitizedError: string; retryAfterMs?: number }
  | { outcome: "failed"; sanitizedError: string }
  | { outcome: "ambiguous"; sanitizedError: string; remoteReference?: string }
  | { outcome: "config_required"; sanitizedError: string };

export interface DeliveryAdapter {
  destination: DeliveryDestination;
  /** Never log secrets / full PII. */
  deliver(job: DeliveryJobSnapshot, fieldsAllowlist: string[]): Promise<DeliveryAttemptResult>;
}

/** Test double: always succeeds with a fake reference. */
export class FakeSuccessAdapter implements DeliveryAdapter {
  constructor(public destination: DeliveryDestination) {}
  async deliver(job: DeliveryJobSnapshot): Promise<DeliveryAttemptResult> {
    return {
      outcome: "delivered",
      remoteReference: `fake:${this.destination}:${job.submissionId}`,
    };
  }
}

/** Test double: simulates timeout / ambiguous remote write. */
export class FakeAmbiguousAdapter implements DeliveryAdapter {
  constructor(public destination: DeliveryDestination) {}
  async deliver(): Promise<DeliveryAttemptResult> {
    return {
      outcome: "ambiguous",
      sanitizedError: "remote_timeout_after_possible_accept",
    };
  }
}

/** Test double: missing sandbox credentials. */
export class FakeConfigRequiredAdapter implements DeliveryAdapter {
  constructor(public destination: DeliveryDestination) {}
  async deliver(): Promise<DeliveryAttemptResult> {
    return {
      outcome: "config_required",
      sanitizedError: "destination_not_configured",
    };
  }
}

export function defaultB1Adapters(): DeliveryAdapter[] {
  return [
    new FakeConfigRequiredAdapter("telegram"),
    new FakeConfigRequiredAdapter("sheets"),
  ];
}
