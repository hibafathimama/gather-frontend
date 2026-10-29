"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ArrowLeft,
  CalendarDays,
  Loader2,
  AlertCircle,
} from "lucide-react";
import OrganizerHeader from "@/components/OrganizerHeader";

interface NotificationType {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function OrganizerNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view your notifications.");
        return;
      }

      const response = await fetch(`${backendUrl}/notifications/organizer`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.status) {
        throw new Error(result.message || "Failed to fetch notifications.");
      }

      setNotifications(Array.isArray(result.data) ? result.data : []);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      setUpdatingId(notificationId);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to continue.");
        return;
      }

      const response = await fetch(
        `${backendUrl}/notifications/organizer/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.status) {
        throw new Error(
          result.message || "Failed to mark notification as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update notification."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#FFECD1] text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <OrganizerHeader />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          href="/organizer/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3E000C] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        {/* Page title */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#3E000C] sm:text-3xl">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-stone-600 sm:text-base">
              Updates about your events.
            </p>
          </div>

          {!loading && notifications.length > 0 && (
            <span className="inline-flex items-center gap-2 rounded-lg border border-[#F5D8B3] bg-white px-3 py-1.5 text-sm font-medium text-[#3E000C]">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </span>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-stone-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl border border-[#F5D8B3] bg-white p-12 text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
              <BellOff className="h-7 w-7" />
            </span>
            <h2 className="text-lg font-semibold text-[#3E000C]">
              No notifications yet
            </h2>
            <p className="mt-1.5 text-sm text-stone-600">
              Updates about your events will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`flex flex-col gap-4 rounded-xl border p-5 transition-colors sm:flex-row sm:items-start sm:justify-between ${
                  notification.isRead
                    ? "border-stone-200 bg-white"
                    : "border-[#3E000C]/30 bg-white shadow-sm"
                }`}
              >
                <div className="flex min-w-0 gap-4">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                      notification.isRead
                        ? "bg-stone-100 text-stone-500"
                        : "bg-[#3E000C] text-[#FFECD1]"
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <p
                      className={`leading-6 ${
                        notification.isRead
                          ? "text-stone-700"
                          : "font-semibold text-[#3E000C]"
                      }`}
                    >
                      {notification.message}
                    </p>

                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-stone-500">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(notification.createdAt)}
                    </p>

                    {!notification.isRead && (
                      <span className="mt-2 inline-block rounded-md bg-[#FFECD1] px-2.5 py-1 text-xs font-medium text-[#3E000C]">
                        New
                      </span>
                    )}
                  </div>
                </div>

                {!notification.isRead ? (
                  <button
                    type="button"
                    onClick={() => markAsRead(notification._id)}
                    disabled={updatingId !== null}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#3E000C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingId === notification._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Mark as read
                  </button>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-stone-500">
                    <CheckCheck className="h-4 w-4" />
                    Read
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}