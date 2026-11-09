import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/server/db/client";
import {
  isStaffAuthConfigured,
  STAFF_COOKIE_NAME,
  verifyStaffToken,
} from "@/server/staff/auth";
import { getAssortmentMatrix } from "@/server/retail/assortment";
import { Banner } from "@/components/ui/card";
import { EmptyState, FormStatus } from "@/components/ui/feedback";
import { AssortmentMatrix } from "./assortment-matrix";
import { TilesetPublishPanel } from "./tileset-publish-panel";

export const dynamic = "force-dynamic";

export default async function StaffMapPage() {
  if (!isStaffAuthConfigured()) {
    redirect("/staff");
  }

  const cookieStore = await cookies();
  if (!verifyStaffToken(cookieStore.get(STAFF_COOKIE_NAME)?.value)) {
    redirect("/staff");
  }

  let matrix: Awaited<ReturnType<typeof getAssortmentMatrix>> | null = null;
  let error: string | null = null;
  try {
    matrix = await getAssortmentMatrix(getDb());
  } catch {
    error = "База недоступна — проверьте embedded PostgreSQL и миграции.";
  }

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <h1 className="font-display text-2xl leading-none font-extrabold tracking-wide text-gletcher-navy uppercase sm:text-3xl">
        Карта продаж
      </h1>

      <Banner tone="ice" className="!px-4 !py-2.5">
        <p className="type-caption text-gletcher-navy/80">
          Чекбокс → PostgreSQL + audit. Строка сортов закреплена при скролле.
          Product для Mapbox собирается отдельным dry-run ниже.
        </p>
      </Banner>

      <TilesetPublishPanel />

      {error ? (
        <FormStatus tone="error" role="alert">
          {error}
        </FormStatus>
      ) : null}

      {matrix && matrix.chains.length === 0 ? (
        <EmptyState
          title="Матрица пуста"
          body="Выполните: npm run retail:seed-assortment"
        />
      ) : null}

      {matrix && matrix.chains.length > 0 ? (
        <AssortmentMatrix columns={matrix.columns} chains={matrix.chains} />
      ) : null}
    </div>
  );
}
