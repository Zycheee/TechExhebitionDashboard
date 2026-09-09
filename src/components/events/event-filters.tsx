import { REGIONS, BUSINESS_LINES, PRIORITIES } from "@/lib/constants/business-lines";
import { Search, X, Filter } from "lucide-react";
import { useLocaleStore } from "@/stores/locale-store";
import { LifewoodDropdown } from "@/components/shared/lifewood-dropdown";

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

  const isFiltered =
    filters.region !== "ALL" ||
    filters.businessLine !== "ALL" ||
    filters.fitScore !== "ALL" ||
    filters.priority !== "ALL" ||
    filters.search !== "";

  const regionOptions = [
    { value: "ALL", label: locale === "en" ? "All regions" : "所有大区" },
    ...REGIONS.map((r) => ({ value: r, label: r })),
  ];

  const businessLineOptions = [
    { value: "ALL", label: locale === "en" ? "All business lines" : "所有业务线" },
    ...BUSINESS_LINES.map((b) => ({ value: b.name, label: b.name })),
  ];

  const fitScoreOptions = [
    { value: "ALL", label: locale === "en" ? "All fit scores" : "所有适配度" },
    { value: "5", label: `Fit 5 (${locale === "en" ? "Direct fit" : "直接匹配"})` },
    { value: "4", label: `Fit 4 (${locale === "en" ? "Strong fit" : "高度匹配"})` },
    { value: "3", label: `Fit 3 (${locale === "en" ? "Moderate fit" : "中度匹配"})` },
  ];

  const priorityOptions = [
    { value: "ALL", label: locale === "en" ? "All priorities" : "所有优先级" },
    ...PRIORITIES.map((p) => ({
      value: p.name,
      label: `${p.name} ${locale === "en" ? "priority" : "优先级"}`,
    })),
  ];

  return (
    <div className="bg-[#F5EEDB] border-[1.5px] border-[#D8D2C8] rounded-[12px] p-4 sm:px-6 mb-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] font-manrope">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Dropdown Filters with Section 6.9 Pill Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#133020] mr-1">
            <Filter className="w-3.5 h-3.5 text-[#046241]" />
            <span>{locale === "en" ? "Filters:" : "筛选条件:"}</span>
          </div>

          {/* Region */}
          <LifewoodDropdown
            variant="pill"
            value={filters.region}
            onChange={(val) => onChange("region", val)}
            options={regionOptions}
            isActivePill={filters.region !== "ALL"}
            aria-label="Filter by region"
          />

          {/* Business Line */}
          <LifewoodDropdown
            variant="pill"
            value={filters.businessLine}
            onChange={(val) => onChange("businessLine", val)}
            options={businessLineOptions}
            isActivePill={filters.businessLine !== "ALL"}
            aria-label="Filter by business line"
          />

          {/* Fit Score */}
          <LifewoodDropdown
            variant="pill"
            value={filters.fitScore}
            onChange={(val) => onChange("fitScore", val)}
            options={fitScoreOptions}
            isActivePill={filters.fitScore !== "ALL"}
            aria-label="Filter by fit score"
          />

          {/* Priority */}
          <LifewoodDropdown
            variant="pill"
            value={filters.priority}
            onChange={(val) => onChange("priority", val)}
            options={priorityOptions}
            isActivePill={filters.priority !== "ALL"}
            aria-label="Filter by priority"
          />

          {isFiltered && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium text-[#B91C1C] hover:bg-[#B91C1C]/10 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>{locale === "en" ? "Clear all filters" : "重置筛选"}</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#999999] absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
            placeholder={locale === "en" ? "Search event name, city, organizer..." : "搜索展会名称、城市、主办方..."}
            className="w-full pl-9 pr-8 py-2 rounded-[8px] border-[1.5px] border-[#D8D2C8] bg-white text-xs text-[#133020] placeholder-[#999999] focus:outline-none focus:border-[#046241] focus:ring-2 focus:ring-[#046241]/15 transition"
          />
          {filters.search && (
            <button
              onClick={() => onChange("search", "")}
              className="absolute right-2.5 top-2.5 text-[#999999] hover:text-[#133020]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
