import React, { useState, useEffect, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import {
  Activity,
  Zap,
  Users,
  Server,
  Cpu,
  HardDrive,
  Globe,
  Smartphone,
  Laptop,
  Flame,
  ShieldCheck,
  RefreshCw,
  Sliders,
  TrendingUp,
  AlertCircle,
  Clock,
  Radio,
  CheckCircle2,
  BarChart2,
  Share2,
} from "lucide-react";

interface TrafficPoint {
  time: string;
  visitors: number;
  rps: number;
  latencyMs: number;
  cpuPercent: number;
}

export const TrafficLoadTracker: React.FC = () => {
  const { language, activeRole, addToast } = useStore();
  const isBN = language === "BN";
  const isSuperAdmin = activeRole === "Super Admin";

  // Simulation mode: normal | surge | mega | mitigated
  const [trafficMode, setTrafficMode] = useState<"normal" | "surge" | "mega" | "mitigated">("normal");
  const [timeRange, setTimeRange] = useState<"live" | "hourly" | "weekly">("live");
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Live Metrics State
  const [baseVisitors, setBaseVisitors] = useState(168);
  const [currentRps, setCurrentRps] = useState(38.4);
  const [currentLatency, setCurrentLatency] = useState(34);
  const [cpuUsage, setCpuUsage] = useState(24);
  const [memoryUsage, setMemoryUsage] = useState(46);
  const [errorRate, setErrorRate] = useState(0.02);

  // History waveform points
  const [historyPoints, setHistoryPoints] = useState<TrafficPoint[]>([
    { time: "00:00", visitors: 94, rps: 18.2, latencyMs: 28, cpuPercent: 18 },
    { time: "04:00", visitors: 42, rps: 9.4, latencyMs: 25, cpuPercent: 12 },
    { time: "08:00", visitors: 110, rps: 26.8, latencyMs: 31, cpuPercent: 22 },
    { time: "11:00", visitors: 195, rps: 44.5, latencyMs: 38, cpuPercent: 32 },
    { time: "14:00", visitors: 220, rps: 51.0, latencyMs: 41, cpuPercent: 36 },
    { time: "17:00", visitors: 180, rps: 42.1, latencyMs: 35, cpuPercent: 28 },
    { time: "19:00", visitors: 265, rps: 62.4, latencyMs: 48, cpuPercent: 44 },
    { time: "21:00", visitors: 310, rps: 74.8, latencyMs: 54, cpuPercent: 52 },
    { time: "22:00", visitors: 240, rps: 56.2, latencyMs: 42, cpuPercent: 38 },
    { time: "Now", visitors: 168, rps: 38.4, latencyMs: 34, cpuPercent: 24 },
  ]);

  // Handle traffic simulation presets
  const handleSetTrafficMode = (mode: "normal" | "surge" | "mega" | "mitigated") => {
    setTrafficMode(mode);
    if (mode === "normal") {
      setBaseVisitors(168);
      setCurrentRps(38.4);
      setCurrentLatency(34);
      setCpuUsage(24);
      setErrorRate(0.02);
      addToast(
        isBN ? "স্বাভাবিক ট্রাফিক লোড নির্ধারণ করা হয়েছে" : "Baseline Traffic Load Restored",
        "info"
      );
    } else if (mode === "surge") {
      setBaseVisitors(580);
      setCurrentRps(142.6);
      setCurrentLatency(72);
      setCpuUsage(68);
      setErrorRate(0.14);
      addToast(
        isBN
          ? "🔥 ফ্ল্যাশ সেল ট্রাফিক সার্জ সক্রিয় (+৫০০ ইউজার)!"
          : "🔥 Flash Sale Traffic Surge Activated (+500 users)!",
        "warning"
      );
    } else if (mode === "mega") {
      setBaseVisitors(1280);
      setCurrentRps(312.4);
      setCurrentLatency(118);
      setCpuUsage(86);
      setErrorRate(0.48);
      addToast(
        isBN
          ? "⚡ মেগা ফেস্টিভ্যাল ট্রাফিক স্পাইক সিমুলেশন চলছে!"
          : "⚡ Mega Festival Traffic Spike Running!",
        "warning"
      );
    } else if (mode === "mitigated") {
      setBaseVisitors(320);
      setCurrentRps(68.0);
      setCurrentLatency(40);
      setCpuUsage(34);
      setErrorRate(0.01);
      addToast(
        isBN
          ? "🛡️ ক্লাউড ডিস্ট্রিবিউটেড সিডিএন ক্যাশ সক্রিয় (Load Mitigated)"
          : "🛡️ Cloud CDN Edge Shielding & Cache Active",
        "success"
      );
    }
  };

  // Real-time Heartbeat Simulator
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      // Natural minor fluctuations
      const deltaVisitors = Math.floor(Math.random() * 11) - 5;
      const deltaRps = +(Math.random() * 4 - 2).toFixed(1);
      const deltaLatency = Math.floor(Math.random() * 5) - 2;

      setBaseVisitors((prev) => Math.max(20, prev + deltaVisitors));
      setCurrentRps((prev) => Math.max(5, +(prev + deltaRps).toFixed(1)));
      setCurrentLatency((prev) => Math.max(18, prev + deltaLatency));

      // Append rolling point
      const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setHistoryPoints((prev) => {
        const next = [...prev.slice(1)];
        next.push({
          time: nowStr,
          visitors: Math.max(20, baseVisitors + deltaVisitors),
          rps: Math.max(5, +(currentRps + deltaRps).toFixed(1)),
          latencyMs: Math.max(18, currentLatency + deltaLatency),
          cpuPercent: Math.max(10, Math.min(95, cpuUsage + (Math.random() * 4 - 2))),
        });
        return next;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isAutoRefresh, baseVisitors, currentRps, currentLatency, cpuUsage]);

  // Compute SVG coordinates for the rolling wave
  const maxVisitorVal = useMemo(() => {
    return Math.max(...historyPoints.map((p) => p.visitors), 100);
  }, [historyPoints]);

  const svgPoints = useMemo(() => {
    const width = 500;
    const height = 140;
    const padding = 15;

    return historyPoints.map((p, idx) => {
      const x = padding + (idx / (historyPoints.length - 1)) * (width - 2 * padding);
      const y = height - padding - (p.visitors / (maxVisitorVal * 1.15)) * (height - 2 * padding);
      return { x, y, val: p.visitors, time: p.time };
    });
  }, [historyPoints, maxVisitorVal]);

  const pathD = useMemo(() => {
    if (svgPoints.length === 0) return "";
    let d = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
    for (let i = 1; i < svgPoints.length; i++) {
      const prev = svgPoints[i - 1];
      const curr = svgPoints[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [svgPoints]);

  const areaD = useMemo(() => {
    if (svgPoints.length === 0) return "";
    const first = svgPoints[0];
    const last = svgPoints[svgPoints.length - 1];
    return `${pathD} L ${last.x} 140 L ${first.x} 140 Z`;
  }, [pathD, svgPoints]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-6 relative overflow-hidden">
      {/* Background ambient mesh glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {isBN ? "লাইভ ট্রাফিক মনিটরিং" : "Real-Time Traffic Load Track"}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
              Edge CDN • HTTP/3 QUIC
            </span>
            {isSuperAdmin && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                👑 Super Admin Access
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>
              {isBN ? "রিয়েল-টাইম ট্রাফিক ও সার্ভার লোড ট্র্যাকার" : "Live Traffic Load & Server Stress Monitor"}
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            {isBN
              ? "সরাসরি ভিজিটর সংখ্যা, রিকোয়েস্ট রেট (RPS), সার্ভার ল্যাটেন্সি এবং লোড ব্যালান্সারের অবস্থা।"
              : "Live concurrent visitors, requests per second (RPS), round-trip latency & server stress balance."}
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              isAutoRefresh
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAutoRefresh ? "animate-spin [animation-duration:4s]" : ""}`} />
            <span>{isAutoRefresh ? (isBN ? "অটো লাইভ (২.৮ সে.)" : "Live Auto-Refresh") : "Paused"}</span>
          </button>

          {/* Time range switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setTimeRange("live")}
              className={`px-2.5 py-1 rounded-lg transition ${
                timeRange === "live" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {isBN ? "রিয়েল-টাইম" : "Live Wave"}
            </button>
            <button
              onClick={() => setTimeRange("hourly")}
              className={`px-2.5 py-1 rounded-lg transition ${
                timeRange === "hourly" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {isBN ? "২৪ ঘণ্টা" : "24h Load"}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Live Gauge Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 relative z-10">
        {/* 1. Concurrent Visitors */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              {isBN ? "অনলাইন ভিজিটর" : "Active Shoppers"}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white tracking-tight">
              {baseVisitors}
            </span>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              ↑ 12%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isBN ? "বর্তমানে স্টোরে ব্রাউজ করছেন" : "Concurrent active sessions"}
          </span>
        </div>

        {/* 2. Requests per Second (RPS) */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              {isBN ? "রিকোয়েস্ট রেট (RPS)" : "Throughput (RPS)"}
            </span>
            <span className="text-[10px] font-mono text-amber-300">HTTP/3</span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white tracking-tight">
              {currentRps}
            </span>
            <span className="text-xs text-slate-400 font-mono">req/s</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isBN ? "প্রতি সেকেন্ডে সার্ভার হিট" : "Requests per second processed"}
          </span>
        </div>

        {/* 3. Latency (TTFB) */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              {isBN ? "ল্যাটেন্সি (Latency)" : "Response Time"}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[9px] font-mono font-bold">
              Fast
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white tracking-tight">
              {currentLatency}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isBN ? "গড় রাউন্ড-ট্রিপ সময়" : "Average TTFB server latency"}
          </span>
        </div>

        {/* 4. CPU & Server Health */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              {isBN ? "সিপিইউ লোড" : "CPU Load"}
            </span>
            <span className="text-[10px] font-mono text-purple-300 font-bold">
              {cpuUsage < 50 ? "Healthy" : "Elevated"}
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white tracking-tight">
              {cpuUsage}%
            </span>
            <span className="text-xs text-slate-400 font-mono">RAM {memoryUsage}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                cpuUsage > 75 ? "bg-rose-500" : cpuUsage > 50 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
        </div>

        {/* 5. Error Rate & Edge Health */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {isBN ? "এরর রেট" : "Error Rate"}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
              99.98%
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
              {errorRate}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isBN ? "HTTP 5xx এরর মুক্ত" : "Zero fatal server drops"}
          </span>
        </div>
      </div>

      {/* Main Interactive Rolling Waveform Chart */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h4 className="font-bold text-sm text-white">
              {isBN ? "লাইভ ট্রাফিক লোড ওয়েভফর্ম (Live Waveform)" : "Live Traffic Rolling Waveform"}
            </h4>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              <span>{isBN ? "ভিজিটর ভলিউম" : "Visitor Volume"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span>{isBN ? "পিক থ্রুপুট" : "Peak Throughput"}</span>
            </span>
          </div>
        </div>

        {/* SVG Waveform Graphic */}
        <div className="w-full overflow-hidden pt-2">
          <svg viewBox="0 0 500 140" className="w-full h-36 overflow-visible">
            <defs>
              <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            <line x1="15" y1="35" x2="485" y2="35" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="15" y1="70" x2="485" y2="70" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="15" y1="105" x2="485" y2="105" stroke="#1e293b" strokeDasharray="3 3" />

            {/* Filled Area */}
            <path d={areaD} fill="url(#trafficGradient)" />

            {/* Curving Stroke Line */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#lineStroke)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Pulsing Dots at data points */}
            {svgPoints.map((p, idx) => (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={idx === svgPoints.length - 1 ? "5" : "3.5"}
                  className={idx === svgPoints.length - 1 ? "fill-emerald-400 animate-ping" : "fill-indigo-400"}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={idx === svgPoints.length - 1 ? "4" : "2.5"}
                  className={idx === svgPoints.length - 1 ? "fill-emerald-300" : "fill-white"}
                />
              </g>
            ))}
          </svg>
        </div>

        {/* X-Axis Labels */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-2 pt-1 border-t border-slate-900">
          {historyPoints.map((p, i) => (
            <span key={i} className="truncate max-w-[45px]">
              {p.time}
            </span>
          ))}
        </div>
      </div>

      {/* Geolocation & Device Distribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {/* Device Breakdown */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-xs text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>{isBN ? "ডিভাইস ভিত্তিক ট্রাফিক" : "Device Share"}</span>
            </h5>
            <span className="text-[10px] text-slate-400 font-mono">Mobile First</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                <span className="flex items-center gap-1.5 font-bold">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Android Web & App
                </span>
                <span className="font-mono font-bold text-emerald-400">74%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "74%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" /> Apple iOS (Safari)
                </span>
                <span className="font-mono font-bold text-indigo-400">18%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: "18%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                <span className="flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-amber-400" /> Desktop & Mac
                </span>
                <span className="font-mono font-bold text-amber-400">8%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "8%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Bangladesh Region Traffic */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-xs text-white flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>{isBN ? "বিভাগ ভিত্তিক ট্রাফিক (বাংলাদেশ)" : "Regional Traffic (BD)"}</span>
            </h5>
            <span className="text-[10px] text-slate-400 font-mono">8 Divisions</span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { region: "ঢাকা বিভাগ (Dhaka)", share: 62, count: "1.2k req/m" },
              { region: "চট্টগ্রাম বিভাগ (Chittagong)", share: 18, count: "380 req/m" },
              { region: "সিলেট বিভাগ (Sylhet)", share: 8, count: "160 req/m" },
              { region: "রাজশাহী ও খুলনা (Rajshahi/Khulna)", share: 8, count: "155 req/m" },
              { region: "অন্যান্য ও প্রবাসী (Others/Global)", share: 4, count: "80 req/m" },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">{r.region}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono text-[10px]">{r.count}</span>
                  <span className="font-mono font-bold text-indigo-300 w-8 text-right">
                    {r.share}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Active Endpoints */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-xs text-white flex items-center gap-1.5">
              <Server className="w-4 h-4 text-purple-400" />
              <span>{isBN ? "জনপ্রিয় এন্ডপয়েন্ট ও রাউট" : "Top Active Routes"}</span>
            </h5>
            <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { route: "/ (Storefront Home)", load: "42%", status: "200 OK" },
              { route: "/products (Catalog)", load: "26%", status: "200 OK" },
              { route: "/api/ai/agent/action", load: "14%", status: "AI Stream" },
              { route: "/checkout (bKash/Nagad)", load: "11%", status: "SSL Sec" },
              { route: "/admin/excel-hub", load: "7%", status: "SuperAdmin" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px]"
              >
                <span className="font-mono text-indigo-300 truncate max-w-[160px]">{item.route}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-slate-200">{item.load}</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Super Admin Traffic Simulator & Surge Controls */}
      {isSuperAdmin && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950 border border-indigo-500/30 rounded-2xl relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h5 className="font-black text-xs sm:text-sm text-white uppercase tracking-wider">
                  {isBN
                    ? "সুপার এডমিন ট্রাফিক সিমুলেশন ও স্ট্রেস টেস্ট"
                    : "Super Admin Traffic Surge & Stress Simulator"}
                </h5>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isBN
                  ? "বিভিন্ন উৎসব বা ক্যাম্পেইনের ট্রাফিক লোড সিমুলেট করে সার্ভারের প্রতিক্রিয়া তাৎক্ষণিকভাবে পরীক্ষা করুন।"
                  : "Simulate seasonal rush or flash sales to test infrastructure resilience and load balancer behavior."}
              </p>
            </div>

            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 self-start sm:self-auto">
              Auto-Scaling Active: 3/3 Nodes Healthy
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => handleSetTrafficMode("normal")}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                trafficMode === "normal"
                  ? "bg-slate-800 text-white border-indigo-500 shadow-sm"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBN ? "স্বাভাবিক ট্রাফিক" : "Normal Flow"}</span>
            </button>

            <button
              onClick={() => handleSetTrafficMode("surge")}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                trafficMode === "surge"
                  ? "bg-amber-950/60 text-amber-300 border-amber-500 shadow-sm"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-amber-300"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBN ? "ফ্ল্যাশ সেল সার্জ (+৫০০)" : "Flash Sale (+500)"}</span>
            </button>

            <button
              onClick={() => handleSetTrafficMode("mega")}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                trafficMode === "mega"
                  ? "bg-rose-950/60 text-rose-300 border-rose-500 shadow-sm"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-rose-300"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>{isBN ? "মেগা স্পাইক (১০০০+)" : "Mega Spike (1k+)"}</span>
            </button>

            <button
              onClick={() => handleSetTrafficMode("mitigated")}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                trafficMode === "mitigated"
                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-500 shadow-sm"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-emerald-300"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBN ? "সিডিএন এজ ক্যাশ" : "Edge CDN Shield"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
