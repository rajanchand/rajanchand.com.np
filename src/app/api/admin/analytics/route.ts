import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Helper to check authentication
async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "rajan-portfolio-secure-token-2026";
}

export async function GET(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";

    // Calculate date filter
    let dateFilter: string | null = null;
    const now = new Date();
    switch (range) {
      case "today":
        dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        break;
      case "7d":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case "30d":
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case "all":
      default:
        dateFilter = null;
        break;
    }

    // Fetch recent visitors
    let query = supabase
      .from("visitors")
      .select("*")
      .order("visited_at", { ascending: false })
      .limit(100);

    if (dateFilter) {
      query = query.gte("visited_at", dateFilter);
    }

    const { data: visitors, error } = await query;

    if (error) {
      console.error("Analytics query error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const visitorList = visitors || [];

    // Aggregate stats
    const totalVisits = visitorList.length;
    const uniqueIPs = new Set(visitorList.map((v) => v.ip_address)).size;

    // Top countries
    const countryCounts: Record<string, number> = {};
    visitorList.forEach((v) => {
      const c = v.country || "Unknown";
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }));

    // Top browsers
    const browserCounts: Record<string, number> = {};
    visitorList.forEach((v) => {
      const b = v.browser || "Unknown";
      browserCounts[b] = (browserCounts[b] || 0) + 1;
    });
    const topBrowsers = Object.entries(browserCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([browser, count]) => ({ browser, count }));

    // Top devices
    const deviceCounts: Record<string, number> = {};
    visitorList.forEach((v) => {
      const d = v.device_type || "Unknown";
      deviceCounts[d] = (deviceCounts[d] || 0) + 1;
    });
    const topDevices = Object.entries(deviceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([device, count]) => ({ device, count }));

    // Top pages
    const pageCounts: Record<string, number> = {};
    visitorList.forEach((v) => {
      const p = v.page_url || "/";
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([page, count]) => ({ page, count }));

    return NextResponse.json({
      totalVisits,
      uniqueIPs,
      topCountries,
      topBrowsers,
      topDevices,
      topPages,
      recentVisitors: visitorList.slice(0, 50), // Last 50 visitors
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
