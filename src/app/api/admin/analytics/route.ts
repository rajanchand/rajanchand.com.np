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

    // Fetch recent visitors - query up to 2000 records for accurate aggregates in range
    let query = supabase
      .from("visitors")
      .select("*")
      .order("visited_at", { ascending: false });

    if (dateFilter) {
      query = query.gte("visited_at", dateFilter);
    } else {
      query = query.limit(2000);
    }

    const { data: visitors, error } = await query;

    if (error) {
      console.error("Analytics query error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const visitorList = visitors || [];

    // Aggregate basic stats
    const totalVisits = visitorList.length;
    const uniqueIPs = new Set(visitorList.map((v) => v.ip_address)).size;

    // Active Sessions (active in the last 5 minutes)
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).getTime();
    const activeSessions = new Set(
      visitorList
        .filter((v) => new Date(v.visited_at).getTime() >= fiveMinsAgo)
        .map((v) => v.ip_address)
    ).size;

    // Bounce Rate and Session Duration Calculations
    const ipGroups: Record<string, typeof visitorList> = {};
    visitorList.forEach((v) => {
      if (!ipGroups[v.ip_address]) {
        ipGroups[v.ip_address] = [];
      }
      ipGroups[v.ip_address].push(v);
    });

    let singlePageIPs = 0;
    let totalDurationSeconds = 0;
    let sessionCountWithDuration = 0;

    Object.values(ipGroups).forEach((group) => {
      // Sort visits for this IP ascending by visited_at
      group.sort((a, b) => new Date(a.visited_at).getTime() - new Date(b.visited_at).getTime());
      
      if (group.length === 1) {
        singlePageIPs++;
      } else {
        const start = new Date(group[0].visited_at).getTime();
        const end = new Date(group[group.length - 1].visited_at).getTime();
        const diff = (end - start) / 1000; // in seconds
        // Cap single session at 2 hours to exclude outlier open tabs
        const cappedDiff = Math.min(diff, 7200);
        totalDurationSeconds += cappedDiff;
        sessionCountWithDuration++;
      }
    });

    const totalIPs = Object.keys(ipGroups).length;
    const bounceRate = totalIPs > 0 ? Math.round((singlePageIPs / totalIPs) * 100) : 0;
    const avgSessionDuration = sessionCountWithDuration > 0 ? Math.round(totalDurationSeconds / sessionCountWithDuration) : 0;

    // Historical Chart Data (group by hour for today, day for other ranges)
    const chartData: { label: string; visits: number; unique: number }[] = [];

    if (range === "today") {
      // Last 24 hours hourly tracking
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourLabel = d.toLocaleString("en-US", { hour: "numeric", hour12: true });
        
        const hourVisits = visitorList.filter((v) => {
          const vDate = new Date(v.visited_at);
          return (
            vDate.getFullYear() === d.getFullYear() &&
            vDate.getMonth() === d.getMonth() &&
            vDate.getDate() === d.getDate() &&
            vDate.getHours() === d.getHours()
          );
        });

        chartData.push({
          label: hourLabel,
          visits: hourVisits.length,
          unique: new Set(hourVisits.map((v) => v.ip_address)).size,
        });
      }
    } else {
      // Daily tracking for 7d, 30d, or all
      const daysCount = range === "30d" || range === "all" ? 30 : 7;
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        
        const dayVisits = visitorList.filter((v) => {
          const vDate = new Date(v.visited_at);
          return (
            vDate.getFullYear() === d.getFullYear() &&
            vDate.getMonth() === d.getMonth() &&
            vDate.getDate() === d.getDate()
          );
        });

        chartData.push({
          label: dayLabel,
          visits: dayVisits.length,
          unique: new Set(dayVisits.map((v) => v.ip_address)).size,
        });
      }
    }

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
      .slice(0, 10) // Return top 10 pages as requested
      .map(([page, count]) => ({ page, count }));

    // Top Referrers
    const referrerCounts: Record<string, number> = {};
    visitorList.forEach((v) => {
      const ref = v.referrer || "Direct / Bookmark";
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    });
    const topReferrers = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count }));

    return NextResponse.json({
      totalVisits,
      uniqueIPs,
      activeSessions,
      bounceRate,
      avgSessionDuration,
      topCountries,
      topBrowsers,
      topDevices,
      topPages,
      topReferrers,
      chartData,
      recentVisitors: visitorList.slice(0, 50), // Last 50 visitors
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
