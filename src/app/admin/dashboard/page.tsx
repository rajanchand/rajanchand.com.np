/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  LogOut,
  Plus,
  Trash2,
  User,
  Briefcase,
  Layers,
  Award,
  BookOpen,
  Activity,
  ChevronRight,
  Upload,
  TrendingUp,
  Eye,
  Terminal,
  RefreshCw,
  BarChart2,
  Laptop,
  Smartphone,
  Tablet,
  MapPin,
  Wifi,
  Search,
  Download,
  Printer,
  X,
  Mail,
  Grid,
  Shield,
  Database,
  Server,
  Check,
  AlertTriangle,
  KeyRound,
  ExternalLink,
  Image,
  FileText,
  Calendar,
  Hash,
  Link2,
  Clock,
  Fingerprint,
  Globe,
  Zap,
  Lock,
  ShieldCheck,
  HardDrive,
  Cpu,
  GripVertical,
  FolderGit2,
  Github,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  File
} from "lucide-react";
import { BackgroundOrbs } from "@/components/background-orbs";

// ==========================================
// CUSTOM INTERACTIVE SVG COMPONENTS (Light-Theme Adaptive)
// ==========================================

const Sparkline = ({ points, color = "#3b82f6" }: { points: number[]; color?: string }) => {
  if (!points || points.length < 2) return null;
  const height = 40;
  const width = 120;
  const max = Math.max(...points, 1);
  const min = Math.min(...points);
  const range = max - min || 1;

  const pathD = points
    .map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg className="w-24 h-10 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`sparkGrad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#sparkGrad-${color.replace("#", "")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const AreaChart = ({ data }: { data: { label: string; visits: number; unique: number }[] }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-xs text-[var(--muted-foreground)]">
        No telemetry records in range.
      </div>
    );
  }

  if (data.length === 1) {
    return (
      <div className="h-60 flex flex-col items-center justify-center text-xs text-[var(--muted-foreground)] gap-2">
        <p className="font-bold text-[var(--foreground)]">{data[0].label}</p>
        <p>{data[0].visits} visit{data[0].visits !== 1 ? "s" : ""} · {data[0].unique} unique</p>
      </div>
    );
  }

  const height = 240;
  const width = 800;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };

  const maxVal = Math.max(...data.map((d) => Math.max(d.visits, d.unique)), 5);
  const stepY = Math.ceil(maxVal / 5) || 1;
  const maxY = stepY * 5;

  const getX = (index: number) => {
    return padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
  };

  const getY = (val: number) => {
    return height - padding.bottom - (val / maxY) * (height - padding.top - padding.bottom);
  };

  const visitsPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.visits)}`).join(" ");
  const uniquePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.unique)}`).join(" ");

  const visitsArea = `${visitsPath} L ${getX(data.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;
  const uniqueArea = `${uniquePath} L ${getX(data.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

  return (
    <div className="w-full relative">
      <div className="w-full overflow-x-auto custom-scrollbar pb-2">
        <svg className="w-full min-w-[650px] h-60 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const val = stepY * idx;
            const y = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                  className="opacity-70"
                />
                <text x={padding.left - 12} y={y + 4} fill="var(--muted-foreground)" fontSize="10" textAnchor="end">
                  {val}
                </text>
              </g>
            );
          })}

          {/* X Labels */}
          {data.map((d, i) => {
            const interval = Math.ceil(data.length / 8);
            if (i % interval !== 0 && i !== data.length - 1) return null;
            const x = getX(i);
            return (
              <text key={i} x={x} y={height - padding.bottom + 22} fill="var(--muted-foreground)" fontSize="10" textAnchor="middle">
                {d.label}
              </text>
            );
          })}

          {/* Fill Areas */}
          <path d={visitsArea} fill="url(#visitsGrad)" />
          <path d={uniqueArea} fill="url(#uniqueGrad)" />

          {/* Lines */}
          <path d={visitsPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
          <path d={uniquePath} fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />

          {/* Nodes */}
          {data.map((d, i) => {
            const x = getX(i);
            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <rect
                  x={x - (width / data.length) / 2}
                  y={padding.top}
                  width={width / data.length}
                  height={height - padding.top - padding.bottom}
                  fill="transparent"
                />
                {hoveredIndex === i && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke="var(--primary)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}
                <circle
                  cx={x}
                  cy={getY(d.visits)}
                  r={hoveredIndex === i ? 4.5 : 2.5}
                  fill="#3b82f6"
                  stroke="var(--card)"
                  strokeWidth="1.5"
                />
                <circle
                  cx={x}
                  cy={getY(d.unique)}
                  r={hoveredIndex === i ? 4.5 : 2.5}
                  fill="#a855f7"
                  stroke="var(--card)"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {hoveredIndex !== null && data[hoveredIndex] && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-[var(--card)] border border-[var(--border)] rounded-xl p-2.5 shadow-lg text-[10px] space-y-1 z-20">
          <p className="font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-1 mb-1 text-center">
            {data[hoveredIndex].label}
          </p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1 text-[#3b82f6] font-semibold">
              Views: {data[hoveredIndex].visits}
            </span>
            <span className="flex items-center gap-1 text-[#a855f7] font-semibold">
              Unique: {data[hoveredIndex].unique}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const DonutChart = ({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 35;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col xl:flex-row items-center gap-6 p-2">
      <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} className="opacity-40" />
          {data.map((item, idx) => {
            const percent = total > 0 ? item.value / total : 0;
            const strokeLength = percent * circumference;
            const prevPercent = data
              .slice(0, idx)
              .reduce((sum, d) => sum + (total > 0 ? d.value / total : 0), 0);
            const strokeOffset = circumference - prevPercent * circumference;

            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={colors[idx % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-300 hover:stroke-[10px] cursor-pointer"
              >
                <title>{`${item.label}: ${item.value}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-[9px] text-[var(--muted-foreground)] uppercase font-semibold">Total</span>
          <span className="text-base font-extrabold text-[var(--foreground)]">{total}</span>
        </div>
      </div>
      <div className="space-y-1 flex-1 w-full min-w-0">
        {data.map((item, idx) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={idx} className="flex items-center justify-between text-xs gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                <span className="text-[var(--muted-foreground)] font-semibold truncate block min-w-0" title={item.label}>
                  {item.label}
                </span>
              </div>
              <span className="font-bold text-[var(--foreground)] shrink-0 pl-2">
                {item.value} <span className="text-[9px] text-[var(--muted-foreground)] font-normal font-sans">({percent}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GeographyMap = ({ recentVisitors }: { recentVisitors: any[] }) => {
  const worldLandmasses = [
    { name: "North America", d: "M 100,80 L 150,70 L 220,100 L 240,120 L 200,160 L 170,180 L 150,220 L 140,240 L 130,220 L 140,180 L 110,150 L 90,130 Z" },
    { name: "Greenland", d: "M 240,40 L 290,30 L 280,70 L 250,80 Z" },
    { name: "South America", d: "M 180,240 L 220,250 L 250,290 L 260,330 L 240,380 L 220,395 L 205,370 L 195,300 L 175,260 Z" },
    { name: "Africa", d: "M 360,200 L 410,190 L 450,210 L 490,260 L 480,290 L 460,340 L 440,360 L 430,340 L 400,280 L 375,250 L 350,220 Z" },
    { name: "Europe", d: "M 370,100 L 410,80 L 450,80 L 470,100 L 460,140 L 420,160 L 380,180 L 360,160 L 350,120 Z" },
    { name: "Asia", d: "M 460,100 L 550,60 L 680,60 L 730,90 L 750,150 L 720,230 L 680,250 L 620,260 L 580,220 L 530,230 L 470,160 Z" },
    { name: "India/Indochina", d: "M 570,200 L 590,220 L 600,260 L 570,250 L 550,220 Z" },
    { name: "Australia", d: "M 670,300 L 730,290 L 750,330 L 710,360 L 660,330 Z" },
    { name: "Madagascar", d: "M 490,320 L 500,340 L 495,360 Z" },
    { name: "Japan", d: "M 740,140 L 750,160 L 745,190 Z" },
    { name: "United Kingdom", d: "M 345,115 L 355,110 L 350,125 Z" }
  ];

  const getMapCoords = (lat: number | null, lon: number | null) => {
    if (lat == null || lon == null) return null;
    const x = ((lon + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x, y };
  };

  const coords = (recentVisitors || [])
    .map((v) => ({
      pos: getMapCoords(v.latitude, v.longitude),
      city: v.city,
      country: v.country,
      ip: v.ip_address,
      time: new Date(v.visited_at).toLocaleTimeString()
    }))
    .filter((c) => c.pos !== null);

  return (
    <div className="w-full relative border border-[var(--border)] rounded-2xl p-4 overflow-hidden bg-[var(--card)]/50">
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] font-mono">Telemetry Map</span>
      </div>
      <div className="w-full overflow-x-auto custom-scrollbar">
        <svg className="w-full min-w-[650px] h-80 bg-[var(--background)] border border-[var(--border)] rounded-xl overflow-hidden" viewBox="0 0 800 400">
          <g>
            {worldLandmasses.map((land, idx) => (
              <path
                key={idx}
                d={land.d}
                fill="rgba(100, 116, 139, 0.08)"
                stroke="rgba(100, 116, 139, 0.25)"
                strokeWidth="1"
                strokeLinejoin="round"
                className="transition-all duration-300 hover:fill-blue-500/5"
              />
            ))}
          </g>

          {coords.map((c: any, idx) => {
            const { x, y } = c.pos;
            return (
              <g key={idx} className="cursor-pointer">
                <circle cx={x} cy={y} r="10" fill="none" stroke="#3b82f6" strokeWidth="1" className="animate-ping" style={{ transformOrigin: `${x}px ${y}px` }} />
                <circle cx={x} cy={y} r="5" fill="#3b82f6" opacity="0.3" />
                <circle cx={x} cy={y} r="2.5" fill="#3b82f6" stroke="var(--card)" strokeWidth="1" />
                <title>{`${c.city ? `${c.city}, ` : ""}${c.country}\nIP: ${c.ip}\nActive: ${c.time}`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// ==========================================
// CORE PORTAL COMPONENT
// ==========================================

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ success: false, message: "" });
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState("7d");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const router = useRouter();

  // New features states
  const [statusData, setStatusData] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState({ success: false, message: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  const [syncStatus, setSyncStatus] = useState({ success: false, message: "" });
  const [syncing, setSyncing] = useState(false);

  // Polling condition
  const isAnalyticsActive = activeTab === "analytics";
  const isMessagesActive = activeTab === "messages";
  const isOverviewActive = activeTab === "overview";
  const isSecurityActive = activeTab === "security";

  const loadMessages = async () => {
    setMessagesLoading(true);
    try {
      const res = await fetch("/api/admin/messages");
      if (res.ok) {
        const json = await res.json();
        setMessages(json.messages || []);
      } else {
        console.error("Failed to load messages");
      }
    } catch (err) {
      console.error("Messages fetch error:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (isMessagesActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors the existing analytics tab's fetch-on-activate pattern
      loadMessages();
    }
  }, [isMessagesActive]);

  const handleToggleMessageStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "read" ? "unread" : "read";
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
    try {
      await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update message status:", err);
      loadMessages();
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    setMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete message:", err);
      loadMessages();
    }
  };

  const loadStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch("/api/admin/status");
      if (res.ok) {
        const json = await res.json();
        setStatusData(json);
      } else {
        console.error("Failed to load health status");
      }
    } catch (err) {
      console.error("Status fetch error:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (isOverviewActive || isSecurityActive) {
      loadStatus();
    }
  }, [isOverviewActive, isSecurityActive]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ success: false, message: "" });

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ success: false, message: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordStatus({ success: false, message: "New password must be at least 8 characters long" });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const resData = await res.json();
      if (res.ok) {
        setPasswordStatus({ success: true, message: resData.message || "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordStatus({ success: false, message: resData.error || "Failed to update password" });
      }
    } catch (err: any) {
      setPasswordStatus({ success: false, message: err.message || "An unexpected error occurred" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSync = async (action: "push" | "pull") => {
    const confirmationMessage = action === "push" 
      ? "Warning: This will overwrite Supabase database content with your local data.json config. Continue?"
      : "Warning: This will overwrite your local data.json file with Supabase content. Continue?";
    
    if (!window.confirm(confirmationMessage)) return;

    setSyncing(true);
    setSyncStatus({ success: false, message: "" });
    try {
      const res = await fetch("/api/admin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const resData = await res.json();
      if (res.ok) {
        setSyncStatus({ success: true, message: resData.message || "Sync completed successfully!" });
        // Reload page configuration data to display the changes immediately
        const dataRes = await fetch("/api/admin");
        if (dataRes.ok) {
          setData(await dataRes.json());
        }
      } else {
        setSyncStatus({ success: false, message: resData.error || "Sync action failed" });
      }
    } catch (err: any) {
      setSyncStatus({ success: false, message: err.message || "Sync crashed" });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (isAnalyticsActive || isOverviewActive) {
      async function loadAnalytics() {
        setAnalyticsLoading(true);
        try {
          const res = await fetch(`/api/admin/analytics?range=${analyticsRange}`);
          if (res.ok) {
            const json = await res.json();
            setAnalyticsData(json);
          } else {
            console.error("Failed to load analytics");
          }
        } catch (err) {
          console.error("Analytics fetch error:", err);
        } finally {
          setAnalyticsLoading(false);
        }
      }
      loadAnalytics();
    }
  }, [activeTab, analyticsRange, isAnalyticsActive, isOverviewActive]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin");
        if (res.status === 401) {
          router.push("/admin");
          return;
        }
        const jsonData = await res.json();
        if (!jsonData || !jsonData.siteConfig) {
          console.error("Admin API returned invalid data:", jsonData?.error || "missing siteConfig");
          setLoading(false);
          return;
        }
        setData(jsonData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading admin data:", err);
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  const handleExportCSV = () => {
    if (!analyticsData || !analyticsData.recentVisitors) return;
    const headers = ["IP Address", "Browser", "OS", "Device", "City", "Region", "Country", "ISP", "Page Path", "Referrer", "Time"];
    const rows = analyticsData.recentVisitors.map((v: any) => [
      v.ip_address,
      v.browser,
      v.os,
      v.device_type,
      v.city || "Unknown",
      v.region || "",
      v.country || "Unknown",
      v.isp || "",
      v.page_url,
      v.referrer || "Direct",
      v.visited_at
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e: any) => e.map((val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `visitor_analytics_${analyticsRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleConfigChange = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      siteConfig: {
        ...prev.siteConfig,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus({ success: false, message: "" });

    try {
      const payload = { ...data };

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (res.ok) {
        setSaveStatus({ success: true, message: resData.message || "Saved successfully!" });
        setTimeout(() => setSaveStatus({ success: false, message: "" }), 4000);
      } else {
        setSaveStatus({ success: false, message: resData.error || "Failed to save data" });
      }
    } catch (err: any) {
      setSaveStatus({ success: false, message: err.message || "An error occurred" });
    } finally {
      setSaving(false);
    }
  };

  const toggleRow = (idx: number) => {
    setExpandedRows((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <BackgroundOrbs />
        <div className="text-center relative z-10 space-y-3">
          <div className="w-10 h-10 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[var(--muted-foreground)]">Loading Portfolio Console...</p>
        </div>
      </div>
    );
  }

  // Sparkline coordinates
  const visitsPoints = analyticsData?.chartData ? analyticsData.chartData.map((d: any) => d.visits) : [0, 0];
  const uniquePoints = analyticsData?.chartData ? analyticsData.chartData.map((d: any) => d.unique) : [0, 0];

  // Filtering search logs
  const filteredVisitors = analyticsData?.recentVisitors
    ? analyticsData.recentVisitors.filter((v: any) => {
        const query = searchQuery.toLowerCase();
        return (
          v.ip_address?.toLowerCase().includes(query) ||
          v.city?.toLowerCase().includes(query) ||
          v.country?.toLowerCase().includes(query) ||
          v.isp?.toLowerCase().includes(query) ||
          v.page_url?.toLowerCase().includes(query) ||
          v.browser?.toLowerCase().includes(query) ||
          v.os?.toLowerCase().includes(query)
        );
      })
    : [];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/30 relative overflow-hidden">
      <BackgroundOrbs />

      {/* Header bar */}
      <header className="sticky top-0 z-30 w-full border-b border-[var(--glass-border)] bg-[var(--background)]/80 backdrop-blur-md no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-[0_0_15px_var(--glow-primary)]">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm block">Rajan Chand Portfolio</span>
              <span className="text-[10px] text-emerald-500 font-mono block flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> CMS Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeTab !== "analytics" && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-[0_0_25px_var(--glow-primary)] text-white text-xs font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-2 border border-[var(--glass-border)] hover:border-rose-500/30 hover:bg-rose-500/10 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {saveStatus.message && (
          <div
            className={`p-4 rounded-xl mb-6 border text-sm max-w-xl mx-auto flex items-center justify-between no-print ${
              saveStatus.success
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : "bg-rose-500/10 border-rose-500/20 text-rose-500"
            }`}
          >
            <span>{saveStatus.message}</span>
            <button onClick={() => setSaveStatus({ success: false, message: "" })} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Navigation Card (Original) */}
          <div className="lg:col-span-1 space-y-2 no-print">
            <div className="glass rounded-2xl p-4 space-y-1 bg-[var(--card)] border border-[var(--glass-border)]">
              {[
                { id: "overview", label: "Console Overview", icon: Grid },
                { id: "profile", label: "Profile Info", icon: User },
                { id: "experience", label: "Experience Timeline", icon: Briefcase },
                { id: "projects", label: "Projects Grid", icon: Layers },
                { id: "skills", label: "Technical Skills", icon: Activity },
                { id: "blogs", label: "Blog Articles", icon: BookOpen },
                { id: "certifications", label: "Certifications", icon: Award },
                { id: "dissertions", label: "Dissertations", icon: Briefcase },
                { id: "messages", label: "Messages", icon: Mail },
                { id: "analytics", label: "Visitor Analytics", icon: BarChart2 },
                { id: "security", label: "Security & System", icon: Shield }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-md"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--glass-border)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <TabIcon className="w-4 h-4" /> {tab.label}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-[var(--primary)]/5 border border-[var(--primary)]/10 rounded-2xl text-[10px] leading-relaxed text-[var(--muted-foreground)]">
              💡 <strong>Pro-Tip</strong>: After configuring details, click <strong>Save Changes</strong> above to push changes live and instantly re-render static routes.
            </div>
          </div>

          {/* Right Workspace Card */}
          <div className="lg:col-span-3">
            <div className="glass rounded-3xl p-6 md:p-8 space-y-6 bg-[var(--card)] border border-[var(--glass-border)] shadow-sm">
              {/* === CONSOLE OVERVIEW TAB === */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Tab Title */}
                  <div className="border-b border-[var(--glass-border)] pb-4">
                    <h2 className="text-xl font-bold font-display">Console Overview</h2>
                    <p className="text-xs text-[var(--muted-foreground)]">Welcome back. Here is a summary of your website metrics, dashboard status, and quick shortcuts.</p>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Page Views */}
                    <div className="p-4 border border-[var(--glass-border)] bg-[var(--glass-bg)]/30 rounded-2xl relative overflow-hidden group hover:border-[var(--primary)]/30 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">Page Views</span>
                        <Eye className="w-4 h-4 text-[var(--primary)]" />
                      </div>
                      <div className="mt-2">
                        <h3 className="text-2xl font-extrabold font-display">{analyticsData ? analyticsData.totalVisits : "..."}</h3>
                        <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Total page view logs</p>
                      </div>
                    </div>

                    {/* Unique Visitors */}
                    <div className="p-4 border border-[var(--glass-border)] bg-[var(--glass-bg)]/30 rounded-2xl relative overflow-hidden group hover:border-[var(--primary)]/30 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">Unique Visitors</span>
                        <User className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="mt-2">
                        <h3 className="text-2xl font-extrabold font-display">{analyticsData ? analyticsData.uniqueIPs : "..."}</h3>
                        <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Unique IP address logs</p>
                      </div>
                    </div>

                    {/* Active Visitors */}
                    <div className="p-4 border border-[var(--glass-border)] bg-[var(--glass-bg)]/30 rounded-2xl relative overflow-hidden group hover:border-[var(--primary)]/30 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">Active (5m)</span>
                        <Activity className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="mt-2">
                        <h3 className="text-2xl font-extrabold font-display">{analyticsData ? analyticsData.activeSessions : "..."}</h3>
                        <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Real-time visitors</p>
                      </div>
                    </div>

                    {/* Unread Messages */}
                    <div className="p-4 border border-[var(--glass-border)] bg-[var(--glass-bg)]/30 rounded-2xl relative overflow-hidden group hover:border-[var(--primary)]/30 transition-all duration-300 cursor-pointer" onClick={() => setActiveTab("messages")}>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">Inbox</span>
                        <Mail className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="mt-2">
                        <h3 className="text-2xl font-extrabold font-display">
                          {statusData?.supabase?.messages ? statusData.supabase.messages.unread : "..."}
                        </h3>
                        <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                          Unread of {statusData?.supabase?.messages ? statusData.supabase.messages.total : "..."} messages
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Content Count Grid */}
                    <div className="lg:col-span-2 border border-[var(--glass-border)] bg-[var(--glass-bg)]/10 rounded-2xl p-5 space-y-4">
                      <h3 className="text-sm font-bold flex items-center gap-1.5 border-b border-[var(--glass-border)] pb-2">
                        <Laptop className="w-4 h-4 text-[var(--primary)]" /> Content Summary
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-3 bg-[var(--glass-bg)]/20 rounded-xl text-center space-y-1">
                          <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">Projects</span>
                          <p className="text-lg font-bold">{data?.projects?.length ?? 0}</p>
                        </div>
                        <div className="p-3 bg-[var(--glass-bg)]/20 rounded-xl text-center space-y-1">
                          <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">Blog Posts</span>
                          <p className="text-lg font-bold">{data?.blogPosts?.length ?? 0}</p>
                        </div>
                        <div className="p-3 bg-[var(--glass-bg)]/20 rounded-xl text-center space-y-1">
                          <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">Skills</span>
                          <p className="text-lg font-bold">{data?.skills?.length ?? 0}</p>
                        </div>
                        <div className="p-3 bg-[var(--glass-bg)]/20 rounded-xl text-center space-y-1">
                          <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">Experience</span>
                          <p className="text-lg font-bold">{data?.experience?.length ?? 0}</p>
                        </div>
                        <div className="p-3 bg-[var(--glass-bg)]/20 rounded-xl text-center space-y-1">
                          <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">Certifications</span>
                          <p className="text-lg font-bold">{data?.certifications?.length ?? 0}</p>
                        </div>
                        <div className="p-3 bg-[var(--glass-bg)]/20 rounded-xl text-center space-y-1">
                          <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">Dissertations</span>
                          <p className="text-lg font-bold">{data?.dissertations?.length ?? 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Database Status Summary */}
                    <div className="lg:col-span-1 border border-[var(--glass-border)] bg-[var(--glass-bg)]/10 rounded-2xl p-5 space-y-4">
                      <h3 className="text-sm font-bold flex items-center gap-1.5 border-b border-[var(--glass-border)] pb-2">
                        <Server className="w-4 h-4 text-emerald-500" /> System Health
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[var(--muted-foreground)]">Supabase DB</span>
                          <span className={`inline-flex items-center gap-1 font-bold ${statusData?.supabase?.status === "connected" ? "text-emerald-500" : "text-rose-500"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusData?.supabase?.status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                            {statusData?.supabase?.status === "connected" ? "Online" : statusLoading ? "Checking..." : "Offline"}
                          </span>
                        </div>
                        {statusData?.supabase?.status === "connected" && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--muted-foreground)]">DB Latency</span>
                            <span className="font-semibold">{statusData.supabase.latencyMs}ms</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[var(--muted-foreground)]">Local Files</span>
                          <span className={`font-semibold ${statusData?.localFiles?.dataJson?.writeable ? "text-emerald-500" : "text-amber-500"}`}>
                            {statusData?.localFiles?.dataJson?.writeable ? "Writable" : statusLoading ? "Checking..." : "Read-Only"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--glass-border)]">
                          <button onClick={loadStatus} disabled={statusLoading} className="text-[10px] uppercase font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer">
                            <RefreshCw className={`w-3 h-3 ${statusLoading ? "animate-spin" : ""}`} /> Refresh Diagnostics
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Shortcuts */}
                  <div className="border border-[var(--glass-border)] bg-[var(--glass-bg)]/10 rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-1.5 border-b border-[var(--glass-border)] pb-2">
                      <Grid className="w-4 h-4 text-purple-500" /> Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <button onClick={() => setActiveTab("blogs")} className="p-4 bg-[var(--glass-bg)]/30 border border-[var(--glass-border)] hover:border-[var(--primary)]/30 rounded-xl text-left space-y-1 transition-all group cursor-pointer">
                        <BookOpen className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                        <h4 className="text-xs font-bold pt-1">Write Blog Post</h4>
                        <p className="text-[9px] text-[var(--muted-foreground)]">Draft and publish articles</p>
                      </button>

                      <button onClick={() => setActiveTab("projects")} className="p-4 bg-[var(--glass-bg)]/30 border border-[var(--glass-border)] hover:border-[var(--primary)]/30 rounded-xl text-left space-y-1 transition-all group cursor-pointer">
                        <Layers className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                        <h4 className="text-xs font-bold pt-1">Add New Project</h4>
                        <p className="text-[9px] text-[var(--muted-foreground)]">Manage portfolio grid entries</p>
                      </button>

                      <button onClick={() => setActiveTab("messages")} className="p-4 bg-[var(--glass-bg)]/30 border border-[var(--glass-border)] hover:border-[var(--primary)]/30 rounded-xl text-left space-y-1 transition-all group cursor-pointer">
                        <Mail className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                        <h4 className="text-xs font-bold pt-1">Inbox Messages</h4>
                        <p className="text-[9px] text-[var(--muted-foreground)]">Read visitor contact forms</p>
                      </button>

                      <button onClick={() => setActiveTab("security")} className="p-4 bg-[var(--glass-bg)]/30 border border-[var(--glass-border)] hover:border-[var(--primary)]/30 rounded-xl text-left space-y-1 transition-all group cursor-pointer">
                        <KeyRound className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
                        <h4 className="text-xs font-bold pt-1">Change Password</h4>
                        <p className="text-[9px] text-[var(--muted-foreground)]">Security & Database Health</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* === SECURITY & SYSTEM TAB === */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  {/* Tab Title with gradient accent */}
                  <div className="border-b border-[var(--glass-border)] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-rose-500/20 flex items-center justify-center relative">
                        <Shield className="w-5 h-5 text-rose-500" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--background)] animate-pulse" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-display">Security & System Settings</h2>
                        <p className="text-xs text-[var(--muted-foreground)]">Access credentials, system diagnostics, and database synchronization</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 ${
                        statusData?.supabase?.status === "connected"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${statusData?.supabase?.status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                        {statusData?.supabase?.status === "connected" ? "All Systems Online" : statusLoading ? "Checking..." : "Issues Detected"}
                      </span>
                    </div>
                  </div>

                  {/* Security Score Banner */}
                  <div className="relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-gradient-to-r from-[var(--glass-bg)]/30 to-[var(--glass-bg)]/10 p-6">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Shield Score Ring */}
                      <div className="relative w-24 h-24 shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-[var(--glass-border)]" />
                          <circle
                            cx="50" cy="50" r="42" fill="none"
                            stroke="url(#securityGradient)"
                            strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 42}`}
                            strokeDashoffset={`${2 * Math.PI * 42 * (1 - ((() => {
                              let score = 0;
                              if (statusData?.supabase?.status === "connected") score += 25;
                              if (statusData?.localFiles?.dataJson?.writeable) score += 25;
                              if (statusData?.environment?.supabaseUrl) score += 12.5;
                              if (statusData?.environment?.supabaseServiceRoleKey) score += 12.5;
                              if (statusData?.environment?.adminSessionSecret) score += 12.5;
                              if (statusData?.environment?.adminPasswordHash) score += 12.5;
                              return score;
                            })() / 100))}`}
                            className="transition-all duration-1000"
                          />
                          <defs>
                            <linearGradient id="securityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-extrabold font-display">{(() => {
                            let score = 0;
                            if (statusData?.supabase?.status === "connected") score += 25;
                            if (statusData?.localFiles?.dataJson?.writeable) score += 25;
                            if (statusData?.environment?.supabaseUrl) score += 12.5;
                            if (statusData?.environment?.supabaseServiceRoleKey) score += 12.5;
                            if (statusData?.environment?.adminSessionSecret) score += 12.5;
                            if (statusData?.environment?.adminPasswordHash) score += 12.5;
                            return Math.round(score);
                          })()}%</span>
                          <span className="text-[8px] text-[var(--muted-foreground)] uppercase font-bold">Health</span>
                        </div>
                      </div>
                      {/* Score Details */}
                      <div className="flex-1 space-y-2">
                        <h3 className="text-sm font-bold flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" /> System Health Score
                        </h3>
                        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                          Your system health is calculated from database connectivity, file permissions, and environment variable configuration.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: "Database", ok: statusData?.supabase?.status === "connected", icon: Database },
                            { label: "Disk I/O", ok: statusData?.localFiles?.dataJson?.writeable, icon: HardDrive },
                            { label: "Auth", ok: statusData?.environment?.adminPasswordHash, icon: Fingerprint },
                            { label: "Secrets", ok: statusData?.environment?.adminSessionSecret, icon: Lock },
                          ].map((item, i) => (
                            <span key={i} className={`px-2 py-1 rounded-lg text-[9px] font-bold border flex items-center gap-1 ${
                              item.ok
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                            }`}>
                              <item.icon className="w-3 h-3" />
                              {item.label}: {item.ok ? "OK" : "FAIL"}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Change Password Form */}
                    <div className="lg:col-span-3 border border-[var(--glass-border)] bg-[var(--glass-bg)]/10 rounded-2xl overflow-hidden">
                      <div className="px-5 py-3 bg-gradient-to-r from-rose-500/5 to-purple-500/5 border-b border-[var(--glass-border)] flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
                          <KeyRound className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                        <h3 className="text-sm font-bold">Change Console Password</h3>
                      </div>
                      <div className="p-5">
                        <form onSubmit={handleChangePassword} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Current Password
                            </label>
                            <input
                              type="password"
                              required
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs focus:outline-none focus:border-rose-500/40 text-[var(--foreground)] transition-colors"
                              placeholder="••••••••••••"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase flex items-center gap-1">
                              <Fingerprint className="w-3 h-3" /> New Password
                            </label>
                            <input
                              type="password"
                              required
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs focus:outline-none focus:border-rose-500/40 text-[var(--foreground)] transition-colors"
                              placeholder="••••••••••••"
                            />
                            {/* Password strength indicator */}
                            {newPassword && (
                              <div className="space-y-1">
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4].map((level) => {
                                    const strength = newPassword.length >= 12 ? 4 : newPassword.length >= 10 ? 3 : newPassword.length >= 8 ? 2 : 1;
                                    const colors = ["bg-rose-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];
                                    return (
                                      <div key={level} className={`h-1 flex-1 rounded-full transition-all duration-300 ${level <= strength ? colors[strength - 1] : "bg-[var(--glass-border)]"}`} />
                                    );
                                  })}
                                </div>
                                <p className="text-[9px] text-[var(--muted-foreground)]">
                                  {newPassword.length < 8 ? "Too short — min 8 characters" : newPassword.length < 10 ? "Fair strength" : newPassword.length < 12 ? "Good strength" : "Strong password ✓"}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase flex items-center gap-1">
                              <Check className="w-3 h-3" /> Confirm New Password
                            </label>
                            <input
                              type="password"
                              required
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className={`w-full px-4 py-2.5 bg-[var(--glass-bg)] border rounded-xl text-xs focus:outline-none text-[var(--foreground)] transition-colors ${
                                confirmPassword && confirmPassword === newPassword
                                  ? "border-emerald-500/40"
                                  : confirmPassword
                                    ? "border-rose-500/40"
                                    : "border-[var(--glass-border)] focus:border-rose-500/40"
                              }`}
                              placeholder="••••••••••••"
                            />
                            {confirmPassword && confirmPassword !== newPassword && (
                              <p className="text-[9px] text-rose-500">Passwords don&apos;t match</p>
                            )}
                          </div>

                          {passwordStatus.message && (
                            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                              passwordStatus.success
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                            }`}>
                              {passwordStatus.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                              <span>{passwordStatus.message}</span>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={changingPassword}
                            className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-purple-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] text-white text-xs font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            {changingPassword ? "Updating..." : "Update Password"}
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Health Diagnostics Panel */}
                    <div className="lg:col-span-2 border border-[var(--glass-border)] bg-[var(--glass-bg)]/10 rounded-2xl overflow-hidden">
                      <div className="px-5 py-3 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 border-b border-[var(--glass-border)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                          <h3 className="text-sm font-bold">System Diagnostic</h3>
                        </div>
                        <button onClick={loadStatus} disabled={statusLoading} className="p-1.5 border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] rounded-lg transition-colors cursor-pointer">
                          <RefreshCw className={`w-3 h-3 text-[var(--muted-foreground)] ${statusLoading ? "animate-spin" : ""}`} />
                        </button>
                      </div>

                      <div className="p-5">
                        {statusLoading && !statusData ? (
                          <div className="py-10 text-center space-y-2">
                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-[10px] text-[var(--muted-foreground)]">Running diagnostic checks...</p>
                          </div>
                        ) : (
                          <div className="space-y-4 text-xs">
                            {/* DB Connection */}
                            <div className="p-3 bg-[var(--glass-bg)]/20 border border-[var(--glass-border)] rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold flex items-center gap-1.5">
                                  <Database className="w-3.5 h-3.5 text-blue-500" />
                                  Supabase Connection
                                </span>
                                <span className={`flex items-center gap-1 font-bold text-[10px] ${statusData?.supabase?.status === "connected" ? "text-emerald-500" : "text-rose-500"}`}>
                                  <span className={`w-2 h-2 rounded-full ${statusData?.supabase?.status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                                  {statusData?.supabase?.status === "connected" ? "Connected" : "Error"}
                                </span>
                              </div>
                              {statusData?.supabase?.latencyMs && (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                                    <span>Latency</span>
                                    <span className="font-mono font-bold">{statusData.supabase.latencyMs}ms</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-[var(--glass-border)] rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        statusData.supabase.latencyMs < 200 ? "bg-emerald-500" : statusData.supabase.latencyMs < 500 ? "bg-amber-500" : "bg-rose-500"
                                      }`}
                                      style={{ width: `${Math.min(100, (statusData.supabase.latencyMs / 1000) * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                              {statusData?.supabase?.error && (
                                <p className="text-[9px] text-rose-500 bg-rose-500/5 p-2 rounded border border-rose-500/10 font-mono break-all">{statusData.supabase.error}</p>
                              )}
                            </div>

                            {/* Local Files */}
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { name: "data.json", icon: FileText, ok: statusData?.localFiles?.dataJson?.writeable },
                                { name: "credentials.json", icon: Lock, ok: statusData?.localFiles?.credentialsJson?.writeable }
                              ].map((file, i) => (
                                <div key={i} className={`p-3 rounded-xl border text-center space-y-1 ${
                                  file.ok ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"
                                }`}>
                                  <file.icon className={`w-4 h-4 mx-auto ${file.ok ? "text-emerald-500" : "text-amber-500"}`} />
                                  <p className="text-[9px] text-[var(--muted-foreground)] font-mono">{file.name}</p>
                                  <p className={`font-bold text-[10px] ${file.ok ? "text-emerald-500" : "text-amber-500"}`}>
                                    {file.ok ? "Writable ✓" : "Read-Only"}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Environment Variables */}
                            <div className="space-y-2">
                              <span className="text-[10px] text-[var(--muted-foreground)] font-semibold uppercase block flex items-center gap-1">
                                <Terminal className="w-3 h-3" /> Environment Variables
                              </span>
                              <div className="space-y-1.5">
                                {[
                                  { key: "NEXT_PUBLIC_SUPABASE_URL", ok: statusData?.environment?.supabaseUrl, icon: Globe },
                                  { key: "SUPABASE_SERVICE_ROLE_KEY", ok: statusData?.environment?.supabaseServiceRoleKey, icon: KeyRound },
                                  { key: "ADMIN_SESSION_SECRET", ok: statusData?.environment?.adminSessionSecret, icon: Lock },
                                  { key: "ADMIN_PASSWORD_HASH", ok: statusData?.environment?.adminPasswordHash, icon: Fingerprint },
                                ].map((env, i) => (
                                  <div key={i} className="flex items-center justify-between p-2 bg-[var(--glass-bg)]/20 border border-[var(--glass-border)] rounded-lg">
                                    <span className="flex items-center gap-1.5 text-[9px] font-mono">
                                      <env.icon className="w-3 h-3 text-[var(--muted-foreground)]" />
                                      <span className="truncate max-w-[130px]" title={env.key}>{env.key}</span>
                                    </span>
                                    <span className={`text-[9px] font-bold ${env.ok ? "text-emerald-500" : "text-rose-500"}`}>
                                      {env.ok ? "✓" : "✗"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Database Synchronizer Utility */}
                  <div className="border border-[var(--glass-border)] rounded-2xl overflow-hidden">
                    <div className="px-5 py-3 bg-gradient-to-r from-amber-500/5 to-blue-500/5 border-b border-[var(--glass-border)] flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Database className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Portfolio Database Synchronizer</h3>
                        <p className="text-[10px] text-[var(--muted-foreground)]">Sync content between Supabase and local filesystem</p>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Push to Database */}
                        <div className="p-4 border border-amber-500/20 bg-amber-500/[0.02] rounded-xl space-y-3 hover:border-amber-500/40 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                              <Upload className="w-4 h-4 text-amber-500" />
                            </div>
                            <h4 className="text-xs font-bold text-[var(--foreground)]">Push Local → Supabase</h4>
                          </div>
                          <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
                            Overwrites remote DB with your local <code className="px-1 py-0.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded text-[8px] font-mono">data.json</code> file.
                          </p>
                          <button
                            onClick={() => handleSync("push")}
                            disabled={syncing}
                            className="w-full px-4 py-2 bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/30 hover:from-amber-500/20 text-amber-500 font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Upload className="w-3 h-3" />
                            {syncing ? "Syncing..." : "Push"}
                          </button>
                        </div>

                        {/* Pull from Database */}
                        <div className="p-4 border border-blue-500/20 bg-blue-500/[0.02] rounded-xl space-y-3 hover:border-blue-500/40 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <Download className="w-4 h-4 text-blue-500" />
                            </div>
                            <h4 className="text-xs font-bold text-[var(--foreground)]">Pull Supabase → Local</h4>
                          </div>
                          <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
                            Overwrites your local <code className="px-1 py-0.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded text-[8px] font-mono">data.json</code> with remote DB content.
                          </p>
                          <button
                            onClick={() => handleSync("pull")}
                            disabled={syncing}
                            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/30 hover:from-blue-500/20 text-blue-500 font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Download className="w-3 h-3" />
                            {syncing ? "Syncing..." : "Pull"}
                          </button>
                        </div>
                      </div>

                      {syncStatus.message && (
                        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                          syncStatus.success
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                        }`}>
                          {syncStatus.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                          <span>{syncStatus.message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* === VISITOR ANALYTICS TAB === */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  {/* Tab Title */}
                  <div className="border-b border-[var(--glass-border)] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center relative">
                        <BarChart2 className="w-5 h-5 text-blue-500" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[var(--background)]" />
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-display">Visitor Analytics & Security Log</h2>
                        <p className="text-xs text-[var(--muted-foreground)]">Real-time telemetry, geographic tracking, and device environments</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Range Select */}
                      <select
                        value={analyticsRange}
                        onChange={(e) => setAnalyticsRange(e.target.value)}
                        className="px-3 py-1.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-xs font-semibold text-[var(--foreground)] focus:outline-none cursor-pointer"
                      >
                        <option value="today">Today</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="all">All Time</option>
                      </select>
                      {/* Refresh Button */}
                      <button
                        onClick={async () => {
                          setAnalyticsLoading(true);
                          try {
                            const res = await fetch(`/api/admin/analytics?range=${analyticsRange}`);
                            if (res.ok) {
                              setAnalyticsData(await res.json());
                            }
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setAnalyticsLoading(false);
                          }
                        }}
                        disabled={analyticsLoading}
                        className="p-1.5 border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg transition-colors cursor-pointer"
                        title="Refresh Data"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? "animate-spin" : ""}`} />
                      </button>
                      {/* Print PDF Button */}
                      <button
                        onClick={handleExportPDF}
                        className="p-1.5 border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg transition-colors cursor-pointer"
                        title="Export PDF (Print)"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      {/* CSV Export Button */}
                      <button
                        onClick={handleExportCSV}
                        className="p-1.5 border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg transition-colors cursor-pointer"
                        title="Export CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Analytics content */}
                  {analyticsLoading && !analyticsData ? (
                    <div className="py-20 text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-[var(--muted-foreground)]">Fetching visitor telemetry...</p>
                    </div>
                  ) : !analyticsData ? (
                    <div className="p-8 border border-dashed border-[var(--glass-border)] rounded-2xl text-center text-xs text-[var(--muted-foreground)]">
                      No analytics data loaded. Click Refresh or check your Supabase connection.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Metric cards grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Unique Visitors */}
                        <div className="p-4 border border-[var(--glass-border)] bg-[var(--glass-bg)]/30 rounded-2xl relative overflow-hidden group hover:border-[var(--primary)]/30 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">Unique Visitors</span>
                            <User className="w-4 h-4 text-[var(--primary)]" />
                          </div>
                          <div className="flex items-baseline justify-between mt-2">
                            <h3 className="text-xl font-extrabold font-display">{analyticsData.uniqueIPs}</h3>
                            <Sparkline points={uniquePoints} color="#a855f7" />
                          </div>
                        </div>

                        {/* Page Views */}
                        <div className="p-4 border border-[var(--glass-border)] bg-[var(--glass-bg)]/30 rounded-2xl relative overflow-hidden group hover:border-[var(--primary)]/30 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">Total Page Views</span>
                            <Eye className="w-4 h-4 text-[var(--primary)]" />
                          </div>
                          <div className="flex items-baseline justify-between mt-2">
                            <h3 className="text-xl font-extrabold font-display">{analyticsData.totalVisits}</h3>
                            <Sparkline points={visitsPoints} color="#3b82f6" />
                          </div>
                        </div>

                        {/* Active Sessions */}
                        <div className="p-4 border border-[var(--glass-border)] bg-[var(--glass-bg)]/30 rounded-2xl relative overflow-hidden group hover:border-[var(--primary)]/30 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">Active Sessions</span>
                            <span className="flex h-2 w-2 relative shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between mt-2">
                            <h3 className="text-xl font-extrabold font-display">{analyticsData.activeSessions}</h3>
                            <span className="text-[9px] text-emerald-500 font-bold font-mono">Live counter</span>
                          </div>
                        </div>

                        {/* Bounce Rate */}
                        <div className="p-4 border border-[var(--glass-border)] bg-[var(--glass-bg)]/30 rounded-2xl relative overflow-hidden group hover:border-[var(--primary)]/30 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">Bounce Rate</span>
                            <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
                          </div>
                          <div className="flex items-baseline justify-between mt-2">
                            <h3 className="text-xl font-extrabold font-display">{analyticsData.bounceRate}%</h3>
                            <span className="text-[9px] text-[var(--muted-foreground)] font-semibold">Single page visits</span>
                          </div>
                        </div>
                      </div>

                      {/* Area Chart Container */}
                      <div className="border border-[var(--glass-border)] rounded-2xl p-4 bg-[var(--glass-bg)]/10">
                        <h3 className="text-xs uppercase font-bold text-[var(--muted-foreground)] tracking-wider mb-3">Traffic History Over Time</h3>
                        <AreaChart data={analyticsData.chartData} />
                      </div>

                      {/* Vector Map */}
                      <GeographyMap recentVisitors={analyticsData.recentVisitors} />

                      {/* Stats grids (Donuts, Paths, Channels) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Device distributions */}
                        <div className="border border-[var(--glass-border)] rounded-2xl p-4 bg-[var(--glass-bg)]/10">
                          <h3 className="text-xs uppercase font-bold text-[var(--muted-foreground)] tracking-wider mb-2">Device Types</h3>
                          <DonutChart
                            data={analyticsData.topDevices.map((d: any) => ({ label: d.device, value: d.count }))}
                            colors={["#3b82f6", "#a855f7", "#10b981"]}
                          />
                        </div>

                        {/* Browser distributions */}
                        <div className="border border-[var(--glass-border)] rounded-2xl p-4 bg-[var(--glass-bg)]/10">
                          <h3 className="text-xs uppercase font-bold text-[var(--muted-foreground)] tracking-wider mb-2">Browsers</h3>
                          <DonutChart
                            data={analyticsData.topBrowsers.map((b: any) => ({ label: b.browser, value: b.count }))}
                            colors={["#3b82f6", "#a855f7", "#10b981", "#f59e0b", "#6366f1"]}
                          />
                        </div>

                        {/* Referrers */}
                        <div className="border border-[var(--glass-border)] rounded-2xl p-4 bg-[var(--glass-bg)]/10 flex flex-col justify-between min-w-0">
                          <h3 className="text-xs uppercase font-bold text-[var(--muted-foreground)] tracking-wider mb-3">Traffic Referrers</h3>
                          <div className="space-y-3 flex-1 overflow-y-auto max-h-[140px] pr-1">
                            {analyticsData.topReferrers.slice(0, 4).map((ref: any, idx: number) => {
                              const percent = Math.round((ref.count / (analyticsData.totalVisits || 1)) * 100);
                              return (
                                <div key={idx} className="flex items-center justify-between text-xs border-b border-[var(--glass-border)] pb-2 gap-2 min-w-0">
                                  <span className="text-[var(--muted-foreground)] font-semibold truncate block min-w-0 flex-1" title={ref.referrer}>{ref.referrer}</span>
                                  <span className="font-mono text-[var(--primary)] font-bold shrink-0">{ref.count} ({percent}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Top Visited paths list */}
                      <div className="border border-[var(--glass-border)] rounded-2xl p-4 bg-[var(--glass-bg)]/10 min-w-0">
                        <h3 className="text-xs uppercase font-bold text-[var(--muted-foreground)] tracking-wider mb-3">Top Visited Paths</h3>
                        <div className="space-y-3">
                          {analyticsData.topPages.slice(0, 5).map((page: any, idx: number) => {
                            const percent = Math.round((page.count / (analyticsData.totalVisits || 1)) * 100);
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex items-center justify-between text-xs gap-2 min-w-0">
                                  <span className="font-mono text-[var(--primary)] truncate block min-w-0 flex-1" title={page.page}>{page.page}</span>
                                  <span className="font-bold text-[var(--foreground)] shrink-0">{page.count} views ({percent}%)</span>
                                </div>
                                <div className="w-full h-1 bg-[var(--glass-border)] rounded-full overflow-hidden">
                                  <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Stream Search and Table */}
                      <div className="border border-[var(--glass-border)] rounded-2xl p-4 bg-[var(--glass-bg)]/10 space-y-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                          <h3 className="text-xs uppercase font-bold text-[var(--muted-foreground)] tracking-wider">Telemetry Stream (Recent Visits)</h3>
                          <div className="relative w-full sm:max-w-xs">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)]" />
                            <input
                              type="text"
                              placeholder="Search logs (IP, city, ISP)..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-4 py-1.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:border-[var(--primary)]/60"
                            />
                          </div>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-[var(--glass-border)] text-[var(--muted-foreground)]">
                                <th className="p-3 font-semibold">IP & Device</th>
                                <th className="p-3 font-semibold">Location</th>
                                <th className="p-3 font-semibold">ISP Network</th>
                                <th className="p-3 font-semibold">Target Page</th>
                                <th className="p-3 font-semibold text-right">Time</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--glass-border)]">
                              {filteredVisitors.map((v: any, idx: number) => {
                                const dev = v.device_type?.toLowerCase() || "unknown";
                                const DevIcon = dev === "desktop" ? Laptop : dev === "mobile" ? Smartphone : dev === "tablet" ? Tablet : Laptop;
                                const isExpanded = !!expandedRows[idx];

                                return (
                                  <React.Fragment key={idx}>
                                    <tr
                                      onClick={() => toggleRow(idx)}
                                      className="hover:bg-[var(--primary)]/5 transition-colors cursor-pointer group"
                                    >
                                      <td className="p-3">
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-1.5">
                                            <DevIcon className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0 animate-none" />
                                            <span className="font-mono font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                                              {v.ip_address}
                                            </span>
                                          </div>
                                          <div className="text-[9px] text-[var(--muted-foreground)]">
                                            {v.browser} • {v.os}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-3 font-semibold text-[var(--foreground)]">
                                        {v.city ? `${v.city}, ` : ""}{v.region ? `${v.region}, ` : ""}{v.country}
                                      </td>
                                      <td className="p-3 font-semibold text-[var(--muted-foreground)]">
                                        <span className="flex items-center gap-1.5">
                                          <Wifi className="w-3 h-3 text-[var(--primary)] shrink-0" />
                                          <span className="truncate max-w-[120px]" title={v.isp}>{v.isp || "Direct"}</span>
                                        </span>
                                      </td>
                                      <td className="p-3">
                                        <span className="px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] font-mono text-[9px]">
                                          {v.page_url}
                                        </span>
                                      </td>
                                      <td className="p-3 text-right text-[var(--muted-foreground)] font-mono">
                                        {new Date(v.visited_at).toLocaleTimeString()}
                                      </td>
                                    </tr>

                                    {isExpanded && (
                                      <tr key={`expanded-${idx}`} className="bg-[var(--glass-bg)]/20">
                                        <td colSpan={5} className="p-4 border-t border-[var(--glass-border)]">
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[10px] text-[var(--muted-foreground)]">
                                            <div className="space-y-1.5">
                                              <p className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">User Agent</p>
                                              <p className="bg-[var(--glass-bg)] p-2.5 rounded-lg border border-[var(--glass-border)] leading-relaxed break-all">
                                                {v.user_agent}
                                              </p>
                                            </div>
                                            <div className="space-y-1.5">
                                              <p className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Network details</p>
                                              <div className="bg-[var(--glass-bg)] p-2.5 rounded-lg border border-[var(--glass-border)] space-y-1">
                                                <p>ISP: <span className="text-[var(--foreground)]">{v.isp || "Unknown"}</span></p>
                                                <p>Referrer: <span className="text-[var(--foreground)] truncate inline-block max-w-[120px]" title={v.referrer}>{v.referrer || "Direct"}</span></p>
                                                <p>Coordinates: <span className="text-[var(--primary)]">{v.latitude && v.longitude ? `${v.latitude}, ${v.longitude}` : "N/A"}</span></p>
                                              </div>
                                            </div>
                                            <div className="space-y-1.5 flex flex-col justify-between">
                                              <p className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Actions</p>
                                              <div className="flex flex-col gap-2">
                                                {v.latitude && v.longitude && (
                                                  <a
                                                    href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-2 border border-[var(--primary)]/20 hover:bg-[var(--primary)]/10 text-[var(--primary)] font-semibold rounded-lg text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                                  >
                                                    <MapPin className="w-3.5 h-3.5" /> View on Map
                                                  </a>
                                                )}
                                                <button
                                                  onClick={() => setSearchQuery(v.ip_address)}
                                                  className="px-3 py-2 border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] text-[var(--foreground)] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                  <Search className="w-3.5 h-3.5" /> Filter IP
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* === PROFILE TAB === */}
              {activeTab === "profile" && data && (
                <div className="space-y-6">
                  <div className="border-b border-[var(--glass-border)] pb-4">
                    <h2 className="text-xl font-bold font-display">Site Configuration</h2>
                    <p className="text-xs text-[var(--muted-foreground)]">General settings and brand data</p>
                  </div>

                  {/* Profile Photo Uploader */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 border border-[var(--glass-border)] bg-[var(--glass-bg)]/20 rounded-2xl">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border border-[var(--glass-border)] shrink-0 bg-zinc-100 flex items-center justify-center">
                      {data.siteConfig.profileImage ? (
                        <img src={data.siteConfig.profileImage} alt="Profile Headshot" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-[var(--muted-foreground)]" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <h4 className="text-sm font-bold">Profile Picture</h4>
                      <p className="text-xs text-[var(--muted-foreground)]">Upload a high-quality square headshot (PNG, JPG, WEBP, SVG)</p>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <label className="px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append("file", file);
                              setSaveStatus({ success: false, message: "Uploading image..." });
                              try {
                                const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
                                const uploadRes = await res.json();
                                if (res.ok) {
                                  handleConfigChange("profileImage", uploadRes.url);
                                  setSaveStatus({ success: true, message: "Avatar uploaded successfully! Click 'Save Changes' to apply." });
                                } else {
                                  setSaveStatus({ success: false, message: uploadRes.error || "Upload failed" });
                                }
                              } catch (err: any) {
                                setSaveStatus({ success: false, message: err.message || "Upload crashed" });
                              }
                            }}
                          />
                        </label>
                        {data.siteConfig.profileImage && (
                          <button
                            onClick={() => handleConfigChange("profileImage", "")}
                            className="px-3 py-1.5 border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase block">Full Name</label>
                      <input
                        type="text"
                        value={data.siteConfig.name || ""}
                        onChange={(e) => handleConfigChange("name", e.target.value)}
                        className="w-full px-5 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase block">Title / Headline</label>
                      <input
                        type="text"
                        value={data.siteConfig.title || ""}
                        onChange={(e) => handleConfigChange("title", e.target.value)}
                        className="w-full px-5 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase block">Short Bio</label>
                      <textarea
                        rows={4}
                        value={data.siteConfig.bio || ""}
                        onChange={(e) => handleConfigChange("bio", e.target.value)}
                        className="w-full px-5 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase block">Contact Email</label>
                      <input
                        type="email"
                        value={data.siteConfig.email || ""}
                        onChange={(e) => handleConfigChange("email", e.target.value)}
                        className="w-full px-5 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase block">GitHub Link</label>
                      <input
                        type="text"
                        value={data.siteConfig.github || ""}
                        onChange={(e) => handleConfigChange("github", e.target.value)}
                        className="w-full px-5 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase block">LinkedIn Link</label>
                      <input
                        type="text"
                        value={data.siteConfig.linkedin || ""}
                        onChange={(e) => handleConfigChange("linkedin", e.target.value)}
                        className="w-full px-5 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase block">Twitter Link</label>
                      <input
                        type="text"
                        value={data.siteConfig.twitter || ""}
                        onChange={(e) => handleConfigChange("twitter", e.target.value)}
                        className="w-full px-5 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase block">Resume / CV URL</label>
                      <input
                        type="text"
                        placeholder="https://docs.google.com/document/d/..."
                        value={data.siteConfig.resumeUrl || ""}
                        onChange={(e) => handleConfigChange("resumeUrl", e.target.value)}
                        className="w-full px-5 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                      <p className="text-[10px] text-[var(--muted-foreground)]">Google Drive link to your resume. Used in navbar &quot;Resume&quot; link and hero &quot;Download CV&quot; button.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase block">Calendly URL</label>
                      <input
                        type="text"
                        placeholder="https://calendly.com/..."
                        value={data.siteConfig.calendlyUrl || ""}
                        onChange={(e) => handleConfigChange("calendlyUrl", e.target.value)}
                        className="w-full px-5 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase block">Location</label>
                      <input
                        type="text"
                        placeholder="Scotland, UK"
                        value={data.siteConfig.location || ""}
                        onChange={(e) => handleConfigChange("location", e.target.value)}
                        className="w-full px-5 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase block">Location Origin</label>
                      <input
                        type="text"
                        placeholder="Nepal"
                        value={data.siteConfig.locationOrigin || ""}
                        onChange={(e) => handleConfigChange("locationOrigin", e.target.value)}
                        className="w-full px-5 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* === EXPERIENCE TIMELINE === */}
              {activeTab === "experience" && data && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="border-b border-[var(--glass-border)] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-display">Experience Timeline</h2>
                        <p className="text-xs text-[var(--muted-foreground)]">Manage your employment history & job definitions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-[10px] font-mono font-bold text-[var(--muted-foreground)]">
                        {data.experience.length} entr{data.experience.length !== 1 ? "ies" : "y"}
                      </span>
                      <button
                        onClick={() => {
                          const newExp = { type: "work", title: "", company: "", companyUrl: "", period: "", description: "", bullets: [], tags: [] };
                          setData((prev: any) => ({ ...prev, experience: [newExp, ...prev.experience] }));
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all duration-300"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Position
                      </button>
                    </div>
                  </div>

                  {/* Empty State */}
                  {data.experience.length === 0 && (
                    <div className="p-12 border-2 border-dashed border-[var(--glass-border)] rounded-2xl text-center space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-blue-500/50" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--muted-foreground)]">No experience entries yet</p>
                      <p className="text-xs text-[var(--muted-foreground)]">Click &quot;Add Position&quot; above to create your first entry.</p>
                    </div>
                  )}

                  {/* Experience Cards */}
                  <div className="space-y-5">
                    {data.experience.map((item: any, idx: number) => {
                      const titleVal = item.title || item.role || "";
                      const periodVal = item.period || item.duration || "";
                      const typeVal = item.type || "work";
                      const companyVal = item.company || "";
                      const companyUrlVal = item.companyUrl || "";
                      const descVal = typeof item.description === "string" ? item.description : (Array.isArray(item.description) ? item.description.join(" ") : "");
                      const bulletsVal = Array.isArray(item.bullets) ? item.bullets : (Array.isArray(item.description) ? item.description : []);
                      const tagsVal = Array.isArray(item.tags) ? item.tags.join(", ") : (typeof item.tags === "string" ? item.tags : "");

                      return (
                        <div key={idx} className="border border-[var(--glass-border)] bg-[var(--glass-bg)]/10 rounded-2xl overflow-hidden hover:border-blue-500/20 transition-all duration-300">
                          {/* Card Header */}
                          <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-b border-[var(--glass-border)]">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                                <GripVertical className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-mono font-bold bg-[var(--glass-bg)] px-2 py-0.5 rounded border border-[var(--glass-border)]">#{idx + 1}</span>
                              </div>
                              <h4 className="text-sm font-bold text-[var(--foreground)] truncate max-w-[250px]">{titleVal || "Untitled Position"}</h4>
                              <span className={`hidden sm:inline-flex px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${typeVal === "education" ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"}`}>
                                {typeVal === "education" ? "Education" : "Work"}
                              </span>
                              {companyVal && <span className="hidden md:inline-flex text-[10px] text-[var(--muted-foreground)] font-semibold">@ {companyVal}</span>}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {companyUrlVal && (
                                <a href={companyUrlVal} target="_blank" rel="noopener noreferrer" className="p-1.5 border border-[var(--glass-border)] hover:border-blue-500/30 text-[var(--muted-foreground)] hover:text-blue-500 rounded-lg transition-colors cursor-pointer"><ExternalLink className="w-3.5 h-3.5" /></a>
                              )}
                              <button onClick={() => { if (!window.confirm("Delete this experience entry?")) return; const updated = data.experience.filter((_: any, i: number) => i !== idx); setData((prev: any) => ({ ...prev, experience: updated })); }} className="p-1.5 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-5 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1"><Layers className="w-3 h-3" /> Type</label>
                                <select value={typeVal} onChange={(e) => { const updated = [...data.experience]; updated[idx].type = e.target.value; setData((prev: any) => ({ ...prev, experience: updated })); }} className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-blue-500/40 transition-colors cursor-pointer">
                                  <option value="work">Professional Work</option>
                                  <option value="education">Academic & Education</option>
                                </select>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1"><Briefcase className="w-3 h-3" /> Role / Degree Title</label>
                                <input type="text" value={titleVal} onChange={(e) => { const updated = [...data.experience]; updated[idx].title = e.target.value; updated[idx].role = e.target.value; setData((prev: any) => ({ ...prev, experience: updated })); }} placeholder="e.g., Network Engineer" className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-semibold text-[var(--foreground)] focus:outline-none focus:border-blue-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1"><Calendar className="w-3 h-3" /> Duration / Period</label>
                                <input type="text" value={periodVal} onChange={(e) => { const updated = [...data.experience]; updated[idx].period = e.target.value; updated[idx].duration = e.target.value; setData((prev: any) => ({ ...prev, experience: updated })); }} placeholder="e.g., 2024 — Present" className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-blue-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40" />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1"><Globe className="w-3 h-3" /> Company / Institution</label>
                                <input type="text" value={companyVal} onChange={(e) => { const updated = [...data.experience]; updated[idx].company = e.target.value; setData((prev: any) => ({ ...prev, experience: updated })); }} placeholder="e.g., Subisu Cablenet Pvt. Ltd." className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-blue-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1"><Link2 className="w-3 h-3" /> Company Website URL</label>
                                <div className="flex items-center gap-2">
                                  <input type="url" value={companyUrlVal} onChange={(e) => { const updated = [...data.experience]; updated[idx].companyUrl = e.target.value; setData((prev: any) => ({ ...prev, experience: updated })); }} placeholder="https://company.com" className="flex-1 px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-blue-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40" />
                                  {companyUrlVal && (
                                    <a href={companyUrlVal} target="_blank" rel="noopener noreferrer" className="px-3 py-2.5 border border-blue-500/20 hover:bg-blue-500/10 text-blue-500 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"><ExternalLink className="w-3 h-3" /> Visit</a>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1"><Hash className="w-3 h-3" /> Skills / Tags (Comma-separated)</label>
                              <input type="text" value={tagsVal} onChange={(e) => { const updated = [...data.experience]; updated[idx].tags = e.target.value.split(",").map((s) => s.trim()).filter(Boolean); setData((prev: any) => ({ ...prev, experience: updated })); }} placeholder="e.g., Cisco, OSPF, BGP, Network Administration" className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-blue-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40" />
                              {tagsVal && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {tagsVal.split(",").map((t: string, i: number) => t.trim() && <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-bold rounded-full">{t.trim()}</span>)}
                                </div>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1"><FileText className="w-3 h-3" /> Role Overview / Summary</label>
                              <textarea rows={2} value={descVal} onChange={(e) => { const updated = [...data.experience]; updated[idx].description = e.target.value; setData((prev: any) => ({ ...prev, experience: updated })); }} placeholder="Describe your responsibilities and scope of work..." className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-blue-500/40 transition-colors resize-none leading-relaxed placeholder:text-[var(--muted-foreground)]/40" />
                            </div>

                            {/* Bullet points */}
                            <div className="space-y-2 border-t border-[var(--glass-border)] pt-4">
                              <div className="flex items-center justify-between">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Key Accomplishments</label>
                                <button onClick={() => { const updated = [...data.experience]; updated[idx].bullets = [...bulletsVal, ""]; setData((prev: any) => ({ ...prev, experience: updated })); }} className="px-2 py-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-[10px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors">
                                  <Plus className="w-3 h-3" /> Add Highlight
                                </button>
                              </div>
                              <div className="space-y-2">
                                {bulletsVal.map((bullet: string, bIdx: number) => (
                                  <div key={bIdx} className="flex items-center gap-2">
                                    <span className="text-[9px] text-[var(--muted-foreground)] font-mono font-bold shrink-0 w-5 text-center">{bIdx + 1}.</span>
                                    <input type="text" value={bullet} onChange={(e) => { const updated = [...data.experience]; const newBullets = [...bulletsVal]; newBullets[bIdx] = e.target.value; updated[idx].bullets = newBullets; setData((prev: any) => ({ ...prev, experience: updated })); }} placeholder="Describe a key achievement..." className="flex-1 px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-blue-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40" />
                                    <button onClick={() => { if (!window.confirm("Remove this highlight?")) return; const updated = [...data.experience]; updated[idx].bullets = bulletsVal.filter((_: any, i: number) => i !== bIdx); setData((prev: any) => ({ ...prev, experience: updated })); }} className="p-1.5 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg cursor-pointer transition-colors">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Status Tags */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--glass-border)]">
                              <span className="text-[9px] text-[var(--muted-foreground)] font-bold uppercase">Status:</span>
                              {titleVal && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Title</span>}
                              {companyVal && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Company</span>}
                              {periodVal && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Period</span>}
                              {descVal && <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[9px] font-bold rounded-full flex items-center gap-1"><FileText className="w-2.5 h-2.5" /> Described</span>}
                              {bulletsVal.length > 0 && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-bold rounded-full flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" /> {bulletsVal.length} highlight{bulletsVal.length !== 1 ? "s" : ""}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


              {/* === PROJECTS GRID === */}
              {activeTab === "projects" && data && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="border-b border-[var(--glass-border)] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                        <FolderGit2 className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-display">Projects Grid</h2>
                        <p className="text-xs text-[var(--muted-foreground)]">Manage your network engineering and research projects</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-[10px] font-mono font-bold text-[var(--muted-foreground)]">
                        {data.projects.length} project{data.projects.length !== 1 ? "s" : ""}
                      </span>
                      <button
                        onClick={() => {
                          const newProj = { 
                            title: "", 
                            role: "", 
                            company: "", 
                            description: "", 
                            icon: "FolderGit2", 
                            tags: [], 
                            githubUrl: "", 
                            github: "", 
                            websiteUrl: "", 
                            demo: "", 
                            impact: [] 
                          };
                          setData((prev: any) => ({ ...prev, projects: [newProj, ...prev.projects] }));
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all duration-300"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Project
                      </button>
                    </div>
                  </div>

                  {/* Empty State */}
                  {data.projects.length === 0 && (
                    <div className="p-12 border-2 border-dashed border-[var(--glass-border)] rounded-2xl text-center space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <FolderGit2 className="w-8 h-8 text-indigo-500/50" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--muted-foreground)]">No projects registered</p>
                      <p className="text-xs text-[var(--muted-foreground)]">Click &quot;Add Project&quot; above to begin defining your showcase.</p>
                    </div>
                  )}

                  {/* Project Cards */}
                  <div className="space-y-5">
                    {data.projects.map((proj: any, idx: number) => {
                      const githubVal = proj.githubUrl || proj.github || "";
                      const websiteVal = proj.websiteUrl || proj.demo || "";
                      const companyVal = proj.company || "";
                      const roleVal = proj.role || "";
                      const iconVal = proj.icon || "FolderGit2";
                      const tagsVal = Array.isArray(proj.tags) ? proj.tags.join(", ") : (typeof proj.tags === "string" ? proj.tags : "");
                      const impactVal = Array.isArray(proj.impact) ? proj.impact : [];

                      return (
                        <div key={idx} className="border border-[var(--glass-border)] bg-[var(--glass-bg)]/10 rounded-2xl overflow-hidden hover:border-indigo-500/20 transition-all duration-300">
                          {/* Card Header Strip */}
                          <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border-b border-[var(--glass-border)]">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                                <GripVertical className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-mono font-bold bg-[var(--glass-bg)] px-2 py-0.5 rounded border border-[var(--glass-border)]">#{idx + 1}</span>
                              </div>
                              <h4 className="text-sm font-bold text-[var(--foreground)] truncate max-w-[250px]">
                                {proj.title || "Untitled Project"}
                              </h4>
                              {companyVal && (
                                <span className="hidden sm:inline-flex px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[9px] font-bold uppercase rounded-full">
                                  {companyVal}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {githubVal && (
                                <a href={githubVal} target="_blank" rel="noopener noreferrer" className="p-1.5 border border-[var(--glass-border)] hover:border-indigo-500/30 text-[var(--muted-foreground)] hover:text-indigo-500 rounded-lg transition-colors cursor-pointer" title="View Source Code">
                                  <Github className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {websiteVal && (
                                <a href={websiteVal} target="_blank" rel="noopener noreferrer" className="p-1.5 border border-[var(--glass-border)] hover:border-indigo-500/30 text-[var(--muted-foreground)] hover:text-indigo-500 rounded-lg transition-colors cursor-pointer" title="View Demo / Live Site">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  if (!window.confirm("Delete this project? This cannot be undone.")) return;
                                  const updated = data.projects.filter((_: any, i: number) => i !== idx);
                                  setData((prev: any) => ({ ...prev, projects: updated }));
                                }}
                                className="p-1.5 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-5 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <FolderGit2 className="w-3 h-3" /> Project Title
                                </label>
                                <input
                                  type="text"
                                  value={proj.title || ""}
                                  onChange={(e) => {
                                    const updated = [...data.projects];
                                    updated[idx].title = e.target.value;
                                    setData((prev: any) => ({ ...prev, projects: updated }));
                                  }}
                                  placeholder="e.g., Enterprise Core Switch Migration"
                                  className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-semibold text-[var(--foreground)] focus:outline-none focus:border-indigo-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Briefcase className="w-3 h-3" /> Company / Client
                                </label>
                                <input
                                  type="text"
                                  value={companyVal}
                                  onChange={(e) => {
                                    const updated = [...data.projects];
                                    updated[idx].company = e.target.value;
                                    setData((prev: any) => ({ ...prev, projects: updated }));
                                  }}
                                  placeholder="e.g., Subisu Cablenet / R&D Division"
                                  className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-indigo-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Shield className="w-3 h-3" /> Your Role in the Project
                                </label>
                                <input
                                  type="text"
                                  value={roleVal}
                                  onChange={(e) => {
                                    const updated = [...data.projects];
                                    updated[idx].role = e.target.value;
                                    setData((prev: any) => ({ ...prev, projects: updated }));
                                  }}
                                  placeholder="e.g., Lead Network Architect"
                                  className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-indigo-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Layers className="w-3 h-3" /> Visual Icon Design
                                </label>
                                <select
                                  value={iconVal}
                                  onChange={(e) => {
                                    const updated = [...data.projects];
                                    updated[idx].icon = e.target.value;
                                    setData((prev: any) => ({ ...prev, projects: updated }));
                                  }}
                                  className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-indigo-500/40 transition-colors cursor-pointer"
                                >
                                  <option value="FolderGit2">Generic Folder / Git</option>
                                  <option value="Router">Router & Switch</option>
                                  <option value="Network">Network Topology</option>
                                  <option value="Wifi">Broadband / Wi-Fi</option>
                                  <option value="Tv">Broadband TV / Multicast</option>
                                  <option value="ShieldCheck">Security / Lock</option>
                                  <option value="Bell">Bell / Alarm Alert</option>
                                  <option value="Search">Search / Lens</option>
                                  <option value="Monitor">Monitor Screen</option>
                                  <option value="Activity">Pulse Line / Telemetry</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Github className="w-3 h-3" /> GitHub Link (Code)
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="url"
                                    value={githubVal}
                                    onChange={(e) => {
                                      const updated = [...data.projects];
                                      updated[idx].githubUrl = e.target.value;
                                      updated[idx].github = e.target.value;
                                      setData((prev: any) => ({ ...prev, projects: updated }));
                                    }}
                                    placeholder="https://github.com/..."
                                    className="flex-1 px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-indigo-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                                  />
                                  {githubVal && (
                                    <a href={githubVal} target="_blank" rel="noopener noreferrer" className="px-3 py-2.5 border border-indigo-500/20 hover:bg-indigo-500/10 text-indigo-500 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0">
                                      <Github className="w-3 h-3" /> Code
                                    </a>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Link2 className="w-3 h-3" /> Live Demo / Website Link
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="url"
                                    value={websiteVal}
                                    onChange={(e) => {
                                      const updated = [...data.projects];
                                      updated[idx].websiteUrl = e.target.value;
                                      updated[idx].demo = e.target.value;
                                      setData((prev: any) => ({ ...prev, projects: updated }));
                                    }}
                                    placeholder="https://example.com"
                                    className="flex-1 px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-indigo-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                                  />
                                  {websiteVal && (
                                    <a href={websiteVal} target="_blank" rel="noopener noreferrer" className="px-3 py-2.5 border border-indigo-500/20 hover:bg-indigo-500/10 text-indigo-500 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0">
                                      <ExternalLink className="w-3 h-3" /> Demo
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                <Hash className="w-3 h-3" /> Tags / Technologies (Comma-separated)
                              </label>
                              <input
                                type="text"
                                value={tagsVal}
                                onChange={(e) => {
                                  const updated = [...data.projects];
                                  updated[idx].tags = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                                  setData((prev: any) => ({ ...prev, projects: updated }));
                                }}
                                placeholder="e.g., Cisco ACI, OSPF, Terraform, AWS"
                                className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-indigo-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                              />
                              {tagsVal && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {tagsVal.split(",").map((t: string, i: number) => t.trim() && (
                                    <span key={i} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[9px] font-bold rounded-full">{t.trim()}</span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Project Overview Description
                              </label>
                              <textarea
                                rows={2}
                                value={proj.description || ""}
                                onChange={(e) => {
                                  const updated = [...data.projects];
                                  updated[idx].description = e.target.value;
                                  setData((prev: any) => ({ ...prev, projects: updated }));
                                }}
                                placeholder="Describe the objectives, layout, scope, and technical implementations..."
                                className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-indigo-500/40 transition-colors resize-none leading-relaxed placeholder:text-[var(--muted-foreground)]/40"
                              />
                            </div>

                            {/* Project Metrics & Impact Highlights */}
                            <div className="space-y-2 border-t border-[var(--glass-border)] pt-4">
                              <div className="flex items-center justify-between">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" /> Project Metrics & Impact Highlights
                                </label>
                                <button
                                  onClick={() => {
                                    const updated = [...data.projects];
                                    updated[idx].impact = [...impactVal, ""];
                                    setData((prev: any) => ({ ...prev, projects: updated }));
                                  }}
                                  className="px-2 py-1 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 text-[10px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Plus className="w-3 h-3" /> Add Metric
                                </button>
                              </div>
                              <div className="space-y-2">
                                {impactVal.map((metric: string, mIdx: number) => (
                                  <div key={mIdx} className="flex items-center gap-2">
                                    <span className="text-[9px] text-[var(--muted-foreground)] font-mono font-bold shrink-0 w-5 text-center">{mIdx + 1}.</span>
                                    <input
                                      type="text"
                                      value={metric}
                                      onChange={(e) => {
                                        const updated = [...data.projects];
                                        const newImpact = [...impactVal];
                                        newImpact[mIdx] = e.target.value;
                                        updated[idx].impact = newImpact;
                                        setData((prev: any) => ({ ...prev, projects: updated }));
                                      }}
                                      placeholder="e.g., Reduced latency by 18% across WAN links..."
                                      className="flex-1 px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-indigo-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                                    />
                                    <button
                                      onClick={() => {
                                        if (!window.confirm("Remove this impact metric?")) return;
                                        const updated = [...data.projects];
                                        updated[idx].impact = impactVal.filter((_: any, i: number) => i !== mIdx);
                                        setData((prev: any) => ({ ...prev, projects: updated }));
                                      }}
                                      className="p-1.5 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg cursor-pointer transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Status Footer */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--glass-border)]">
                              <span className="text-[9px] text-[var(--muted-foreground)] font-bold uppercase">Status:</span>
                              {proj.title && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Title</span>}
                              {githubVal && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Source Code</span>}
                              {websiteVal && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Live Demo</span>}
                              {proj.description && <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[9px] font-bold rounded-full flex items-center gap-1"><FileText className="w-2.5 h-2.5" /> Overview</span>}
                              {impactVal.length > 0 && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-bold rounded-full flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" /> {impactVal.length} metric{impactVal.length !== 1 ? "s" : ""}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* === TECHNICAL SKILLS === */}
              {activeTab === "skills" && data && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="border-b border-[var(--glass-border)] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-display">Technical Skills</h2>
                        <p className="text-xs text-[var(--muted-foreground)]">Group and rank engineering skills domains</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-[10px] font-mono font-bold text-[var(--muted-foreground)]">
                        {data.skills.length} skill{data.skills.length !== 1 ? "s" : ""}
                      </span>
                      <button
                        onClick={() => {
                          const newSkill = { icon: "Cpu", name: "", category: "" };
                          setData((prev: any) => ({ ...prev, skills: [...prev.skills, newSkill] }));
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all duration-300"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Skill
                      </button>
                    </div>
                  </div>

                  {/* Empty State */}
                  {data.skills.length === 0 && (
                    <div className="p-12 border-2 border-dashed border-[var(--glass-border)] rounded-2xl text-center space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Cpu className="w-8 h-8 text-emerald-500/50" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--muted-foreground)]">No skills added yet</p>
                      <p className="text-xs text-[var(--muted-foreground)]">Click &quot;Add Skill&quot; above to list your expertise.</p>
                    </div>
                  )}

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.skills.map((skill: any, idx: number) => {
                      // Attempt to resolve custom Lucide icon dynamic preview
                      let PreviewIconComponent = Cpu;
                      try {
                        const iconName = skill.icon || "Cpu";
                        // Find matching icon component
                        const lucideIcons = require("lucide-react");
                        if (lucideIcons && lucideIcons[iconName]) {
                          PreviewIconComponent = lucideIcons[iconName];
                        }
                      } catch (e) {
                        PreviewIconComponent = Cpu;
                      }

                      return (
                        <div key={idx} className="border border-[var(--glass-border)] bg-[var(--glass-bg)]/10 rounded-2xl p-4 space-y-3 relative hover:border-emerald-500/20 transition-all duration-300">
                          {/* Top handle and delete */}
                          <div className="flex items-center justify-between pb-1 border-b border-[var(--glass-border)]">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                              <span className="text-[10px] font-mono font-bold bg-[var(--glass-bg)] px-2 py-0.5 rounded border border-[var(--glass-border)] text-[var(--muted-foreground)]">#{idx + 1}</span>
                              {skill.category && (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase rounded-full">
                                  {skill.category}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                if (!window.confirm("Delete this skill? This cannot be undone.")) return;
                                const updated = data.skills.filter((_: any, i: number) => i !== idx);
                                setData((prev: any) => ({ ...prev, skills: updated }));
                              }}
                              className="p-1 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-12 gap-3 pt-1">
                            {/* Icon Preview */}
                            <div className="col-span-3 flex flex-col items-center justify-center p-2.5 bg-[var(--glass-bg)]/20 border border-[var(--glass-border)] rounded-xl aspect-square">
                              <PreviewIconComponent className="w-6 h-6 text-emerald-500 animate-pulse" />
                              <span className="text-[8px] text-[var(--muted-foreground)] uppercase font-semibold mt-1">Preview</span>
                            </div>

                            {/* Inputs */}
                            <div className="col-span-9 space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                    <Image className="w-2.5 h-2.5" /> Lucide Icon
                                  </label>
                                  <input
                                    type="text"
                                    value={skill.icon || ""}
                                    onChange={(e) => {
                                      const updated = [...data.skills];
                                      updated[idx] = { ...updated[idx], icon: e.target.value };
                                      setData((prev: any) => ({ ...prev, skills: updated }));
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-emerald-500/40 transition-colors"
                                    placeholder="Cpu, Wifi, Router..."
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                    <Layers className="w-2.5 h-2.5" /> Category
                                  </label>
                                  <input
                                    type="text"
                                    value={skill.category || ""}
                                    onChange={(e) => {
                                      const updated = [...data.skills];
                                      updated[idx] = { ...updated[idx], category: e.target.value };
                                      setData((prev: any) => ({ ...prev, skills: updated }));
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-xs text-[var(--foreground)] focus:outline-none focus:border-emerald-500/40 transition-colors"
                                    placeholder="e.g. Networking"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5" /> Skill Name
                                </label>
                                <input
                                  type="text"
                                  value={skill.name || ""}
                                  onChange={(e) => {
                                    const updated = [...data.skills];
                                    updated[idx] = { ...updated[idx], name: e.target.value };
                                    setData((prev: any) => ({ ...prev, skills: updated }));
                                  }}
                                  className="w-full px-3 py-1.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-xs font-bold text-[var(--foreground)] focus:outline-none focus:border-emerald-500/40 transition-colors"
                                  placeholder="e.g. Cisco routing"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* === BLOG ARTICLES === */}
              {activeTab === "blogs" && data && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="border-b border-[var(--glass-border)] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-display">Blog Manager</h2>
                        <p className="text-xs text-[var(--muted-foreground)]">Create, compile, and publish blog articles & newsletters</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-[10px] font-mono font-bold text-[var(--muted-foreground)]">
                        {data.blogPosts.length} post{data.blogPosts.length !== 1 ? "s" : ""}
                      </span>
                      <button
                        onClick={() => {
                          const newBlog = { 
                            title: "", 
                            slug: "", 
                            date: new Date().toISOString().split("T")[0], 
                            category: "General", 
                            readTime: "5 min read", 
                            excerpt: "", 
                            content: "", 
                            tags: ["General"] 
                          };
                          setData((prev: any) => ({ ...prev, blogPosts: [newBlog, ...prev.blogPosts] }));
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all duration-300"
                      >
                        <Plus className="w-3.5 h-3.5" /> New Post
                      </button>
                    </div>
                  </div>

                  {/* Empty State */}
                  {data.blogPosts.length === 0 && (
                    <div className="p-12 border-2 border-dashed border-[var(--glass-border)] rounded-2xl text-center space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-purple-500/50" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--muted-foreground)]">No articles created yet</p>
                      <p className="text-xs text-[var(--muted-foreground)]">Click &quot;New Post&quot; above to compose your first piece.</p>
                    </div>
                  )}

                  {/* Blog Cards */}
                  <div className="space-y-5">
                    {data.blogPosts.map((blog: any, idx: number) => {
                      const titleVal = blog.title || "";
                      const slugVal = blog.slug || "";
                      const dateVal = blog.date || "";
                      const categoryVal = blog.category || "";
                      const readTimeVal = blog.readTime || "";
                      const excerptVal = blog.excerpt || "";
                      const contentVal = blog.content || "";

                      // Selection helper function
                      const insertAtCursor = (prefix: string, suffix: string = "") => {
                        const el = document.getElementById(`blog-content-${idx}`) as HTMLTextAreaElement;
                        if (!el) return;
                        const start = el.selectionStart;
                        const end = el.selectionEnd;
                        const text = el.value;
                        const selectedText = text.substring(start, end);
                        const replacement = prefix + selectedText + suffix;
                        const newVal = text.substring(0, start) + replacement + text.substring(end);
                        
                        const updated = [...data.blogPosts];
                        updated[idx].content = newVal;
                        setData((prev: any) => ({ ...prev, blogPosts: updated }));
                        
                        setTimeout(() => {
                          el.focus();
                          el.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
                        }, 10);
                      };

                      return (
                        <div key={idx} className="border border-[var(--glass-border)] bg-[var(--glass-bg)]/10 rounded-2xl overflow-hidden hover:border-purple-500/20 transition-all duration-300">
                          {/* Card Header Strip */}
                          <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-b border-[var(--glass-border)]">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                                <GripVertical className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-mono font-bold bg-[var(--glass-bg)] px-2 py-0.5 rounded border border-[var(--glass-border)]">#{idx + 1}</span>
                              </div>
                              <h4 className="text-sm font-bold text-[var(--foreground)] truncate max-w-[250px]">
                                {titleVal || "Draft Article"}
                              </h4>
                              {categoryVal && (
                                <span className="hidden sm:inline-flex px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[9px] font-bold uppercase rounded-full">
                                  {categoryVal}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {slugVal && (
                                <a href={`/blog/${slugVal}`} target="_blank" rel="noopener noreferrer" className="p-1.5 border border-[var(--glass-border)] hover:border-purple-500/30 text-[var(--muted-foreground)] hover:text-purple-500 rounded-lg transition-colors cursor-pointer" title="Preview Article URL">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  if (!window.confirm("Delete this blog post? This cannot be undone.")) return;
                                  const updated = data.blogPosts.filter((_: any, i: number) => i !== idx);
                                  setData((prev: any) => ({ ...prev, blogPosts: updated }));
                                }}
                                className="p-1.5 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Title */}
                              <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <FileText className="w-3 h-3" /> Article Title
                                </label>
                                <input
                                  type="text"
                                  value={titleVal}
                                  onChange={(e) => {
                                    const updated = [...data.blogPosts];
                                    updated[idx].title = e.target.value;
                                    setData((prev: any) => ({ ...prev, blogPosts: updated }));
                                  }}
                                  placeholder="e.g. Setting Up OSPF on Cisco IOS"
                                  className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-semibold text-[var(--foreground)] focus:outline-none focus:border-purple-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                                />
                              </div>

                              {/* Date */}
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> Publish Date
                                </label>
                                <input
                                  type="date"
                                  value={dateVal}
                                  onChange={(e) => {
                                    const updated = [...data.blogPosts];
                                    updated[idx].date = e.target.value;
                                    setData((prev: any) => ({ ...prev, blogPosts: updated }));
                                  }}
                                  className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-purple-500/40 transition-colors"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Slug Route */}
                              <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Hash className="w-3 h-3" /> Slug Route URL
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={slugVal}
                                    onChange={(e) => {
                                      const updated = [...data.blogPosts];
                                      updated[idx].slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
                                      setData((prev: any) => ({ ...prev, blogPosts: updated }));
                                    }}
                                    placeholder="e.g. setting-up-ospf-cisco"
                                    className="flex-1 px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-purple-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const generated = titleVal.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                                      const updated = [...data.blogPosts];
                                      updated[idx].slug = generated;
                                      setData((prev: any) => ({ ...prev, blogPosts: updated }));
                                    }}
                                    className="px-3 py-2.5 border border-purple-500/20 hover:bg-purple-500/10 text-purple-500 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
                                  >
                                    Auto Generate
                                  </button>
                                </div>
                              </div>

                              {/* Category */}
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Layers className="w-3 h-3" /> Category
                                </label>
                                <input
                                  type="text"
                                  value={categoryVal}
                                  onChange={(e) => {
                                    const updated = [...data.blogPosts];
                                    updated[idx].category = e.target.value;
                                    setData((prev: any) => ({ ...prev, blogPosts: updated }));
                                  }}
                                  placeholder="e.g. Network Security"
                                  className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-purple-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Read Time */}
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Reading Duration
                                </label>
                                <input
                                  type="text"
                                  value={readTimeVal}
                                  onChange={(e) => {
                                    const updated = [...data.blogPosts];
                                    updated[idx].readTime = e.target.value;
                                    setData((prev: any) => ({ ...prev, blogPosts: updated }));
                                  }}
                                  placeholder="e.g. 8 min read"
                                  className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-purple-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                                />
                              </div>

                              {/* Excerpt */}
                              <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" /> Excerpt / Summary (Short preview text)
                                </label>
                                <input
                                  type="text"
                                  value={excerptVal}
                                  onChange={(e) => {
                                    const updated = [...data.blogPosts];
                                    updated[idx].excerpt = e.target.value;
                                    setData((prev: any) => ({ ...prev, blogPosts: updated }));
                                  }}
                                  placeholder="Short 1-2 sentence overview of the article contents..."
                                  className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-purple-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                                />
                              </div>
                            </div>

                            {/* Markdown/Rich Content Area with MS-Word-style formatting bar */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center justify-between">
                                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Article Contents & Layout Editor</span>
                                <span className="font-mono text-[9px] text-[var(--muted-foreground)]">{contentVal.length} chars | {contentVal.split(/\s+/).filter(Boolean).length} words</span>
                              </label>

                              {/* The MS Word / Text Document Style Formatting Bar */}
                              <div className="flex flex-wrap items-center gap-1 p-2 bg-[var(--glass-bg)]/20 border border-[var(--glass-border)] rounded-t-xl border-b-0">
                                {/* Bold */}
                                <button
                                  type="button"
                                  onClick={() => insertAtCursor("**", "**")}
                                  className="p-1.5 hover:bg-[var(--glass-bg)] rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                                  title="Bold"
                                >
                                  <Bold className="w-3.5 h-3.5" />
                                </button>
                                {/* Italic */}
                                <button
                                  type="button"
                                  onClick={() => insertAtCursor("*", "*")}
                                  className="p-1.5 hover:bg-[var(--glass-bg)] rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                                  title="Italic"
                                >
                                  <Italic className="w-3.5 h-3.5" />
                                </button>
                                <div className="w-[1px] h-4 bg-[var(--glass-border)] mx-1" />
                                {/* Heading 1 */}
                                <button
                                  type="button"
                                  onClick={() => insertAtCursor("\n# ", "\n")}
                                  className="p-1.5 hover:bg-[var(--glass-bg)] rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                                  title="Heading 1"
                                >
                                  <Heading1 className="w-3.5 h-3.5" />
                                </button>
                                {/* Heading 2 */}
                                <button
                                  type="button"
                                  onClick={() => insertAtCursor("\n## ", "\n")}
                                  className="p-1.5 hover:bg-[var(--glass-bg)] rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                                  title="Heading 2"
                                >
                                  <Heading2 className="w-3.5 h-3.5" />
                                </button>
                                <div className="w-[1px] h-4 bg-[var(--glass-border)] mx-1" />
                                {/* Bullet List */}
                                <button
                                  type="button"
                                  onClick={() => insertAtCursor("\n- ", "\n")}
                                  className="p-1.5 hover:bg-[var(--glass-bg)] rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                                  title="Bullet List"
                                >
                                  <List className="w-3.5 h-3.5" />
                                </button>
                                {/* Numbered List */}
                                <button
                                  type="button"
                                  onClick={() => insertAtCursor("\n1. ", "\n")}
                                  className="p-1.5 hover:bg-[var(--glass-bg)] rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                                  title="Numbered List"
                                >
                                  <ListOrdered className="w-3.5 h-3.5" />
                                </button>
                                {/* Code block */}
                                <button
                                  type="button"
                                  onClick={() => insertAtCursor("\n```\n", "\n```\n")}
                                  className="p-1.5 hover:bg-[var(--glass-bg)] rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                                  title="Code Block"
                                >
                                  <Code className="w-3.5 h-3.5" />
                                </button>
                                {/* External Link */}
                                <button
                                  type="button"
                                  onClick={() => insertAtCursor("[", "](https://)")}
                                  className="p-1.5 hover:bg-[var(--glass-bg)] rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                                  title="Add Hyperlink"
                                >
                                  <Link2 className="w-3.5 h-3.5" />
                                </button>

                                <div className="w-[1px] h-4 bg-[var(--glass-border)] mx-1" />

                                {/* Document / PDF / Image Uploader Button */}
                                <label className="p-1.5 hover:bg-[var(--glass-bg)] rounded text-purple-500 hover:text-purple-400 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-semibold">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Attach File</span>
                                  <input
                                    type="file"
                                    accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      
                                      const formData = new FormData();
                                      formData.append("file", file);
                                      try {
                                        const res = await fetch("/api/admin/upload", {
                                          method: "POST",
                                          body: formData
                                        });
                                        if (res.ok) {
                                          const result = await res.json();
                                          if (result.success) {
                                            const isImg = [".png", ".jpg", ".jpeg", ".webp", ".svg"].some(ext => result.url.toLowerCase().endsWith(ext));
                                            const isPdf = result.url.toLowerCase().endsWith(".pdf");
                                            const markdown = isImg 
                                              ? `\n![${result.name}](${result.url})\n`
                                              : isPdf
                                                ? `\n[📕 PDF Document: ${result.name}](${result.url})\n`
                                                : `\n[📄 Attached Document: ${result.name}](${result.url})\n`;
                                            insertAtCursor(markdown);
                                          } else {
                                            alert(result.error || "Upload failed");
                                          }
                                        } else {
                                          const err = await res.json();
                                          alert(err.error || "Upload failed");
                                        }
                                      } catch (error) {
                                        console.error(error);
                                        alert("Network error during file upload");
                                      }
                                    }}
                                  />
                                </label>
                                <span className="text-[8px] text-[var(--muted-foreground)] ml-auto hidden md:inline">PNG, JPG, PDF, DOCX up to 10MB</span>
                              </div>

                              {/* Textarea content editor */}
                              <textarea
                                id={`blog-content-${idx}`}
                                rows={12}
                                value={contentVal}
                                onChange={(e) => {
                                  const updated = [...data.blogPosts];
                                  updated[idx].content = e.target.value;
                                  setData((prev: any) => ({ ...prev, blogPosts: updated }));
                                }}
                                placeholder="Write your article body here in standard word markdown style..."
                                className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-b-xl text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-purple-500/40 transition-colors leading-relaxed"
                              />
                            </div>

                            {/* Status and summary check */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--glass-border)]">
                              <span className="text-[9px] text-[var(--muted-foreground)] font-bold uppercase">Checklist:</span>
                              {titleVal && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Title</span>}
                              {slugVal && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Slug URL</span>}
                              {excerptVal && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Excerpt</span>}
                              {contentVal.length > 100 ? (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Content Wrote</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[9px] font-bold rounded-full flex items-center gap-1">Drafting...</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* === CERTIFICATIONS === */}
              {activeTab === "certifications" && data && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="border-b border-[var(--glass-border)] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center">
                        <Award className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-display">Professional Certifications</h2>
                        <p className="text-xs text-[var(--muted-foreground)]">Manage credentials, licenses, and professional awards</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-[10px] font-mono font-bold text-[var(--muted-foreground)]">
                        {data.certifications.length} credential{data.certifications.length !== 1 ? "s" : ""}
                      </span>
                      <button
                        onClick={() => {
                          const newCert = { title: "", name: "", issuer: "", date: "", credentialId: "", url: "", photo: "", description: "" };
                          setData((prev: any) => ({ ...prev, certifications: [newCert, ...prev.certifications] }));
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all duration-300"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Credential
                      </button>
                    </div>
                  </div>

                  {/* Empty State */}
                  {data.certifications.length === 0 && (
                    <div className="p-12 border-2 border-dashed border-[var(--glass-border)] rounded-2xl text-center space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Award className="w-8 h-8 text-amber-500/50" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--muted-foreground)]">No certifications yet</p>
                      <p className="text-xs text-[var(--muted-foreground)]">Click &quot;Add Credential&quot; above to create your first entry.</p>
                    </div>
                  )}

                  {/* Certification Cards */}
                  <div className="space-y-5">
                    {data.certifications.map((cert: any, idx: number) => (
                      <div key={idx} className="border border-[var(--glass-border)] bg-[var(--glass-bg)]/10 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-all duration-300 group/cert">
                        {/* Card Header Strip */}
                        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-b border-[var(--glass-border)]">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                              <GripVertical className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-mono font-bold bg-[var(--glass-bg)] px-2 py-0.5 rounded border border-[var(--glass-border)]">#{idx + 1}</span>
                            </div>
                            <h4 className="text-sm font-bold text-[var(--foreground)] truncate max-w-[300px]">
                              {cert.title || cert.name || "Untitled Credential"}
                            </h4>
                            {cert.issuer && (
                              <span className="hidden sm:inline-flex px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase rounded-full">
                                {cert.issuer}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {cert.url && (
                              <a
                                href={cert.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 border border-[var(--glass-border)] hover:border-blue-500/30 text-[var(--muted-foreground)] hover:text-blue-500 rounded-lg transition-colors cursor-pointer"
                                title="Open verification link"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => {
                                if (!window.confirm("Delete this certification? This cannot be undone.")) return;
                                const updated = data.certifications.filter((_: any, i: number) => i !== idx);
                                setData((prev: any) => ({ ...prev, certifications: updated }));
                              }}
                              className="p-1.5 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-5">
                          {/* Top row: Photo + Basic Info */}
                          <div className="flex flex-col sm:flex-row gap-5">
                            {/* Photo Uploader */}
                            <div className="shrink-0 space-y-2">
                              <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                <Image className="w-3 h-3" /> Certificate Photo
                              </label>
                              <div className="relative w-32 h-24 rounded-xl border-2 border-dashed border-[var(--glass-border)] hover:border-amber-500/30 bg-[var(--glass-bg)]/30 overflow-hidden group/photo transition-colors cursor-pointer">
                                {cert.photo ? (
                                  <>
                                    <img src={cert.photo} alt="Certificate" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="text-white text-[9px] font-bold">Change</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full gap-1">
                                    <Upload className="w-5 h-5 text-[var(--muted-foreground)] group-hover/photo:text-amber-500 transition-colors" />
                                    <span className="text-[8px] text-[var(--muted-foreground)] font-semibold">Upload</span>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    setSaveStatus({ success: false, message: "Uploading certificate image..." });
                                    try {
                                      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
                                      const uploadRes = await res.json();
                                      if (res.ok) {
                                        const updated = [...data.certifications];
                                        updated[idx].photo = uploadRes.url;
                                        setData((prev: any) => ({ ...prev, certifications: updated }));
                                        setSaveStatus({ success: true, message: "Certificate image uploaded! Click Save to apply." });
                                      } else {
                                        setSaveStatus({ success: false, message: uploadRes.error || "Upload failed" });
                                      }
                                    } catch (err: any) {
                                      setSaveStatus({ success: false, message: err.message || "Upload crashed" });
                                    }
                                  }}
                                />
                              </div>
                            </div>

                            {/* Basic fields */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Award className="w-3 h-3" /> Certification Title
                                </label>
                                <input
                                  type="text"
                                  value={cert.title || cert.name || ""}
                                  onChange={(e) => {
                                    const updated = [...data.certifications];
                                    updated[idx].title = e.target.value;
                                    updated[idx].name = e.target.value;
                                    setData((prev: any) => ({ ...prev, certifications: updated }));
                                  }}
                                  placeholder="e.g., AWS Solutions Architect"
                                  className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-semibold text-[var(--foreground)] focus:outline-none focus:border-amber-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Briefcase className="w-3 h-3" /> Issuing Organization
                                </label>
                                <input
                                  type="text"
                                  value={cert.issuer || ""}
                                  onChange={(e) => {
                                    const updated = [...data.certifications];
                                    updated[idx].issuer = e.target.value;
                                    setData((prev: any) => ({ ...prev, certifications: updated }));
                                  }}
                                  placeholder="e.g., Amazon Web Services, Cisco"
                                  className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-amber-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> Date Issued
                                </label>
                                <input
                                  type="text"
                                  value={cert.date || ""}
                                  onChange={(e) => {
                                    const updated = [...data.certifications];
                                    updated[idx].date = e.target.value;
                                    setData((prev: any) => ({ ...prev, certifications: updated }));
                                  }}
                                  placeholder="e.g., Jan 2026 or 2025-12"
                                  className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-amber-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Hash className="w-3 h-3" /> Credential ID
                                </label>
                                <input
                                  type="text"
                                  value={cert.credentialId || ""}
                                  onChange={(e) => {
                                    const updated = [...data.certifications];
                                    updated[idx].credentialId = e.target.value;
                                    setData((prev: any) => ({ ...prev, certifications: updated }));
                                  }}
                                  placeholder="e.g., ABC123XYZ or N/A"
                                  className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-amber-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40 placeholder:font-sans"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Verification Link */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                              <Link2 className="w-3 h-3" /> Verification Link URL
                            </label>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                                <input
                                  type="url"
                                  value={cert.url || ""}
                                  onChange={(e) => {
                                    const updated = [...data.certifications];
                                    updated[idx].url = e.target.value;
                                    setData((prev: any) => ({ ...prev, certifications: updated }));
                                  }}
                                  placeholder="https://credly.com/badge/..."
                                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-amber-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40"
                                />
                              </div>
                              {cert.url && (
                                <a
                                  href={cert.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2.5 border border-blue-500/20 hover:bg-blue-500/10 text-blue-500 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                                >
                                  <ExternalLink className="w-3 h-3" /> Verify
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Description
                            </label>
                            <textarea
                              value={cert.description || ""}
                              onChange={(e) => {
                                const updated = [...data.certifications];
                                updated[idx].description = e.target.value;
                                setData((prev: any) => ({ ...prev, certifications: updated }));
                              }}
                              rows={3}
                              placeholder="Briefly describe this certification, skills validated, or relevance to your career..."
                              className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-amber-500/40 transition-colors placeholder:text-[var(--muted-foreground)]/40 resize-none leading-relaxed"
                            />
                          </div>

                          {/* Status Tags */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--glass-border)]">
                            <span className="text-[9px] text-[var(--muted-foreground)] font-bold uppercase">Status:</span>
                            {cert.photo && (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Photo
                              </span>
                            )}
                            {!cert.photo && (
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[9px] font-bold rounded-full flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" /> No Photo
                              </span>
                            )}
                            {cert.credentialId && (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> ID Verified
                              </span>
                            )}
                            {cert.url && (
                              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-bold rounded-full flex items-center gap-1">
                                <Link2 className="w-2.5 h-2.5" /> Link Added
                              </span>
                            )}
                            {cert.description && (
                              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[9px] font-bold rounded-full flex items-center gap-1">
                                <FileText className="w-2.5 h-2.5" /> Described
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === DISSERTATIONS === */}
              {activeTab === "dissertions" && data && (
                <div className="space-y-6">
                  <div className="border-b border-[var(--glass-border)] pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-display">Academic Dissertations</h2>
                      <p className="text-xs text-[var(--muted-foreground)]">Manage your research dissertations & thesis items</p>
                    </div>
                    <button
                      onClick={() => {
                        const newDiss = { title: "Thesis Title", author: "Rajan Prakash Chand", institution: "UWS, Scotland", year: "2026", abstract: "Abstract...", pdfUrl: "" };
                        setData((prev: any) => ({ ...prev, dissertations: [newDiss, ...prev.dissertations] }));
                      }}
                      className="px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Dissertation
                    </button>
                  </div>

                  <div className="space-y-6">
                    {data.dissertations.length === 0 && (
                      <div className="p-8 border border-dashed border-[var(--glass-border)] rounded-2xl text-center text-xs text-[var(--muted-foreground)]">
                        No dissertations yet — click &quot;Add Dissertation&quot; above to create one.
                      </div>
                    )}
                    {data.dissertations.map((diss: any, idx: number) => (
                      <div key={idx} className="p-5 border border-[var(--glass-border)] bg-[var(--glass-bg)]/20 rounded-2xl space-y-4 relative">
                        <button
                          onClick={() => {
                            if (!window.confirm("Delete this dissertation entry? This cannot be undone.")) return;
                            const updated = data.dissertations.filter((_: any, i: number) => i !== idx);
                            setData((prev: any) => ({ ...prev, dissertations: updated }));
                          }}
                          className="absolute top-4 right-4 p-1.5 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Dissertation Title</label>
                            <input
                              type="text"
                              value={diss.title || ""}
                              onChange={(e) => {
                                const updated = [...data.dissertations];
                                updated[idx].title = e.target.value;
                                setData((prev: any) => ({ ...prev, dissertations: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-semibold text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Author</label>
                            <input
                              type="text"
                              value={diss.author || ""}
                              onChange={(e) => {
                                const updated = [...data.dissertations];
                                updated[idx].author = e.target.value;
                                setData((prev: any) => ({ ...prev, dissertations: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Institution</label>
                            <input
                              type="text"
                              value={diss.institution || ""}
                              onChange={(e) => {
                                const updated = [...data.dissertations];
                                updated[idx].institution = e.target.value;
                                setData((prev: any) => ({ ...prev, dissertations: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Abstract</label>
                            <textarea
                              rows={4}
                              value={diss.abstract || ""}
                              onChange={(e) => {
                                const updated = [...data.dissertations];
                                updated[idx].abstract = e.target.value;
                                setData((prev: any) => ({ ...prev, dissertations: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Year</label>
                              <input
                                type="text"
                                value={diss.year || ""}
                                onChange={(e) => {
                                  const updated = [...data.dissertations];
                                  updated[idx].year = e.target.value;
                                  setData((prev: any) => ({ ...prev, dissertations: updated }));
                                }}
                                className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1 pt-4">
                              <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">PDF Document Link</label>
                              <input
                                type="text"
                                value={diss.pdfUrl || ""}
                                onChange={(e) => {
                                  const updated = [...data.dissertations];
                                  updated[idx].pdfUrl = e.target.value;
                                  setData((prev: any) => ({ ...prev, dissertations: updated }));
                                }}
                                className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "messages" && (
                <div className="space-y-6">
                  <div className="border-b border-[var(--glass-border)] pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-display">Messages</h2>
                      <p className="text-xs text-[var(--muted-foreground)]">Contact form submissions from visitors</p>
                    </div>
                    <button
                      onClick={loadMessages}
                      className="px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                  </div>

                  {messagesLoading && messages.length === 0 ? (
                    <div className="py-20 text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-[var(--muted-foreground)]">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="p-8 border border-dashed border-[var(--glass-border)] rounded-2xl text-center text-xs text-[var(--muted-foreground)]">
                      No messages yet. When visitors submit the contact form, they&apos;ll appear here.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-5 border rounded-2xl space-y-3 relative transition-colors ${
                            msg.status === "unread"
                              ? "border-[var(--primary)]/30 bg-[var(--primary)]/[0.03]"
                              : "border-[var(--glass-border)] bg-[var(--glass-bg)]/20"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-[var(--foreground)]">{msg.name}</span>
                                <span
                                  className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                    msg.status === "unread"
                                      ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                                      : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                                  }`}
                                >
                                  {msg.status}
                                </span>
                              </div>
                              <a href={`mailto:${msg.email}`} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors block truncate">
                                {msg.email}
                              </a>
                              <p className="text-xs font-semibold text-[var(--foreground)]">{msg.subject}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] text-[var(--muted-foreground)] mr-1">
                                {msg.created_at ? new Date(msg.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                              </span>
                              <a
                                href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`}
                                className="p-1.5 border border-[var(--glass-border)] hover:border-[var(--primary)]/30 text-[var(--muted-foreground)] hover:text-[var(--primary)] rounded-lg transition-colors cursor-pointer"
                                aria-label="Reply by email"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleToggleMessageStatus(msg.id, msg.status)}
                                className="p-1.5 border border-[var(--glass-border)] hover:border-[var(--primary)]/30 text-[var(--muted-foreground)] hover:text-[var(--primary)] rounded-lg transition-colors cursor-pointer"
                                aria-label={msg.status === "read" ? "Mark as unread" : "Mark as read"}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-1.5 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                                aria-label="Delete message"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap border-t border-[var(--glass-border)] pt-3">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
