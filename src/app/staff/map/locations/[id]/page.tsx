import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getDb } from "@/server/db/client";
import {
  isStaffAuthConfigured,
  STAFF_COOKIE_NAME,
  verifyStaffToken,
} from "@/server/staff/auth";
import { getLocationAssortment } from "@/server/retail/location-assortment";
import { Banner } from "@/components/ui/card";
import { FormStatus } from "@/components/ui/feedback";
import { DeleteLocationButton } from "./delete-location-button";
import { LocationAssortmentEditor } from "./location-assortment-editor";

export const dynamic = "force-dynamic";

export default async function StaffLocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isStaffAuthConfigured()) {
    redirect("/staff");
  }

  const cookieStore = await cookies();
  if (!verifyStaffToken(cookieStore.get(STAFF_COOKIE_NAME)?.value)) {
    redirect("/staff");
  }

  const { id } = await params;
  let detail: Awaited<ReturnType<typeof getLocationAssortment>> = null;
  let error: string | null = null;
  try {
    detail = await getLocationAssortment(getDb(), id);
  } catch {
    error = "База недоступна.";
  }

  if (!error && !detail) notFound();

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div>
        <p className="type-caption text-gletcher-navy/60">
          <Link
            href="/staff/map"
            className="underline-offset-2 hover:underline"
          >
            Карта продаж
          </Link>
          {" / "}
          <Link
            href="/staff/map/locations"
            className="underline-offset-2 hover:underline"
          >
            Точки
          </Link>
          {" / "}
          SKU
        </p>
        <h1 className="font-display text-2xl leading-none font-extrabold tracking-wide text-gletcher-navy uppercase sm:text-3xl">
          Ассортимент точки
        </h1>
      </div>

      <Banner tone="ice" className="!px-4 !py-2.5">
        <p className="type-caption text-gletcher-navy/80">
          По умолчанию точка наследует SKU сети. Персональный режим копирует
          текущую матрицу сети; дальше правки только для этой точки. На /map
          попадёт после Product publish.
        </p>
      </Banner>

      {error ? (
        <FormStatus tone="error" role="alert">
          {error}
        </FormStatus>
      ) : null}

      {detail ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DeleteLocationButton locationId={detail.id} />
          </div>
          <LocationAssortmentEditor initial={detail} />
        </>
      ) : null}
    </div>
  );
}
