"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ModalPortal } from "@/components/shared/modal-portal";
import { Users, UserPlus, Shield, Trash2, Edit, Loader2, Check, X, Key } from "lucide-react";
import { toast } from "sonner";
import { useLocaleStore } from "@/stores/locale-store";
import { LifewoodDropdown } from "@/components/shared/lifewood-dropdown";

export default function UsersPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "INTERN";
  const { locale } = useLocaleStore();

  const roleOptionsTable = [
    { value: "ADMIN", label: "ADMIN" },
    { value: "SUPERVISOR", label: "SUPERVISOR" },
    { value: "INTERN", label: "INTERN" },
  ];

  const roleOptionsModal = [
    { value: "INTERN", label: "INTERN (Submit & View Only)" },
    { value: "SUPERVISOR", label: "SUPERVISOR (Approve & Manage)" },
    { value: "ADMIN", label: "ADMIN (Full Control)" },
  ];

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        toast.success("User role updated!");
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
    <div className="space-y-6 font-manrope">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#046241]" />
            <h2 className="text-2xl font-bold text-[#133020]">
              {locale === "en" ? "User Management & RBAC Governance" : "用户管理与权限控制"}
            </h2>
          </div>
          <p className="text-xs text-[#333333] mt-0.5">
            Administer system accounts, assign roles (Admin, Supervisor, Intern), and control platform capabilities
          </p>
        </div>

        {userRole === "ADMIN" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FFB347] hover:bg-[#FFC370] text-[#133020] font-bold text-xs rounded-lg transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>{locale === "en" ? "Create New User" : "创建新用户"}</span>
          </button>
        )}
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#046241]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-xs font-semibold text-[#133020]">
            Loading registered users...
          </span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#D8D2C8] shadow-xs overflow-hidden">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#133020] text-white font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">User</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Joined Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D2C8]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#F9F7F7] transition">
                  <td className="p-3.5 font-bold text-[#133020]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#046241] text-white flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-[#666666] font-medium">{u.email}</td>
                  <td className="p-3.5">
                    {editingUser?.id === u.id ? (
                      <LifewoodDropdown
                        variant="compact"
                        value={editingUser.role}
                        onChange={(val) => setEditingUser({ ...editingUser, role: val })}
                        options={roleOptionsTable}
                        aria-label="Edit User Role"
                      />
                    ) : (
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] uppercase ${getRoleBadgeStyle(u.role)}`}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-[#666666]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right">
                    {userRole === "ADMIN" ? (
                      <div className="flex items-center justify-end gap-2">
                        {editingUser?.id === u.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateRole(u.id, editingUser.role)}
                              className="p-1 bg-[#046241] text-white rounded hover:bg-[#133020] transition"
                              title="Save Role"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="p-1 bg-gray-200 text-[#133020] rounded hover:bg-gray-300 transition"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingUser(u)}
                              className="p-1.5 text-[#046241] hover:bg-[#046241]/10 rounded-lg transition font-medium flex items-center gap-1"
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
                              className="p-1.5 text-[#C17110] hover:bg-[#FFB347]/15 rounded-lg transition font-medium flex items-center gap-1"
                              title="Change / Reset Password"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>Password</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 text-[#B91C1C] hover:bg-[#B91C1C]/10 rounded-lg transition font-medium flex items-center gap-1"
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
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8D2C8] pb-3">
            <h3 className="text-base font-bold text-[#133020]">
              {locale === "en" ? "Register New User Account" : "注册新用户账号"}
            </h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-[#666666] hover:text-[#133020] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
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
                className="w-full px-3 py-2 border border-[#D8D2C8] rounded-lg text-xs"
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
                className="w-full px-3 py-2 border border-[#D8D2C8] rounded-lg text-xs"
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
                className="w-full px-3 py-2 border border-[#D8D2C8] rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[#133020] uppercase tracking-wider mb-1">
                System Role
              </label>
              <LifewoodDropdown
                value={formData.role}
                onChange={(val) => setFormData({ ...formData, role: val })}
                options={roleOptionsModal}
                aria-label="System Role"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-[#D8D2C8] rounded-lg text-xs text-[#666666] font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FFB347] hover:bg-[#FFC370] text-[#133020] font-bold text-xs rounded-lg transition"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>

      {/* Reset Password Modal */}
      <ModalPortal isOpen={!!resetPasswordUser} onClose={() => setResetPasswordUser(null)}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8D2C8] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#133020]">
                {locale === "en" ? "Reset / Change User Password" : "重置/修改用户密码"}
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">
                Set a new password for {resetPasswordUser?.name} ({resetPasswordUser?.email})
              </p>
            </div>
            <button
              onClick={() => setResetPasswordUser(null)}
              className="text-[#666666] hover:text-[#133020] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#133020] uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Enter at least 6 characters"
                value={newPasswordValue}
                onChange={(e) => setNewPasswordValue(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#D8D2C8] rounded-lg text-xs bg-white text-[#133020] focus:outline-none focus:border-[#046241]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetPasswordUser(null)}
                className="px-4 py-2 border border-[#D8D2C8] rounded-lg text-xs text-[#666666] font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resetting}
                className="px-4 py-2 bg-[#133020] hover:bg-[#133020]/90 text-white hover:text-[#FFB347] font-bold text-xs rounded-lg transition disabled:opacity-50"
              >
                {resetting ? "Updating..." : "Set New Password"}
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>
    </div>
  );
}
