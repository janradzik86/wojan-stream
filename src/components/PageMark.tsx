"use client";

import { useEffect } from "react";

/** Sets body[data-page] for route-specific atmosphere (e.g. subtler wolf on /live). */
export function PageMark({ page }: { page: string }) {
  useEffect(() => {
    document.body.dataset.page = page;
    return () => {
      delete document.body.dataset.page;
    };
  }, [page]);
  return null;
}
