import { REGIONS, BUSINESS_LINES, PRIORITIES } from "@/lib/constants/business-lines";
import { Search, X, Filter } from "lucide-react";
import { useLocaleStore } from "@/stores/locale-store";

interface EventFiltersProps {
  filters: {
    region: string;
    businessLine: string;
    fitScore: string;
    priority: string;
    search: string;
  };
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function EventFilters({ filters, onChange, onClear }: EventFiltersProps) {
  const { locale } = useLocaleStore();

  const activeFiltersCount = [
    filters.region !== "ALL",
    filters.businessLine !== "ALL",
    filters.fitScore !== "ALL",
    filters.priority !== "ALL",
    filters.search !== "",
  ].filter(Boolean).length;

  return (
    <div className="bg-white border-[1.5px] border-[#D8D2C8] rounded-2xl p-4 sm:px-6 mb-6 shadow-sm font-manrope transition-all">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Dropdown Filters with Badges & Visual Polish */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#133020] mr-1">
            <Filter className="w-4 h-4 text-[#046241]" />
            <span>{locale === "en" ? "Filter Intelligence:" : "智能筛选:"}</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#FFB347] text-[#133020] text-[10px] font-extrabold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </div>

          {/* Region */}
          <div className="relative">
            <select
              value={filters.region}
              onChange={(e) => onChange("region", e.target.value)}
              className={`px-3.5 py-2 rounded-xl border-[1.5px] text-xs font-semibold transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#046241]/20 ${
                filters.region !== "ALL"
                  ? "bg-[#133020] border-[#133020] text-white"
                  : "bg-[#F9F7F7] border-[#D8D2C8] text-[#133020] hover:border-[#046241]"
              }`}
            >
              <option value="ALL">{locale === "en" ? "All Regions" : "所有大区"}</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Business Line */}
          <div className="relative">
            <select
              value={filters.businessLine}
              onChange={(e) => onChange("businessLine", e.target.value)}
              className={`px-3.5 py-2 rounded-xl border-[1.5px] text-xs font-semibold transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#046241]/20 ${
                filters.businessLine !== "ALL"
                  ? "bg-[#133020] border-[#133020] text-white"
                  : "bg-[#F9F7F7] border-[#D8D2C8] text-[#133020] hover:border-[#046241]"
              }`}
            >
              <option value="ALL">{locale === "en" ? "All Business Lines" : "所有业务线"}</option>
              {BUSINESS_LINES.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fit Score */}
          <div className="relative">
            <select
              value={filters.fitScore}
              onChange={(e) => onChange("fitScore", e.target.value)}
              className={`px-3.5 py-2 rounded-xl border-[1.5px] text-xs font-semibold transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#046241]/20 ${
                filters.fitScore !== "ALL"
                  ? "bg-[#133020] border-[#133020] text-white"
                  : "bg-[#F9F7F7] border-[#D8D2C8] text-[#133020] hover:border-[#046241]"
              }`}
            >
              <option value="ALL">{locale === "en" ? "All Fit Scores" : "所有适配度"}</option>
              <option value="5">Fit 5.0 ({locale === "en" ? "Direct Strategic Fit" : "直接战略匹配"})</option>
              <option value="4">Fit 4.0 ({locale === "en" ? "Strong Fit" : "高度匹配"})</option>
              <option value="3">Fit 3.0 ({locale === "en" ? "Moderate Fit" : "中度匹配"})</option>
            </select>
          </div>

          {/* Priority */}
          <div className="relative">
            <select
              value={filters.priority}
              onChange={(e) => onChange("priority", e.target.value)}
              className={`px-3.5 py-2 rounded-xl border-[1.5px] text-xs font-semibold transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#046241]/20 ${
                filters.priority !== "ALL"
                  ? "bg-[#133020] border-[#133020] text-white"
                  : "bg-[#F9F7F7] border-[#D8D2C8] text-[#133020] hover:border-[#046241]"
              }`}
            >
              <option value="ALL">{locale === "en" ? "All Priorities" : "所有优先级"}</option>
              {PRIORITIES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} {locale === "en" ? "Priority" : "优先级"}
                </option>
              ))}
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#B91C1C] hover:bg-[#B91C1C]/10 transition"
            >
              <X className="w-4 h-4" />
              <span>{locale === "en" ? "Clear Filters" : "重置筛选"}</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#999999] absolute left-3.5 top-3" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
            placeholder={locale === "en" ? "Search exhibition name, venue, city..." : "搜索展会名称、展馆、城市..."}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border-[1.5px] border-[#D8D2C8] bg-[#F9F7F7] text-xs text-[#133020] placeholder-[#999999] focus:outline-none focus:border-[#046241] focus:bg-white focus:ring-2 focus:ring-[#046241]/15 transition font-medium"
          />
          {filters.search && (
            <button
              onClick={() => onChange("search", "")}
              className="absolute right-3 top-3 text-[#999999] hover:text-[#133020]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
