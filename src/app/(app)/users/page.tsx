"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ModalPortal } from "@/components/shared/modal-portal";
import { Users, UserPlus, Shield, Trash2, Edit, Loader2, Check, X, Key, Search, Sparkles, Lock, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useLocaleStore } from "@/stores/locale-store";

export default function UsersPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "INTERN";
  const { locale } = useLocaleStore();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<any | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [resetting, setResetting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "INTERN",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        toast.error(data.error || "Failed to fetch users");
      }
    } catch {
      toast.error("Error loading user administration list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`User "${formData.name}" created successfully!`);
        setShowAddModal(false);
        setFormData({ name: "", email: "", password: "", role: "INTERN" });
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to create user");
      }
    } catch {
      toast.error("Error creating user account");
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("User role updated successfully!");
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to update role");
      }
    } catch {
      toast.error("Error updating user role");
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;

    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`User "${userName}" deleted.`);
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to delete user");
      }
    } catch {
      toast.error("Error deleting user account");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || !newPasswordValue) return;
    if (newPasswordValue.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setResetting(true);
    try {
      const res = await fetch(`/api/users/${resetPasswordUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPasswordValue }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Password updated for "${resetPasswordUser.name}"!`);
        setResetPasswordUser(null);
        setNewPasswordValue("");
      } else {
        toast.error(data.error || "Failed to update password");
      }
    } catch {
      toast.error("Error updating user password");
    } finally {
      setResetting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const supervisorCount = users.filter((u) => u.role === "SUPERVISOR").length;
  const internCount = users.filter((u) => u.role === "INTERN").length;

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-[#FFB347] text-[#133020] font-extrabold";
      case "SUPERVISOR":
        return "bg-[#046241] text-white font-extrabold";
      default:
        return "bg-[#708E7C] text-white font-semibold";
    }
  };

  return (
    <div className="space-y-6 font-manrope">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#046241]/10 border border-[#046241]/30 flex items-center justify-center text-[#046241]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#133020]">
                {locale === "en" ? "User Management & RBAC Governance" : "用户管理与权限控制"}
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Administer platform accounts, role-based access controls, and security credentials
              </p>
            </div>
          </div>
        </div>

        {userRole === "ADMIN" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FFB347] hover:bg-[#FFC370] text-[#133020] font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{locale === "en" ? "Create New Account" : "创建新账号"}</span>
          </button>
        )}
      </div>

      {/* Role Summary Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#D8D2C8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block">Total Users</span>
            <span className="text-2xl font-extrabold text-[#133020]">{users.length}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#133020]/10 flex items-center justify-center text-[#133020]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D8D2C8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block">Admins</span>
            <span className="text-2xl font-extrabold text-[#133020]">{adminCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FFB347]/20 flex items-center justify-center text-[#133020]">
            <Shield className="w-5 h-5 text-[#C17110]" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D8D2C8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block">Supervisors</span>
            <span className="text-2xl font-extrabold text-[#133020]">{supervisorCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#046241]/10 flex items-center justify-center text-[#046241]">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D8D2C8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block">Interns</span>
            <span className="text-2xl font-extrabold text-[#133020]">{internCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#708E7C]/15 flex items-center justify-center text-[#708E7C]">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-[#D8D2C8]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#999999] absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search accounts by name, email, or role..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D8D2C8] bg-[#F9F7F7] text-xs text-[#133020] placeholder-[#999999] focus:outline-none focus:border-[#046241] focus:bg-white transition"
          />
        </div>
        <span className="text-xs font-semibold text-[#666666]">
          Showing {filteredUsers.length} accounts
        </span>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#046241]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-xs font-semibold text-[#133020]">
            Loading registered system accounts...
          </span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#D8D2C8] shadow-xs overflow-hidden">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#133020] text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 px-4">User</th>
                <th className="p-3.5 px-4">Email Address</th>
                <th className="p-3.5 px-4">Assigned Role</th>
                <th className="p-3.5 px-4">Joined Date</th>
                <th className="p-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D2C8]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#F9F7F7] transition">
                  <td className="p-3.5 px-4 font-bold text-[#133020]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#046241] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-[#133020]">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 px-4 text-[#666666] font-medium">{u.email}</td>
                  <td className="p-3.5 px-4">
                    {editingUser?.id === u.id ? (
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                        className="px-2 py-1 border border-[#D8D2C8] rounded-lg text-xs text-[#133020] bg-white font-bold cursor-pointer"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPERVISOR">SUPERVISOR</option>
                        <option value="INTERN">INTERN</option>
                      </select>
                    ) : (
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase ${getRoleBadgeStyle(u.role)}`}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 px-4 text-[#666666]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 px-4 text-right">
                    {userRole === "ADMIN" ? (
                      <div className="flex items-center justify-end gap-2">
                        {editingUser?.id === u.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateRole(u.id, editingUser.role)}
                              className="p-1.5 bg-[#046241] text-white rounded-lg hover:bg-[#133020] transition"
                              title="Save Role"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="p-1.5 bg-gray-200 text-[#133020] rounded-lg hover:bg-gray-300 transition"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingUser(u)}
                              className="px-2.5 py-1 text-[#046241] bg-[#046241]/10 hover:bg-[#046241]/20 rounded-lg transition font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Change Role"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Role</span>
                            </button>

                            <button
                              onClick={() => {
                                setResetPasswordUser(u);
                                setNewPasswordValue("");
                              }}
                              className="px-2.5 py-1 text-[#C17110] bg-[#FFB347]/15 hover:bg-[#FFB347]/30 rounded-lg transition font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Reset Password"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>Password</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 text-[#B91C1C] hover:bg-[#B91C1C]/10 rounded-lg transition font-medium cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#666666] italic">View Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      <ModalPortal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="bg-[#133020] text-white p-5 px-7 flex items-center justify-between shrink-0 border-b border-white/10 font-manrope">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFB347] text-[#133020] flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {locale === "en" ? "Register New Account" : "注册新用户账号"}
              </h3>
              <p className="text-[10px] text-[#F5EEDB]/70 uppercase tracking-wider">
                System Account Provisioning
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

        <div className="p-6 sm:p-8 bg-white font-manrope space-y-4">
          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#133020] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Wong"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#D8D2C8] rounded-xl text-xs bg-[#F9F7F7] focus:bg-white focus:outline-none focus:border-[#046241]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#133020] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="alex@lifewood.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#D8D2C8] rounded-xl text-xs bg-[#F9F7F7] focus:bg-white focus:outline-none focus:border-[#046241]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#133020] uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#D8D2C8] rounded-xl text-xs bg-[#F9F7F7] focus:bg-white focus:outline-none focus:border-[#046241]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#133020] uppercase tracking-wider mb-1">
                System Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#D8D2C8] rounded-xl text-xs bg-white font-bold cursor-pointer"
              >
                <option value="INTERN">INTERN (Submit & View Catalog Only)</option>
                <option value="SUPERVISOR">SUPERVISOR (Approve & Manage Records)</option>
                <option value="ADMIN">ADMIN (Full Administrative Control)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-[#D8D2C8] rounded-xl text-xs text-[#666666] font-bold hover:bg-[#F9F7F7]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#FFB347] hover:bg-[#FFC370] text-[#133020] font-bold text-xs rounded-xl transition shadow-sm"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>

      {/* Reset Password Modal */}
      <ModalPortal isOpen={!!resetPasswordUser} onClose={() => setResetPasswordUser(null)}>
        <div className="bg-[#133020] text-white p-5 px-7 flex items-center justify-between shrink-0 border-b border-white/10 font-manrope">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFB347] text-[#133020] flex items-center justify-center font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Reset Account Password
              </h3>
              <p className="text-[10px] text-[#F5EEDB]/70 uppercase tracking-wider">
                {resetPasswordUser?.name} ({resetPasswordUser?.email})
              </p>
            </div>
          </div>
          <button
            onClick={() => setResetPasswordUser(null)}
            className="p-2 rounded-xl bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transform hover:rotate-90 transition duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 bg-white font-manrope space-y-4">
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#133020] uppercase tracking-wider mb-1.5">
                New Security Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Enter at least 6 characters"
                value={newPasswordValue}
                onChange={(e) => setNewPasswordValue(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#D8D2C8] rounded-xl text-xs bg-[#F9F7F7] text-[#133020] focus:bg-white focus:outline-none focus:border-[#046241]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResetPasswordUser(null)}
                className="px-4 py-2 border border-[#D8D2C8] rounded-xl text-xs text-[#666666] font-bold hover:bg-[#F9F7F7]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resetting}
                className="px-5 py-2.5 bg-[#133020] hover:bg-[#046241] text-white font-bold text-xs rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {resetting ? "Updating Password..." : "Set New Password"}
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>
    </div>
  );
}
