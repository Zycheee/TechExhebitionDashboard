"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays,
  Bot,
  FileSpreadsheet,
  ListTodo,
  History,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLocaleStore } from "@/stores/locale-store";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const { locale } = useLocaleStore();

  const userRole = (session?.user as any)?.role || "INTERN";
  const userName = session?.user?.name || "User";

  const navItems = [
    {
      href: "/dashboard",
      label: locale === "en" ? "Dashboard" : "仪表板",
      icon: LayoutDashboard,
    },
    {
      href: "/events",
      label: locale === "en" ? "Events" : "展会列表",
      icon: CalendarDays,
    },
    {
      href: "/scraper",
      label: locale === "en" ? "Scraper" : "数据抓取器",
      icon: Bot,
    },
    {
      href: "/reports",
      label: locale === "en" ? "Reports" : "报告导出",
      icon: FileSpreadsheet,
    },
    {
      href: "/queues",
      label: locale === "en" ? "Queues" : "审核队列",
      icon: ListTodo,
    },
    {
      href: "/history",
      label: locale === "en" ? "History" : "历史记录",
      icon: History,
    },
    {
      href: "/users",
      label: locale === "en" ? "User Management" : "用户管理",
      icon: Users,
    },
    {
      href: "/settings",
      label: locale === "en" ? "Settings" : "设置",
      icon: Settings,
    },
  ];

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-[#FFB347] text-[#133020] font-bold";
      case "SUPERVISOR":
        return "bg-[#046241] text-white font-bold";
      default:
        return "bg-[#708E7C] text-white font-medium";
    }
  };

  return (
    <aside
      className={`bg-white text-[#133020] flex flex-col justify-between transition-all duration-200 ease-in-out relative z-30 h-screen sticky top-0 shadow-xl border-r border-[#133020]/10 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 w-6 h-6 bg-[#FFB347] text-[#133020] rounded-full flex items-center justify-center shadow-md hover:bg-[#FFC370] transition z-40"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Top Header & Logo */}
      <div>
        <div className="p-1.5 flex flex-col items-start gap-2 border-b border-[#133020]/10">
          <div className="relative w-full h-5">
            <Image
              src="/logo.png"
              alt="Lifewood logo"
              fill
              className="object-contain object-left"
            />
          </div>
          {!collapsed && (
            <div>
              <p className="text-[10px] text-[#133020]/60 uppercase tracking-wider font-bold">
                {locale === "en" ? "Exhibition Intelligence" : "全球展会智能平台"}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 relative ${
                  isActive
                    ? "bg-[#FFB347]/15 text-[#133020] border-l-4 border-[#FFB347] pl-2.5 font-semibold"
                    : "text-[#133020]/65 hover:bg-[#133020]/5 hover:text-[#133020]"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? "text-[#FFB347]" : "text-[#133020]/65"
                  }`}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Role */}
      <div className="p-4 border-t border-[#133020]/10 bg-[#133020]/5">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#046241] flex items-center justify-center text-xs font-bold text-white shrink-0 border border-[#133020]/20">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-[#133020] truncate">
                  {userName}
                </p>
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider mt-0.5 ${getRoleBadgeStyle(
                    userRole
                  )}`}
                >
                  {userRole}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign Out"
              className="p-2 text-[#133020]/60 hover:text-[#FFB347] hover:bg-[#133020]/5 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={`Sign Out (${userName})`}
            className="w-full flex justify-center p-2 text-[#133020]/60 hover:text-[#FFB347] hover:bg-[#133020]/5 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
}