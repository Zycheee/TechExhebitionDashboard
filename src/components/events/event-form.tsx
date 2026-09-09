"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REGIONS, BUSINESS_LINES, PARTICIPATION_OPTIONS } from "@/lib/constants/business-lines";
import { DuplicateWarning } from "./duplicate-warning";
import { Plus, Trash2, CheckCircle2, AlertCircle, Sparkles, Save, Info, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { LifewoodDropdown } from "@/components/shared/lifewood-dropdown";

interface EventFormProps {
  initialData?: any;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EventForm({ initialData, isEditing = false, onSuccess, onCancel }: EventFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "INTERN";

  // Parse initial businessLines & sourceLinks
  let parsedBL: string[] = ["Global AI Data"];
  if (initialData?.businessLines) {
    try {
      parsedBL = JSON.parse(initialData.businessLines);
    } catch {
      parsedBL = Array.isArray(initialData.businessLines)
        ? initialData.businessLines
        : [initialData.businessLines];
    }
  }

  let parsedLinks: string[] = ["https://"];
  if (initialData?.sourceLinks) {
    try {
      parsedLinks = JSON.parse(initialData.sourceLinks);
    } catch {
      parsedLinks = Array.isArray(initialData.sourceLinks)
        ? initialData.sourceLinks
        : [initialData.sourceLinks];
    }
  }

  const [formData, setFormData] = useState({
    region: initialData?.region || "Asia",
    country: initialData?.country || "",
    city: initialData?.city || "",
    eventName: initialData?.eventName || "",
    dates: initialData?.dates || "",
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : "",
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : "",
    venue: initialData?.venue || "",
    locationAddress: initialData?.locationAddress || "",
    officialWebsite: initialData?.officialWebsite || "https://",
    organizer: initialData?.organizer || "",
    eventCategory: initialData?.eventCategory || "",
    businessLines: parsedBL,
    strategicFocus: initialData?.strategicFocus || "",
    relevanceToLifewood: initialData?.relevanceToLifewood || "",
    targetAudience: initialData?.targetAudience || "",
    estimatedAttendees: initialData?.estimatedAttendees || "Not publicly disclosed",
    exhibitorOpportunity: initialData?.exhibitorOpportunity || "Not publicly disclosed",
    boothCost: initialData?.boothCost || "Not publicly disclosed",
    registrationDeadline: initialData?.registrationDeadline || "Not publicly disclosed",
    contactEmail: initialData?.contactEmail || "Not publicly disclosed",
    contactPerson: initialData?.contactPerson || "Not publicly disclosed",
    socialMedia: initialData?.socialMedia || "Not publicly disclosed",
    participationRec: initialData?.participationRec || "Exhibit",
    fitScore: initialData?.fitScore || 4,
    priorityLevel: initialData?.priorityLevel || "High",
    keyNotes: initialData?.keyNotes || "",
    sourceLinks: parsedLinks,
  });

  const [duplicateMatches, setDuplicateMatches] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-derive priority from fit score
  const handleFitScoreChange = (score: number) => {
    let priority = "High";
    if (score === 3) priority = "Medium";
    setFormData((prev) => ({
      ...prev,
      fitScore: score,
      priorityLevel: priority,
    }));
  };

  const handleStartDatePicker = (dateStr: string) => {
    const newStart = dateStr;
    let newDates = formData.dates;
    if (newStart && formData.endDate) {
      const s = new Date(newStart);
      const e = new Date(formData.endDate);
      const sMonth = s.toLocaleString("en-US", { month: "short" });
      const eMonth = e.toLocaleString("en-US", { month: "short" });
      const year = s.getFullYear();
      if (sMonth === eMonth) {
        newDates = `${sMonth} ${s.getDate()}–${e.getDate()}, ${year}`;
      } else {
        newDates = `${sMonth} ${s.getDate()} – ${eMonth} ${e.getDate()}, ${year}`;
      }
    } else if (newStart) {
      const s = new Date(newStart);
      const sMonth = s.toLocaleString("en-US", { month: "short" });
      newDates = `${sMonth} ${s.getDate()}, ${s.getFullYear()}`;
    }
    setFormData((prev) => ({
      ...prev,
      startDate: newStart,
      dates: newDates,
    }));
  };

  const handleEndDatePicker = (dateStr: string) => {
    const newEnd = dateStr;
    let newDates = formData.dates;
    if (formData.startDate && newEnd) {
      const s = new Date(formData.startDate);
      const e = new Date(newEnd);
      const sMonth = s.toLocaleString("en-US", { month: "short" });
      const eMonth = e.toLocaleString("en-US", { month: "short" });
      const year = s.getFullYear();
      if (sMonth === eMonth) {
        newDates = `${sMonth} ${s.getDate()}–${e.getDate()}, ${year}`;
      } else {
        newDates = `${sMonth} ${s.getDate()} – ${eMonth} ${e.getDate()}, ${year}`;
      }
    }
    setFormData((prev) => ({
      ...prev,
      endDate: newEnd,
      dates: newDates,
    }));
  };

  // Real-time duplicate check on blur of eventName
  const handleNameBlur = async () => {
    if (!formData.eventName || formData.eventName.trim().length < 3 || isEditing) return;
    try {
      const res = await fetch(`/api/events/search?q=${encodeURIComponent(formData.eventName)}`);
      const data = await res.json();
      if (data.matches && data.matches.length > 0) {
        setDuplicateMatches(data.matches);
      }
    } catch {
      // Ignore search errors
    }
  };

  // Toggle business line check box
  const toggleBusinessLine = (name: string) => {
    setFormData((prev) => {
      const exists = prev.businessLines.includes(name);
      if (exists) {
        if (prev.businessLines.length === 1) return prev; // Keep at least one
        return {
          ...prev,
          businessLines: prev.businessLines.filter((b) => b !== name),
        };
      } else {
        return {
          ...prev,
          businessLines: [...prev.businessLines, name],
        };
      }
    });
  };

  // Source links management
  const addSourceLink = () => {
    setFormData((prev) => ({
      ...prev,
      sourceLinks: [...prev.sourceLinks, "https://"],
    }));
  };

  const removeSourceLink = (index: number) => {
    if (formData.sourceLinks.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      sourceLinks: prev.sourceLinks.filter((_, i) => i !== index),
    }));
  };

  const updateSourceLink = (index: number, val: string) => {
    setFormData((prev) => {
      const newLinks = [...prev.sourceLinks];
      newLinks[index] = val;
      return { ...prev, sourceLinks: newLinks };
    });
  };

  // Quick NPD fill helper
  const setNPD = (field: string) => {
    setFormData((prev) => ({ ...prev, [field]: "Not publicly disclosed" }));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent, statusOverride?: string) => {
    e.preventDefault();
    setErrors({});

    // Validate mandatory groups
    const newErrors: Record<string, string> = {};
    if (!formData.eventName) newErrors.eventName = "Event name is required.";
    if (!formData.country) newErrors.country = "Country is required.";
    if (!formData.city) newErrors.city = "City is required.";
    if (!formData.dates) newErrors.dates = "Dates string is required.";
    if (!formData.venue) newErrors.venue = "Venue is required.";
    if (!formData.officialWebsite) newErrors.officialWebsite = "Official website is required.";
    if (!formData.organizer) newErrors.organizer = "Organizer is required.";
    if (!formData.strategicFocus) newErrors.strategicFocus = "Strategic focus is required.";
    if (!formData.relevanceToLifewood) newErrors.relevanceToLifewood = "Relevance to Lifewood is required.";

    // Fit score enforcement
    if (formData.fitScore < 3) {
      newErrors.fitScore = "Only events scoring Fit 3+ can be entered into the database.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        status: statusOverride || (userRole === "INTERN" ? "PENDING_REVIEW" : "PUBLISHED"),
      };

      const url = isEditing ? `/api/events/${initialData.id}` : "/api/events";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          isEditing
            ? "Event updated successfully!"
            : userRole === "INTERN"
            ? "Event submitted for supervisor review!"
            : "Event published successfully!"
        );
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/events");
          router.refresh();
        }
      } else {
        toast.error(data.error || "Failed to save event");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto font-manrope">
      {/* Duplicate Warning Bar */}
      <DuplicateWarning
        matches={duplicateMatches}
        onDismiss={() => setDuplicateMatches([])}
      />

      {/* GROUP A: Identity & Location */}
      <div className="bg-white p-6 rounded-xl border border-[#D8D2C8] shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#D8D2C8] pb-3 mb-5">
          <span className="w-6 h-6 rounded-full bg-[#133020] text-white text-xs font-bold flex items-center justify-center">
            A
          </span>
          <h3 className="text-base font-bold text-[#133020]">
            Group A — Identity & Location (Mandatory)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
              Region *
            </label>
            <LifewoodDropdown
              value={formData.region}
              onChange={(val) => setFormData({ ...formData, region: val })}
              options={REGIONS.map((r) => ({ value: r, label: r }))}
              aria-label="Select Region"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
              Event Name *
            </label>
            <input
              type="text"
              required
              value={formData.eventName}
              onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              onBlur={handleNameBlur}
              placeholder="e.g. GITEX ASIA 2026"
              className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
            />
            {errors.eventName && <p className="text-[11px] text-[#B91C1C] mt-1">{errors.eventName}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
              Country *
            </label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="e.g. Singapore"
              className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
              City *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Singapore"
              className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
              Start Date (Calendar Picker)
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleStartDatePicker(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241] cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
              End Date (Calendar Picker)
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleEndDatePicker(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241] cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
              Formatted Event Date Display *
            </label>
            <input
              type="text"
              required
              value={formData.dates}
              onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
              placeholder="Sep 14–17, 2026 or Q3 2027"
              className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
            />
            <span className="text-[10px] text-[#666666] block mt-1">
              Auto-generated from calendar pickers or manually editable (e.g. "Apr 6–9, 2026")
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
              Venue Name *
            </label>
            <input
              type="text"
              required
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g. Marina Bay Sands Expo Centre"
              className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#046241]" />
              <span>Full Location & Map Address (Optional — Street, District, Postal Code)</span>
            </label>
            <textarea
              rows={2}
              value={formData.locationAddress}
              onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
              placeholder="e.g. 1 Harbour Road, Wan Chai, Hong Kong (Used for Google Maps location links)"
              className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
            />
          </div>
        </div>
      </div>

      {/* GROUP B: Source & Organizer */}
      <div className="bg-white p-6 rounded-xl border border-[#D8D2C8] shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#D8D2C8] pb-3 mb-5">
          <span className="w-6 h-6 rounded-full bg-[#133020] text-white text-xs font-bold flex items-center justify-center">
            B
          </span>
          <h3 className="text-base font-bold text-[#133020]">
            Group B — Source & Organizer (Mandatory)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
              Official Website URL *
            </label>
            <input
              type="url"
              required
              value={formData.officialWebsite}
              onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
              Organizer Body *
            </label>
            <input
              type="text"
              required
              value={formData.organizer}
              onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
              placeholder="e.g. HKTDC / KAOUN International"
              className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
              Event Category
            </label>
            <input
              type="text"
              value={formData.eventCategory}
              onChange={(e) => setFormData({ ...formData, eventCategory: e.target.value })}
              placeholder="e.g. Enterprise AI Summit & Expo"
              className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
            />
          </div>
        </div>
      </div>

      {/* GROUP C: Strategic Assessment */}
      <div className="bg-white p-6 rounded-xl border border-[#D8D2C8] shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#D8D2C8] pb-3 mb-5">
          <span className="w-6 h-6 rounded-full bg-[#133020] text-white text-xs font-bold flex items-center justify-center">
            C
          </span>
          <h3 className="text-base font-bold text-[#133020]">
            Group C — Strategic Assessment & Scoring (Mandatory)
          </h3>
        </div>

        <div className="space-y-5">
          {/* Business Lines Multi-select */}
          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-2">
              Lifewood Business Line(s) (Select at least 1) *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {BUSINESS_LINES.map((b) => {
                const selected = formData.businessLines.includes(b.name);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleBusinessLine(b.name)}
                    className={`p-3 rounded-lg border text-left text-xs transition flex flex-col justify-between ${
                      selected
                        ? "bg-[#133020] text-white border-[#133020] shadow-xs font-semibold"
                        : "bg-[#F9F7F7] text-[#133020] border-[#D8D2C8] hover:border-[#046241]"
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className="text-[10px] opacity-75 mt-1 block font-normal">
                      {b.dataElements}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
                Strategic Focus / Purpose *
              </label>
              <textarea
                rows={3}
                required
                value={formData.strategicFocus}
                onChange={(e) => setFormData({ ...formData, strategicFocus: e.target.value })}
                placeholder="1–2 sentences on what this conference covers..."
                className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
                Relevance to Lifewood (Buyer + Service) *
              </label>
              <textarea
                rows={3}
                required
                value={formData.relevanceToLifewood}
                onChange={(e) => setFormData({ ...formData, relevanceToLifewood: e.target.value })}
                placeholder="Must state specific buyer in the room & Lifewood service offered..."
                className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="CTOs, AI Engineers, Data leads..."
                className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
                Participation Recommendation
              </label>
              <LifewoodDropdown
                value={formData.participationRec}
                onChange={(val) => setFormData({ ...formData, participationRec: val })}
                options={PARTICIPATION_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
                aria-label="Select Participation Recommendation"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
                Fit Score (1–5, Minimum 3 Enforced) *
              </label>
              <div className="flex gap-2">
                {[5, 4, 3].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => handleFitScoreChange(score)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-bold transition ${
                      formData.fitScore === score
                        ? score === 5
                          ? "bg-[#133020] text-white border-[#133020]"
                          : score === 4
                          ? "bg-[#046241] text-white border-[#046241]"
                          : "bg-[#708E7C] text-white border-[#708E7C]"
                        : "bg-white text-[#133020] border-[#D8D2C8] hover:bg-[#F9F7F7]"
                    }`}
                  >
                    Fit {score}
                  </button>
                ))}
              </div>
              {errors.fitScore && <p className="text-[11px] text-[#B91C1C] mt-1">{errors.fitScore}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* GROUP D: Commercial Detail with NPD Quick Fill Buttons */}
      <div className="bg-white p-6 rounded-xl border border-[#D8D2C8] shadow-sm">
        <div className="flex items-center justify-between border-b border-[#D8D2C8] pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#133020] text-white text-xs font-bold flex items-center justify-center">
              D
            </span>
            <h3 className="text-base font-bold text-[#133020]">
              Group D — Commercial Detail (Best-Effort)
            </h3>
          </div>
          <span className="text-[11px] text-[#666666]">
            Use [NPD] button if details are unannounced
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Estimated Attendees", field: "estimatedAttendees" },
            { label: "Booth or Sponsorship Cost", field: "boothCost" },
            { label: "Registration Deadline", field: "registrationDeadline" },
            { label: "Contact Email", field: "contactEmail" },
            { label: "Contact Person / Title", field: "contactPerson" },
            { label: "LinkedIn / Social Media URL", field: "socialMedia" },
          ].map((item) => (
            <div key={item.field}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#133020] uppercase tracking-wider">
                  {item.label}
                </label>
                <button
                  type="button"
                  onClick={() => setNPD(item.field)}
                  className="text-[10px] font-bold text-[#046241] hover:underline"
                >
                  [NPD Quick Fill]
                </button>
              </div>
              <input
                type="text"
                value={(formData as any)[item.field]}
                onChange={(e) => setFormData({ ...formData, [item.field]: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
              />
            </div>
          ))}

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#133020] uppercase tracking-wider">
                Exhibitor & Sponsorship Details
              </label>
              <button
                type="button"
                onClick={() => setNPD("exhibitorOpportunity")}
                className="text-[10px] font-bold text-[#046241] hover:underline"
              >
                [NPD Quick Fill]
              </button>
            </div>
            <textarea
              rows={2}
              value={formData.exhibitorOpportunity}
              onChange={(e) => setFormData({ ...formData, exhibitorOpportunity: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
            />
          </div>
        </div>
      </div>

      {/* GROUP E: Provenance & Source Links */}
      <div className="bg-white p-6 rounded-xl border border-[#D8D2C8] shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#D8D2C8] pb-3 mb-5">
          <span className="w-6 h-6 rounded-full bg-[#133020] text-white text-xs font-bold flex items-center justify-center">
            E
          </span>
          <h3 className="text-base font-bold text-[#133020]">
            Group E — Provenance & Source Links (Mandatory)
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-1">
              Key Notes (Co-located shows, edition #, CFP deadline...)
            </label>
            <textarea
              rows={2}
              value={formData.keyNotes}
              onChange={(e) => setFormData({ ...formData, keyNotes: e.target.value })}
              placeholder="e.g. Co-located with InnoEX 2026. CFP closes Dec 2025."
              className="w-full px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#133020] uppercase tracking-wider">
                Verification Source Link(s) (Minimum 1) *
              </label>
              <button
                type="button"
                onClick={addSourceLink}
                className="text-xs text-[#046241] hover:underline font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.sourceLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    required
                    value={link}
                    onChange={(e) => updateSourceLink(idx, e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs text-[#133020] focus:border-[#046241]"
                  />
                  {formData.sourceLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSourceLink(idx)}
                      className="p-2 text-[#B91C1C] hover:bg-[#B91C1C]/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.push("/events"))}
          className="px-6 py-3 rounded-lg border border-[#D8D2C8] bg-white text-xs font-bold text-[#133020] hover:bg-[#F9F7F7]"
        >
          Cancel
        </button>

        {userRole === "INTERN" && (
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "DRAFT")}
            disabled={submitting}
            className="px-6 py-3 rounded-lg border border-[#133020] bg-white text-xs font-bold text-[#133020] hover:bg-[#F5EEDB]"
          >
            Save as Draft
          </button>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 rounded-lg bg-[#FFB347] hover:bg-[#FFC370] text-[#133020] text-xs font-bold shadow-md transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>
            {submitting
              ? "Saving..."
              : isEditing
              ? "Update Record"
              : userRole === "INTERN"
              ? "Submit for Review"
              : "Publish Event"}
          </span>
        </button>
      </div>
    </form>
  );
}
