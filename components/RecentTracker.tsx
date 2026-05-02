"use client";

import { useTrackToolVisit } from "@/lib/useRecentTools";

// Mounts inside server-rendered ToolPage to log a localStorage entry on visit.
export function RecentTracker({ slug }: { slug: string }) {
  useTrackToolVisit(slug);
  return null;
}
