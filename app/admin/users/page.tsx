"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  ShieldCheck,
  Search,
  ArrowLeft,
  ShieldAlert,
  Loader2,
  AlertCircle,
  CheckCircle2,
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
  isActive?: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const backendOrigin =
    process.env.NEXT_PUBLIC_BACKEND_URL?.endsWith("/api")
      ? process.env.NEXT_PUBLIC_BACKEND_URL.slice(0, -4)
      : process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");

      setUsers(response.data.data || []);
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" && err !== null && "response" in err
          ? String(
              (
                err as {
                  response?: {
                    data?: {
                      message?: string;
                    };
                  };
                }
              ).response?.data?.message || "Failed to fetch users"
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

  // Search and filter active users
  const filteredActiveUsers = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return users.filter((user) => {
      const fullName = `${user.firstName || ""} ${
        user.lastName || ""
      }`.toLowerCase();

      const matchesSearch =
        fullName.includes(searchText) ||
        user.email.toLowerCase().includes(searchText) ||
        user.role.toLowerCase().includes(searchText);

      return user.isActive !== false && matchesSearch;
    });
  }, [users, search]);

  // Search and filter inactive users
  const filteredInactiveUsers = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return users.filter((user) => {
      const fullName = `${user.firstName || ""} ${
        user.lastName || ""
      }`.toLowerCase();

      const matchesSearch =
        fullName.includes(searchText) ||
        user.email.toLowerCase().includes(searchText) ||
        user.role.toLowerCase().includes(searchText);

      return user.isActive === false && matchesSearch;
    });
  }, [users, search]);

  // Activate / Deactivate user account
  const handleToggleStatus = async (user: UserType) => {
    const fullName = `${user.firstName} ${user.lastName}`.trim();

    if (user.role === "admin") {
      return;
    }

    const isCurrentlyActive = user.isActive !== false;

    const action = isCurrentlyActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${
        fullName || user.email
      }'s account?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(user._id);
      setError("");
      setMessage("");

      const response = await api.patch(
        `/admin/users/${user._id}/toggle-status`
      );

      const updatedStatus = response.data.data.isActive;

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item._id === user._id
            ? {
                ...item,
                isActive: updatedStatus,
              }
            : item
        )
      );

      setMessage(
        response.data.message ||
          "User account status updated successfully."
      );
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" && err !== null && "response" in err
          ? String(
              (
                err as {
                  response?: {
                    data?: {
                      message?: string;
                    };
                  };
                }
              ).response?.data?.message ||
                "Failed to update account status"
            )
          : "Unable to connect to the server.";

      setError(errorMessage);
    } finally {
      setUpdatingId("");
    }
  };

  // Get user profile image
  const getImageSrc = (user: UserType) => {
    if (!user.image) return "";

    return user.image.startsWith("http")
      ? user.image
      : `${backendOrigin}${
          user.image.startsWith("/")
            ? user.image
            : `/${user.image}`
        }`;
  };

  // User name
  const getFullName = (user: UserType) => {
    return (
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "Unnamed user"
    );
  };

  // Reusable user card
  const renderUserCard = (user: UserType) => {
    const fullName = getFullName(user);
    const isActive = user.isActive !== false;
    const imageSrc = getImageSrc(user);

    return (
      <article
        key={user._id}
        className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
      >
        {/* User Profile */}
        <div className="flex min-w-0 items-center gap-3 border-b border-stone-100 pb-4">

          {imageSrc ? (
            <img
              src={imageSrc}
              alt={fullName}
              className="h-12 w-12 shrink-0 rounded-2xl border-2 border-[#F5D8B3] object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#F5D8B3] bg-[#FFECD1] font-bold text-[#3E000C]">
              {fullName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="break-words text-sm font-bold text-stone-900">
              {fullName}
            </p>

            <p className="mt-1 break-all text-xs text-stone-500">
              {user.email}
            </p>
          </div>
        </div>

        {/* Role and Status */}
        <div className="mt-4 grid grid-cols-2 gap-3">

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Role
            </p>

            <span className="mt-2 inline-block max-w-full truncate rounded-full bg-[#3E000C]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#3E000C]">
              {user.role}
            </span>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Account Status
            </p>

            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

        </div>

        {/* Activate / Deactivate Button */}
        <div className="mt-5 border-t border-stone-100 pt-4">

          <button
            type="button"
            onClick={() => handleToggleStatus(user)}
            disabled={
              user.role === "admin" ||
              updatingId === user._id
            }
            title={
              user.role === "admin"
                ? "Admin account cannot be changed"
                : isActive
                ? "Deactivate account"
                : "Activate account"
            }
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 ${
              isActive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {updatingId === user._id ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : user.role === "admin" ? (
              <>
                <ShieldAlert className="h-4 w-4" />
                Protected
              </>
            ) : isActive ? (
              <>
                <ShieldAlert className="h-4 w-4" />
                Deactivate Account
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4" />
                Activate Account
              </>
            )}
          </button>

        </div>
      </article>
    );
  };

  // Reusable users section
  const renderUsersSection = (
    userList: UserType[],
    type: "active" | "inactive"
  ) => {
    if (userList.length === 0) {
      return (
        <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-8 text-center sm:p-10">
          <Users className="mx-auto mb-3 h-9 w-9 text-stone-400" />

          <p className="font-medium text-stone-600">
            {search
              ? "No matching users found."
              : "No users found in this section."}
          </p>
        </div>
      );
    }

    return (
      <>
        {/* Mobile and Tablet Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
          {userList.map((user) => renderUserCard(user))}
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-2xl border border-stone-200 lg:block">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-xs font-bold uppercase tracking-wider text-stone-500">

                  <th className="whitespace-nowrap px-4 py-3.5">
                    User Profile
                  </th>

                  <th className="whitespace-nowrap px-4 py-3.5">
                    Email Address
                  </th>

                  <th className="whitespace-nowrap px-4 py-3.5">
                    Role
                  </th>

                  <th className="whitespace-nowrap px-4 py-3.5">
                    Account Status
                  </th>

                  <th className="whitespace-nowrap px-4 py-3.5">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">

                {userList.map((user) => {
                  const fullName = getFullName(user);
                  const isActive = user.isActive !== false;
                  const imageSrc = getImageSrc(user);

                  return (
                    <tr
                      key={user._id}
                      className="transition hover:bg-stone-50/50"
                    >

                      {/* User Profile */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">

                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={fullName}
                              className="h-11 w-11 shrink-0 rounded-2xl border-2 border-[#F5D8B3] object-cover shadow-sm"
                            />
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#F5D8B3] bg-[#FFECD1] font-bold text-[#3E000C]">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <span className="whitespace-nowrap font-bold text-stone-900">
                            {fullName}
                          </span>

                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-4 text-sm font-medium text-stone-600">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        <span className="whitespace-nowrap rounded-full bg-[#3E000C]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                          {user.role}
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          disabled={
                            user.role === "admin" ||
                            updatingId === user._id
                          }
                          title={
                            user.role === "admin"
                              ? "Admin account cannot be changed"
                              : isActive
                              ? "Deactivate account"
                              : "Activate account"
                          }
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 ${
                            isActive
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          }`}
                        >
                          {updatingId === user._id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Updating...
                            </>
                          ) : user.role === "admin" ? (
                            <>
                              <ShieldAlert className="h-3.5 w-3.5" />
                              Protected
                            </>
                          ) : isActive ? (
                            <>
                              <ShieldAlert className="h-3.5 w-3.5" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5" />
                              Activate
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
        </div>
      </>
    );
  };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap");

        .editorial-heading {
          font-family: "Cormorant Garamond", Georgia, serif;
          letter-spacing: -0.02em;
        }
      `}</style>

      <AdminNavbar />

      <main className="min-h-screen w-full overflow-x-hidden bg-[#FFECD1] px-3 py-6 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] sm:px-6 sm:py-10 md:px-8 lg:p-12">
        <div className="mx-auto w-full max-w-7xl">

          {/* Header Section */}
          <div className="mb-6 flex flex-col gap-5 border-b border-[#F5D8B3] pb-6 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="min-w-0">
              <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
                Platform Directory
              </span>

              <h1 className="editorial-heading text-3xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
                Manage Users
              </h1>

              <p className="mt-1 max-w-xl text-sm text-stone-600">
                View, search, and manage registered platform accounts and organizers.
              </p>
            </div>

            <Link
              href="/admin/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-stone-50 sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

          </div>

          {/* Statistics Overview */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-3 sm:gap-5">

            {/* Total Accounts */}
            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <Users className="h-5 w-5" />
                </span>

                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Total
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Total Accounts
              </p>

              <p className="editorial-heading mt-1 text-4xl font-bold text-[#3E000C]">
                {users.length}
              </p>
            </div>

            {/* Standard Users */}
            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <UserCheck className="h-5 w-5" />
                </span>

                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Users
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Standard Users
              </p>

              <p className="editorial-heading mt-1 text-4xl font-bold text-[#3E000C]">
                {users.filter((user) => user.role === "user").length}
              </p>
            </div>

            {/* Organizers */}
            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <ShieldCheck className="h-5 w-5" />
                </span>

                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Organizers
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Event Organizers
              </p>

              <p className="editorial-heading mt-1 text-4xl font-bold text-[#3E000C]">
                {users.filter((user) => user.role === "organizer").length}
              </p>
            </div>

          </div>

          {/* Search & Users Container */}
          <div className="rounded-3xl border border-[#F5D8B3] bg-white p-4 shadow-sm sm:p-6 lg:p-8">

            {/* Search */}
            <div className="mb-8">
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
                  className="w-full min-w-0 rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                />

                <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="mb-6 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <span className="break-words">{message}</span>
              </div>
            )}

            {/* Active Users Section */}
            <section className="mb-10 sm:mb-12">

              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-4">

                <div>
                  <h2 className="text-xl font-bold text-[#3E000C] sm:text-2xl">
                    Active Users
                  </h2>

                  <p className="mt-1 text-sm text-stone-500">
                    Users who can currently access the platform.
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700 sm:px-4 sm:text-sm">
                  {filteredActiveUsers.length} Active
                </span>

              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16 text-sm text-stone-600">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#3E000C]" />
                  Loading active users...
                </div>
              ) : (
                renderUsersSection(filteredActiveUsers, "active")
              )}

            </section>

            {/* Inactive Users Section */}
            <section>

              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-red-100 pb-4">

                <div>
                  <h2 className="text-xl font-bold text-[#3E000C] sm:text-2xl">
                    Inactive Users
                  </h2>

                  <p className="mt-1 text-sm text-stone-500">
                    Users whose accounts have been deactivated.
                  </p>
                </div>

                <span className="rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700 sm:px-4 sm:text-sm">
                  {filteredInactiveUsers.length} Inactive
                </span>

              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16 text-sm text-stone-600">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#3E000C]" />
                  Loading inactive users...
                </div>
              ) : (
                renderUsersSection(filteredInactiveUsers, "inactive")
              )}

            </section>

          </div>
        </div>
      </main>
    </>
  );
}