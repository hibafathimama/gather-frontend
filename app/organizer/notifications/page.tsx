"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
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

      const response = await fetch(
        `${backendUrl}/notifications/organizer`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.status) {
        throw new Error(
          result.message || "Failed to fetch notifications."
        );
      }

      setNotifications(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server."
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
        err instanceof Error
          ? err.message
          : "Failed to update notification."
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
    <div className="min-h-screen bg-gray-100">
      <OrganizerHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Link
            href="/organizer/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Bell size={26} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Updates about your events.
                </p>
              </div>
            </div>

            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              {unreadCount} unread
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
              <Loader2 className="animate-spin" size={20} />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="mx-auto mb-3 text-gray-400" size={40} />
              <h2 className="text-lg font-semibold text-gray-800">
                No notifications yet
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Updates about your events will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <article
                  key={notification._id}
                  className={`rounded-xl border p-4 transition sm:p-5 ${
                    notification.isRead
                      ? "border-gray-200 bg-white"
                      : "border-blue-200 bg-blue-50/60"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <div
                        className={`mt-1 rounded-full p-2 ${
                          notification.isRead
                            ? "bg-gray-100 text-gray-500"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        <Bell size={18} />
                      </div>

                      <div>
                        <p className="font-medium leading-6 text-gray-900">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                          {formatDate(notification.createdAt)}
                        </p>

                        {!notification.isRead && (
                          <span className="mt-2 inline-block rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                            New
                          </span>
                        )}
                      </div>
                    </div>

                {notification.isRead !== true && (
                <button
                type="button"
                onClick={() => markAsRead(notification._id)}
                disabled={updatingId !== null || Boolean(notification.isRead)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                {updatingId === notification._id ? (
                    <Loader2 className="animate-spin" size={16} />
                ) : (
                    <CheckCircle size={16} />
                )}

                {notification.isRead ? "Already read" : "Mark as read"}
                </button>


            )}

                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
