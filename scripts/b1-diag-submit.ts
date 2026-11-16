import { randomUUID } from "node:crypto";
import { createDb, closeDb } from "../src/server/db/client";
import { FORM_DEFINITIONS } from "../src/server/forms/contracts";
import { submitForm } from "../src/server/forms/submit";

async function main() {
  const { db } = createDb();
  const def = FORM_DEFINITIONS.contacts;
  if (!def) throw new Error("no contacts def");
  try {
    const r = await submitForm(db, {
      def,
      locale: "ru",
      sourcePath: "/contacts",
      placement: "diag",
      idempotencyKey: randomUUID(),
      fields: {
        name: "Diag",
        email: "diag@example.com",
        phone: "+7 495 000-00-00",
        city: "Клин",
        company: "Diag Co",
        comment: "diag",
      },
    });
    console.log("OK", r);
  } catch (err) {
    console.error("FAIL", err);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
}

void main();
