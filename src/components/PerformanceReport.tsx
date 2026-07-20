"use client";

import { useState } from "react";
import { FaLock, FaChartLine, FaServer, FaShieldAlt } from "react-icons/fa";

export default function PerformanceReport() {
  const [metricTab, setMetricTab] = useState("speed");

  const reports = {
    speed: {
      title: "Anycast Edge Latency (TTFB)",
      description: "Average latency measured globally from edge routing nodes to visitor clients.",
      stats: [
        { region: "North America", latency: "12ms", rating: "Optimal" },
        { region: "Europe & ME", latency: "15ms", rating: "Optimal" },
        { region: "Asia Pacific", latency: "14ms", rating: "Optimal" },
        { region: "South America", latency: "19ms", rating: "Optimal" },
      ],
      avg: "14.25ms",
      conclusion: "Global average latency falls well below the 50ms performance ceiling.",
    },
    cache: {
      title: "Content Delivery & Cache Savings",
      description: "Static and dynamic asset delivery ratios optimized by proxy caching filters.",
      stats: [
        { region: "Static HTML/JS", latency: "99.92%", rating: "Cached" },
        { region: "Media Assets", latency: "99.80%", rating: "Cached" },
        { region: "API Endpoints", latency: "88.50%", rating: "Dynamic" },
        { region: "Font Files", latency: "100%", rating: "Cached" },
      ],
      avg: "99.82%",
      conclusion: "Over 99.8% of assets served directly from Edge memory cache, saving bandwidth.",
    },
  };

  const currentReport = metricTab === "speed" ? reports.speed : reports.cache;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-[#222b38] bg-white dark:bg-[#090d16] p-6 shadow-sm animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 dark:border-[#222b38] mb-6 gap-3">
        <div>
          <h3 className="text-base font-sans font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FaChartLine className="text-[var(--accent)]" />
            Performance & Reliability Report
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-sans font-normal">
            Real-time proxy caching rate, SSL encryption speeds, and global latency charts.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex rounded border border-slate-250 dark:border-[#222b38] overflow-hidden text-[10px] font-sans font-bold">
          <button
            onClick={() => setMetricTab("speed")}
            className={`px-3 py-1.5 transition-all cursor-pointer ${
              metricTab === "speed"
                ? "bg-slate-100 dark:bg-[#222b38] text-slate-800 dark:text-slate-200"
                : "bg-white dark:bg-[#090d16] text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            LATENCY (TTFB)
          </button>
          <button
            onClick={() => setMetricTab("cache")}
            className={`px-3 py-1.5 transition-all cursor-pointer ${
              metricTab === "cache"
                ? "bg-slate-100 dark:bg-[#222b38] text-slate-800 dark:text-slate-200"
                : "bg-white dark:bg-[#090d16] text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            CACHE SAVINGS
          </button>
        </div>
      </div>

      {/* Grid Layout of Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Side: Summary block */}
        <div className="md:col-span-1 p-5 rounded bg-slate-50/50 dark:bg-[#161c24]/30 border border-slate-200 dark:border-[#222b38]/50 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-sans uppercase font-bold tracking-wider text-slate-400">
              {metricTab === "speed" ? "Average Latency" : "Edge HIT Ratio"}
            </span>
            <div className="text-3xl font-sans font-extrabold text-slate-800 dark:text-slate-100 mt-2">
              {currentReport.avg}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              {currentReport.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-[#222b38]/50 text-[10px] text-slate-400 font-sans leading-relaxed">
            {currentReport.conclusion}
          </div>
        </div>

        {/* Right Side: Tabular stats */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest">
            {currentReport.title}
          </h4>

          <div className="space-y-3.5">
            {currentReport.stats.map((stat) => (
              <div key={stat.region} className="space-y-1">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{stat.region}</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{stat.latency}</span>
                </div>
                {/* Visual bar graph */}
                <div className="relative w-full h-1.5 bg-slate-100 dark:bg-[#161c24] rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-[var(--accent)] rounded-full transition-all duration-500"
                    style={{
                      width: metricTab === "speed"
                        ? `${100 - parseInt(stat.latency) * 3}%`
                        : stat.latency
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Corporate Badges row */}
      <div className="mt-8 pt-5 border-t border-slate-200 dark:border-[#222b38] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-sans">
        <div className="flex items-center gap-2.5">
          <FaShieldAlt className="text-emerald-500" />
          <div>
            <span className="block font-bold text-slate-800 dark:text-slate-200">SSL/TLS Strict Mode</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Strict end-to-end encryption</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <FaServer className="text-blue-500" />
          <div>
            <span className="block font-bold text-slate-800 dark:text-slate-200">Anycast Network</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Routed via nearest edge point</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
          <FaLock className="text-[var(--accent)]" />
          <div>
            <span className="block font-bold text-slate-800 dark:text-slate-200">Zero-Trust Config</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Protected tunnels enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
