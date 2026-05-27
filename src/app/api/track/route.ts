import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Simple User-Agent parser
function parseUserAgent(ua: string) {
  const result = {
    browser: "Unknown",
    browserVersion: "",
    os: "Unknown",
    osVersion: "",
    deviceType: "Desktop",
  };

  if (!ua) return result;

  // Device type
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    result.deviceType = /iPad|Tablet/i.test(ua) ? "Tablet" : "Mobile";
  }

  // Browser detection (order matters — more specific first)
  if (/Edg\/(\d+[\.\d]*)/i.test(ua)) {
    result.browser = "Edge";
    result.browserVersion = ua.match(/Edg\/(\d+[\.\d]*)/i)?.[1] || "";
  } else if (/OPR\/(\d+[\.\d]*)/i.test(ua)) {
    result.browser = "Opera";
    result.browserVersion = ua.match(/OPR\/(\d+[\.\d]*)/i)?.[1] || "";
  } else if (/Chrome\/(\d+[\.\d]*)/i.test(ua) && !/Edg/i.test(ua)) {
    result.browser = "Chrome";
    result.browserVersion = ua.match(/Chrome\/(\d+[\.\d]*)/i)?.[1] || "";
  } else if (/Safari\/(\d+[\.\d]*)/i.test(ua) && !/Chrome/i.test(ua)) {
    result.browser = "Safari";
    result.browserVersion = ua.match(/Version\/(\d+[\.\d]*)/i)?.[1] || "";
  } else if (/Firefox\/(\d+[\.\d]*)/i.test(ua)) {
    result.browser = "Firefox";
    result.browserVersion = ua.match(/Firefox\/(\d+[\.\d]*)/i)?.[1] || "";
  }

  // OS detection
  if (/Windows NT (\d+[\.\d]*)/i.test(ua)) {
    result.os = "Windows";
    const ntVersion = ua.match(/Windows NT (\d+[\.\d]*)/i)?.[1] || "";
    const ntMap: Record<string, string> = {
      "10.0": "10/11",
      "6.3": "8.1",
      "6.2": "8",
      "6.1": "7",
    };
    result.osVersion = ntMap[ntVersion] || ntVersion;
  } else if (/Mac OS X (\d+[._\d]*)/i.test(ua)) {
    result.os = "macOS";
    result.osVersion = (ua.match(/Mac OS X (\d+[._\d]*)/i)?.[1] || "").replace(/_/g, ".");
  } else if (/Android (\d+[\.\d]*)/i.test(ua)) {
    result.os = "Android";
    result.osVersion = ua.match(/Android (\d+[\.\d]*)/i)?.[1] || "";
  } else if (/iPhone OS (\d+[._\d]*)/i.test(ua) || /iPad/i.test(ua)) {
    result.os = "iOS";
    result.osVersion = (ua.match(/OS (\d+[._\d]*)/i)?.[1] || "").replace(/_/g, ".");
  } else if (/Linux/i.test(ua)) {
    result.os = "Linux";
  }

  return result;
}

function getClientIP(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return headersList.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const ip = getClientIP(headersList);
    const userAgent = headersList.get("user-agent") || "";

    let body: { pageUrl?: string; referrer?: string } = {};
    try {
      body = await request.json();
    } catch {
      // Body may be empty or malformed — that's OK
    }

    const parsed = parseUserAgent(userAgent);

    // Geolocation lookup (fire-and-forget, non-blocking)
    const geo = { city: "Unknown", country: "Unknown", isp: "Unknown" };
    try {
      // ip-api.com is free for non-commercial use, 45 req/min
      // Use the IP directly; for localhost/dev, it returns the server's public IP info
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,isp`, {
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.city) geo.city = geoData.city;
        if (geoData.country) geo.country = geoData.country;
        if (geoData.isp) geo.isp = geoData.isp;
      }
    } catch {
      // Geolocation failed — continue with defaults
    }

    // Store in Supabase
    const { error } = await supabase.from("visitors").insert({
      ip_address: ip,
      city: geo.city,
      country: geo.country,
      isp: geo.isp,
      device_type: parsed.deviceType,
      browser: parsed.browser,
      browser_version: parsed.browserVersion,
      os: parsed.os,
      os_version: parsed.osVersion,
      page_url: body.pageUrl || "/",
      referrer: body.referrer || "",
      user_agent: userAgent.slice(0, 500), // Cap UA string length
    });

    if (error) {
      console.warn("Visitor tracking insert failed:", error.message);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    // Tracking should never break the user experience
    console.error("Visitor tracking error:", error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
