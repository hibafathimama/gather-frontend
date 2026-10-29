"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Ticket,
  ArrowLeft,
  Bell,
  BellOff,
  CalendarDays,
  Check,
  CheckCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface NotificationType {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view your notifications.");
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      const response = await fetch(`${backendUrl}/notifications`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch notifications");
      }

      setNotifications(result.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setUpdatingId(notificationId);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to continue.");
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      const response = await fetch(
        `${backendUrl}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to mark as read");
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFECD1] text-[#3E000C]">
        <p className="flex items-center gap-2 font-medium">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading notifications...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFECD1] px-4 py-6 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between border-b border-[#F5D8B3] pb-5">
          <Link href="/user/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3E000C] text-[#FFECD1]">
              <Ticket className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-lg font-bold tracking-tight text-[#3E000C]">
                Gather
              </p>
              <p className="text-xs text-stone-600">Event platform</p>
            </div>
          </Link>

          <Link
            href="/user/dashboard"
            className="flex h-10 items-center gap-2 rounded-lg border border-[#3E000C]/25 bg-white px-3.5 text-sm font-medium text-[#3E000C] transition-colors hover:bg-[#3E000C] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </header>

        {/* Page title */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#3E000C] sm:text-3xl">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-stone-600 sm:text-base">
              Stay up to date with your bookings and event updates.
            </p>
          </div>

          {notifications.length > 0 && (
            <span className="inline-flex items-center gap-2 rounded-lg border border-[#F5D8B3] bg-white px-3 py-1.5 text-sm font-medium text-[#3E000C]">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </span>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="rounded-xl border border-[#F5D8B3] bg-white p-12 text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
              <BellOff className="h-7 w-7" />
            </span>
            <h2 className="text-lg font-semibold text-[#3E000C]">
              No notifications yet
            </h2>
            <p className="mt-1.5 text-sm text-stone-600">
              Updates about your bookings and events will show up here.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`flex gap-4 rounded-xl border p-5 transition-colors ${
                  notification.isRead
                    ? "border-stone-200 bg-white"
                    : "border-[#3E000C]/30 bg-white shadow-sm"
                }`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                    notification.isRead
                      ? "bg-stone-100 text-stone-500"
                      : "bg-[#3E000C] text-[#FFECD1]"
                  }`}
                >
                  <Bell className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={`text-base ${
                        notification.isRead
                          ? "text-stone-700"
                          : "font-semibold text-[#3E000C]"
                      }`}
                    >
                      {notification.message}
                    </p>

                    {!notification.isRead && (
                      <span
                        className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#3E000C]"
                        title="Unread"
                        aria-label="Unread"
                      />
                    )}
                  </div>

                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-stone-500">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(notification.createdAt).toLocaleString("en-IN")}
                  </p>

                  <div className="mt-3 flex items-center">
                    {!notification.isRead ? (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification._id)}
                        disabled={updatingId === notification._id}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#3E000C] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatingId === notification._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {updatingId === notification._id
                          ? "Marking as read..."
                          : "Mark as read"}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-stone-500">
                        <CheckCheck className="h-4 w-4" />
                        Read
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8">
          <Link
            href="/user/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3E000C] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}