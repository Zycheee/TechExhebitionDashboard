"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Settings, Shield, User, Key, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocaleStore } from "@/stores/locale-store";

export default function SettingsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "INTERN";
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "user@lifewood.com";
  const { locale } = useLocaleStore();

  const [activeTab, setActiveTab] = useState<"general" | "security">("general");

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to change password.");
      }
    } catch {
      toast.error("An error occurred while updating your password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-manrope">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D8D2C8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#046241]" />
            <h2 className="text-2xl font-bold text-[#133020]">
              {locale === "en" ? "System Configuration & Account Settings" : "系统配置与账户设置"}
            </h2>
          </div>
          <p className="text-xs text-[#333333] mt-0.5">
            {locale === "en"
              ? "Manage administrator profiles, RBAC governance, and credential security"
              : "管理管理员档案、权限控制与系统凭证安全"}
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[#D8D2C8] pb-1">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 text-xs font-semibold transition border-b-2 ${
            activeTab === "general"
              ? "text-[#133020] border-[#133020]"
              : "text-[#666666] hover:text-[#046241] border-transparent"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{locale === "en" ? "General & Roles" : "个人信息与角色"}</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 text-xs font-semibold transition border-b-2 ${
            activeTab === "security"
              ? "text-[#133020] border-[#133020]"
              : "text-[#666666] hover:text-[#046241] border-transparent"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>{locale === "en" ? "Security & Password" : "安全与密码管理"}</span>
          </div>
        </button>
      </div>

      {activeTab === "general" ? (
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-white p-6 rounded-xl border border-[#D8D2C8] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D8D2C8] pb-3">
              <User className="w-5 h-5 text-[#046241]" />
              <h3 className="text-base font-bold text-[#133020]">
                {locale === "en" ? "User Profile Information" : "用户档案信息"}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-[#666666] uppercase font-bold block">
                  {locale === "en" ? "Full Name" : "姓名"}
                </span>
                <span className="font-bold text-[#133020] text-sm">{userName}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#666666] uppercase font-bold block">
                  {locale === "en" ? "Email Address" : "邮箱地址"}
                </span>
                <span className="font-bold text-[#133020] text-sm">{userEmail}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#666666] uppercase font-bold block">
                  {locale === "en" ? "Assigned Role" : "系统角色"}
                </span>
                <span className="inline-block px-2.5 py-0.5 rounded bg-[#FFB347] text-[#133020] font-bold text-xs mt-0.5">
                  {userRole}
                </span>
              </div>
            </div>
          </div>

          {/* Role Access Matrix */}
          <div className="bg-white p-6 rounded-xl border border-[#D8D2C8] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D8D2C8] pb-3">
              <Shield className="w-5 h-5 text-[#046241]" />
              <h3 className="text-base font-bold text-[#133020]">
                {locale === "en" ? "System Role Access Control Matrix" : "系统角色权限矩阵"}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#133020] text-white font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-2.5">Platform Action</th>
                    <th className="p-2.5 text-center">Admin</th>
                    <th className="p-2.5 text-center">Supervisor</th>
                    <th className="p-2.5 text-center">Intern</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D2C8]">
                  <tr>
                    <td className="p-2.5 font-semibold text-[#133020]">View Dashboard & Exhibition Records</td>
                    <td className="p-2.5 text-center text-[#046241] font-bold">✅</td>
                    <td className="p-2.5 text-center text-[#046241] font-bold">✅</td>
                    <td className="p-2.5 text-center text-[#046241] font-bold">✅</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[#133020]">Add New Event (Draft / Review)</td>
                    <td className="p-2.5 text-center text-[#046241] font-bold">✅</td>
                    <td className="p-2.5 text-center text-[#046241] font-bold">✅</td>
                    <td className="p-2.5 text-center text-[#046241] font-bold">✅</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[#133020]">Publish Event Directly</td>
                    <td className="p-2.5 text-center text-[#046241] font-bold">✅</td>
                    <td className="p-2.5 text-center text-[#046241] font-bold">✅</td>
                    <td className="p-2.5 text-center text-[#B91C1C] font-bold">❌</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[#133020]">Approve Queue Items & Edits</td>
                    <td className="p-2.5 text-center text-[#046241] font-bold">✅</td>
                    <td className="p-2.5 text-center text-[#046241] font-bold">✅</td>
                    <td className="p-2.5 text-center text-[#B91C1C] font-bold">❌</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[#133020]">Delete Exhibition Record</td>
                    <td className="p-2.5 text-center text-[#046241] font-bold">✅</td>
                    <td className="p-2.5 text-center text-[#B91C1C] font-bold">❌</td>
                    <td className="p-2.5 text-center text-[#B91C1C] font-bold">❌</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Security Tab: Dedicated Change Password Section */
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#D8D2C8] shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-[#D8D2C8] pb-3">
            <Lock className="w-5 h-5 text-[#046241]" />
            <div>
              <h3 className="text-base font-bold text-[#133020]">
                {locale === "en" ? "Change Administrator Password" : "修改管理员密码"}
              </h3>
              <p className="text-xs text-[#666666]">
                {locale === "en"
                  ? "Ensure your account is protected with a strong, distinct password"
                  : "设置高强度密码以保障系统管理安全"}
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#133020] mb-1.5">
                {locale === "en" ? "Current Password" : "当前密码"}
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D2C8] text-xs text-[#133020] bg-white focus:outline-none focus:border-[#046241] focus:ring-2 focus:ring-[#046241]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#133020] mb-1.5">
                {locale === "en" ? "New Password (min 6 chars)" : "新密码 (至少6位字符)"}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D2C8] text-xs text-[#133020] bg-white focus:outline-none focus:border-[#046241] focus:ring-2 focus:ring-[#046241]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#133020] mb-1.5">
                {locale === "en" ? "Confirm New Password" : "确认新密码"}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D2C8] text-xs text-[#133020] bg-white focus:outline-none focus:border-[#046241] focus:ring-2 focus:ring-[#046241]/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#133020] hover:bg-[#133020]/90 text-white hover:text-[#FFB347] font-semibold text-xs rounded-lg transition-all duration-180 shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <Key className="w-4 h-4 text-[#FFB347]" />
              <span>
                {submitting
                  ? (locale === "en" ? "Updating password..." : "正在修改...")
                  : (locale === "en" ? "Update Password" : "确认修改密码")}
              </span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
