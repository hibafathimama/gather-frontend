"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Search, 
  ArrowLeft, 
  Trash2, 
  ShieldAlert, 
  Loader2, 
  AlertCircle, 
  CheckCircle2 
} from "lucide-react";
import api from "@/lib/api";
import AdminNavbar from "@/components/AdminNavbar";

interface UserType {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  image?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const backendOrigin =
    process.env.NEXT_PUBLIC_BACKEND_URL?.endsWith("/api")
      ? process.env.NEXT_PUBLIC_BACKEND_URL.slice(0, -4)
      : process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");
      setUsers(response.data.data || []);
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" &&
        err !== null &&
        "response" in err
          ? String(
              (err as { response?: { data?: { message?: string } } })
                .response?.data?.message || "Failed to fetch users"
            )
          : "Unable to connect to the server.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return users.filter((user) => {
      const fullName = `${user.firstName || ""} ${
        user.lastName || ""
      }`.toLowerCase();

      return (
        fullName.includes(searchText) ||
        user.email.toLowerCase().includes(searchText) ||
        user.role.toLowerCase().includes(searchText)
      );
    });
  }, [users, search]);

  const handleDelete = async (user: UserType) => {
    const fullName = `${user.firstName} ${user.lastName}`.trim();

    if (user.role === "admin") {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${fullName || user.email}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(user._id);
      setError("");
      setMessage("");

      await api.delete(`/admin/users/${user._id}`);

      setUsers((previousUsers) =>
        previousUsers.filter((item) => item._id !== user._id)
      );

      setMessage("User deleted successfully.");
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" &&
        err !== null &&
        "response" in err
          ? String(
              (err as { response?: { data?: { message?: string } } })
                .response?.data?.message || "Failed to delete user"
            )
          : "Unable to connect to the server.";

      setError(errorMessage);
    } finally {
      setDeletingId("");
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');

        .editorial-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          letter-spacing: -0.02em;
        }
      `}</style>

      <AdminNavbar />

      <main className="min-h-screen bg-[#FFECD1] px-4 py-10 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] md:p-12">
        <div className="mx-auto max-w-7xl">
          
          {/* Header Section */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#F5D8B3] pb-6">
            <div>
              <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
                Platform Directory
              </span>
              <h1 className="editorial-heading text-4xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
                Manage Users
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                View, search, and manage registered platform accounts and organizers.
              </p>
            </div>

            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-stone-50"
            >
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
          </div>

          {/* Stats Overview Cards */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <Users className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Accounts</p>
              <p className="editorial-heading mt-1 text-4xl font-bold text-[#3E000C]">{users.length}</p>
            </div>

            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <UserCheck className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Users</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Standard Users</p>
              <p className="editorial-heading mt-1 text-4xl font-bold text-[#3E000C]">
                {users.filter((user) => user.role === "user").length}
              </p>
            </div>

            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Organizers</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Event Organizers</p>
              <p className="editorial-heading mt-1 text-4xl font-bold text-[#3E000C]">
                {users.filter((user) => user.role === "organizer").length}
              </p>
            </div>
          </div>

          {/* Search & Content Container */}
          <div className="rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm">
            <div className="mb-6">
              <label
                htmlFor="user-search"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
              >
                Search Platform Users
              </label>

              <div className="relative">
                <input
                  id="user-search"
                  type="text"
                  placeholder="Search by name, email, or role..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                {message}
              </div>
            )}

            {/* Table States */}
            {loading ? (
              <div className="flex items-center justify-center py-20 text-stone-600 font-medium">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#3E000C]" />
                Loading users directory...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-12 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-stone-400" />
                <p className="text-stone-600 font-medium">
                  {search ? "No matching users found." : "No users found."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50/70 text-xs font-bold uppercase tracking-wider text-stone-500">
                      <th className="px-4 py-3.5">User Profile</th>
                      <th className="px-4 py-3.5">Email Address</th>
                      <th className="px-4 py-3.5">Role</th>
                      <th className="px-4 py-3.5">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100">
                    {filteredUsers.map((user) => {
                      const fullName =
                        `${user.firstName || ""} ${
                          user.lastName || ""
                        }`.trim() || "Unnamed user";

                      const imageSrc = user.image
                        ? user.image.startsWith("http")
                          ? user.image
                          : `${backendOrigin}${
                              user.image.startsWith("/")
                                ? user.image
                                : `/${user.image}`
                            }`
                        : "";

                      return (
                        <tr
                          key={user._id}
                          className="transition hover:bg-stone-50/50"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={fullName}
                                  className="h-11 w-11 rounded-2xl border-2 border-[#F5D8B3] object-cover shadow-sm"
                                />
                              ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFECD1] text-[#3E000C] font-bold border border-[#F5D8B3]">
                                  {fullName.charAt(0).toUpperCase()}
                                </div>
                              )}

                              <span className="font-bold text-stone-900">{fullName}</span>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm text-stone-600 font-medium">
                            {user.email}
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-full bg-[#3E000C]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                              {user.role}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              disabled={
                                user.role === "admin" ||
                                deletingId === user._id
                              }
                              title={
                                user.role === "admin"
                                  ? "Admin accounts cannot be deleted"
                                  : "Delete user"
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
                            >
                              {deletingId === user._id ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...
                                </>
                              ) : user.role === "admin" ? (
                                <>
                                  <ShieldAlert className="h-3.5 w-3.5" /> Protected
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-3.5 w-3.5" /> Delete
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
}