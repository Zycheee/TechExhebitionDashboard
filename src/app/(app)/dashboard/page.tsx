"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/shared/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { EventsByMonthChart } from "@/components/dashboard/events-by-month";
import { EventsByRegionChart } from "@/components/dashboard/events-by-region";
import { BusinessLineChart } from "@/components/dashboard/business-line-chart";
import { FitScoreChart } from "@/components/dashboard/fit-score-chart";
import { CoverageGapsWidget } from "@/components/dashboard/coverage-gaps";
import { ScraperStatusWidget } from "@/components/dashboard/scraper-status-widget";
import { FitScoreBadge } from "@/components/events/fit-score-badge";
import { PriorityIndicator } from "@/components/events/priority-indicator";
import { BusinessLineChip } from "@/components/events/business-line-chip";
import { BUSINESS_LINES } from "@/lib/constants/business-lines";
import {
  CalendarDays,
  Globe,
  Award,
  CalendarCheck,
  Bot,
  Plus,
  ArrowRight,
  MapPin,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useLocaleStore } from "@/stores/locale-store";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocaleStore();

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        const json = await res.json();
        if (res.ok) {
          setData(json);
        } else {
          toast.error("Failed to load dashboard statistics");
        }
      } catch {
        toast.error("Error loading dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 font-manrope">
        <div className="flex items-center justify-between pb-4 border-b border-[#D8D2C8]">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Skeleton className="h-32 w-full rounded-[12px]" />
          <Skeleton className="h-32 w-full rounded-[12px]" />
          <Skeleton className="h-32 w-full rounded-[12px]" />
          <Skeleton className="h-32 w-full rounded-[12px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-72 w-full rounded-[12px]" />
          <Skeleton className="lg:col-span-4 h-72 w-full rounded-[12px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-7 h-64 w-full rounded-[12px]" />
          <Skeleton className="lg:col-span-5 h-64 w-full rounded-[12px]" />
        </div>
      </div>
    );
  }

  const { stats, eventsByMonth, eventsByRegion, businessLineDist, fitScoreDist, gaps, recentEvents } = data;

  return (
    <div className="space-y-8 font-manrope">
      {/* Top Bar / Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] pb-4">
        <div>
          <h2 className="text-[28px] font-semibold text-[#133020] tracking-tight leading-tight">
            {locale === "en" ? "Lifewood intelligence overview" : "Lifewood 展会情报总览"}
          </h2>
          <p className="text-xs text-[#333333] mt-0.5">
            {locale === "en"
              ? "Real-time exhibition pipeline tracking, strategic alignment, and coverage gap intelligence"
              : "实时展会追踪、战略适配评估与覆盖空缺分析"}
          </p>
        </div>

        {/* Section 6.5 Compliant Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/scraper"
            className="flex items-center gap-1.5 px-4 py-2 border-[1.5px] border-[#133020] bg-transparent text-[#133020] hover:bg-[#F5EEDB] text-xs font-medium rounded-[8px] transition-all duration-180"
          >
            <Bot className="w-4 h-4 text-[#046241]" />
            <span>{locale === "en" ? "AI scraper engine" : "AI 抓取引擎"}</span>
          </Link>
          <Link
            href="/events/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FFB347] hover:bg-[#FFC370] text-[#133020] font-medium text-xs rounded-[8px] transition-all duration-180 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === "en" ? "Add event" : "+ 添加展会"}</span>
          </Link>
        </div>
      </div>

      {/* Row 1 — Stat Cards (4 across) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={locale === "en" ? "Total exhibitions" : "已录入展会总数"}
          value={stats.totalEvents}
          subtitle={locale === "en" ? "Fit 3+ verified records" : "适配度 3+ 已审核记录"}
          icon={CalendarDays}
        />
        <StatCard
          title={locale === "en" ? "2027 forward pipeline" : "2027 战略展会储备"}
          value={stats.events2027}
          subtitle={locale === "en" ? "Forward-looking target" : "前瞻储备展会指标"}
          icon={CalendarCheck}
        />
        <StatCard
          title={locale === "en" ? "Average fit score" : "平均战略适配度"}
          value={`${stats.avgFitScore} / 5.0`}
          subtitle={locale === "en" ? "High relevance alignment" : "业务线高度对齐"}
          icon={Award}
        />
        <StatCard
          title={locale === "en" ? "Global regions covered" : "覆盖全球大区"}
          value={`${stats.uniqueRegions} regions`}
          subtitle={locale === "en" ? "APAC, NA, Europe & ME" : "亚太、北美、欧洲及中东"}
          icon={Globe}
        />
      </div>

      {/* Row 2 — Charts (Events by Month & Events by Region) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <EventsByMonthChart data={eventsByMonth} />
        </div>
        <div className="lg:col-span-4">
          <EventsByRegionChart data={eventsByRegion} />
        </div>
      </div>

      {/* Row 3 — Charts (Business Line Distribution & Fit Score Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <BusinessLineChart data={businessLineDist} />
        </div>
        <div className="lg:col-span-5">
          <FitScoreChart data={fitScoreDist} />
        </div>
      </div>

      {/* Row 4 — Gaps & Alerts (Coverage Gaps + Recently Added Events) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <CoverageGapsWidget gaps={gaps} />
        </div>

        <div className="lg:col-span-7 bg-white p-5 rounded-[12px] border-[1.5px] border-[#D8D2C8] shadow-[0_2px_16px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#D8D2C8] pb-3 mb-4">
              <div>
                <h3 className="text-[14px] font-semibold text-[#133020]">
                  {locale === "en" ? "Recently added exhibitions" : "最新录入展会记录"}
                </h3>
                <p className="text-[11px] text-[#666666]">
                  Latest verified entries in intelligence database
                </p>
              </div>

              <Link
                href="/events"
                className="text-xs font-semibold text-[#046241] hover:text-[#133020] flex items-center gap-1 transition"
              >
                <span>{locale === "en" ? "View all events" : "查看全部"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* High-density structured recent events list */}
            <div className="divide-y divide-[#D8D2C8]">
              {(recentEvents || []).slice(0, 4).map((evt: any) => {
                let businessLines: string[] = [];
                try {
                  businessLines = JSON.parse(evt.businessLines || "[]");
                } catch {
                  businessLines = Array.isArray(evt.businessLines)
                    ? evt.businessLines
                    : [evt.businessLines];
                }

                const primaryBL = businessLines[0] || "Global AI Data";
                const blConfig = BUSINESS_LINES.find(
                  (b) => b.name.toLowerCase() === primaryBL.toLowerCase()
                );
                const accentColor = blConfig ? blConfig.colorHex : "#046241";

                return (
                  <Link
                    key={evt.id}
                    href={`/events/${evt.id}`}
                    className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-[#F0F5F2] rounded-[6px] transition group relative"
                  >
                    {/* 4px accent indicator */}
                    <div
                      className="w-1 self-stretch rounded-full shrink-0"
                      style={{ backgroundColor: accentColor }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-semibold text-[#133020]">
                          #{evt.eventNumber}
                        </span>
                        <span className="text-[11px] text-[#666666]">
                          · {evt.region}
                        </span>
                        <span className="text-[11px] text-[#666666]">
                          · {evt.dates}
                        </span>
                      </div>
                      <h4 className="font-semibold text-[13px] text-[#133020] group-hover:text-[#046241] transition truncate">
                        {evt.eventName}
                      </h4>
                      <p className="text-[11px] text-[#666666] truncate mt-0.5">
                        {evt.city}, {evt.country}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <PriorityIndicator priority={evt.priorityLevel} />
                      <FitScoreBadge score={evt.fitScore} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#D8D2C8] flex items-center justify-between text-[11px] text-[#666666] mt-3">
            <span>All entries reviewed for Lifewood buyer alignment</span>
            <Link href="/events/new" className="text-[#046241] font-semibold hover:underline">
              + Add new record
            </Link>
          </div>
        </div>
      </div>

      {/* Row 5 — Scraper Engine Status (Section 7.1) */}
      <ScraperStatusWidget />
    </div>
  );
}
