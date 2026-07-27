import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { getClientIp, isValidIp } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Max 10 tracking calls per IP per minute
const trackRateLimiter = createRateLimiter({ max: 10, windowMs: 60 * 1000 });

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

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const ip = getClientIp(headersList);

    if (!trackRateLimiter(ip).allowed) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const userAgent = headersList.get("user-agent") || "";

    let body: { pageUrl?: string; referrer?: string } = {};
    try {
      body = await request.json();
    } catch {
      // Body may be empty or malformed — that's OK
    }

    const parsed = parseUserAgent(userAgent);

    // Geolocation lookup — request full field set for max accuracy
    const geo = {
      city: "Unknown",
      country: "Unknown",
      region: "",
      lat: null as number | null,
      lon: null as number | null,
      isp: "",
    };

    // Only hit third-party geo APIs with a public IP — localhost/private ranges
    // hang or return useless data and slow down every page's tracker beacon.
    const isLocalOrPrivate =
      ip === "::1" ||
      ip === "127.0.0.1" ||
      ip.startsWith("10.") ||
      ip.startsWith("192.168.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip);

    if (isValidIp(ip) && !isLocalOrPrivate) {
      try {
        // ip-api.com: request status + all useful fields for precise location
        // district gives sub-city accuracy; zip helps refine; isp/org for network name
        const geoRes = await fetch(
          `https://ip-api.com/json/${ip}?fields=status,city,country,regionName,district,zip,lat,lon,isp,org,as`,
          { signal: AbortSignal.timeout(3000) }
        );
        if (geoRes.ok) {
          const g = await geoRes.json();
          if (g.status === "success") {
            // Use district (sub-city area) if available for more precise location
            geo.city = g.district || g.city || "Unknown";
            geo.country = g.country || "Unknown";
            geo.region = g.regionName || "";
            if (g.lat != null) geo.lat = g.lat;
            if (g.lon != null) geo.lon = g.lon;
            // Network name: prefer org, fallback to isp, then AS
            geo.isp = g.org || g.isp || g.as || "";
          }
        }
      } catch {
        // Primary geo failed — try fallback
      }

      // Fallback: if primary returned "Unknown" city, try ipapi.co (more accurate for some IPs)
      if (geo.city === "Unknown") {
        try {
          const fallbackRes = await fetch(`https://ipapi.co/${ip}/json/`, {
            signal: AbortSignal.timeout(3000),
          });
          if (fallbackRes.ok) {
            const fb = await fallbackRes.json();
            if (!fb.error) {
              geo.city = fb.city || geo.city;
              geo.country = fb.country_name || geo.country;
              geo.region = fb.region || geo.region;
              if (fb.latitude != null) geo.lat = fb.latitude;
              if (fb.longitude != null) geo.lon = fb.longitude;
              geo.isp = fb.org || geo.isp;
            }
          }
        } catch {
          // Fallback also failed — continue with defaults
        }
      }
    } else if (isLocalOrPrivate) {
      geo.city = "Local";
      geo.country = "Local";
      geo.isp = "Localhost";
    }

    // Store in Supabase
    const { error } = await supabase.from("visitors").insert({
      ip_address: ip,
      city: geo.city,
      country: geo.country,
      region: geo.region || null,
      latitude: geo.lat,
      longitude: geo.lon,
      isp: geo.isp || null,
      device_type: parsed.deviceType,
      browser: `${parsed.browser}${parsed.browserVersion ? ` ${parsed.browserVersion}` : ""}`,
      os: `${parsed.os}${parsed.osVersion ? ` ${parsed.osVersion}` : ""}`,
      page_url: body.pageUrl || "/",
      referrer: body.referrer || "",
      user_agent: userAgent.slice(0, 500),
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
