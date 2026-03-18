"use client";

import { useState } from "react";
import { updateUserRole, inviteUser, deleteUser } from "@/lib/actions/profile";
import {
  Shield,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Loader2,
  UserPlus,
  Mail,
  Trash2,
} from "lucide-react";
import { useDict } from "@/lib/i18n/context";

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  company_id: string | null;
}

const selectClass =
  "w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm transition-all duration-150 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20";

const inputClass =
  "w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm transition-all duration-150 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20";

export default function RoleManager({
  profiles,
  currentUserId,
  callerRole,
}: {
  profiles: Profile[];
  currentUserId: string;
  callerRole: string;
}) {
  const dict = useDict();
  const tp = dict.adminProfile;
  const [open, setOpen] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Invite form state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("buyer");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const isSuperAdmin = callerRole === "superadmin";

  async function handleRoleChange(userId: string, newRole: string) {
    setSavingId(userId);
    setError(null);
    setSuccessId(null);

    const result = await updateUserRole(userId, newRole);

    setSavingId(null);
    if (result.success) {
      setSuccessId(userId);
      setTimeout(() => setSuccessId(null), 2000);
    } else {
      setError(result.error || tp.roleUpdateError);
    }
  }

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInviting(true);
    setError(null);
    setInviteSuccess(false);

    const result = await inviteUser(inviteEmail.trim(), inviteRole, inviteName.trim());

    setInviting(false);
    if (result.success) {
      setInviteSuccess(true);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("buyer");
      setTimeout(() => {
        setInviteSuccess(false);
        setShowInvite(false);
      }, 3000);
    } else {
      setError(result.error || tp.roleUpdateError);
    }
  }

  async function handleDeleteUser(userId: string, displayName: string) {
    const confirmMsg = tp.deleteUserConfirm.replace("{name}", displayName);
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(userId);
    setError(null);

    const result = await deleteUser(userId);

    setDeletingId(null);
    if (!result.success) {
      setError(result.error || tp.deleteUserError);
    }
  }

  const roleLabel = (role: string) => {
    if (role === "superadmin") return tp.roleSuperAdmin;
    if (role === "admin") return tp.roleAdmin;
    return tp.roleBuyer;
  };

  const roleBadgeClass = (role: string) => {
    if (role === "superadmin")
      return "bg-swing-navy text-white";
    if (role === "admin")
      return "bg-swing-gold/20 text-swing-navy";
    return "bg-gray-100 text-swing-navy/60";
  };

  function canEditUser(p: Profile) {
    if (p.id === currentUserId) return false;
    // Admins cannot edit superadmins
    if (!isSuperAdmin && p.role === "superadmin") return false;
    return true;
  }

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-3.5 transition-colors hover:bg-gray-50 sm:px-6 sm:py-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
            <Shield size={16} strokeWidth={1.75} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-swing-navy">
              {tp.roleManagement}
            </h3>
            <p className="text-[11px] text-swing-navy/40">
              {tp.roleManagementHint}
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp size={18} className="text-swing-navy/30" />
        ) : (
          <ChevronDown size={18} className="text-swing-navy/30" />
        )}
      </button>

      {open && (
        <div className="p-4 sm:p-6">
          {error && (
            <p className="mb-4 text-sm font-medium text-red-600">{error}</p>
          )}

          {/* Invite new user button */}
          {!showInvite && (
            <button
              type="button"
              onClick={() => setShowInvite(true)}
              className="mb-4 flex items-center gap-2 rounded bg-swing-gold px-3.5 py-2 text-sm font-semibold text-swing-navy transition-colors hover:bg-swing-gold-dark"
            >
              <UserPlus size={15} />
              {tp.inviteUser}
            </button>
          )}

          {/* Invite form */}
          {showInvite && (
            <form onSubmit={handleInvite} className="mb-5 rounded-lg border border-swing-gold/30 bg-swing-gold/5 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-swing-navy">
                <UserPlus size={15} />
                {tp.inviteUser}
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-swing-navy/50">
                    {tp.inviteName}
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Max Mustermann"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-swing-navy/50">
                    {tp.inviteEmail}
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@beispiel.de"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-swing-navy/50">
                    {tp.role}
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className={selectClass}
                  >
                    {isSuperAdmin && (
                      <option value="superadmin">{tp.roleSuperAdmin}</option>
                    )}
                    <option value="admin">{tp.roleAdmin}</option>
                    <option value="buyer">{tp.roleBuyer}</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex items-center gap-2 rounded bg-swing-gold px-3.5 py-2 text-sm font-semibold text-swing-navy transition-colors hover:bg-swing-gold-dark disabled:opacity-60"
                >
                  {inviting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Mail size={14} />
                  )}
                  {inviting ? tp.inviting : tp.inviteSend}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="rounded px-3 py-2 text-sm font-medium text-swing-navy/50 transition-colors hover:text-swing-navy"
                >
                  {tp.inviteCancel}
                </button>
                {inviteSuccess && (
                  <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <CheckCircle size={14} />
                    {tp.inviteSuccess}
                  </span>
                )}
              </div>
            </form>
          )}

          {/* User list */}
          {profiles.length === 0 ? (
            <p className="text-sm text-swing-navy/40">{tp.noUsers}</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {profiles.map((p) => {
                const isCurrentUser = p.id === currentUserId;
                const editable = canEditUser(p);
                return (
                  <div
                    key={p.id}
                    className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-swing-navy">
                          {p.full_name || p.email}
                        </p>
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleBadgeClass(p.role)}`}
                        >
                          {roleLabel(p.role)}
                        </span>
                        {successId === p.id && (
                          <CheckCircle
                            size={14}
                            className="text-green-600"
                          />
                        )}
                      </div>
                      <p className="truncate text-xs text-swing-navy/40">
                        {p.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:w-48">
                      {isCurrentUser ? (
                        <span className="text-xs text-swing-navy/30 italic">
                          ({roleLabel(callerRole)})
                        </span>
                      ) : !editable ? (
                        <span className="text-xs text-swing-navy/30 italic">
                          {tp.roleSuperAdmin}
                        </span>
                      ) : savingId === p.id ? (
                        <Loader2
                          size={16}
                          className="animate-spin text-swing-navy/40"
                        />
                      ) : (
                        <select
                          value={p.role}
                          onChange={(e) =>
                            handleRoleChange(p.id, e.target.value)
                          }
                          className={selectClass}
                        >
                          {isSuperAdmin && (
                            <option value="superadmin">
                              {tp.roleSuperAdmin}
                            </option>
                          )}
                          <option value="admin">{tp.roleAdmin}</option>
                          <option value="buyer">{tp.roleBuyer}</option>
                        </select>
                      )}
                    </div>
                    {isSuperAdmin && !isCurrentUser && (
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(p.id, p.full_name || p.email)}
                        disabled={deletingId === p.id}
                        className="flex cursor-pointer items-center gap-1 rounded px-2 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {deletingId === p.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                        {tp.deleteUser}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
