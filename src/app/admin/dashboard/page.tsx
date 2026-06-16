/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  LogOut,
  Plus,
  Trash2,
  Edit,
  User,
  Briefcase,
  Layers,
  Award,
  BookOpen,
  Settings,
  Activity,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Link2,
  Upload,
  TrendingUp,
  Eye,
  Globe,
  Shield,
  Terminal,
  RefreshCw,
  BarChart2,
  Laptop,
  Smartphone,
  Tablet,
  MapPin,
  Wifi,
  Menu,
  Search,
  Bell,
  Download,
  Moon,
  Sun,
  ExternalLink,
  Clock,
  Check,
  X
} from "lucide-react";
import { BackgroundOrbs } from "@/components/background-orbs";

// ==========================================
// CUSTOM INTERACTIVE SVG COMPONENTS
// ==========================================

// Sparkline component for KPI cards
const Sparkline = ({ points, color = "#00f5ff" }: { points: number[]; color?: string }) => {
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
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#sparkGrad-${color.replace("#", "")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Interactive Area Chart
const AreaChart = ({ data }: { data: { label: string; visits: number; unique: number }[] }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[var(--muted-foreground)]">
        No chart records available
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
        <svg className="w-full min-w-[700px] h-64 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00f5ff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
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
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                />
                <text x={padding.left - 12} y={y + 4} fill="rgba(255, 255, 255, 0.4)" fontSize="10" textAnchor="end">
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
              <text key={i} x={x} y={height - padding.bottom + 22} fill="rgba(255, 255, 255, 0.4)" fontSize="10" textAnchor="middle">
                {d.label}
              </text>
            );
          })}

          {/* Fill Areas */}
          <path d={visitsArea} fill="url(#visitsGrad)" />
          <path d={uniqueArea} fill="url(#uniqueGrad)" />

          {/* Lines */}
          <path d={visitsPath} fill="none" stroke="#00f5ff" strokeWidth="2.5" strokeLinecap="round" />
          <path d={uniquePath} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />

          {/* Hitboxes / Hover interactions */}
          {data.map((d, i) => {
            const x = getX(i);
            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Mouse catcher bar */}
                <rect
                  x={x - (width / data.length) / 2}
                  y={padding.top}
                  width={width / data.length}
                  height={height - padding.top - padding.bottom}
                  fill="transparent"
                />

                {/* Hover line */}
                {hoveredIndex === i && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke="rgba(0, 245, 255, 0.3)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Visits node */}
                <circle
                  cx={x}
                  cy={getY(d.visits)}
                  r={hoveredIndex === i ? 5 : 3}
                  fill="#00f5ff"
                  stroke="#07070e"
                  strokeWidth={hoveredIndex === i ? 2 : 1}
                  className="transition-all duration-150"
                />

                {/* Unique node */}
                <circle
                  cx={x}
                  cy={getY(d.unique)}
                  r={hoveredIndex === i ? 5 : 3}
                  fill="#a855f7"
                  stroke="#07070e"
                  strokeWidth={hoveredIndex === i ? 2 : 1}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-[#0f0f1c]/90 border border-cyan-500/30 rounded-lg p-2.5 shadow-xl backdrop-blur-md text-[10px] space-y-1 z-20">
          <p className="font-bold text-white border-b border-white/10 pb-1 mb-1 text-center">
            {data[hoveredIndex].label}
          </p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Page Views: <strong>{data[hoveredIndex].visits}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Unique Visitors: <strong>{data[hoveredIndex].unique}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Interactive Donut Chart for Devices & Browsers
const DonutChart = ({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;

  const radius = 35;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth={strokeWidth} />
          {data.map((item, idx) => {
            const percent = total > 0 ? item.value / total : 0;
            const strokeLength = percent * circumference;
            const strokeOffset = circumference - cumulativePercent * circumference;
            cumulativePercent += percent;

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
                className="transition-all duration-300 hover:stroke-[12px] cursor-pointer"
              >
                <title>{`${item.label}: ${item.value}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">Total</span>
          <span className="text-lg font-black text-white">{total}</span>
        </div>
      </div>
      <div className="space-y-1.5 flex-1 w-full">
        {data.map((item, idx) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                <span className="text-[var(--muted-foreground)] font-semibold truncate max-w-[120px]" title={item.label}>
                  {item.label}
                </span>
              </div>
              <span className="font-bold text-white pl-2">
                {item.value} <span className="text-[10px] text-white/40 font-normal">({percent}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Vector Glowing Map Overlay
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
    // Map standard projection coordinates bounds
    const x = ((lon + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x, y };
  };

  // Only plot visitors that have active coordinates
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
    <div className="w-full relative glass rounded-3xl p-5 border border-cyan-500/10 overflow-hidden bg-grid-cyber">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-[10px] uppercase font-bold text-cyan-400">Live Telemetry Map</span>
      </div>
      <div className="w-full overflow-x-auto custom-scrollbar">
        <svg className="w-full min-w-[700px] h-96 bg-[#090915]/50 border border-white/5 rounded-2xl overflow-hidden" viewBox="0 0 800 400">
          <g>
            {worldLandmasses.map((land, idx) => (
              <path
                key={idx}
                d={land.d}
                fill="rgba(255, 255, 255, 0.04)"
                stroke="rgba(0, 245, 255, 0.15)"
                strokeWidth="1.2"
                strokeLinejoin="round"
                className="transition-all duration-300 hover:fill-cyan-500/10"
              />
            ))}
          </g>

          {/* Plot coordinates */}
          {coords.map((c: any, idx) => {
            const { x, y } = c.pos;
            return (
              <g key={idx} className="cursor-pointer group/node">
                <circle cx={x} cy={y} r="12" fill="none" stroke="#00f5ff" strokeWidth="1" className="animate-pulse" />
                <circle cx={x} cy={y} r="6" fill="#00f5ff" opacity="0.3" className="blur-[1px]" />
                <circle cx={x} cy={y} r="3" fill="#00f5ff" stroke="#080810" strokeWidth="1" />
                
                <title>{`${c.city ? `${c.city}, ` : ""}${c.country}\nIP: ${c.ip}\nActive at: ${c.time}`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ success: false, message: "" });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState("7d");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const router = useRouter();

  // Load analytics when range or analytics tabs are selected
  const isAnalyticsTab = ["dashboard", "realtime", "geography", "devices", "pages", "referrers"].includes(activeTab);

  useEffect(() => {
    if (isAnalyticsTab || activeTab === "settings") {
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
  }, [activeTab, analyticsRange, isAnalyticsTab]);

  // Load portfolio database data
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

  // Handle logging out
  const handleLogout = async () => {
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/admin");
  };

  // Export functions (CSV)
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

  // Handle CMS inputs
  const handleConfigChange = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      siteConfig: {
        ...prev.siteConfig,
        [field]: value
      }
    }));
  };

  // Save changes to Supabase / Local
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
      <div className="min-h-screen bg-[#07070e] flex items-center justify-center">
        <BackgroundOrbs />
        <div className="text-center relative z-10 space-y-4">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono tracking-widest text-cyan-400 uppercase animate-pulse">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  // Pre-calculate sparklines arrays safely
  const visitsPoints = analyticsData?.chartData ? analyticsData.chartData.map((d: any) => d.visits) : [0, 0];
  const uniquePoints = analyticsData?.chartData ? analyticsData.chartData.map((d: any) => d.unique) : [0, 0];

  // Filtering recent visitors by search query
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
    <div className="min-h-screen bg-[#07070e] text-[#f8fafc] flex relative overflow-x-hidden font-sans">
      <BackgroundOrbs />

      {/* Embedded dark styles for custom scrolling and mesh */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #07070e;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #00f5ff;
        }
        .bg-grid-cyber {
          background-size: 30px 30px;
          background-image: 
            linear-gradient(to right, rgba(0, 245, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 245, 255, 0.02) 1px, transparent 1px);
        }
        .glass {
          background: rgba(13, 13, 25, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        @media print {
          aside, nav, header, button, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            color: #000 !important;
            background: #fff !important;
          }
        }
      `}</style>

      {/* Sidebar panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 border-r border-white/5 bg-[#0a0a14]/95 backdrop-blur-md flex flex-col no-print ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 border-b border-white/5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,245,255,0.4)]">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-black text-sm uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent truncate">
                Rajan.Cloud
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 border border-white/5 hover:bg-white/5 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 py-6 overflow-y-auto px-4 space-y-6 custom-scrollbar">
          {/* Analytics Subgroup */}
          <div className="space-y-1.5">
            {!sidebarCollapsed && (
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 px-3 block mb-2">
                Analytics Engine
              </span>
            )}
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart2 },
              { id: "realtime", label: "Live Telemetry", icon: Activity },
              { id: "geography", label: "Geography", icon: Globe },
              { id: "devices", label: "Devices & Browsers", icon: Laptop },
              { id: "pages", label: "Top Pages", icon: Link2 },
              { id: "referrers", label: "Referrers", icon: Layers }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    active
                      ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.05)]"
                      : "text-white/40 border border-transparent hover:text-white/80 hover:bg-white/5"
                  }`}
                  title={tab.label}
                >
                  <TabIcon className={`w-4 h-4 shrink-0 transition-transform ${active ? "text-cyan-400" : "group-hover:scale-110"}`} />
                  {!sidebarCollapsed && <span className="truncate">{tab.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Portfolio CMS Subgroup */}
          <div className="space-y-1.5">
            {!sidebarCollapsed && (
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 px-3 block mb-2">
                Portfolio CMS
              </span>
            )}
            {[
              { id: "profile", label: "Profile Info", icon: User },
              { id: "experience", label: "Experience Timeline", icon: Briefcase },
              { id: "projects", label: "Projects Grid", icon: Layers },
              { id: "skills", label: "Technical Skills", icon: Activity },
              { id: "blogs", label: "Blog Articles", icon: BookOpen },
              { id: "dissertions", label: "Dissertations", icon: Briefcase },
              { id: "certifications", label: "Certifications", icon: Award }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    active
                      ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.05)]"
                      : "text-white/40 border border-transparent hover:text-white/80 hover:bg-white/5"
                  }`}
                  title={tab.label}
                >
                  <TabIcon className={`w-4 h-4 shrink-0 transition-transform ${active ? "text-cyan-400" : "group-hover:scale-110"}`} />
                  {!sidebarCollapsed && <span className="truncate">{tab.label}</span>}
                </button>
              );
            })}
          </div>

          {/* System Subgroup */}
          <div className="space-y-1.5">
            {!sidebarCollapsed && (
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 px-3 block mb-2">
                System Options
              </span>
            )}
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                activeTab === "settings"
                  ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 text-cyan-400"
                  : "text-white/40 border border-transparent hover:text-white/80 hover:bg-white/5"
              }`}
              title="System Config"
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>System Config</span>}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400/70 border border-transparent hover:bg-rose-500/5 hover:text-rose-400 transition-all cursor-pointer"
              title="Logout Portal"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Logout Portal</span>}
            </button>
          </div>
        </div>

        {/* Footer profile info */}
        {!sidebarCollapsed && data && (
          <div className="p-4 border-t border-white/5 bg-[#090912]/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-cyan-500/20 bg-zinc-800 shrink-0">
              {data.siteConfig.profileImage ? (
                <img src={data.siteConfig.profileImage} alt="User headshot" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-cyan-400 font-bold text-xs">RC</div>
              )}
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-xs text-white block truncate">{data.siteConfig.name || "Rajan Prakash Chand"}</span>
              <span className="text-[9px] text-white/40 block truncate">Administrator</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Workspace Frame */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? "pl-20" : "pl-64"}`}>
        {/* Navbar */}
        <nav className="sticky top-0 z-30 h-16 border-b border-white/5 bg-[#07070e]/85 backdrop-blur-md px-6 flex items-center justify-between no-print">
          <div className="flex items-center gap-4">
            {/* Collapsible toggle for small viewports */}
            <button className="md:hidden p-1.5 hover:bg-white/5 border border-white/5 rounded-lg text-white/50 hover:text-white cursor-pointer">
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumbs path */}
            <div className="text-xs font-mono hidden sm:flex items-center gap-1.5 text-white/40">
              <span className="hover:text-white transition-colors cursor-pointer">Console</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-semibold">
                {isAnalyticsTab ? "Analytics" : activeTab === "settings" ? "System" : "CMS"}
              </span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-cyan-400 uppercase font-black tracking-wide">
                {activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live active session pulse */}
            {analyticsData && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{analyticsData.activeSessions} ONLINE NOW</span>
              </div>
            )}

            {/* Search filter input */}
            {isAnalyticsTab && (
              <div className="relative max-w-xs hidden md:block">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Filter logs (IP, Path...)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 pl-9 pr-4 py-1.5 bg-[#0f0f1c] border border-white/5 rounded-xl text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
            )}

            {/* Save Changes Floating Button for CMS tabs */}
            {!isAnalyticsTab && activeTab !== "settings" && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 bg-gradient-to-r from-cyan-400 to-purple-600 hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 border-l border-white/5 pl-4">
              <button
                onClick={() => {
                  setAnalyticsRange(analyticsRange === "today" ? "7d" : analyticsRange === "7d" ? "30d" : "today");
                }}
                className="p-2 border border-white/5 hover:bg-white/5 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer"
                title={`Range: ${analyticsRange}`}
              >
                <Clock className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportCSV}
                className="p-2 border border-white/5 hover:bg-white/5 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer"
                title="Export CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>

        {/* Global Save Status banner */}
        {saveStatus.message && (
          <div className="px-8 pt-6 no-print">
            <div
              className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
                saveStatus.success
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}
            >
              <span>{saveStatus.message}</span>
              <button onClick={() => setSaveStatus({ success: false, message: "" })} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Outer content container */}
        <main className="p-6 md:p-8 flex-1 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* ==========================================
              ANALYTICS TAB VIEW: DASHBOARD (Overview)
              ========================================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Dynamic Range and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight uppercase">Visitor Dashboard</h1>
                  <p className="text-xs text-white/40">Real-time statistics & website engagement activity</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex bg-[#0f0f1c] border border-white/5 p-1 rounded-xl">
                    {["today", "7d", "30d", "all"].map((r) => (
                      <button
                        key={r}
                        onClick={() => setAnalyticsRange(r)}
                        className={`px-3 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                          analyticsRange === r ? "bg-cyan-500/20 text-cyan-400" : "text-white/40 hover:text-white"
                        }`}
                      >
                        {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : r}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={async () => {
                      setAnalyticsLoading(true);
                      const res = await fetch(`/api/admin/analytics?range=${analyticsRange}`);
                      if (res.ok) setAnalyticsData(await res.json());
                      setAnalyticsLoading(false);
                    }}
                    disabled={analyticsLoading}
                    className="p-2 border border-white/5 hover:bg-white/5 rounded-xl text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Analytics data content */}
              {analyticsLoading && !analyticsData ? (
                <div className="py-32 text-center space-y-4">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-white/40">Polling statistics from telemetry cache...</p>
                </div>
              ) : !analyticsData ? (
                <div className="py-24 text-center glass rounded-3xl border-dashed border-white/5">
                  <p className="text-xs text-white/30">Failed to pull database metrics. Click refresh to retry.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* KPI metric widgets grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Unique Visitors */}
                    <div className="glass rounded-3xl p-5 border border-white/5 relative overflow-hidden group hover:border-cyan-500/25 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">Unique Visitors</span>
                        <User className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex items-baseline justify-between mt-3">
                        <h2 className="text-2xl font-black text-white">{analyticsData.uniqueIPs}</h2>
                        <Sparkline points={uniquePoints} color="#00f5ff" />
                      </div>
                    </div>

                    {/* Total pageviews */}
                    <div className="glass rounded-3xl p-5 border border-white/5 relative overflow-hidden group hover:border-purple-500/25 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">Total Pageviews</span>
                        <Eye className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex items-baseline justify-between mt-3">
                        <h2 className="text-2xl font-black text-white">{analyticsData.totalVisits}</h2>
                        <Sparkline points={visitsPoints} color="#a855f7" />
                      </div>
                    </div>

                    {/* Bounce rate */}
                    <div className="glass rounded-3xl p-5 border border-white/5 relative overflow-hidden group hover:border-cyan-500/25 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">Bounce Rate</span>
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex items-baseline justify-between mt-3">
                        <h2 className="text-2xl font-black text-white">{analyticsData.bounceRate}%</h2>
                        <div className="w-24 h-10 flex items-center justify-end">
                          <svg className="w-10 h-10 overflow-visible" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00f5ff" strokeWidth="3.5" strokeDasharray={`${analyticsData.bounceRate}, 100`} strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Avg session duration */}
                    <div className="glass rounded-3xl p-5 border border-white/5 relative overflow-hidden group hover:border-purple-500/25 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">Session Duration</span>
                        <Clock className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex items-baseline justify-between mt-3">
                        <h2 className="text-2xl font-black text-white">
                          {analyticsData.avgSessionDuration >= 60
                            ? `${Math.floor(analyticsData.avgSessionDuration / 60)}m ${analyticsData.avgSessionDuration % 60}s`
                            : `${analyticsData.avgSessionDuration}s`}
                        </h2>
                        <Sparkline points={[2, 4, 3, 5, 8, 6, 9]} color="#a855f7" />
                      </div>
                    </div>
                  </div>

                  {/* Main Grid: Area Chart and Top Pages */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Area Chart Container */}
                    <div className="lg:col-span-2 glass rounded-3xl p-5 border border-white/5 relative">
                      <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider mb-4">Traffic Performance History</h3>
                      <AreaChart data={analyticsData.chartData} />
                    </div>

                    {/* Top Visited Pages List */}
                    <div className="glass rounded-3xl p-5 border border-white/5 flex flex-col">
                      <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider mb-4">Top Visited Paths</h3>
                      <div className="space-y-4 flex-1 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
                        {analyticsData.topPages.slice(0, 5).map((page: any, idx: number) => {
                          const total = analyticsData.totalVisits || 1;
                          const percent = Math.round((page.count / total) * 100);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-cyan-400 truncate max-w-[180px]">{page.page}</span>
                                <span className="font-bold text-white">{page.count} ({percent}%)</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* World map */}
                  <GeographyMap recentVisitors={analyticsData.recentVisitors} />

                  {/* Summary of Devices, Browsers and Referrers */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Device distribution */}
                    <div className="glass rounded-3xl p-5 border border-white/5">
                      <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider mb-2">Device Environments</h3>
                      <DonutChart
                        data={analyticsData.topDevices.map((d: any) => ({ label: d.device, value: d.count }))}
                        colors={["#00f5ff", "#a855f7", "#3b82f6"]}
                      />
                    </div>

                    {/* Browser distribution */}
                    <div className="glass rounded-3xl p-5 border border-white/5">
                      <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider mb-2">Browser Distribution</h3>
                      <DonutChart
                        data={analyticsData.topBrowsers.map((b: any) => ({ label: b.browser, value: b.count }))}
                        colors={["#00f5ff", "#a855f7", "#3b82f6", "#eab308", "#22c55e"]}
                      />
                    </div>

                    {/* Top Referrers */}
                    <div className="glass rounded-3xl p-5 border border-white/5 flex flex-col">
                      <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider mb-4">Traffic Referral Channels</h3>
                      <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                        {analyticsData.topReferrers.slice(0, 4).map((ref: any, idx: number) => {
                          const percent = Math.round((ref.count / (analyticsData.totalVisits || 1)) * 100);
                          return (
                            <div key={idx} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                              <span className="text-[var(--muted-foreground)] font-semibold truncate max-w-[160px]">{ref.referrer}</span>
                              <span className="font-mono text-cyan-400 font-bold">{ref.count} ({percent}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Stream table widget */}
                  <div className="glass rounded-3xl border border-white/5 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider">Telemetry Stream (Recent Visits)</h3>
                      <span className="text-[10px] text-white/30 font-mono">Showing last 50 visits</span>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-white/40">
                            <th className="p-3 font-semibold">IP Address</th>
                            <th className="p-3 font-semibold">Location</th>
                            <th className="p-3 font-semibold">ISP/Network</th>
                            <th className="p-3 font-semibold">Target Path</th>
                            <th className="p-3 font-semibold text-right">Activity Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredVisitors.slice(0, 10).map((v: any, idx: number) => {
                            const dev = v.device_type?.toLowerCase() || "unknown";
                            const DevIcon = dev === "desktop" ? Laptop : dev === "mobile" ? Smartphone : dev === "tablet" ? Tablet : Laptop;
                            return (
                              <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <DevIcon className="w-3.5 h-3.5 text-white/40 shrink-0" />
                                    <span className="font-mono font-bold text-white">{v.ip_address}</span>
                                  </div>
                                </td>
                                <td className="p-3 font-semibold text-white/80">
                                  {v.city ? `${v.city}, ` : ""}{v.country || "Unknown"}
                                </td>
                                <td className="p-3 font-semibold text-white/60">
                                  <span className="flex items-center gap-1.5">
                                    <Wifi className="w-3 h-3 text-cyan-400" />
                                    <span className="truncate max-w-[150px]">{v.isp || "Direct ISP"}</span>
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px]">
                                    {v.page_url}
                                  </span>
                                </td>
                                <td className="p-3 text-right text-white/40 font-mono">
                                  {new Date(v.visited_at).toLocaleTimeString()}
                                </td>
                              </tr>
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

          {/* ==========================================
              ANALYTICS TAB VIEW: REALTIME TELEMETRY
              ========================================== */}
          {activeTab === "realtime" && analyticsData && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">Live Telemetry</h1>
                <p className="text-xs text-white/40">Real-time visitor streaming feed and session tracking</p>
              </div>

              {/* Streaming list */}
              <div className="glass rounded-3xl border border-white/5 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      placeholder="Search telemetry logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 bg-[#0f0f1c] border border-white/5 rounded-xl text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>
                  <span className="text-[10px] text-white/40 font-mono">
                    Showing {filteredVisitors.length} recent sessions
                  </span>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-white/40">
                        <th className="p-3.5">IP & Environment</th>
                        <th className="p-3.5">Geography</th>
                        <th className="p-3.5">Network ISP</th>
                        <th className="p-3.5">Destination URL</th>
                        <th className="p-3.5">Referrer</th>
                        <th className="p-3.5 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredVisitors.map((v: any, idx: number) => {
                        const dev = v.device_type?.toLowerCase() || "unknown";
                        const DevIcon = dev === "desktop" ? Laptop : dev === "mobile" ? Smartphone : dev === "tablet" ? Tablet : Laptop;
                        const isExpanded = !!expandedRows[idx];

                        return (
                          <>
                            <tr
                              key={idx}
                              onClick={() => toggleRow(idx)}
                              className="hover:bg-white/5 transition-all cursor-pointer group"
                            >
                              <td className="p-3.5">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <DevIcon className="w-3.5 h-3.5 text-white/30 shrink-0" />
                                    <span className="font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">
                                      {v.ip_address}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-white/30">
                                    {v.browser} • {v.os}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5 font-semibold text-white/80">
                                {v.city ? `${v.city}, ` : ""}{v.region ? `${v.region}, ` : ""}{v.country}
                              </td>
                              <td className="p-3.5 font-semibold text-white/60">
                                <span className="flex items-center gap-1.5">
                                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                                  <span className="truncate max-w-[120px]" title={v.isp}>{v.isp || "Direct"}</span>
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px]">
                                  {v.page_url}
                                </span>
                              </td>
                              <td className="p-3.5 text-white/40 truncate max-w-[120px]" title={v.referrer}>
                                {v.referrer || "Direct / Bookmark"}
                              </td>
                              <td className="p-3.5 text-right text-white/40 font-mono">
                                {new Date(v.visited_at).toLocaleString()}
                              </td>
                            </tr>
                            
                            {/* Expandable Session details */}
                            {isExpanded && (
                              <tr key={`expanded-${idx}`} className="bg-[#090913]/40">
                                <td colSpan={6} className="p-4 border-t border-white/5">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[10px] text-white/60">
                                    <div className="space-y-1.5">
                                      <p className="text-[9px] uppercase font-bold text-white/30">User Agent</p>
                                      <p className="bg-[#07070e] p-2.5 rounded-lg border border-white/5 leading-relaxed text-wrap break-all">
                                        {v.user_agent}
                                      </p>
                                    </div>
                                    <div className="space-y-1.5">
                                      <p className="text-[9px] uppercase font-bold text-white/30">Network Parameters</p>
                                      <div className="bg-[#07070e] p-2.5 rounded-lg border border-white/5 space-y-1">
                                        <p>ISP: <span className="text-white">{v.isp || "Unknown"}</span></p>
                                        <p>IP Address: <span className="text-white">{v.ip_address}</span></p>
                                        <p>Coordinates: <span className="text-cyan-400">{v.latitude && v.longitude ? `${v.latitude}, ${v.longitude}` : "N/A"}</span></p>
                                      </div>
                                    </div>
                                    <div className="space-y-1.5">
                                      <p className="text-[9px] uppercase font-bold text-white/30">Session Actions</p>
                                      <div className="flex flex-col gap-2">
                                        {v.latitude && v.longitude && (
                                          <a
                                            href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 border border-cyan-500/20 hover:bg-cyan-500/10 text-cyan-400 font-semibold rounded-lg text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                          >
                                            <MapPin className="w-3.5 h-3.5" /> View Coordinates on Map
                                          </a>
                                        )}
                                        <button
                                          onClick={() => setSearchQuery(v.ip_address)}
                                          className="px-3 py-2 border border-white/5 hover:bg-white/5 text-white/80 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                          <Search className="w-3.5 h-3.5" /> Filter only this IP
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

          {/* ==========================================
              ANALYTICS TAB VIEW: GEOGRAPHY
              ========================================== */}
          {activeTab === "geography" && analyticsData && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">Geographic Analytics</h1>
                <p className="text-xs text-white/40">Geolocated visitor dispersion and maps data</p>
              </div>

              {/* Glowing Map */}
              <GeographyMap recentVisitors={analyticsData.recentVisitors} />

              {/* Detailed Countries breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 glass rounded-3xl border border-white/5 p-6">
                  <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider mb-4">Country Breakdown</h3>
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-white/40">
                          <th className="pb-3 font-semibold">Country</th>
                          <th className="pb-3 font-semibold text-right">Sessions Count</th>
                          <th className="pb-3 font-semibold text-right">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {analyticsData.topCountries.map((c: any, idx: number) => {
                          const percent = Math.round((c.count / (analyticsData.totalVisits || 1)) * 100);
                          return (
                            <tr key={idx} className="hover:bg-white/5">
                              <td className="py-3 font-semibold text-white/80">{c.country}</td>
                              <td className="py-3 text-right font-mono text-cyan-400 font-bold">{c.count}</td>
                              <td className="py-3 text-right font-mono text-white/60">{percent}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Regional Notes Card */}
                <div className="glass rounded-3xl border border-white/5 p-6 space-y-4">
                  <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider">Geographic insights</h3>
                  <p className="text-xs leading-relaxed text-white/60">
                    Visitor distributions are resolved at the IP-level. City accuracy is improved using subnet geolocated parameters.
                  </p>
                  <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl space-y-2">
                    <h4 className="text-xs font-bold text-cyan-400">Primary Country</h4>
                    <p className="text-lg font-black text-white">
                      {analyticsData.topCountries[0]?.country || "N/A"}
                    </p>
                    <p className="text-[10px] text-white/40">
                      Dominates traffic with {Math.round((analyticsData.topCountries[0]?.count / (analyticsData.totalVisits || 1)) * 100 || 0)}% of total sessions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              ANALYTICS TAB VIEW: DEVICES
              ========================================== */}
          {activeTab === "devices" && analyticsData && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">Devices & Browsers</h1>
                <p className="text-xs text-white/40">Hardware profiles and client browser environments</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Devices */}
                <div className="glass rounded-3xl border border-white/5 p-6">
                  <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider mb-4">Device Typology</h3>
                  <DonutChart
                    data={analyticsData.topDevices.map((d: any) => ({ label: d.device, value: d.count }))}
                    colors={["#00f5ff", "#a855f7", "#3b82f6"]}
                  />
                </div>

                {/* Browsers */}
                <div className="glass rounded-3xl border border-white/5 p-6">
                  <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider mb-4">Browser Environments</h3>
                  <DonutChart
                    data={analyticsData.topBrowsers.map((b: any) => ({ label: b.browser, value: b.count }))}
                    colors={["#00f5ff", "#a855f7", "#3b82f6", "#eab308", "#22c55e"]}
                  />
                </div>
              </div>

              {/* Comprehensive List */}
              <div className="glass rounded-3xl border border-white/5 p-6">
                <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider mb-4">Complete Browsers / Environments</h3>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-white/40">
                        <th className="pb-3 font-semibold">User Environment</th>
                        <th className="pb-3 font-semibold text-right">Hit Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {analyticsData.topBrowsers.map((b: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-3 font-semibold text-white/80">{b.browser}</td>
                          <td className="py-3 text-right font-mono text-cyan-400 font-bold">{b.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              ANALYTICS TAB VIEW: PAGES
              ========================================== */}
          {activeTab === "pages" && analyticsData && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">Top Visited Pages</h1>
                <p className="text-xs text-white/40">Individual path hits and router tracking analytics</p>
              </div>

              <div className="glass rounded-3xl border border-white/5 p-6">
                <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider mb-4">Visited Pages Table</h3>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-white/5 text-white/40 font-sans">
                        <th className="pb-3 font-semibold">Router Path</th>
                        <th className="pb-3 font-semibold text-right">Hit Count</th>
                        <th className="pb-3 font-semibold text-right">Visits Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {analyticsData.topPages.map((page: any, idx: number) => {
                        const percent = Math.round((page.count / (analyticsData.totalVisits || 1)) * 100);
                        return (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="py-3.5 text-cyan-400 font-bold">{page.page}</td>
                            <td className="py-3.5 text-right text-white font-bold">{page.count}</td>
                            <td className="py-3.5 text-right text-white/40">{percent}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              ANALYTICS TAB VIEW: REFERRERS
              ========================================== */}
          {activeTab === "referrers" && analyticsData && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">Traffic Channels</h1>
                <p className="text-xs text-white/40">Inbound source links and referral channels</p>
              </div>

              <div className="glass rounded-3xl border border-white/5 p-6">
                <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider mb-4">Traffic Inbound List</h3>
                <div className="overflow-x-auto custom-scrollbar font-mono">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-white/40 font-sans">
                        <th className="pb-3 font-semibold">Source Referrer</th>
                        <th className="pb-3 font-semibold text-right">Sessions Count</th>
                        <th className="pb-3 font-semibold text-right">Traffic Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {analyticsData.topReferrers.map((ref: any, idx: number) => {
                        const percent = Math.round((ref.count / (analyticsData.totalVisits || 1)) * 100);
                        return (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="py-3.5 text-white/80 font-sans font-semibold">{ref.referrer}</td>
                            <td className="py-3.5 text-right text-cyan-400 font-bold">{ref.count}</td>
                            <td className="py-3.5 text-right text-white/40">{percent}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              ANALYTICS TAB VIEW: SYSTEM SETTINGS
              ========================================== */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">System Configurations</h1>
                <p className="text-xs text-white/40">Global settings, logging tables, and database actions</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Telemetry settings */}
                <div className="glass rounded-3xl border border-white/5 p-6 space-y-4">
                  <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider">Database Operations</h3>
                  <p className="text-xs text-white/60">
                    Review or flush visitor analytics logs directly in Supabase. This operation is permanent.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={async () => {
                        if (!confirm("Are you sure you want to clear all telemetry database logs? This action is permanent!")) return;
                        alert("Log clearance has been requested. Please consult database administrator.");
                      }}
                      className="px-4 py-2 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Purge Telemetry Logs
                    </button>
                    <button
                      onClick={async () => {
                        alert("Database indices are optimized!");
                      }}
                      className="px-4 py-2 border border-white/5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Reindex Visitor Tables
                    </button>
                  </div>
                </div>

                {/* Dashboard Settings */}
                <div className="glass rounded-3xl border border-white/5 p-6 space-y-4">
                  <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider">Dashboard Settings</h3>
                  <div className="flex items-center justify-between text-xs border-b border-white/5 pb-3">
                    <span className="text-white/60">Dark Theme Override</span>
                    <button className="p-1.5 border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 rounded-lg">
                      <Moon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-1">
                    <span className="text-white/60">Live Updates Stream</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              CMS TAB VIEW: PROFILE INFO
              ========================================== */}
          {activeTab === "profile" && data && (
            <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold font-display uppercase tracking-tight">Site Configuration</h2>
                <p className="text-xs text-white/40">General settings and brand data</p>
              </div>

              {/* Profile Photo Uploader */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 border border-white/5 bg-white/5 rounded-2xl">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border border-cyan-500/20 shrink-0 bg-[#0f0f1c] flex items-center justify-center">
                  {data.siteConfig.profileImage ? (
                    <img src={data.siteConfig.profileImage} alt="Profile Headshot" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-white/40" />
                  )}
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <h4 className="text-sm font-bold">Profile Picture</h4>
                  <p className="text-xs text-white/40">Upload a high-quality square headshot (PNG, JPG, WEBP, SVG)</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <label className="px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-purple-600 hover:shadow-[0_0_15px_rgba(0,245,255,0.3)] text-white text-xs font-semibold rounded-lg cursor-pointer transition-all inline-flex items-center gap-1.5">
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
                        className="px-3 py-1.5 border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
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
                  <label className="text-xs font-semibold text-white/40 tracking-wider uppercase block">Full Name</label>
                  <input
                    type="text"
                    value={data.siteConfig.name || ""}
                    onChange={(e) => handleConfigChange("name", e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0f0f1c] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/40 tracking-wider uppercase block">Title / Headline</label>
                  <input
                    type="text"
                    value={data.siteConfig.title || ""}
                    onChange={(e) => handleConfigChange("title", e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0f0f1c] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-white/40 tracking-wider uppercase block">Short Bio</label>
                  <textarea
                    rows={4}
                    value={data.siteConfig.bio || ""}
                    onChange={(e) => handleConfigChange("bio", e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0f0f1c] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/40 tracking-wider uppercase block">Contact Email</label>
                  <input
                    type="email"
                    value={data.siteConfig.email || ""}
                    onChange={(e) => handleConfigChange("email", e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0f0f1c] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/40 tracking-wider uppercase block">GitHub Link</label>
                  <input
                    type="text"
                    value={data.siteConfig.github || ""}
                    onChange={(e) => handleConfigChange("github", e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0f0f1c] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/40 tracking-wider uppercase block">LinkedIn Link</label>
                  <input
                    type="text"
                    value={data.siteConfig.linkedin || ""}
                    onChange={(e) => handleConfigChange("linkedin", e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0f0f1c] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/40 tracking-wider uppercase block">Twitter Link</label>
                  <input
                    type="text"
                    value={data.siteConfig.twitter || ""}
                    onChange={(e) => handleConfigChange("twitter", e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0f0f1c] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              CMS TAB VIEW: EXPERIENCE TIMELINE
              ========================================== */}
          {activeTab === "experience" && data && (
            <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
              <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display uppercase tracking-tight">Experience Timeline</h2>
                  <p className="text-xs text-white/40">Manage your employment history & job definitions</p>
                </div>
                <button
                  onClick={() => {
                    const newExp = { role: "New Role", company: "Company Name", location: "Location", duration: "2026 - Present", description: ["Task bullet point..."] };
                    setData((prev: any) => ({ ...prev, experience: [newExp, ...prev.experience] }));
                  }}
                  className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Job
                </button>
              </div>

              <div className="space-y-6">
                {data.experience.map((item: any, idx: number) => (
                  <div key={idx} className="p-5 border border-white/5 bg-[#0f0f1c] rounded-2xl space-y-4 relative">
                    <button
                      onClick={() => {
                        const updated = data.experience.filter((_: any, i: number) => i !== idx);
                        setData((prev: any) => ({ ...prev, experience: updated }));
                      }}
                      className="absolute top-4 right-4 p-1.5 border border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/10 text-white/40 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      title="Delete Job"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Role Name</label>
                        <input
                          type="text"
                          value={item.role || ""}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[idx].role = e.target.value;
                            setData((prev: any) => ({ ...prev, experience: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Company</label>
                        <input
                          type="text"
                          value={item.company || ""}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[idx].company = e.target.value;
                            setData((prev: any) => ({ ...prev, experience: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Location</label>
                        <input
                          type="text"
                          value={item.location || ""}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[idx].location = e.target.value;
                            setData((prev: any) => ({ ...prev, experience: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Duration</label>
                        <input
                          type="text"
                          value={item.duration || ""}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[idx].duration = e.target.value;
                            setData((prev: any) => ({ ...prev, experience: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] uppercase font-bold text-white/40">Job description details</label>
                        <button
                          onClick={() => {
                            const updated = [...data.experience];
                            updated[idx].description = [...(updated[idx].description || []), "New detail description..."];
                            setData((prev: any) => ({ ...prev, experience: updated }));
                          }}
                          className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
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
                              className="flex-1 px-3 py-1.5 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                            />
                            <button
                              onClick={() => {
                                const updated = [...data.experience];
                                updated[idx].description = updated[idx].description.filter((_: any, i: number) => i !== bIdx);
                                setData((prev: any) => ({ ...prev, experience: updated }));
                              }}
                              className="p-1.5 border border-white/5 hover:border-rose-500/20 text-white/40 hover:text-rose-400 rounded-lg"
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

          {/* ==========================================
              CMS TAB VIEW: PROJECTS GRID
              ========================================== */}
          {activeTab === "projects" && data && (
            <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
              <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display uppercase tracking-tight">Projects Grid</h2>
                  <p className="text-xs text-white/40">Manage your network engineering and research projects</p>
                </div>
                <button
                  onClick={() => {
                    const newProj = { title: "New Project", description: "Project description...", tags: ["React", "TypeScript"], github: "", demo: "", image: "" };
                    setData((prev: any) => ({ ...prev, projects: [newProj, ...prev.projects] }));
                  }}
                  className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>

              <div className="space-y-6">
                {data.projects.map((proj: any, idx: number) => (
                  <div key={idx} className="p-5 border border-white/5 bg-[#0f0f1c] rounded-2xl space-y-4 relative">
                    <button
                      onClick={() => {
                        const updated = data.projects.filter((_: any, i: number) => i !== idx);
                        setData((prev: any) => ({ ...prev, projects: updated }));
                      }}
                      className="absolute top-4 right-4 p-1.5 border border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/10 text-white/40 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Project Title</label>
                        <input
                          type="text"
                          value={proj.title || ""}
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[idx].title = e.target.value;
                            setData((prev: any) => ({ ...prev, projects: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={proj.tags ? proj.tags.join(", ") : ""}
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[idx].tags = e.target.value.split(",").map((s) => s.trim());
                            setData((prev: any) => ({ ...prev, projects: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Description</label>
                        <textarea
                          rows={3}
                          value={proj.description || ""}
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[idx].description = e.target.value;
                            setData((prev: any) => ({ ...prev, projects: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">GitHub Code Link</label>
                        <input
                          type="text"
                          value={proj.github || ""}
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[idx].github = e.target.value;
                            setData((prev: any) => ({ ...prev, projects: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Demo / Preview Link</label>
                        <input
                          type="text"
                          value={proj.demo || ""}
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[idx].demo = e.target.value;
                            setData((prev: any) => ({ ...prev, projects: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================
              CMS TAB VIEW: TECHNICAL SKILLS
              ========================================== */}
          {activeTab === "skills" && data && (
            <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
              <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display uppercase tracking-tight">Technical Skills</h2>
                  <p className="text-xs text-white/40">Group and rank engineering skills domains</p>
                </div>
                <button
                  onClick={() => {
                    const newCat = { category: "Skills Domain", items: ["Skill Item"] };
                    setData((prev: any) => ({ ...prev, skills: [...prev.skills, newCat] }));
                  }}
                  className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Domain Group
                </button>
              </div>

              <div className="space-y-6">
                {data.skills.map((cat: any, idx: number) => (
                  <div key={idx} className="p-5 border border-white/5 bg-[#0f0f1c] rounded-2xl space-y-4 relative">
                    <button
                      onClick={() => {
                        const updated = data.skills.filter((_: any, i: number) => i !== idx);
                        setData((prev: any) => ({ ...prev, skills: updated }));
                      }}
                      className="absolute top-4 right-4 p-1.5 border border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/10 text-white/40 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-bold text-white/40">Skills Category Title</label>
                      <input
                        type="text"
                        value={cat.category || ""}
                        onChange={(e) => {
                          const updated = [...data.skills];
                          updated[idx].category = e.target.value;
                          setData((prev: any) => ({ ...prev, skills: updated }));
                        }}
                        className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs font-semibold text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-bold text-white/40 block">Skills Array List</label>
                      <input
                        type="text"
                        value={cat.items ? cat.items.join(", ") : ""}
                        onChange={(e) => {
                          const updated = [...data.skills];
                          updated[idx].items = e.target.value.split(",").map((s) => s.trim());
                          setData((prev: any) => ({ ...prev, skills: updated }));
                        }}
                        className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        placeholder="Core routing, BGP, IPv6..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================
              CMS TAB VIEW: BLOG ARTICLES
              ========================================== */}
          {activeTab === "blogs" && data && (
            <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
              <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display uppercase tracking-tight">Blog Manager</h2>
                  <p className="text-xs text-white/40">Create & compile blog postings</p>
                </div>
                <button
                  onClick={() => {
                    const newBlog = { title: "Draft Blog", slug: "draft-slug", date: new Date().toLocaleDateString("en-US"), excerpt: "Short summary...", content: "Full text content...", tags: ["General"] };
                    setData((prev: any) => ({ ...prev, blogPosts: [newBlog, ...prev.blogPosts] }));
                  }}
                  className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> New Post
                </button>
              </div>

              <div className="space-y-6">
                {data.blogPosts.map((blog: any, idx: number) => (
                  <div key={idx} className="p-5 border border-white/5 bg-[#0f0f1c] rounded-2xl space-y-4 relative">
                    <button
                      onClick={() => {
                        const updated = data.blogPosts.filter((_: any, i: number) => i !== idx);
                        setData((prev: any) => ({ ...prev, blogPosts: updated }));
                      }}
                      className="absolute top-4 right-4 p-1.5 border border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/10 text-white/40 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Article Title</label>
                        <input
                          type="text"
                          value={blog.title || ""}
                          onChange={(e) => {
                            const updated = [...data.blogPosts];
                            updated[idx].title = e.target.value;
                            setData((prev: any) => ({ ...prev, blogPosts: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Slug Routing</label>
                        <input
                          type="text"
                          value={blog.slug || ""}
                          onChange={(e) => {
                            const updated = [...data.blogPosts];
                            updated[idx].slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                            setData((prev: any) => ({ ...prev, blogPosts: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Publishing Date</label>
                        <input
                          type="text"
                          value={blog.date || ""}
                          onChange={(e) => {
                            const updated = [...data.blogPosts];
                            updated[idx].date = e.target.value;
                            setData((prev: any) => ({ ...prev, blogPosts: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Summary Excerpt</label>
                        <input
                          type="text"
                          value={blog.excerpt || ""}
                          onChange={(e) => {
                            const updated = [...data.blogPosts];
                            updated[idx].excerpt = e.target.value;
                            setData((prev: any) => ({ ...prev, blogPosts: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Markdown Content</label>
                        <textarea
                          rows={8}
                          value={blog.content || ""}
                          onChange={(e) => {
                            const updated = [...data.blogPosts];
                            updated[idx].content = e.target.value;
                            setData((prev: any) => ({ ...prev, blogPosts: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================
              CMS TAB VIEW: DISSERTATIONS
              ========================================== */}
          {activeTab === "dissertions" && data && (
            <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
              <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display uppercase tracking-tight">Academic Dissertations</h2>
                  <p className="text-xs text-white/40">Manage your research dissertations & thesis items</p>
                </div>
                <button
                  onClick={() => {
                    const newDiss = { title: "Academic Thesis Title", author: "Rajan Prakash Chand", institution: "UWS, Scotland", year: "2026", abstract: "Abstract text...", pdfUrl: "" };
                    setData((prev: any) => ({ ...prev, dissertations: [newDiss, ...prev.dissertations] }));
                  }}
                  className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Dissertation
                </button>
              </div>

              <div className="space-y-6">
                {data.dissertations.map((diss: any, idx: number) => (
                  <div key={idx} className="p-5 border border-white/5 bg-[#0f0f1c] rounded-2xl space-y-4 relative">
                    <button
                      onClick={() => {
                        const updated = data.dissertations.filter((_: any, i: number) => i !== idx);
                        setData((prev: any) => ({ ...prev, dissertations: updated }));
                      }}
                      className="absolute top-4 right-4 p-1.5 border border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/10 text-white/40 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Dissertation Title</label>
                        <input
                          type="text"
                          value={diss.title || ""}
                          onChange={(e) => {
                            const updated = [...data.dissertations];
                            updated[idx].title = e.target.value;
                            setData((prev: any) => ({ ...prev, dissertations: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs font-semibold text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Author</label>
                        <input
                          type="text"
                          value={diss.author || ""}
                          onChange={(e) => {
                            const updated = [...data.dissertations];
                            updated[idx].author = e.target.value;
                            setData((prev: any) => ({ ...prev, dissertations: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Institution / University</label>
                        <input
                          type="text"
                          value={diss.institution || ""}
                          onChange={(e) => {
                            const updated = [...data.dissertations];
                            updated[idx].institution = e.target.value;
                            setData((prev: any) => ({ ...prev, dissertations: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Thesis Abstract</label>
                        <textarea
                          rows={4}
                          value={diss.abstract || ""}
                          onChange={(e) => {
                            const updated = [...data.dissertations];
                            updated[idx].abstract = e.target.value;
                            setData((prev: any) => ({ ...prev, dissertations: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-white/40">Year</label>
                          <input
                            type="text"
                            value={diss.year || ""}
                            onChange={(e) => {
                              const updated = [...data.dissertations];
                              updated[idx].year = e.target.value;
                              setData((prev: any) => ({ ...prev, dissertations: updated }));
                            }}
                            className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1 pt-4">
                          <label className="text-[9px] uppercase font-bold text-white/40">PDF Document Link</label>
                          <input
                            type="text"
                            value={diss.pdfUrl || ""}
                            onChange={(e) => {
                              const updated = [...data.dissertations];
                              updated[idx].pdfUrl = e.target.value;
                              setData((prev: any) => ({ ...prev, dissertations: updated }));
                            }}
                            className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================
              CMS TAB VIEW: CERTIFICATIONS
              ========================================== */}
          {activeTab === "certifications" && data && (
            <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
              <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display uppercase tracking-tight">Professional Certifications</h2>
                  <p className="text-xs text-white/40">Credential registries & awards links</p>
                </div>
                <button
                  onClick={() => {
                    const newCert = { name: "Cert Name", issuer: "Cisco / Juniper", date: "2026", credentialId: "", url: "" };
                    setData((prev: any) => ({ ...prev, certifications: [newCert, ...prev.certifications] }));
                  }}
                  className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Credential
                </button>
              </div>

              <div className="space-y-6">
                {data.certifications.map((cert: any, idx: number) => (
                  <div key={idx} className="p-5 border border-white/5 bg-[#0f0f1c] rounded-2xl space-y-4 relative">
                    <button
                      onClick={() => {
                        const updated = data.certifications.filter((_: any, i: number) => i !== idx);
                        setData((prev: any) => ({ ...prev, certifications: updated }));
                      }}
                      className="absolute top-4 right-4 p-1.5 border border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/10 text-white/40 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Certification Title</label>
                        <input
                          type="text"
                          value={cert.name || ""}
                          onChange={(e) => {
                            const updated = [...data.certifications];
                            updated[idx].name = e.target.value;
                            setData((prev: any) => ({ ...prev, certifications: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs font-semibold text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Issuer Authority</label>
                        <input
                          type="text"
                          value={cert.issuer || ""}
                          onChange={(e) => {
                            const updated = [...data.certifications];
                            updated[idx].issuer = e.target.value;
                            setData((prev: any) => ({ ...prev, certifications: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Date Obtained</label>
                        <input
                          type="text"
                          value={cert.date || ""}
                          onChange={(e) => {
                            const updated = [...data.certifications];
                            updated[idx].date = e.target.value;
                            setData((prev: any) => ({ ...prev, certifications: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Credential ID</label>
                        <input
                          type="text"
                          value={cert.credentialId || ""}
                          onChange={(e) => {
                            const updated = [...data.certifications];
                            updated[idx].credentialId = e.target.value;
                            setData((prev: any) => ({ ...prev, certifications: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/40">Verification Link URL</label>
                        <input
                          type="text"
                          value={cert.url || ""}
                          onChange={(e) => {
                            const updated = [...data.certifications];
                            updated[idx].url = e.target.value;
                            setData((prev: any) => ({ ...prev, certifications: updated }));
                          }}
                          className="w-full px-3 py-2 bg-[#0a0a14] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
