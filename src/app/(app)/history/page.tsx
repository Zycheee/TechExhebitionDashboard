"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, CheckCircle, XCircle, Calendar, ExternalLink, Loader2, Sparkles, Award } from "lucide-react";
import { toast } from "sonner";
import { useLocaleStore } from "@/stores/locale-store";
import { FitScoreBadge } from "@/components/events/fit-score-badge";

export default function HistoryPage() {
  const { locale } = useLocaleStore();
  const [activeTab, setActiveTab] = useState<"DECISIONS" | "ATTENDED">("DECISIONS");
  const [decisionFilter, setDecisionFilter] = useState<"ALL" | "APPROVED" | "REJECTED">("ALL");

  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [attendedEvents, setAttendedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Fetch queue decisions
      const resQ = await fetch("/api/queues?status=HISTORY");
      const dataQ = await resQ.json();
      if (resQ.ok) {
        // Filter decisions within 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const items = (dataQ.queueItems || []).filter((item: any) => {
          const itemDate = new Date(item.resolvedAt || item.createdAt);
          return itemDate >= thirtyDaysAgo;
        });

        setHistoryItems(items);
      }

      // Fetch attended events
      const resE = await fetch("/api/events?limit=100");
      const dataE = await resE.json();
      if (resE.ok) {
        const attended = (dataE.events || []).filter(
          (e: any) => e.participationRec === "Exhibit" || e.participationRec === "Attend"
        );
        setAttendedEvents(attended);
      }
    } catch {
      toast.error("Failed to load history log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6 font-manrope">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-[#046241]" />
            <h2 className="text-2xl font-bold text-[#133020]">
              {locale === "en" ? "Governance & Attendance History" : "审核与参展历史记录"}
            </h2>
          </div>
          <p className="text-xs text-[#333333] mt-0.5">
            Historical audit log for supervisor decisions (30-day auto-archive) and permanent attended exhibition records
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D8D2C8] gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab("DECISIONS")}
          className={`pb-3 transition border-b-2 flex items-center gap-2 ${
            activeTab === "DECISIONS"
              ? "border-[#046241] text-[#046241]"
              : "border-transparent text-[#666666] hover:text-[#133020]"
          }`}
        >
          <span>Queue Decisions (30-Day Auto-Clear)</span>
          <span className="px-2 py-0.5 rounded-full bg-[#133020] text-white text-[10px]">
            {historyItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ATTENDED")}
          className={`pb-3 transition border-b-2 flex items-center gap-2 ${
            activeTab === "ATTENDED"
              ? "border-[#046241] text-[#046241]"
              : "border-transparent text-[#666666] hover:text-[#133020]"
          }`}
        >
          <span>Attended Exhibitions Log (Permanent)</span>
          <span className="px-2 py-0.5 rounded-full bg-[#046241] text-white text-[10px]">
            {attendedEvents.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#046241]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-xs font-semibold text-[#133020]">
            Loading history records...
          </span>
        </div>
      ) : activeTab === "DECISIONS" ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#F5EEDB] rounded-xl border border-[#D8D2C8] text-xs text-[#133020]">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-[#C17110] shrink-0" />
              <span>
                <strong>30-Day Retention Policy:</strong> Supervisor queue rulings automatically expire and disappear from this history tab after 30 days.
              </span>
            </div>

            {/* Decision Status Filter Pills */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#D8D2C8] shrink-0">
              <button
                onClick={() => setDecisionFilter("ALL")}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                  decisionFilter === "ALL"
                    ? "bg-[#133020] text-white shadow-2xs"
                    : "text-[#666666] hover:text-[#133020]"
                }`}
              >
                All Decisions
              </button>
              <button
                onClick={() => setDecisionFilter("APPROVED")}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                  decisionFilter === "APPROVED"
                    ? "bg-[#046241] text-white shadow-2xs"
                    : "text-[#666666] hover:text-[#133020]"
                }`}
              >
                Accepted (Approved)
              </button>
              <button
                onClick={() => setDecisionFilter("REJECTED")}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                  decisionFilter === "REJECTED"
                    ? "bg-[#B91C1C] text-white shadow-2xs"
                    : "text-[#666666] hover:text-[#133020]"
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          {historyItems.filter((i) => decisionFilter === "ALL" || i.status === decisionFilter).length === 0 ? (
            <div className="bg-white border-2 border-dashed border-[#D8D2C8] rounded-xl p-12 text-center max-w-md mx-auto my-6">
              <History className="w-12 h-12 text-[#666666] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#133020] mb-1">
                No decision history found
              </h3>
              <p className="text-xs text-[#666666]">
                No matching decisions found for this filter within the past 30 days.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyItems
                .filter((i) => decisionFilter === "ALL" || i.status === decisionFilter)
                .map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl border border-[#D8D2C8] shadow-xs flex flex-col md:flex-row items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === "APPROVED"
                            ? "bg-[#046241] text-white"
                            : "bg-[#B91C1C] text-white"
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs text-[#666666]">
                        Resolved on: {new Date(item.resolvedAt || item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Link
                      href={`/events/${item.event?.id}`}
                      className="font-bold text-sm text-[#133020] hover:text-[#046241] flex items-center gap-1.5"
                    >
                      <span>Event #{item.event?.eventNumber} — {item.event?.eventName}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <p className="text-xs text-[#666666] bg-[#F9F7F7] p-2.5 rounded-lg border border-[#D8D2C8]">
                      {item.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ATTENDED EXHIBITIONS TAB */
        <div className="space-y-4">
          <div className="p-3 bg-[#046241]/10 rounded-xl border border-[#046241]/20 text-xs text-[#046241] flex items-center gap-2 font-semibold">
            <Sparkles className="w-4 h-4 text-[#046241] shrink-0" />
            <span>
              <strong>Permanent Record:</strong> Attended exhibitions are logged permanently for executive reporting and never expire.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {attendedEvents.map((evt) => (
              <Link
                key={evt.id}
                href={`/events/${evt.id}`}
                className="bg-white p-5 rounded-2xl border border-[#D8D2C8] shadow-xs hover:shadow-md hover:-translate-y-1 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#046241] bg-[#046241]/10 px-2.5 py-0.5 rounded-full">
                      #{evt.eventNumber} • {evt.region}
                    </span>
                    <span className="px-2 py-0.5 bg-[#046241] text-white text-[10px] font-bold rounded">
                      {evt.participationRec}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#133020] group-hover:text-[#046241] transition line-clamp-2 leading-snug mb-2">
                    {evt.eventName}
                  </h4>

                  <p className="text-xs text-[#666666] mb-3 truncate">
                    📍 {evt.city}, {evt.country} • 🗓️ {evt.dates}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#D8D2C8] flex items-center justify-between text-xs">
                  <span className="text-[#666666]">Venue: {evt.venue}</span>
                  <div className="flex items-center gap-1 bg-[#133020] text-[#FFB347] px-2 py-0.5 rounded font-bold">
                    <Award className="w-3.5 h-3.5" />
                    <span>Score {evt.fitScore}.0</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
