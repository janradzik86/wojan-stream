"use client";

import { useLayoutEffect } from "react";
import { purgeStaleUgcCatalog } from "@/lib/ugc-storage";

/**
 * Runs before paint: clear stale localStorage catalogs that conflict with
 * Hits v2 fixture (e.g. demo „Przykład UGC”) so cold load never flashes them.
 */
export function CatalogBoot() {
  useLayoutEffect(() => {
    purgeStaleUgcCatalog();
  }, []);
  return null;
}
