/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
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
  X
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
    <div className="flex flex-col sm:flex-row items-center gap-6 p-2">
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
      <div className="space-y-1 flex-1 w-full">
        {data.map((item, idx) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                <span className="text-[var(--muted-foreground)] font-semibold truncate max-w-[110px]" title={item.label}>
                  {item.label}
                </span>
              </div>
              <span className="font-bold text-[var(--foreground)] pl-2">
                {item.value} <span className="text-[9px] text-[var(--muted-foreground)] font-normal">({percent}%)</span>
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
  const [activeTab, setActiveTab] = useState("profile");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState("7d");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const router = useRouter();

  // Polling condition
  const isAnalyticsActive = activeTab === "analytics";

  useEffect(() => {
    if (isAnalyticsActive) {
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
  }, [activeTab, analyticsRange, isAnalyticsActive]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin");
        if (res.status === 401) {
          router.push("/admin");
          return;
        }
        const jsonData = await res.json();
        setData(jsonData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading admin data:", err);
      }
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
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
      [headers.join(","), ...rows.map((e: any) => e.map((val: string) => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

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
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
                { id: "profile", label: "Profile Info", icon: User },
                { id: "experience", label: "Experience Timeline", icon: Briefcase },
                { id: "projects", label: "Projects Grid", icon: Layers },
                { id: "skills", label: "Technical Skills", icon: Activity },
                { id: "blogs", label: "Blog Articles", icon: BookOpen },
                { id: "certifications", label: "Certifications", icon: Award },
                { id: "dissertions", label: "Dissertations", icon: Briefcase },
                { id: "analytics", label: "Visitor Analytics", icon: BarChart2 }
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
              {/* === VISITOR ANALYTICS TAB === */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  {/* Tab Title */}
                  <div className="border-b border-[var(--glass-border)] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold font-display">Visitor Analytics & Security Log</h2>
                      <p className="text-xs text-[var(--muted-foreground)]">Real-time telemetry, geographic tracking, and device environments</p>
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
                        <div className="border border-[var(--glass-border)] rounded-2xl p-4 bg-[var(--glass-bg)]/10 flex flex-col justify-between">
                          <h3 className="text-xs uppercase font-bold text-[var(--muted-foreground)] tracking-wider mb-3">Traffic Referrers</h3>
                          <div className="space-y-3 flex-1 overflow-y-auto max-h-[140px] pr-1">
                            {analyticsData.topReferrers.slice(0, 4).map((ref: any, idx: number) => {
                              const percent = Math.round((ref.count / (analyticsData.totalVisits || 1)) * 100);
                              return (
                                <div key={idx} className="flex items-center justify-between text-xs border-b border-[var(--glass-border)] pb-2">
                                  <span className="text-[var(--muted-foreground)] font-semibold truncate max-w-[150px]">{ref.referrer}</span>
                                  <span className="font-mono text-[var(--primary)] font-bold">{ref.count} ({percent}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Top Visited paths list */}
                      <div className="border border-[var(--glass-border)] rounded-2xl p-4 bg-[var(--glass-bg)]/10">
                        <h3 className="text-xs uppercase font-bold text-[var(--muted-foreground)] tracking-wider mb-3">Top Visited Paths</h3>
                        <div className="space-y-3">
                          {analyticsData.topPages.slice(0, 5).map((page: any, idx: number) => {
                            const percent = Math.round((page.count / (analyticsData.totalVisits || 1)) * 100);
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-mono text-[var(--primary)] truncate max-w-[200px]">{page.page}</span>
                                  <span className="font-bold text-[var(--foreground)]">{page.count} views ({percent}%)</span>
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
                                  <>
                                    <tr
                                      key={idx}
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
                                  </>
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
                  </div>
                </div>
              )}

              {/* === EXPERIENCE TIMELINE === */}
              {activeTab === "experience" && data && (
                <div className="space-y-6">
                  <div className="border-b border-[var(--glass-border)] pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-display">Experience Timeline</h2>
                      <p className="text-xs text-[var(--muted-foreground)]">Manage your employment history & job definitions</p>
                    </div>
                    <button
                      onClick={() => {
                        const newExp = { role: "New Role", company: "Company Name", location: "Location", duration: "2026 - Present", description: ["Description details..."] };
                        setData((prev: any) => ({ ...prev, experience: [newExp, ...prev.experience] }));
                      }}
                      className="px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Job
                    </button>
                  </div>

                  <div className="space-y-6">
                    {data.experience.map((item: any, idx: number) => (
                      <div key={idx} className="p-5 border border-[var(--glass-border)] bg-[var(--glass-bg)]/20 rounded-2xl space-y-4 relative">
                        <button
                          onClick={() => {
                            const updated = data.experience.filter((_: any, i: number) => i !== idx);
                            setData((prev: any) => ({ ...prev, experience: updated }));
                          }}
                          className="absolute top-4 right-4 p-1.5 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Role Name</label>
                            <input
                              type="text"
                              value={item.role || ""}
                              onChange={(e) => {
                                const updated = [...data.experience];
                                updated[idx].role = e.target.value;
                                setData((prev: any) => ({ ...prev, experience: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Company</label>
                            <input
                              type="text"
                              value={item.company || ""}
                              onChange={(e) => {
                                const updated = [...data.experience];
                                updated[idx].company = e.target.value;
                                setData((prev: any) => ({ ...prev, experience: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Location</label>
                            <input
                              type="text"
                              value={item.location || ""}
                              onChange={(e) => {
                                const updated = [...data.experience];
                                updated[idx].location = e.target.value;
                                setData((prev: any) => ({ ...prev, experience: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Duration</label>
                            <input
                              type="text"
                              value={item.duration || ""}
                              onChange={(e) => {
                                const updated = [...data.experience];
                                updated[idx].duration = e.target.value;
                                setData((prev: any) => ({ ...prev, experience: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Bullet points */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Job Description details</label>
                            <button
                              onClick={() => {
                                const updated = [...data.experience];
                                updated[idx].description = [...(updated[idx].description || []), "New detail description..."];
                                setData((prev: any) => ({ ...prev, experience: updated }));
                              }}
                              className="text-[10px] text-[var(--primary)] hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Plus className="w-3 h-3" /> Add Detail
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(item.description || []).map((bullet: string, bIdx: number) => (
                              <div key={bIdx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={bullet}
                                  onChange={(e) => {
                                    const updated = [...data.experience];
                                    updated[idx].description[bIdx] = e.target.value;
                                    setData((prev: any) => ({ ...prev, experience: updated }));
                                  }}
                                  className="flex-1 px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    const updated = [...data.experience];
                                    updated[idx].description = updated[idx].description.filter((_: any, i: number) => i !== bIdx);
                                    setData((prev: any) => ({ ...prev, experience: updated }));
                                  }}
                                  className="p-2 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === PROJECTS GRID === */}
              {activeTab === "projects" && data && (
                <div className="space-y-6">
                  <div className="border-b border-[var(--glass-border)] pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-display">Projects Grid</h2>
                      <p className="text-xs text-[var(--muted-foreground)]">Manage your network engineering and research projects</p>
                    </div>
                    <button
                      onClick={() => {
                        const newProj = { title: "New Project", description: "Project description...", tags: ["React"], github: "", demo: "", image: "" };
                        setData((prev: any) => ({ ...prev, projects: [newProj, ...prev.projects] }));
                      }}
                      className="px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Project
                    </button>
                  </div>

                  <div className="space-y-6">
                    {data.projects.map((proj: any, idx: number) => (
                      <div key={idx} className="p-5 border border-[var(--glass-border)] bg-[var(--glass-bg)]/20 rounded-2xl space-y-4 relative">
                        <button
                          onClick={() => {
                            const updated = data.projects.filter((_: any, i: number) => i !== idx);
                            setData((prev: any) => ({ ...prev, projects: updated }));
                          }}
                          className="absolute top-4 right-4 p-1.5 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Project Title</label>
                            <input
                              type="text"
                              value={proj.title || ""}
                              onChange={(e) => {
                                const updated = [...data.projects];
                                updated[idx].title = e.target.value;
                                setData((prev: any) => ({ ...prev, projects: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Tags (comma-separated)</label>
                            <input
                              type="text"
                              value={proj.tags ? proj.tags.join(", ") : ""}
                              onChange={(e) => {
                                const updated = [...data.projects];
                                updated[idx].tags = e.target.value.split(",").map((s) => s.trim());
                                setData((prev: any) => ({ ...prev, projects: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Description</label>
                            <textarea
                              rows={3}
                              value={proj.description || ""}
                              onChange={(e) => {
                                const updated = [...data.projects];
                                updated[idx].description = e.target.value;
                                setData((prev: any) => ({ ...prev, projects: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">GitHub Link</label>
                            <input
                              type="text"
                              value={proj.github || ""}
                              onChange={(e) => {
                                const updated = [...data.projects];
                                updated[idx].github = e.target.value;
                                setData((prev: any) => ({ ...prev, projects: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Demo Link</label>
                            <input
                              type="text"
                              value={proj.demo || ""}
                              onChange={(e) => {
                                const updated = [...data.projects];
                                updated[idx].demo = e.target.value;
                                setData((prev: any) => ({ ...prev, projects: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === TECHNICAL SKILLS === */}
              {activeTab === "skills" && data && (
                <div className="space-y-6">
                  <div className="border-b border-[var(--glass-border)] pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-display">Technical Skills</h2>
                      <p className="text-xs text-[var(--muted-foreground)]">Group and rank engineering skills domains</p>
                    </div>
                    <button
                      onClick={() => {
                        const newCat = { category: "Skills Domain", items: ["Skill Item"] };
                        setData((prev: any) => ({ ...prev, skills: [...prev.skills, newCat] }));
                      }}
                      className="px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Domain Group
                    </button>
                  </div>

                  <div className="space-y-6">
                    {data.skills.map((cat: any, idx: number) => (
                      <div key={idx} className="p-5 border border-[var(--glass-border)] bg-[var(--glass-bg)]/20 rounded-2xl space-y-4 relative">
                        <button
                          onClick={() => {
                            const updated = data.skills.filter((_: any, i: number) => i !== idx);
                            setData((prev: any) => ({ ...prev, skills: updated }));
                          }}
                          className="absolute top-4 right-4 p-1.5 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Skills Category Title</label>
                          <input
                            type="text"
                            value={cat.category || ""}
                            onChange={(e) => {
                              const updated = [...data.skills];
                              updated[idx].category = e.target.value;
                              setData((prev: any) => ({ ...prev, skills: updated }));
                            }}
                            className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-bold text-[var(--foreground)] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Skills Array (comma-separated)</label>
                          <input
                            type="text"
                            value={cat.items ? cat.items.join(", ") : ""}
                            onChange={(e) => {
                              const updated = [...data.skills];
                              updated[idx].items = e.target.value.split(",").map((s) => s.trim());
                              setData((prev: any) => ({ ...prev, skills: updated }));
                            }}
                            className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            placeholder="Core routing, BGP..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === BLOG ARTICLES === */}
              {activeTab === "blogs" && data && (
                <div className="space-y-6">
                  <div className="border-b border-[var(--glass-border)] pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-display">Blog Manager</h2>
                      <p className="text-xs text-[var(--muted-foreground)]">Create & compile blog postings</p>
                    </div>
                    <button
                      onClick={() => {
                        const newBlog = { title: "Draft Blog", slug: "draft-slug", date: new Date().toLocaleDateString("en-US"), excerpt: "Excerpt...", content: "Content...", tags: ["General"] };
                        setData((prev: any) => ({ ...prev, blogPosts: [newBlog, ...prev.blogPosts] }));
                      }}
                      className="px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Post
                    </button>
                  </div>

                  <div className="space-y-6">
                    {data.blogPosts.map((blog: any, idx: number) => (
                      <div key={idx} className="p-5 border border-[var(--glass-border)] bg-[var(--glass-bg)]/20 rounded-2xl space-y-4 relative">
                        <button
                          onClick={() => {
                            const updated = data.blogPosts.filter((_: any, i: number) => i !== idx);
                            setData((prev: any) => ({ ...prev, blogPosts: updated }));
                          }}
                          className="absolute top-4 right-4 p-1.5 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Article Title</label>
                            <input
                              type="text"
                              value={blog.title || ""}
                              onChange={(e) => {
                                const updated = [...data.blogPosts];
                                updated[idx].title = e.target.value;
                                setData((prev: any) => ({ ...prev, blogPosts: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Slug Route</label>
                            <input
                              type="text"
                              value={blog.slug || ""}
                              onChange={(e) => {
                                const updated = [...data.blogPosts];
                                updated[idx].slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                                setData((prev: any) => ({ ...prev, blogPosts: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Date</label>
                            <input
                              type="text"
                              value={blog.date || ""}
                              onChange={(e) => {
                                const updated = [...data.blogPosts];
                                updated[idx].date = e.target.value;
                                setData((prev: any) => ({ ...prev, blogPosts: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="md:col-span-3 space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Excerpt</label>
                            <input
                              type="text"
                              value={blog.excerpt || ""}
                              onChange={(e) => {
                                const updated = [...data.blogPosts];
                                updated[idx].excerpt = e.target.value;
                                setData((prev: any) => ({ ...prev, blogPosts: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="md:col-span-3 space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Markdown Content</label>
                            <textarea
                              rows={8}
                              value={blog.content || ""}
                              onChange={(e) => {
                                const updated = [...data.blogPosts];
                                updated[idx].content = e.target.value;
                                setData((prev: any) => ({ ...prev, blogPosts: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-mono text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === CERTIFICATIONS === */}
              {activeTab === "certifications" && data && (
                <div className="space-y-6">
                  <div className="border-b border-[var(--glass-border)] pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-display">Professional Certifications</h2>
                      <p className="text-xs text-[var(--muted-foreground)]">Credential registries & awards links</p>
                    </div>
                    <button
                      onClick={() => {
                        const newCert = { name: "Cert Name", issuer: "Cisco", date: "2026", credentialId: "", url: "" };
                        setData((prev: any) => ({ ...prev, certifications: [newCert, ...prev.certifications] }));
                      }}
                      className="px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Credential
                    </button>
                  </div>

                  <div className="space-y-6">
                    {data.certifications.map((cert: any, idx: number) => (
                      <div key={idx} className="p-5 border border-[var(--glass-border)] bg-[var(--glass-bg)]/20 rounded-2xl space-y-4 relative">
                        <button
                          onClick={() => {
                            const updated = data.certifications.filter((_: any, i: number) => i !== idx);
                            setData((prev: any) => ({ ...prev, certifications: updated }));
                          }}
                          className="absolute top-4 right-4 p-1.5 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Certification Title</label>
                            <input
                              type="text"
                              value={cert.name || ""}
                              onChange={(e) => {
                                const updated = [...data.certifications];
                                updated[idx].name = e.target.value;
                                setData((prev: any) => ({ ...prev, certifications: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-semibold text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Issuer</label>
                            <input
                              type="text"
                              value={cert.issuer || ""}
                              onChange={(e) => {
                                const updated = [...data.certifications];
                                updated[idx].issuer = e.target.value;
                                setData((prev: any) => ({ ...prev, certifications: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Date</label>
                            <input
                              type="text"
                              value={cert.date || ""}
                              onChange={(e) => {
                                const updated = [...data.certifications];
                                updated[idx].date = e.target.value;
                                setData((prev: any) => ({ ...prev, certifications: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Credential ID</label>
                            <input
                              type="text"
                              value={cert.credentialId || ""}
                              onChange={(e) => {
                                const updated = [...data.certifications];
                                updated[idx].credentialId = e.target.value;
                                setData((prev: any) => ({ ...prev, certifications: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
                          </div>
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">Verification Link URL</label>
                            <input
                              type="text"
                              value={cert.url || ""}
                              onChange={(e) => {
                                const updated = [...data.certifications];
                                updated[idx].url = e.target.value;
                                setData((prev: any) => ({ ...prev, certifications: updated }));
                              }}
                              className="w-full px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
                            />
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
                    {data.dissertations.map((diss: any, idx: number) => (
                      <div key={idx} className="p-5 border border-[var(--glass-border)] bg-[var(--glass-bg)]/20 rounded-2xl space-y-4 relative">
                        <button
                          onClick={() => {
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
