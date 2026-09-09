"use client";

import { useState } from "react";
import { REGIONS } from "@/lib/constants/business-lines";
import { FileSpreadsheet, Download, Eye, FileText, Sparkles, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useLocaleStore } from "@/stores/locale-store";
import { LifewoodDropdown } from "@/components/shared/lifewood-dropdown";

export default function ReportsPage() {
  const { locale } = useLocaleStore();
  const [reportType, setReportType] = useState("regional");
  const [region, setRegion] = useState("Asia");
  const [format, setFormat] = useState<"html" | "csv">("html");

  const reportTypeOptions = [
    { value: "regional", label: "Regional Summary Report" },
    { value: "businessLine", label: "Business Line Summary Report" },
    { value: "full", label: "Full Database Export" },
  ];

  const regionOptions = [
    { value: "ALL", label: "All Regions (Global Summary)" },
    ...REGIONS.map((r) => ({ value: r, label: r })),
  ];

  const formatOptions = [
    { value: "html", label: "Lifewood Branded HTML (HK Report Style)" },
    { value: "csv", label: "Raw CSV Spreadsheet Data" },
  ];

  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (format === "csv") {
        // Download CSV directly
        const res = await fetch("/api/reports/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportType, region, format: "csv" }),
        });
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Lifewood_Exhibition_Report_${region}.csv`;
        a.click();
        toast.success("CSV report downloaded!");
      } else {
        // Generate HTML preview
        const res = await fetch("/api/reports/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportType, region, format: "html" }),
        });
        const data = await res.json();
        if (res.ok) {
          setGeneratedHtml(data.html);
          setCount(data.count);
          toast.success("Branded HTML report generated successfully!");
        } else {
          toast.error(data.error || "Failed to generate report");
        }
      }
    } catch {
      toast.error("Error generating report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadHtml = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Lifewood_Exhibition_Report_${region}.html`;
    a.click();
    toast.success("HTML report downloaded!");
  };

  return (
    <div className="space-y-8 font-manrope">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#046241]" />
            <h2 className="text-2xl font-bold text-[#133020]">
              {locale === "en" ? "Executive Report Generator" : "执行报告生成器"}
            </h2>
          </div>
          <p className="text-xs text-[#333333] mt-0.5">
            Export Lifewood-branded HK report HTML documents or CSV datasets for executive presentation
          </p>
        </div>
      </div>

      {/* Config Form */}
      <div className="bg-white p-10 rounded-xl border border-[#D8D2C8] shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-2">
              Report Type
            </label>
            <LifewoodDropdown
              value={reportType}
              onChange={(val) => setReportType(val)}
              options={reportTypeOptions}
              aria-label="Report Type"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-2">
              Region Selection
            </label>
            <LifewoodDropdown
              value={region}
              onChange={(val) => setRegion(val)}
              options={regionOptions}
              aria-label="Region Selection"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#133020] uppercase tracking-wider mb-2">
              Export Format
            </label>
            <LifewoodDropdown
              value={format}
              onChange={(val) => setFormat(val as any)}
              options={formatOptions}
              aria-label="Export Format"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FFB347] hover:bg-[#FFC370] text-[#133020] font-bold text-xs rounded-lg transition shadow-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {generatedHtml && (
        <div className="bg-white p-6 rounded-xl border border-[#D8D2C8] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8D2C8] pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#046241]" />
              <div>
                <h3 className="text-sm font-bold text-[#133020]">
                  Live Report Preview ({count} Records)
                </h3>
                <p className="text-[11px] text-[#666666]">
                  Rendered in official HK Report design language
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#133020] hover:bg-[#046241] text-white text-xs font-bold rounded-lg transition shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download HTML File</span>
            </button>
          </div>

          <div className="border border-[#D8D2C8] rounded-xl overflow-hidden bg-[#F5EEDB] p-4 max-h-[600px] overflow-y-auto">
            <iframe
              srcDoc={generatedHtml}
              className="w-full min-h-[500px] rounded-lg border border-[#D8D2C8] bg-white shadow-inner"
              title="Report Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
