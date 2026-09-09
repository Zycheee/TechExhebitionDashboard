"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { EventCard } from "@/components/events/event-card";
import { EventTable } from "@/components/events/event-table";
import { EventFilters } from "@/components/events/event-filters";
import { EventForm } from "@/components/events/event-form";
import { ModalPortal } from "@/components/shared/modal-portal";
import { Skeleton } from "@/components/shared/skeleton";
import { LayoutGrid, Table as TableIcon, Plus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useLocaleStore } from "@/stores/locale-store";

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { locale } = useLocaleStore();

  const [filters, setFilters] = useState({
    region: "ALL",
    businessLine: "ALL",
    fitScore: "ALL",
    priority: "ALL",
    search: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    totalCount: 0,
    totalPages: 1,
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        region: filters.region,
        businessLine: filters.businessLine,
        fitScore: filters.fitScore,
        priority: filters.priority,
        search: filters.search,
      });

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setEvents(data.events || []);
        if (data.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalCount: data.pagination.totalCount,
            totalPages: data.pagination.totalPages,
          }));
        }
      } else {
        toast.error("Failed to load events: " + data.error);
      }
    } catch (err: any) {
      toast.error("Error loading events");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      region: "ALL",
      businessLine: "ALL",
      fitScore: "ALL",
      priority: "ALL",
      search: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event record?")) return;

    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Event deleted successfully");
        fetchEvents();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete event");
      }
    } catch (err) {
      toast.error("Error deleting event");
    }
  };

  return (
    <div className="space-y-6 font-manrope">
      {/* Top Section */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] pb-4">
        <div>
          <h2 className="text-[28px] font-semibold text-[#133020] tracking-tight leading-tight">
            {locale === "en" ? "Exhibition records" : "展会记录库"}
          </h2>
          <p className="text-xs text-[#333333] mt-0.5">
            {locale === "en"
              ? `Showing ${pagination.totalCount} strategic tech exhibition records (fit score 3+)`
              : `显示 ${pagination.totalCount} 条战略科技展会记录（适配分 3+）`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-white border-[1.5px] border-[#D8D2C8] rounded-[8px] shadow-2xs">
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition ${
                viewMode === "card"
                  ? "bg-[#133020] text-white shadow-2xs"
                  : "text-[#666666] hover:text-[#133020]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{locale === "en" ? "Cards" : "卡片视图"}</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition ${
                viewMode === "table"
                  ? "bg-[#133020] text-white shadow-2xs"
                  : "text-[#666666] hover:text-[#133020]"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{locale === "en" ? "Table" : "表格视图"}</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FFB347] hover:bg-[#FFC370] text-[#133020] font-medium text-xs rounded-[8px] transition-all duration-180 shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === "en" ? "Add event" : "+ 添加展会"}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <EventFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-[12px]" />
          ))}
        </div>
      ) : events.length === 0 ? (
        /* Empty State */
        <div className="bg-white border-[1.5px] border-dashed border-[#D8D2C8] rounded-[12px] p-12 text-center max-w-lg mx-auto my-8 font-manrope">
          <div className="w-14 h-14 bg-[#F5EEDB] rounded-[10px] flex items-center justify-center mx-auto mb-4 text-[#046241]">
            <LayoutGrid className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-[#133020] mb-1">
            No exhibition events found
          </h3>
          <p className="text-xs text-[#666666] mb-6">
            Try adjusting your filter preferences or search term, or add a new event.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-[#133020] text-white text-xs font-medium rounded-[8px] hover:bg-[#046241] transition"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        /* Events Data List */
        <div>
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          ) : (
            <EventTable events={events} onDelete={handleDelete} />
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between text-xs text-[#666666] font-manrope">
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  className="px-3.5 py-1.5 rounded-[8px] border-[1.5px] border-[#D8D2C8] bg-white font-medium disabled:opacity-50 hover:bg-[#F9F7F7] transition"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  className="px-3.5 py-1.5 rounded-[8px] border-[1.5px] border-[#D8D2C8] bg-white font-medium disabled:opacity-50 hover:bg-[#F9F7F7] transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Add Event Pop-up Modal */}
      <ModalPortal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="bg-[#133020] text-white p-5 px-7 flex items-center justify-between shrink-0 shadow-sm border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFB347] text-[#133020] flex items-center justify-center font-bold shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {locale === "en" ? "Add New Exhibition Record" : "录入新展会记录"}
              </h3>
              <p className="text-[10px] text-[#F5EEDB]/70 uppercase tracking-wider">
                Lifewood Intelligence Database
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(false)}
            className="p-2 rounded-xl bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transform hover:rotate-90 transition duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto no-scrollbar">
          <EventForm
            onSuccess={() => {
              setShowAddModal(false);
              fetchEvents();
            }}
            onCancel={() => setShowAddModal(false)}
          />
        </div>
      </ModalPortal>
    </div>
  );
}
