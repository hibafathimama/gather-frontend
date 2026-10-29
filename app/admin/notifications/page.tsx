"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  ShieldCheck, 
  UserCheck, 
  Clock 
} from "lucide-react";
import AdminNavbar from "@/components/AdminNavbar";
import api from "@/lib/api";

interface OrganizerType {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
  verificationStatus?: "pending" | "approved" | "rejected";
}

interface OrganizerNotification {
  _id: string;
  message?: string;
  createdAt?: string;
  isRead?: boolean;
  organizer?: OrganizerType | null;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<OrganizerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setError("");

      const response = await api.get("/notifications/admin", {
        withCredentials: true,
      });

      setNotifications(
        Array.isArray(response.data.data) ? response.data.data : []
      );
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const apiError = err as {
          response?: { data?: { message?: string } };
        };

        setError(
          apiError.response?.data?.message ||
            "Failed to load organizer notifications."
        );
      } else {
        setError("Unable to connect to the backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setMarkingReadId(notificationId);
      setError("");
      setActionMessage("");

      const response = await api.patch(
        `/notifications/admin/${notificationId}/read`,
        {},
        { withCredentials: true }
      );

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setActionMessage(
        response.data.message || "Notification marked as read."
      );
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const apiError = err as {
          response?: { data?: { message?: string } };
        };

        setError(
          apiError.response?.data?.message ||
            "Failed to mark notification as read."
        );
      } else {
        setError("Unable to connect to the backend.");
      }
    } finally {
      setMarkingReadId(null);
    }
  };

  const handleOrganizerAction = async (
    organizerId: string,
    action: "approve" | "reject"
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this organizer?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(organizerId);
      setError("");
      setActionMessage("");

      const response = await api.patch(
        `/notifications/admin/organizers/${organizerId}/${action}`,
        {},
        { withCredentials: true }
      );

      setActionMessage(
        response.data.message ||
          `Organizer ${
            action === "approve" ? "approved" : "rejected"
          } successfully.`
      );

      await fetchNotifications();
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const apiError = err as {
          response?: { data?: { message?: string } };
        };

        setError(
          apiError.response?.data?.message ||
            `Failed to ${action} organizer.`
        );
      } else {
        setError("Unable to connect to the backend.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = notifications.filter(
    (notification) =>
      notification.organizer?.verificationStatus === "pending"
  ).length;

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

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
          
          {/* Back Navigation Link */}
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3E000C] transition hover:opacity-75 mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          {/* Page Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#F5D8B3] pb-6">
            <div>
              <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
                Platform Governance
              </span>
              <h1 className="editorial-heading text-4xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
                Organizer Notifications
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                Review organizer registration requests and manage credential approvals.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-800 shadow-sm border border-amber-200">
                {pendingCount} Pending
              </span>

              <span className="rounded-full bg-rose-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-rose-800 shadow-sm border border-rose-200">
                {unreadCount} Unread
              </span>
            </div>
          </div>

          {/* Main Card Section */}
          <section className="rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFECD1] text-[#3E000C]">
                <Bell className="h-6 w-6" />
              </span>
              <div>
                <h2 className="editorial-heading text-2xl font-bold text-[#3E000C]">
                  Organizer Verification Requests
                </h2>
                <p className="text-xs font-semibold text-stone-500">
                  Authorize or decline pending organizer accounts seeking portal access.
                </p>
              </div>
            </div>

            {/* Success Message */}
            {actionMessage && (
              <div
                role="status"
                className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                {actionMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Content States */}
            {loading ? (
              <div className="flex items-center justify-center py-20 text-stone-600 font-medium">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#3E000C]" />
                Loading organizer notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-12 text-center">
                <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-stone-400" />
                <p className="text-stone-600 font-medium">No organizer notifications found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => {
                  const organizer = notification.organizer;
                  const status = organizer?.verificationStatus;
                  const isProcessing = actionLoading === organizer?._id;
                  const isMarkingRead = markingReadId === notification._id;

                  return (
                    <article
                      key={notification._id}
                      className={`rounded-2xl border p-6 transition-all shadow-sm ${
                        notification.isRead
                          ? "border-stone-200 bg-white"
                          : "border-[#3E000C]/30 bg-[#FFECD1]/20"
                      }`}
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="editorial-heading text-2xl font-bold text-[#3E000C]">
                              {organizer
                                ? `${organizer.firstName || ""} ${
                                    organizer.lastName || ""
                                  }`.trim() || "Organizer"
                                : "Organizer information unavailable"}
                            </h3>

                            {!notification.isRead ? (
                              <span className="rounded-full bg-[#3E000C] px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#FFECD1]">
                                Unread
                              </span>
                            ) : (
                              <span className="rounded-full bg-stone-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                                Read
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs font-semibold text-stone-500">
                            {organizer?.email || "No email available"}
                          </p>

                          <p className="mt-3 text-sm text-stone-800 leading-relaxed">
                            {notification.message ||
                              "Organizer verification request pending review."}
                          </p>

                          <p className="mt-2 text-xs text-stone-400 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {notification.createdAt
                              ? new Date(notification.createdAt).toLocaleString("en-IN", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "Date unavailable"}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-start sm:items-end gap-3">
                          <span
                            className={`rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${
                              status === "approved"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : status === "rejected"
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : status === "pending"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-stone-100 text-stone-700 border border-stone-200"
                            }`}
                          >
                            {status || "unknown"}
                          </span>

                          <div className="flex flex-wrap items-center gap-2">
                            {organizer && status === "pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOrganizerAction(
                                      organizer._id,
                                      "approve"
                                    )
                                  }
                                  disabled={
                                    actionLoading !== null ||
                                    markingReadId !== null
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-50"
                                >
                                  {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                                  Approve
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOrganizerAction(
                                      organizer._id,
                                      "reject"
                                    )
                                  }
                                  disabled={
                                    actionLoading !== null ||
                                    markingReadId !== null
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
                                >
                                  {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                                  Reject
                                </button>
                              </>
                            )}

                            {!notification.isRead && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMarkAsRead(notification._id)
                                }
                                disabled={
                                  markingReadId !== null ||
                                  actionLoading !== null
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#3E000C] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition hover:bg-[#3E000C] hover:text-[#FFECD1] disabled:opacity-50"
                              >
                                {isMarkingRead ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : null}
                                Mark as Read
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

        </div>
      </main>
    </>
  );
}