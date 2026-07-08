"use client";

import { useLayoutEffect } from "react";
import { updatePortfolioData } from "@/lib/data";

interface PortfolioSyncProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export function PortfolioSync({ data }: PortfolioSyncProps) {
  useLayoutEffect(() => {
    if (data) updatePortfolioData(data);
  }, [data]);

  return null;
}
