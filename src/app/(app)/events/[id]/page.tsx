"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FitScoreBadge } from "@/components/events/fit-score-badge";
import { PriorityIndicator } from "@/components/events/priority-indicator";
import { BusinessLineChip } from "@/components/events/business-line-chip";
import { BUSINESS_LINES } from "@/lib/constants/business-lines";
import { EventForm } from "@/components/events/event-form";
import { ModalPortal } from "@/components/shared/modal-portal";
import { sanitizeEventUrl } from "@/lib/url";
import {
  MapPin,
  Calendar,
  Building,
  Globe,
  Users,
  DollarSign,
  Clock,
  Mail,
  User,
  Share2,
  Edit,
  Trash2,
  ArrowLeft,
  ExternalLink,
  Loader2,
  FileCheck,
  Award,
  Star,
  Ticket,
  CheckCircle2,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useLocaleStore } from "@/stores/locale-store";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "INTERN";
  const { locale } = useLocaleStore();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (res.ok) {
          setEvent(data.event);
        } else {
          toast.error(data.error || "Event not found");
        }
      } catch (err) {
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this event record?")) return;

    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Event record deleted");
        router.push("/events");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Error deleting event");
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#046241]">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <span className="text-xs font-semibold text-[#133020]">
          Loading exhibition specifications...
        </span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-12 text-center text-[#B91C1C] font-semibold text-sm">
        Event not found.
      </div>
    );
  }

  let businessLines: string[] = [];
  try {
    businessLines = JSON.parse(event.businessLines || "[]");
  } catch {
    businessLines = Array.isArray(event.businessLines)
      ? event.businessLines
      : [event.businessLines];
  }

  let sourceLinks: string[] = [];
  try {
    sourceLinks = JSON.parse(event.sourceLinks || "[]");
  } catch {
    sourceLinks = Array.isArray(event.sourceLinks)
      ? event.sourceLinks
      : [event.sourceLinks];
  }

  const primaryBL = businessLines[0] || "Global AI Data";
  const blConfig = BUSINESS_LINES.find(
    (b) => b.name.toLowerCase() === primaryBL.toLowerCase()
  );
  const accentColor = blConfig ? blConfig.colorHex : "#046241";

  const isFree =
    event.boothCost?.toLowerCase().includes("free") ||
    event.boothCost === "$0" ||
    event.boothCost === "0";

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-manrope">
      {/* Back Button & Section Title */}
      <div className="flex items-center justify-between">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#046241] hover:text-[#133020] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === "en" ? "Back to All Events" : "返回展会列表"}</span>
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-[#666666]">
          {locale === "en" ? "Exhibition Details" : "展会详细信息"}
        </span>
      </div>

      {/* Main Full-Width Standalone Card Container */}
      <div className="bg-white rounded-[12px] border-[1.5px] border-[#D8D2C8] shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden relative">
        {/* 6px Left Accent Bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[6px] z-10 rounded-l-[12px]"
          style={{ backgroundColor: accentColor }}
        />

        {/* HEADER AREA */}
        <div className="p-6 pl-8 border-b border-[#D8D2C8] bg-white">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#133020]">
                Record #{event.eventNumber} · {event.region}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-tight ${
                  isFree
                    ? "bg-[#046241]/10 text-[#046241]"
                    : "bg-[#FFB347]/25 text-[#133020]"
                }`}
              >
                <Ticket className="w-3 h-3" />
                {isFree ? "Free entry" : "Paid / Ticketed"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const newAttended = !event.isAttended;
                    const res = await fetch(`/api/events/${event.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ isAttended: newAttended }),
                    });
                    if (res.ok) {
                      setEvent({ ...event, isAttended: newAttended });
                      toast.success(
                        newAttended
                          ? "Event marked as Attended!"
                          : "Event attendance removed"
                      );
                    }
                  } catch {
                    toast.error("Failed to update attendance status");
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs border ${
                  event.isAttended
                    ? "bg-[#046241] text-white border-[#046241]"
                    : "bg-[#F5EEDB] text-[#133020] border-[#D8D2C8] hover:border-[#046241]"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#FFB347]" />
                <span>{event.isAttended ? "Already Attended ✓" : "Mark as Attended"}</span>
              </button>

              <PriorityIndicator priority={event.priorityLevel} />
              <FitScoreBadge score={event.fitScore} size="xl" showLevel />
            </div>
          </div>

          <h1 className="text-[28px] font-bold text-emerald-950 dark:text-white tracking-tight leading-tight mb-3">
            {event.eventName}
          </h1>

          <div className="flex items-center gap-2 flex-wrap mb-4">
            {businessLines.map((bl) => (
              <BusinessLineChip key={bl} name={bl} />
            ))}
          </div>

          {/* Logistics & Official Website CTA */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-[#D8D2C8] dark:border-[#1E4830]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-emerald-950 dark:text-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-emerald-800/70 dark:text-slate-400 block uppercase font-medium">
                    Dates
                  </span>
                  <span className="font-semibold text-sm">{event.dates}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-emerald-800/70 dark:text-slate-400 block uppercase font-medium">
                    Location
                  </span>
                  <span className="font-semibold text-sm">
                    {event.city}, {event.country}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-emerald-800/70 dark:text-slate-400 block uppercase font-medium">
                    Venue
                  </span>
                  <span className="font-semibold text-sm truncate block max-w-[200px]">
                    {event.venue}
                  </span>
                </div>
              </div>
            </div>

            {/* Official Website Button */}
            {(() => {
              let firstSource: string | null = null;
              try {
                const parsed = JSON.parse(event.sourceLinks || "[]");
                firstSource = Array.isArray(parsed) ? parsed[0] : null;
              } catch {
                firstSource = event.sourceLinks || null;
              }

              const validUrl = sanitizeEventUrl(event.officialWebsite, firstSource);
              if (!validUrl) return null;

              return (
                <a
                  href={validUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#FFB347] hover:bg-[#FFC370] text-[#133020] font-medium text-xs rounded-[8px] transition-all duration-180 shadow-2xs"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Visit official website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              );
            })()}
          </div>
        </div>

        {/* BODY (2-Column Grid) */}
        <div className="p-6 pl-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-[#D8D2C8]">
          {/* Left Column: Strategic Assessment */}
          <div className="space-y-4">
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#046241] mb-1.5 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-[#046241]" />
                <span>Strategic focus & purpose</span>
              </h3>
              <p className="text-xs text-[#133020] leading-relaxed bg-[#F9F7F7] p-3.5 rounded-[8px] border border-[#D8D2C8]">
                {event.strategicFocus || "Strategic industrial intelligence event"}
              </p>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#046241] mb-1.5">
                Relevance to Lifewood
              </h3>
              <p className="text-xs font-medium text-[#133020] leading-relaxed bg-[#F0F5F2] p-3.5 rounded-[8px] border border-[#046241]/20">
                {event.relevanceToLifewood || "High alignment with Lifewood target buyers"}
              </p>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#666666] mb-1.5">
                Target audience & buyers
              </h3>
              <p className="text-xs text-[#133020] bg-white p-3 rounded-[8px] border border-[#D8D2C8]">
                {event.targetAudience || "Enterprise buyers, AI leaders, procurement teams"}
              </p>
            </div>

            {/* Location card */}
            <div className="bg-[#F5EEDB] p-3.5 rounded-[8px] border border-[#D8D2C8] space-y-1.5 text-xs text-[#133020]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[13px]">{event.venue}</span>
                {event.locationAddress && event.locationAddress !== "Not publicly disclosed" && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue}, ${event.locationAddress}, ${event.city}, ${event.country}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#046241] hover:underline font-semibold"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-[#666666] text-[11.5px]">
                {event.locationAddress || `${event.city}, ${event.country}`}
              </p>
            </div>
          </div>

          {/* Right Column: Commercial & Organizer Specs */}
          <div className="space-y-4 bg-[#F9F7F7] p-5 rounded-[8px] border border-[#D8D2C8] text-xs">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#133020] border-b border-[#D8D2C8] pb-2">
              Commercial & organizer detail
            </h3>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-medium text-[#666666] block">
                  Organizer
                </span>
                <span className="font-semibold text-[#133020] text-sm">
                  {event.organizer || "Not publicly disclosed"}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-medium text-[#666666] block">
                  Estimated attendees
                </span>
                <span className="font-semibold text-[#046241]">
                  {event.estimatedAttendees || "Not publicly disclosed"}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-medium text-[#666666] block">
                  Booth / sponsorship cost
                </span>
                <span className="font-semibold text-[#133020]">
                  {event.boothCost || "Not publicly disclosed"}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-medium text-[#666666] block">
                  Registration deadline
                </span>
                <span className="font-medium text-[#133020]">
                  {event.registrationDeadline || "Not publicly disclosed"}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-medium text-[#666666] block">
                  Contact person
                </span>
                <span className="font-medium text-[#133020]">
                  {event.contactPerson || "Not publicly disclosed"}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-[10px] uppercase font-medium text-[#666666] block">
                  Contact email
                </span>
                <span className="font-medium text-[#046241]">
                  {event.contactEmail || "Not publicly disclosed"}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-[10px] uppercase font-medium text-[#666666] block">
                  Exhibitor opportunities
                </span>
                <span className="text-[#133020]">
                  {event.exhibitorOpportunity || "Not publicly disclosed"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER & ACTIONS */}
        <div className="p-5 pl-8 bg-[#133020] text-white flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-wider text-[#FFB347] font-semibold">
              Recommendation:
            </span>
            <span className="px-3 py-1 rounded-[6px] text-xs font-semibold bg-[#FFB347] text-[#133020]">
              {event.participationRec || "Exhibit"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {(userRole === "ADMIN" || userRole === "SUPERVISOR") && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#FFB347] hover:bg-[#FFC370] text-[#133020] font-medium text-xs rounded-[8px] transition shadow-2xs"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit record</span>
              </button>
            )}

            {userRole === "ADMIN" && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#B91C1C] hover:bg-[#B91C1C]/90 text-white font-medium text-xs rounded-[8px] transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Event Pop-up Modal */}
      <ModalPortal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <div className="bg-[#133020] text-white p-5 px-7 flex items-center justify-between shrink-0 shadow-sm border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFB347] text-[#133020] flex items-center justify-center font-bold shadow-xs">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {locale === "en" ? "Edit Exhibition Record" : "编辑展会记录"}
              </h3>
              <p className="text-[10px] text-[#F5EEDB]/70 uppercase tracking-wider">
                Record #{event?.eventNumber} • {event?.eventName}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(false)}
            className="p-2 rounded-xl bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transform hover:rotate-90 transition duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto no-scrollbar">
          <EventForm
            initialData={event}
            isEditing={true}
            onSuccess={() => {
              setShowEditModal(false);
              window.location.reload();
            }}
            onCancel={() => setShowEditModal(false)}
          />
        </div>
      </ModalPortal>
    </div>
  );
}
