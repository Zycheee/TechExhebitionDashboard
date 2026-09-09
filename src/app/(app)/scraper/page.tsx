"use client";

import { useState, useEffect } from "react";
import { REGIONS, BUSINESS_LINES } from "@/lib/constants/business-lines";
import { Bot, Play, Check, X, RefreshCw, Sparkles, Sliders, Calendar, ShieldCheck, Edit, Search } from "lucide-react";
import { toast } from "sonner";
import { useLocaleStore } from "@/stores/locale-store";
import EventScraperDashboard from "@/components/events/EventScraperDashboard";

export default function ScraperPage() {
  const [engineMode, setEngineMode] = useState<"apify_gemini" | "standard">("apify_gemini");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocaleStore();

  const [config, setConfig] = useState({
    startDate: "2026-09-01",
    endDate: "2027-12-31",
    regions: ["Asia", "North America", "Europe"],
    businessLines: ["Global AI Data", "AIGC", "Autonomous Driving", "AEO/GEO", "EDGE Intelligence"],
    tier1: true,
    tier2: true,
    tier3: true,
  });

  const [schedule, setSchedule] = useState({
    enabled: true,
    frequency: "Weekly",
    day: "Monday",
    time: "06:00 AM",
  });

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scraper/results");
      const data = await res.json();
      if (res.ok) {
        setResults(data.results || []);
      }
    } catch {
      toast.error("Failed to load scraper results");
    } finally {
      setLoading(false);
    }
  };

  const handleRunScraper = async () => {
    setRunning(true);
    toast.info("Scraper execution initiated...");

    try {
      const res = await fetch("/api/scraper/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        toast.success("Scraper job finished successfully!");
        fetchResults();
      } else {
        toast.error("Scraper execution failed");
      }
    } catch {
      toast.error("Error triggering scraper");
    } finally {
      setRunning(false);
    }
  };

  const handleAccept = async (item: any) => {
    try {
      const res = await fetch("/api/scraper/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        toast.success(`"${item.eventName}" transferred to Review Queue for supervisor approval!`);
        setResults((prev) => prev.filter((r) => r.id !== item.id));
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to accept event");
      }
    } catch {
      toast.error("Error accepting event");
    }
  };

  const handleReject = (id: string, name: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
    toast.info(`Rejected "${name}"`);
  };

  return (
    <div className="space-y-8 font-manrope">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#046241]" />
            <h2 className="text-2xl font-bold text-[#133020]">
              {locale === "en" ? "AI Event Scraper Engine" : "AI 智能抓取引擎"}
            </h2>
          </div>
          <p className="text-xs text-[#333333] mt-0.5">
            Automated crawler parsing official organizer sites, convention centers & AI conference calendars
          </p>
        </div>

      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D8D2C8] pb-2">
        <button
          onClick={() => setEngineMode("apify_gemini")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            engineMode === "apify_gemini"
              ? "bg-[#046241] text-white shadow-xs"
              : "bg-white text-[#133020] border border-[#D8D2C8] hover:bg-[#F5EEDB]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Apify + Google Gemini Engine (Batch 11 Spec)</span>
        </button>
        <button
          onClick={() => setEngineMode("standard")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            engineMode === "standard"
              ? "bg-[#046241] text-white shadow-xs"
              : "bg-white text-[#133020] border border-[#D8D2C8] hover:bg-[#F5EEDB]"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Internal Crawler & Scheduler</span>
        </button>
      </div>

      {engineMode === "apify_gemini" ? (
        <div className="bg-white rounded-xl border border-[#D8D2C8] shadow-xs overflow-hidden">
          <EventScraperDashboard />
        </div>
      ) : (
        <>
          {/* Grid: Config Panel & Schedule Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#D8D2C8] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#D8D2C8] pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#046241]" />
              <h3 className="text-sm font-bold text-[#133020]">
                Scraper Search Configuration
              </h3>
            </div>
            <span className="text-[11px] text-[#046241] font-semibold bg-[#046241]/10 px-2.5 py-0.5 rounded-full">
              Status: {running ? "Crawling" : "Idle"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
                Target Start Date
              </label>
              <input
                type="date"
                value={config.startDate}
                onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] text-xs text-[#133020] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
                Target End Date
              </label>
              <input
                type="date"
                value={config.endDate}
                onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] text-xs text-[#133020] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-2">
              Included Source Tiers
            </label>
            <div className="flex items-center gap-4 text-xs font-medium text-[#133020]">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.tier1}
                  onChange={(e) => setConfig({ ...config, tier1: e.target.checked })}
                  className="rounded text-[#046241]"
                />
                <span>Tier 1 (Official Organizers)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.tier2}
                  onChange={(e) => setConfig({ ...config, tier2: e.target.checked })}
                  className="rounded text-[#046241]"
                />
                <span>Tier 2 (Convention Centers)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.tier3}
                  onChange={(e) => setConfig({ ...config, tier3: e.target.checked })}
                  className="rounded text-[#046241]"
                />
                <span>Tier 3 (Curated AI Calendars)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Schedule Panel */}
        <div className="bg-white p-6 rounded-xl border border-[#D8D2C8] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8D2C8] pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#046241]" />
              <h3 className="text-sm font-bold text-[#133020]">
                Automated Schedule
              </h3>
            </div>
            <input
              type="checkbox"
              checked={schedule.enabled}
              onChange={(e) => setSchedule({ ...schedule, enabled: e.target.checked })}
              className="w-4 h-4 text-[#046241] rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
              Frequency
            </label>
            <select
              value={schedule.frequency}
              onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] text-xs text-[#133020] bg-white"
            >
              <option value="Daily">Daily Execution</option>
              <option value="Weekly">Weekly (Recommended)</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
              Execution Day & Time
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={schedule.day}
                onChange={(e) => setSchedule({ ...schedule, day: e.target.value })}
                className="px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-[#133020]"
              >
                <option value="Monday">Monday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Friday">Friday</option>
              </select>
              <input
                type="text"
                value={schedule.time}
                onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                className="px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-[#133020]"
              />
            </div>
          </div>

          <div className="p-3 bg-[#F5EEDB] rounded-lg text-[11px] text-[#133020]">
            <span className="font-bold">Next Automated Execution:</span>
            <p className="text-[#046241] font-semibold mt-0.5">
              Mon, Sep 14, 2026 at 06:00 AM (APAC Standard)
            </p>
          </div>
        </div>
      </div>

      {/* Scraped Results Review Table */}
      <div className="bg-white p-6 rounded-xl border border-[#D8D2C8] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#D8D2C8] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#133020]">
              Scraper Extracted Results ({results.length})
            </h3>
            <p className="text-xs text-[#666666]">
              Review AI-classified events before accepting into main database
            </p>
          </div>
          <button
            onClick={fetchResults}
            className="flex items-center gap-1 text-xs text-[#046241] font-semibold hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Results</span>
          </button>
        </div>

        {results.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#666666]">
            No pending scraped records awaiting review. Click "Run Scraper Now" above to crawl target sources.
          </div>
        ) : (
          <div className="divide-y divide-[#D8D2C8]/60">
            {results.map((item) => (
              <div
                key={item.id}
                className="py-4 flex items-start justify-between gap-4 hover:bg-[#F9F7F7] p-3 rounded-xl transition"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#046241]/10 text-[#046241] font-bold text-[10px] rounded uppercase">
                      AI Confidence: {Math.round((item.confidence || 0.9) * 100)}%
                    </span>
                    <span className="text-xs font-semibold text-[#133020]">
                      {item.city}, {item.country} ({item.region})
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#133020]">
                    {item.eventName}
                  </h4>

                  <p className="text-xs text-[#666666] line-clamp-2">
                    {item.strategicFocus}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-[#666666]">
                      Dates: <strong className="text-[#133020]">{item.dates}</strong>
                    </span>
                    <span className="text-[11px] text-[#666666]">
                      Venue: <strong className="text-[#133020]">{item.venue}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAccept(item)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#046241] hover:bg-[#133020] text-white text-xs font-semibold rounded-lg transition shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept into DB</span>
                  </button>

                  <button
                    onClick={() => handleReject(item.id, item.eventName)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#B91C1C]/10 text-[#B91C1C] hover:bg-[#B91C1C]/20 text-xs font-semibold rounded-lg transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
