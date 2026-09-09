"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FitScoreBadge } from "@/components/events/fit-score-badge";
import { PriorityIndicator } from "@/components/events/priority-indicator";
import { ListTodo, CheckCircle, XCircle, Clock, ShieldAlert, ExternalLink, Loader2, Globe } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useLocaleStore } from "@/stores/locale-store";
import { sanitizeEventUrl } from "@/lib/url";

export default function QueuesPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "INTERN";
  const { locale } = useLocaleStore();

  const [activeTab, setActiveTab] = useState<"FOR_REVIEW" | "CORRECTION">("FOR_REVIEW");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/queues?status=PENDING");
      const data = await res.json();
      if (res.ok) {
        setItems(data.queueItems || []);
      }
    } catch {
      toast.error("Failed to load queue items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const handleAction = async (id: number, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch(`/api/queues/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        toast.success(action === "APPROVE" ? "Item approved & published!" : "Item rejected");
        fetchQueues();
      } else {
        const data = await res.json();
        toast.error(data.error || "Action failed");
      }
    } catch {
      toast.error("Error processing queue action");
    }
  };

  const filteredItems = items.filter((i) => i.type === activeTab);

  return (
    <div className="space-y-6 font-manrope">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-[#046241]" />
            <h2 className="text-2xl font-bold text-[#133020]">
              {locale === "en" ? "Review & Approval Queues" : "审核与更正队列"}
            </h2>
          </div>
          <p className="text-xs text-[#333333] mt-0.5">
            Supervisor & Admin governance workflow for fit score rulings and data corrections
          </p>
        </div>

        {userRole === "INTERN" && (
          <div className="px-3 py-1.5 bg-[#FFB347]/20 border border-[#FFB347] text-[#133020] text-xs font-semibold rounded-lg flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#C17110]" />
            <span>Intern Submissions Awaiting Approval</span>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#D8D2C8] gap-6">
        <button
          onClick={() => setActiveTab("FOR_REVIEW")}
          className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === "FOR_REVIEW"
              ? "border-[#046241] text-[#046241]"
              : "border-transparent text-[#666666] hover:text-[#133020]"
          }`}
        >
          <span>For Review (Scraped & Intern Submissions)</span>
          <span className="px-2 py-0.5 rounded-full bg-[#133020] text-white text-[10px]">
            {items.filter((i) => i.type === "FOR_REVIEW" && i.status === "PENDING").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("CORRECTION")}
          className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === "CORRECTION"
              ? "border-[#046241] text-[#046241]"
              : "border-transparent text-[#666666] hover:text-[#133020]"
          }`}
        >
          <span>Corrections Queue (Data Edits)</span>
          <span className="px-2 py-0.5 rounded-full bg-[#708E7C] text-white text-[10px]">
            {items.filter((i) => i.type === "CORRECTION" && i.status === "PENDING").length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#046241]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-xs font-semibold text-[#133020]">
            Loading queue entries...
          </span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#D8D2C8] rounded-xl p-12 text-center max-w-md mx-auto my-8">
          <CheckCircle className="w-12 h-12 text-[#046241] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#133020] mb-1">
            Queue is clear
          </h3>
          <p className="text-xs text-[#666666]">
            No pending entries awaiting supervisor evaluation in this queue tab.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl border border-[#D8D2C8] shadow-xs flex flex-col md:flex-row items-start justify-between gap-6 hover:shadow-md transition"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === "PENDING"
                        ? "bg-[#FFB347] text-[#133020]"
                        : item.status === "APPROVED"
                        ? "bg-[#046241] text-white"
                        : "bg-[#B91C1C] text-white"
                    }`}
                  >
                    {item.status}
                  </span>

                  <span className="text-xs text-[#666666]">
                    Submitted by: <strong className="text-[#133020]">{item.submittedBy?.name || "Intern"}</strong> ({item.submittedBy?.role})
                  </span>

                  {item.event?.fitScore && (
                    <FitScoreBadge score={item.event.fitScore} />
                  )}

                  {item.event?.priorityLevel && (
                    <PriorityIndicator priority={item.event.priorityLevel} />
                  )}
                </div>

                <div className="space-y-1">
                  <Link
                    href={`/events/${item.event?.id}`}
                    className="font-bold text-base text-[#133020] hover:text-[#046241] flex items-center gap-2"
                  >
                    <span>Record #{item.event?.eventNumber} — {item.event?.eventName}</span>
                    <ExternalLink className="w-4 h-4 text-[#046241]" />
                  </Link>

                  <p className="text-xs text-[#666666]">
                    📍 {item.event?.city}, {item.event?.country} • 🗓️ {item.event?.dates} • Organizer: {item.event?.organizer}
                  </p>
                </div>

                <div className="text-xs text-[#133020] bg-[#F9F7F7] p-3.5 rounded-xl border border-[#D8D2C8] space-y-1">
                  <span className="font-bold text-[#046241] block uppercase tracking-wider text-[10px]">
                    Submission Rationale & Source:
                  </span>
                  <p>{item.reason}</p>
                  {(() => {
                    let firstSource: string | null = null;
                    try {
                      const parsed = JSON.parse(item.event?.sourceLinks || "[]");
                      firstSource = Array.isArray(parsed) ? parsed[0] : null;
                    } catch {
                      firstSource = item.event?.sourceLinks || null;
                    }
                    const validUrl = sanitizeEventUrl(
                      item.event?.officialWebsite,
                      firstSource
                    );
                    if (!validUrl) return null;
                    return (
                      <a
                        href={validUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-[#046241] hover:underline pt-1"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Inspect Official Scraped Site ↗</span>
                      </a>
                    );
                  })()}
                </div>
              </div>

              {/* Governance Actions for Supervisor / Admin */}
              {item.status === "PENDING" && (userRole === "ADMIN" || userRole === "SUPERVISOR") && (
                <div className="flex flex-row md:flex-col items-center gap-2 shrink-0 self-center">
                  <button
                    onClick={() => handleAction(item.id, "APPROVE")}
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#046241] hover:bg-[#133020] text-white font-bold text-xs rounded-xl transition shadow-sm w-full"
                  >
                    <CheckCircle className="w-4 h-4 text-[#FFB347]" />
                    <span>Approve & Publish</span>
                  </button>

                  <button
                    onClick={() => handleAction(item.id, "REJECT")}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B91C1C]/10 text-[#B91C1C] hover:bg-[#B91C1C]/20 font-bold text-xs rounded-xl transition w-full"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
