import { and, eq, sql } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import {
  deliveryJobs,
  formSubmissions,
  staffContactLeads,
  submissionConsents,
} from "@/server/db/schema";
import {
  DELIVERY_DESTINATIONS,
  type ConsentEvidence,
  type FormDefinition,
} from "./contracts";
import { computeIntentHash } from "./intent-hash";

export type SubmitInput = {
  def: FormDefinition;
  locale: string;
  sourcePath: string;
  placement: string | null;
  idempotencyKey: string;
  fields: Record<string, string | null>;
};

export type SubmitResult =
  | {
      kind: "created" | "replay";
      submissionId: string;
      status: "accepted";
      intentHash: string;
    }
  | {
      kind: "conflict";
      code: "idempotency_conflict";
      message: string;
    };

function buildConsentEvidence(def: FormDefinition): ConsentEvidence {
  return {
    channel: "form_submit",
    uiNotice:
      "Отправляя форму, вы соглашаетесь с политикой обработки персональных данных",
    policyUrl: def.policyUrl,
    policyVersion: def.policyVersion,
    accepted: true,
  };
}

export async function submitForm(
  db: AppDb,
  input: SubmitInput,
): Promise<SubmitResult> {
  const intentHash = computeIntentHash({
    formId: input.def.formId,
    locale: input.locale,
    schemaVersion: input.def.schemaVersion,
    fields: input.fields,
    consent: {
      purpose: input.def.purpose,
      policyVersion: input.def.policyVersion,
    },
  });

  const existing = await db
    .select({
      id: formSubmissions.id,
      intentHash: formSubmissions.intentHash,
      status: formSubmissions.status,
    })
    .from(formSubmissions)
    .where(
      and(
        eq(formSubmissions.formId, input.def.formId),
        eq(formSubmissions.locale, input.locale),
        eq(formSubmissions.idempotencyKey, input.idempotencyKey),
      ),
    )
    .limit(1);

  if (existing[0]) {
    if (existing[0].intentHash !== intentHash) {
      return {
        kind: "conflict",
        code: "idempotency_conflict",
        message: "Same idempotency key with different payload",
      };
    }
    return {
      kind: "replay",
      submissionId: existing[0].id,
      status: "accepted",
      intentHash,
    };
  }

  const evidence = buildConsentEvidence(input.def);

  try {
    const result = await db.transaction(async (tx) => {
      const [submission] = await tx
        .insert(formSubmissions)
        .values({
          formId: input.def.formId,
          locale: input.locale,
          schemaVersion: input.def.schemaVersion,
          sourcePath: input.sourcePath,
          placement: input.placement,
          idempotencyKey: input.idempotencyKey,
          intentHash,
          status: "accepted",
          fields: input.fields,
        })
        .returning({ id: formSubmissions.id });

      if (!submission) {
        throw new Error("insert form_submissions returned no row");
      }

      await tx.insert(submissionConsents).values({
        submissionId: submission.id,
        purpose: input.def.purpose,
        legalBasis: input.def.legalBasis,
        policyVersion: input.def.policyVersion,
        policyUrl: input.def.policyUrl,
        evidence,
      });

      await tx.insert(deliveryJobs).values(
        DELIVERY_DESTINATIONS.map((destination) => ({
          submissionId: submission.id,
          destination,
          eventType: "submission_accepted",
          schemaVersion: "1",
          status: "pending",
        })),
      );

      // Staff CRM projection for all intake forms (NocoDB reads public.*).
      {
        const createdAt = new Date();
        const f = input.fields;
        const leadRow = {
          submissionId: submission.id,
          formId: input.def.formId,
          locale: input.locale,
          sourcePath: input.sourcePath,
          status: "accepted",
          createdAt,
          name: f.name ?? null,
          email: f.email ?? null,
          phone: f.phone ?? null,
          city: f.city ?? null,
          company: f.company ?? null,
          comment: f.comment ?? null,
          partnerType: f.type ?? null,
          inn: f.inn ?? null,
          tourDate: f.date ?? null,
          guests: f.guests ?? null,
          wishes: f.wishes ?? null,
        };
        await tx.insert(staffContactLeads).values(leadRow);
        const createdAtIso = createdAt.toISOString();
        await tx.execute(sql`
          INSERT INTO public.staff_contact_leads (
            submission_id, form_id, locale, source_path, status, created_at,
            name, email, phone, city, company, comment,
            partner_type, inn, tour_date, guests, wishes
          ) VALUES (
            ${leadRow.submissionId}::uuid, ${leadRow.formId}, ${leadRow.locale},
            ${leadRow.sourcePath}, ${leadRow.status}, ${createdAtIso}::timestamptz,
            ${leadRow.name}, ${leadRow.email}, ${leadRow.phone},
            ${leadRow.city}, ${leadRow.company}, ${leadRow.comment},
            ${leadRow.partnerType}, ${leadRow.inn}, ${leadRow.tourDate},
            ${leadRow.guests}, ${leadRow.wishes}
          )
        `);
      }

      return submission.id;
    });

    return {
      kind: "created",
      submissionId: result,
      status: "accepted",
      intentHash,
    };
  } catch (err) {
    // Concurrent insert with same idempotency key — re-read and classify.
    const race = await db
      .select({
        id: formSubmissions.id,
        intentHash: formSubmissions.intentHash,
      })
      .from(formSubmissions)
      .where(
        and(
          eq(formSubmissions.formId, input.def.formId),
          eq(formSubmissions.locale, input.locale),
          eq(formSubmissions.idempotencyKey, input.idempotencyKey),
        ),
      )
      .limit(1);

    if (race[0]) {
      if (race[0].intentHash !== intentHash) {
        return {
          kind: "conflict",
          code: "idempotency_conflict",
          message: "Same idempotency key with different payload",
        };
      }
      return {
        kind: "replay",
        submissionId: race[0].id,
        status: "accepted",
        intentHash,
      };
    }

    throw err;
  }
}
