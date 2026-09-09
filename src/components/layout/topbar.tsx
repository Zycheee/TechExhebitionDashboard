"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LangToggle } from "@/components/shared/lang-toggle";
import { ChevronRight } from "lucide-react";
import { useLocaleStore } from "@/stores/locale-store";

export function Topbar() {
  const pathname = usePathname();
  const { locale } = useLocaleStore();

  const getPageTitle = (path: string) => {
    if (path.startsWith("/dashboard")) return locale === "en" ? "Dashboard" : "仪表板";
    if (path === "/events") return locale === "en" ? "Events" : "展会列表";
    if (path === "/events/new") return locale === "en" ? "Add Event" : "添加展会记录";
    if (path.includes("/edit")) return locale === "en" ? "Edit Event" : "编辑展会记录";
    if (path.startsWith("/events/")) return locale === "en" ? "Event Details" : "展会详情";
    if (path.startsWith("/scraper")) return locale === "en" ? "Scraper" : "数据抓取器";
    if (path.startsWith("/reports")) return locale === "en" ? "Reports" : "报告导出";
    if (path.startsWith("/queues")) return locale === "en" ? "Queues" : "审核队列";
    if (path.startsWith("/history")) return locale === "en" ? "History" : "历史记录";
    if (path.startsWith("/users")) return locale === "en" ? "User Management" : "用户管理";
    if (path.startsWith("/settings")) return locale === "en" ? "Settings" : "设置";
    return locale === "en" ? "Dashboard" : "仪表板";
  };

  const title = getPageTitle(pathname);

  return (
    <header className="h-16 bg-[#F5EEDB]/85 backdrop-blur-md border-b border-[#D8D2C8] px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs transition-colors font-manrope">
      {/* Page Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[#666666]">
          <Link href="/dashboard" className="hover:text-[#046241] transition font-medium">
            Lifewood 活树
          </Link>
          <ChevronRight className="w-3 h-3 text-[#999999]" />
          <span className="text-[#133020] font-semibold">{title}</span>
        </div>
        <h1 className="text-xl font-bold text-[#133020] tracking-tight mt-0.5 font-manrope">
          {title}
        </h1>
      </div>

      {/* Right Actions: Improved Language Toggle */}
      <div className="flex items-center gap-3">
        <LangToggle />
      </div>
    </header>
  );
}
