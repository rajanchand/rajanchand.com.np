import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { isAdminAuthenticated, getClientIp } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const analyticsRateLimiter = createRateLimiter({ max: 60, windowMs: 60 * 1000 });

interface SecurityAuditLog {
  id?: string | number;
  type: "2FA_SUCCESS" | "LOGIN_FAILED";
  ip: string;
  city: string;
  region: string;
  country: string;
  isp: string;
  browser: string;
  os: string;
  device: string;
  visited_at: string;
  user_agent: string;
}

interface VisitorRecord {
  id?: string | number;
  ip_address: string;
  city?: string;
  region?: string;
  country?: string;
  isp?: string;
  browser?: string;
  os?: string;
  device_type?: string;
  user_agent?: string;
  visited_at: string;
  page_url?: string;
}

interface VisitorSessionGroup {
  ip: string;
  city: string;
  region: string;
  country: string;
  isp: string;
  browser: string;
  os: string;
  device: string;
  user_agent: string;
  visits: VisitorRecord[];
  firstSeen: string;
  lastSeen: string;
}

export async function GET(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientIp = getClientIp(await headers());
    const rateCheck = analyticsRateLimiter(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSec) } }
      );
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
      return serverError("Analytics query error:", error);
    }

    const visitorList: VisitorRecord[] = visitors || [];

    const totalVisits = visitorList.length;
    const uniqueIPs = new Set(visitorList.map((v) => v.ip_address)).size;

    // Active Sessions (active in the last 5 minutes)
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).getTime();
    const activeSessions = new Set(
      visitorList
        .filter((v) => new Date(v.visited_at).getTime() >= fiveMinsAgo)
        .map((v) => v.ip_address)
    ).size;

    // Security Audit Event Classification
    const securityAuditLogs: SecurityAuditLog[] = [];
    let successLogins = 0;
    let failedLogins = 0;

    visitorList.forEach((v) => {
      const combined = `${v.browser || ""} ${v.user_agent || ""}`;
      const isSuccess = combined.includes("ADMIN LOGIN SUCCESS");
      const isFailed = combined.includes("ADMIN LOGIN FAILED");

      if (isSuccess || isFailed) {
        if (isSuccess) successLogins++;
        if (isFailed) failedLogins++;

        securityAuditLogs.push({
          id: v.id,
          type: isSuccess ? "2FA_SUCCESS" : "LOGIN_FAILED",
          ip: v.ip_address,
          city: v.city || "Unknown",
          region: v.region || "",
          country: v.country || "Unknown",
          isp: v.isp || "Direct ISP",
          browser: v.browser || "Unknown",
          os: v.os || "Unknown",
          device: v.device_type || "Desktop",
          visited_at: v.visited_at,
          user_agent: v.user_agent || "",
        });
      }
    });

    // Group Individual Visitor Sessions by IP
    const ipMap: Record<string, VisitorSessionGroup> = {};
    visitorList.forEach((v) => {
      const ip = v.ip_address;
      if (!ipMap[ip]) {
        ipMap[ip] = {
          ip,
          city: v.city || "Unknown",
          region: v.region || "",
          country: v.country || "Unknown",
          isp: v.isp || "Direct ISP",
          browser: v.browser || "Unknown",
          os: v.os || "Unknown",
          device: v.device_type || "Desktop",
          user_agent: v.user_agent || "",
          visits: [],
          firstSeen: v.visited_at,
          lastSeen: v.visited_at,
        };
      }
      ipMap[ip].visits.push(v);
      if (new Date(v.visited_at).getTime() < new Date(ipMap[ip].firstSeen).getTime()) {
        ipMap[ip].firstSeen = v.visited_at;
      }
      if (new Date(v.visited_at).getTime() > new Date(ipMap[ip].lastSeen).getTime()) {
        ipMap[ip].lastSeen = v.visited_at;
      }
    });

    // Calculate spend time per IP session
    const individualSessions = Object.values(ipMap).map((session: VisitorSessionGroup) => {
      const first = new Date(session.firstSeen).getTime();
      const last = new Date(session.lastSeen).getTime();
      const durationSec = Math.round((last - first) / 1000);

      let spendTimeStr = "Single Hit (< 30s)";
      if (durationSec > 0) {
        const mins = Math.floor(durationSec / 60);
        const secs = durationSec % 60;
        spendTimeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
      }

      const pagesHit = Array.from(new Set(session.visits.map((v: VisitorRecord) => v.page_url || "/")));

      return {
        ip: session.ip,
        city: session.city,
        region: session.region,
        country: session.country,
        isp: session.isp,
        browser: session.browser,
        os: session.os,
        device: session.device,
        user_agent: session.user_agent,
        totalVisits: session.visits.length,
        spendTime: spendTimeStr,
        durationSec,
        pagesHit,
        latestPage: session.visits[0]?.page_url || "/",
        lastSeen: session.lastSeen,
      };
    });

    // Country & City Breakdown
    const countryCityMap: Record<string, { country: string; totalHits: number; cities: Record<string, number> }> = {};
    visitorList.forEach((v) => {
      const country = v.country || "Unknown Country";
      const city = v.city || "Unknown City";
      if (!countryCityMap[country]) {
        countryCityMap[country] = { country, totalHits: 0, cities: {} };
      }
      countryCityMap[country].totalHits++;
      countryCityMap[country].cities[city] = (countryCityMap[country].cities[city] || 0) + 1;
    });

    const countryCityBreakdown = Object.values(countryCityMap)
      .sort((a, b) => b.totalHits - a.totalHits)
      .slice(0, 10)
      .map((c) => ({
        country: c.country,
        totalHits: c.totalHits,
        cities: Object.entries(c.cities)
          .sort((a, b) => b[1] - a[1])
          .map(([city, hits]) => ({ city, hits })),
      }));

    // Top Cities
    const cityCounts: Record<string, { city: string; country: string; count: number }> = {};
    visitorList.forEach((v) => {
      const city = v.city || "Unknown";
      const country = v.country || "Unknown";
      const key = `${city}, ${country}`;
      if (!cityCounts[key]) {
        cityCounts[key] = { city, country, count: 0 };
      }
      cityCounts[key].count++;
    });
    const topCities = Object.values(cityCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Top ISPs
    const ispCounts: Record<string, number> = {};
    visitorList.forEach((v) => {
      const isp = v.isp || "Direct / Local ISP";
      ispCounts[isp] = (ispCounts[isp] || 0) + 1;
    });
    const topISPs = Object.entries(ispCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([isp, count]) => ({ isp, count }));

    // Top browsers
    const browserCounts: Record<string, number> = {};
    visitorList.forEach((v) => {
      const b = v.browser || "Unknown";
      browserCounts[b] = (browserCounts[b] || 0) + 1;
    });
    const topBrowsers = Object.entries(browserCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([browser, count]) => ({ browser, count }));

    // Top devices
    const deviceCounts: Record<string, number> = {};
    visitorList.forEach((v) => {
      const d = v.device_type || "Desktop";
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
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    return NextResponse.json({
      totalVisits,
      uniqueIPs,
      activeSessions,
      securityStats: {
        totalLogins: successLogins + failedLogins,
        successLogins,
        failedLogins,
        regularVisits: Math.max(0, totalVisits - (successLogins + failedLogins)),
      },
      securityAuditLogs: securityAuditLogs.slice(0, 30),
      individualSessions: individualSessions.slice(0, 30),
      countryCityBreakdown,
      topCities,
      topISPs,
      topBrowsers,
      topDevices,
      topPages,
      recentVisitors: visitorList.slice(0, 50),
    });
  } catch (error) {
    return serverError("Analytics GET error:", error);
  }
}
