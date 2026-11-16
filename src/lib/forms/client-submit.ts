"use client";

export type ClientSubmitOk = {
  ok: true;
  submissionId: string;
  replay?: boolean;
};

export type ClientSubmitErr = {
  ok: false;
  status: number;
  code?: string;
  message?: string;
};

export function ensureIdempotencyKey(storageKey: string): string {
  try {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const key = crypto.randomUUID();
    sessionStorage.setItem(storageKey, key);
    return key;
  } catch {
    return crypto.randomUUID();
  }
}

export function clearIdempotencyKey(storageKey: string): void {
  try {
    sessionStorage.removeItem(storageKey);
  } catch {
    /* ignore */
  }
}

export async function postFormSubmission(body: unknown): Promise<
  ClientSubmitOk | ClientSubmitErr
> {
  let res: Response;
  try {
    res = await fetch("/api/forms/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, status: 0, code: "network", message: "network_error" };
  }

  const json = (await res.json().catch(() => null)) as {
    ok?: boolean;
    submissionId?: string;
    replay?: boolean;
    code?: string;
    message?: string;
  } | null;

  if (res.status === 202 && json?.ok && json.submissionId) {
    return {
      ok: true,
      submissionId: json.submissionId,
      replay: json.replay,
    };
  }

  return {
    ok: false,
    status: res.status,
    code: json?.code,
    message: json?.message,
  };
}
