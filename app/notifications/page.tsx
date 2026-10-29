"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

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
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
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
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFECD1] text-[#3E000C] font-semibold">
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFECD1] px-4 py-8 sm:px-6 lg:px-8 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <div className="mx-auto max-w-3xl">

        <div className="mt-8 mb-6 flex items-center justify-between border-b border-[#F5D8B3] pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#3E000C]">
              My Notifications
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Stay updated with your latest alerts and platform activities.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="rounded-3xl border border-[#F5D8B3] bg-white p-12 text-center shadow-sm">
            <div className="mb-4 text-4xl">🔔</div>
            <p className="text-sm font-medium text-stone-500">You have no notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`rounded-2xl border p-6 shadow-sm transition-all ${
                  notification.isRead
                    ? "border-stone-200 bg-white"
                    : "border-[#F5D8B3] bg-[#3E000C]/5"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-semibold text-[#3E000C] text-base">
                    {notification.message}
                  </p>
                  {!notification.isRead && (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-[#3E000C] shrink-0 mt-1.5" title="Unread" />
                  )}
                </div>

                <p className="mt-2 text-xs font-medium text-stone-500">
                  📅 {new Date(notification.createdAt).toLocaleString("en-IN")}
                </p>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center">
                  {!notification.isRead ? (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notification._id)}
                      disabled={updatingId === notification._id}
                      className="rounded-xl bg-[#3E000C] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updatingId === notification._id
                        ? "Marking as read..."
                        : "Mark as read"}
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                      ✓ Read
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/user/dashboard"
            className="text-xs font-bold uppercase tracking-wider text-[#3E000C] hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}