"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FitScoreBadge } from "@/components/events/fit-score-badge";
import { PriorityIndicator } from "@/components/events/priority-indicator";
import { ModalPortal } from "@/components/shared/modal-portal";
import { ListTodo, CheckCircle, XCircle, Clock, ExternalLink, Loader2, Globe, Eye, Sparkles, X } from "lucide-react";
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
  const [inspectEvent, setInspectEvent] = useState<any>(null);

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
        toast.success(action === "APPROVE" ? "Item approved & published to catalog!" : "Item rejected");
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
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#046241]/10 border border-[#046241]/30 flex items-center justify-center text-[#046241]">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#133020]">
                {locale === "en" ? "Review & Governance Queues" : "审核与更正队列"}
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Supervisor & Admin approval pipeline for intern drafts, AI scraped records, and data corrections
              </p>
            </div>
          </div>
        </div>

        {userRole === "INTERN" && (
          <div className="px-3.5 py-2 bg-[#FFB347]/20 border border-[#FFB347] text-[#133020] text-xs font-bold rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C17110]" />
            <span>Intern Submissions Awaiting Supervisor Review</span>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#D8D2C8] gap-6">
        <button
          onClick={() => setActiveTab("FOR_REVIEW")}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === "FOR_REVIEW"
              ? "border-[#046241] text-[#046241]"
              : "border-transparent text-[#666666] hover:text-[#133020]"
          }`}
        >
          <span>For Review (New Submissions)</span>
          <span className="px-2 py-0.5 rounded-full bg-[#133020] text-white text-[10px] font-extrabold">
            {items.filter((i) => i.type === "FOR_REVIEW" && i.status === "PENDING").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("CORRECTION")}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === "CORRECTION"
              ? "border-[#046241] text-[#046241]"
              : "border-transparent text-[#666666] hover:text-[#133020]"
          }`}
        >
          <span>Corrections Queue (Data Edits)</span>
          <span className="px-2 py-0.5 rounded-full bg-[#708E7C] text-white text-[10px] font-extrabold">
            {items.filter((i) => i.type === "CORRECTION" && i.status === "PENDING").length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#046241]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-xs font-semibold text-[#133020]">
            Loading pending queue records...
          </span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#D8D2C8] rounded-2xl p-12 text-center max-w-md mx-auto my-8 font-manrope">
          <div className="w-12 h-12 rounded-full bg-[#046241]/10 flex items-center justify-center text-[#046241] mx-auto mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#133020] mb-1">
            Queue is clear!
          </h3>
          <p className="text-xs text-[#666666]">
            All submissions in this tab have been evaluated and processed into the catalog.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white p-6 rounded-2xl border border-[#D8D2C8] shadow-xs flex flex-col md:flex-row items-start justify-between gap-6 hover:shadow-md transition relative group"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
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

                    {item.event?.priorityLevel && (
                      <PriorityIndicator priority={item.event.priorityLevel} />
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <button
                        onClick={() => setInspectEvent(item.event)}
                        className="font-bold text-base text-[#133020] hover:text-[#046241] text-left flex items-center gap-2 group cursor-pointer"
                      >
                        <span>Record #{item.event?.eventNumber} — {item.event?.eventName}</span>
                        <Eye className="w-4 h-4 text-[#046241] group-hover:scale-110 transition" />
                      </button>

                      <p className="text-xs text-[#666666]">
                        📍 {item.event?.city}, {item.event?.country} • 🗓️ {item.event?.dates} • Organizer: {item.event?.organizer}
                      </p>
                    </div>

                    {item.event?.fitScore && (
                      <FitScoreBadge score={item.event.fitScore} size="lg" showLevel />
                    )}
                  </div>

                  <div className="text-xs text-[#133020] bg-[#F9F7F7] p-3.5 rounded-xl border border-[#D8D2C8] space-y-1">
                    <span className="font-bold text-[#046241] block uppercase tracking-wider text-[10px]">
                      Submission Rationale & Source:
                    </span>
                    <p className="leading-relaxed">{item.reason}</p>
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
                      className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#046241] hover:bg-[#133020] text-white font-bold text-xs rounded-xl transition shadow-sm w-full cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 text-[#FFB347]" />
                      <span>Approve & Publish</span>
                    </button>

                    <button
                      onClick={() => handleAction(item.id, "REJECT")}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B91C1C]/10 text-[#B91C1C] hover:bg-[#B91C1C]/20 font-bold text-xs rounded-xl transition w-full cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Inspect Event Specs Popup Modal */}
      <ModalPortal isOpen={!!inspectEvent} onClose={() => setInspectEvent(null)}>
        <div className="bg-[#133020] text-white p-5 px-7 flex items-center justify-between shrink-0 shadow-sm border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFB347] text-[#133020] flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Queue Record Specifications
              </h3>
              <p className="text-[10px] text-[#F5EEDB]/70 uppercase tracking-wider">
                Record #{inspectEvent?.eventNumber} · {inspectEvent?.eventName}
              </p>
            </div>
          </div>
          <button
            onClick={() => setInspectEvent(null)}
            className="p-2 rounded-xl bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transform hover:rotate-90 transition duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 bg-white max-h-[80vh] overflow-y-auto space-y-4 text-xs font-manrope">
          {inspectEvent && (
            <>
              <div className="flex items-center justify-between border-b border-[#D8D2C8] pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#666666] font-bold uppercase tracking-wider block">Event Name & Region</span>
                  <h4 className="text-lg font-bold text-[#133020]">{inspectEvent.eventName}</h4>
                  <p className="text-xs text-[#666666]">📍 {inspectEvent.city}, {inspectEvent.country} ({inspectEvent.region})</p>
                </div>
                <FitScoreBadge score={inspectEvent.fitScore} size="xl" showLevel />
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#F9F7F7] p-4 rounded-xl border border-[#D8D2C8]">
                <div>
                  <span className="text-[10px] text-[#666666] font-bold uppercase block">Organizer</span>
                  <span className="font-bold text-[#133020]">{inspectEvent.organizer || "Not disclosed"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] font-bold uppercase block">Dates</span>
                  <span className="font-bold text-[#133020]">{inspectEvent.dates}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] font-bold uppercase block">Venue</span>
                  <span className="font-bold text-[#133020]">{inspectEvent.venue || "Not disclosed"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] font-bold uppercase block">Target Audience</span>
                  <span className="font-bold text-[#133020]">{inspectEvent.targetAudience || "Enterprise buyers"}</span>
                </div>
              </div>

              <div className="bg-[#F0F5F2] p-4 rounded-xl border border-[#046241]/20 space-y-1">
                <span className="text-[10px] text-[#046241] font-bold uppercase block">Relevance to Lifewood</span>
                <p className="text-xs text-[#133020] leading-relaxed">{inspectEvent.relevanceToLifewood || inspectEvent.strategicFocus || "Strategic buyer alignment"}</p>
              </div>
            </>
          )}
        </div>
      </ModalPortal>
    </div>
  );
}
