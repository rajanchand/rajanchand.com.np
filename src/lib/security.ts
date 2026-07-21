import { supabase } from "@/lib/supabase";
import { getClientIp, isValidIp } from "@/lib/auth";

export interface SecurityDeviceInfo {
  ip: string;
  browser: string;
  os: string;
  deviceType: string;
  city: string;
  region: string;
  country: string;
  isp: string;
  userAgent: string;
}

import crypto from "crypto";
import { DEFAULT_SESSION_SECRET } from "@/lib/auth";

export const OTP_COOKIE_NAME = "pending_otp_token";

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function createSignedOtpToken(otpCode: string): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins
  const secret = process.env.ADMIN_SESSION_SECRET || DEFAULT_SESSION_SECRET;
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(`${otpCode}:${expiresAt}`)
    .digest("hex");

  return {
    token: `${otpCode}:${expiresAt}:${hmac}`,
    expiresAt,
  };
}

export function verifySignedOtpToken(token: string | undefined | null, enteredOtp: string): boolean {
  if (!token || !enteredOtp) return false;

  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [expectedOtp, expiresAtStr, hmac] = parts;
  const expiresAt = Number(expiresAtStr);

  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const secret = process.env.ADMIN_SESSION_SECRET || DEFAULT_SESSION_SECRET;
  const expectedHmac = crypto
    .createHmac("sha256", secret)
    .update(`${expectedOtp}:${expiresAtStr}`)
    .digest("hex");

  const hmacBuf = Buffer.from(hmac);
  const expectedBuf = Buffer.from(expectedHmac);

  if (hmacBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(hmacBuf, expectedBuf)) {
    return false;
  }

  return expectedOtp.trim() === enteredOtp.trim();
}

export function parseUserAgent(ua: string) {
  const result = {
    browser: "Unknown Browser",
    os: "Unknown OS",
    deviceType: "Desktop",
  };

  if (!ua) return result;

  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    result.deviceType = /iPad|Tablet/i.test(ua) ? "Tablet" : "Mobile";
  }

  if (/Edg\/(\d+[\.\d]*)/i.test(ua)) {
    result.browser = `Edge ${ua.match(/Edg\/(\d+[\.\d]*)/i)?.[1] || ""}`;
  } else if (/OPR\/(\d+[\.\d]*)/i.test(ua)) {
    result.browser = `Opera ${ua.match(/OPR\/(\d+[\.\d]*)/i)?.[1] || ""}`;
  } else if (/Chrome\/(\d+[\.\d]*)/i.test(ua) && !/Edg/i.test(ua)) {
    result.browser = `Chrome ${ua.match(/Chrome\/(\d+[\.\d]*)/i)?.[1] || ""}`;
  } else if (/Safari\/(\d+[\.\d]*)/i.test(ua) && !/Chrome/i.test(ua)) {
    result.browser = `Safari ${ua.match(/Version\/(\d+[\.\d]*)/i)?.[1] || ""}`;
  } else if (/Firefox\/(\d+[\.\d]*)/i.test(ua)) {
    result.browser = `Firefox ${ua.match(/Firefox\/(\d+[\.\d]*)/i)?.[1] || ""}`;
  }

  if (/Windows NT (\d+[\.\d]*)/i.test(ua)) {
    result.os = "Windows";
  } else if (/Mac OS X/i.test(ua)) {
    result.os = "Mac OS X";
  } else if (/Android/i.test(ua)) {
    result.os = "Android";
  } else if (/iPhone|iPad/i.test(ua)) {
    result.os = "iOS";
  } else if (/Linux/i.test(ua)) {
    result.os = "Linux";
  }

  return result;
}

export async function getDeviceInfo(headersList: Headers): Promise<SecurityDeviceInfo> {
  const ip = getClientIp(headersList);
  const userAgent = headersList.get("user-agent") || "";
  const parsed = parseUserAgent(userAgent);

  const geo = {
    city: "Unknown",
    region: "",
    country: "Unknown",
    isp: "",
  };

  if (isValidIp(ip)) {
    try {
      const geoRes = await fetch(
        `https://ip-api.com/json/${ip}?fields=status,city,country,regionName,isp,org`,
        { signal: AbortSignal.timeout(3500) }
      );
      if (geoRes.ok) {
        const g = await geoRes.json();
        if (g.status === "success") {
          geo.city = g.city || "Unknown";
          geo.region = g.regionName || "";
          geo.country = g.country || "Unknown";
          geo.isp = g.org || g.isp || "";
        }
      }
    } catch (err) {
      console.warn("Geo lookup warning for security event:", err);
    }
  }

  return {
    ip,
    browser: parsed.browser.trim(),
    os: parsed.os.trim(),
    deviceType: parsed.deviceType,
    city: geo.city,
    region: geo.region,
    country: geo.country,
    isp: geo.isp,
    userAgent: userAgent.slice(0, 500),
  };
}

export async function sendOtpEmailNotification(
  otpCode: string,
  deviceInfo: SecurityDeviceInfo,
  adminEmail: string = "rajanchand48@gmail.com"
) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const timestampUTC = new Date().toUTCString();
  const locationStr = [deviceInfo.city, deviceInfo.region, deviceInfo.country]
    .filter((s) => s && s !== "Unknown")
    .join(", ") || "Unknown Location";

  const subject = `🔐 ${otpCode} is your Admin 2FA Login OTP Code`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #1f2937;">
      <div style="margin-bottom: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 12px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; color: #1e40af;">Admin Portal Two-Factor Authentication</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Rajan Chand Portfolio System Security</p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #374151;">Hi Rajan,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #374151;">
        A sign-in request was initiated for your Admin Account (<strong>${adminEmail}</strong>). Please enter the following 6-digit OTP code to complete your login:
      </p>

      <div style="background-color: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 0.35em; color: #0369a1; font-family: monospace; display: inline-block; padding-left: 0.35em;">${otpCode}</span>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #0369a1; font-weight: 600;">Valid for 10 minutes &bull; Do not share this code with anyone</p>
      </div>

      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #4b5563;">
          Sign-In Request Details
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; width: 120px;">Device / OS:</td>
            <td style="padding: 6px 0; font-weight: 600;">${deviceInfo.browser} &bull; ${deviceInfo.os} (${deviceInfo.deviceType})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Time (UTC):</td>
            <td style="padding: 6px 0; font-family: monospace;">${timestampUTC}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Location:</td>
            <td style="padding: 6px 0; font-weight: 600;">${locationStr}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">IP Address:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: 600;">${deviceInfo.ip}</td>
          </tr>
          ${
            deviceInfo.isp
              ? `<tr>
                  <td style="padding: 6px 0; color: #6b7280;">Network / ISP:</td>
                  <td style="padding: 6px 0;">${deviceInfo.isp}</td>
                </tr>`
              : ""
          }
        </table>
      </div>

      <p style="font-size: 12px; color: #6b7280; line-height: 1.5;">
        If you did not initiate this sign-in attempt, someone may have entered your password. Please review your account security immediately.
      </p>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; text-align: center;">
        Rajan Chand Portfolio Security Telemetry Engine &bull; ${adminEmail}
      </div>
    </div>
  `;

  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Security Audit <onboarding@resend.dev>",
          to: [adminEmail],
          subject,
          html: htmlContent,
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[RESEND EMAIL DISPATCH FAILED]", res.status, errorText);
      } else {
        console.log(`[RESEND EMAIL SENT] Successfully delivered OTP notification to ${adminEmail}`);
      }
    } catch (err) {
      console.error("[RESEND FETCH ERROR]", err);
    }
  } else {
    console.warn(`[SECURITY WARNING] RESEND_API_KEY is not configured in environment variables. Email to ${adminEmail} skipped.`);
    console.log(`[OTP DISPATCH] To: ${adminEmail} | 6-Digit OTP: ${otpCode}`);
    console.log(`[DETAILS] IP: ${deviceInfo.ip} | ISP: ${deviceInfo.isp} | OS: ${deviceInfo.os} | Location: ${locationStr}`);
  }
}

export async function sendSecurityEmailNotification(
  success: boolean,
  deviceInfo: SecurityDeviceInfo,
  adminEmail: string = "rajanchand48@gmail.com"
) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const timestampUTC = new Date().toUTCString();
  const locationStr = [deviceInfo.city, deviceInfo.region, deviceInfo.country]
    .filter((s) => s && s !== "Unknown")
    .join(", ") || "Unknown Location";

  const subject = success
    ? `New sign-on detected for your Admin Account (${adminEmail})`
    : `⚠️ ALERT: Failed Admin Login Attempt Detected for ${adminEmail}`;

  const statusBadge = success
    ? `<span style="color:#10b981;font-weight:bold;">✅ SUCCESSFUL 2FA SIGN-IN</span>`
    : `<span style="color:#ef4444;font-weight:bold;">❌ FAILED (Incorrect Password)</span>`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #1f2937;">
      <div style="margin-bottom: 20px; border-bottom: 2px solid ${success ? '#3b82f6' : '#ef4444'}; padding-bottom: 12px;">
        <h2 style="margin: 0; font-size: 20px; color: ${success ? '#1e3a8a' : '#991b1b'};">
          ${success ? 'New Sign-On Detected' : '⚠️ Security Alert: Unauthorized Login Attempt'}
        </h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Rajan Chand Portfolio System Audit</p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #374151;">
        Hi Rajan,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #374151;">
        ${
          success
            ? `Your Admin Account (<strong>${adminEmail}</strong>) was just used to sign in to the Admin Dashboard.`
            : `An attempt was made to sign in to your Admin Account (<strong>${adminEmail}</strong>) using an <strong>incorrect password</strong>.`
        }
      </p>

      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #4b5563;">
          Sign-In Activity Details
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; width: 120px;">Status:</td>
            <td style="padding: 6px 0;">${statusBadge}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Device / OS:</td>
            <td style="padding: 6px 0; font-weight: 600;">${deviceInfo.browser} &bull; ${deviceInfo.os} (${deviceInfo.deviceType})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Time (UTC):</td>
            <td style="padding: 6px 0; font-family: monospace;">${timestampUTC}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Location:</td>
            <td style="padding: 6px 0; font-weight: 600;">${locationStr}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">IP Address:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: 600;">${deviceInfo.ip}</td>
          </tr>
          ${
            deviceInfo.isp
              ? `<tr>
                  <td style="padding: 6px 0; color: #6b7280;">Network / ISP:</td>
                  <td style="padding: 6px 0;">${deviceInfo.isp}</td>
                </tr>`
              : ""
          }
        </table>
      </div>

      <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
        ${
          success
            ? `If you initiated this sign-in, no further action is required.`
            : `<strong>Don't recognize this activity?</strong> Someone may be attempting to access your portal. All failed attempts are logged automatically in your Admin Dashboard.`
        }
      </p>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; text-align: center;">
        Rajan Chand Portfolio Security Telemetry Engine &bull; ${adminEmail}
      </div>
    </div>
  `;

  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Security Audit <onboarding@resend.dev>",
          to: [adminEmail],
          subject,
          html: htmlContent,
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[RESEND EMAIL DISPATCH FAILED]", res.status, errorText);
      } else {
        console.log(`[RESEND SECURITY ALERT SENT] Successfully delivered alert to ${adminEmail}`);
      }
    } catch (err) {
      console.error("[RESEND FETCH ERROR]", err);
    }
  } else {
    console.warn(`[SECURITY WARNING] RESEND_API_KEY is not configured in environment variables. Email to ${adminEmail} skipped.`);
    console.log(`[SECURITY NOTIFICATION] To: ${adminEmail} | Subject: ${subject}`);
    console.log(`[ATTEMPT DETAILS] IP: ${deviceInfo.ip} | ISP: ${deviceInfo.isp} | OS: ${deviceInfo.os} | Location: ${locationStr}`);
  }
}

export async function logSecurityEvent(
  success: boolean,
  deviceInfo: SecurityDeviceInfo
) {
  try {
    await supabase.from("visitors").insert({
      ip_address: deviceInfo.ip,
      city: deviceInfo.city,
      country: deviceInfo.country,
      region: deviceInfo.region || null,
      isp: deviceInfo.isp || null,
      device_type: deviceInfo.deviceType,
      browser: `${deviceInfo.browser} (${success ? 'ADMIN LOGIN SUCCESS' : 'ADMIN LOGIN FAILED'})`,
      os: deviceInfo.os,
      page_url: success ? "/admin/dashboard" : "/admin/login-failed",
      referrer: "security-audit-logger",
      user_agent: deviceInfo.userAgent,
    });
  } catch (err) {
    console.warn("Failed to log security event to visitors table:", err);
  }
}
