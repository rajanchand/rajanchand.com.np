"use client";

import { updatePortfolioData } from "@/lib/data";

interface PortfolioSyncProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export function PortfolioSync({ data }: PortfolioSyncProps) {
  // We run this in the constructor/render phase so it updates client references
  // immediately during hydration before other components render!
  if (data && typeof window !== "undefined") {
    updatePortfolioData(data);
  }

  return null;
}
