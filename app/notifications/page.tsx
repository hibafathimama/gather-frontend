"use client";

import { useCallback, useEffect, useState } from "react";

interface NotificationSender {
  _id: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface NotificationType {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  sender?: NotificationSender | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const backendUrl = (
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api"
  ).replace(/\/$/, "");

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your notifications.");
        return;
      }

      const response = await fetch(`${backendUrl}/notifications`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const result = await response.json();

      console.log("Notifications API response:", result);

      if (!response.ok || result.status === false) {
        throw new Error(
          result.message || "Unable to fetch notifications."
        );
      }

      // IMPORTANT:
      // Your backend sends notifications inside result.data
      const notificationList = Array.isArray(result.data)
        ? result.data
        : [];

      setNotifications(notificationList);
    } catch (err) {
      console.error("Notification error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Get sender name
  const getSenderName = (notification: NotificationType) => {
    const sender = notification.sender;

    if (!sender) {
      return "System";
    }

    if (sender.role?.toLowerCase() === "admin") {
      return "Admin";
    }

    const fullName = `${sender.firstName || ""} ${
      sender.lastName || ""
    }`.trim();

    return fullName || "Organizer";
  };

  // Get sender role
  const getSenderRole = (notification: NotificationType) => {
    const role = notification.sender?.role?.toLowerCase();

    if (role === "admin") return "Administrator";
    if (role === "organizer") return "Event Organizer";

    return "System Notification";
  };

  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      setUpdatingId(id);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `${backendUrl}/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || result.status === false) {
        throw new Error(
          result.message || "Failed to update notification."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Mark as read error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update notification."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div className="min-h-screen bg-[#F8F7F4] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#A16B45]">
              Stay Updated
            </p>

            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              All your latest updates and announcements in one place.
            </p>
          </div>

          <button
            onClick={fetchNotifications}
            className="w-fit rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Notifications
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {notifications.length}
            </h2>
          </div>

          <div className="rounded-xl border border-orange-100 bg-orange-50 p-5 shadow-sm">
            <p className="text-sm text-orange-700">
              Unread Notifications
            </p>

            <h2 className="mt-2 text-3xl font-bold text-orange-800">
              {unreadCount}
            </h2>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#8B4513]" />

            <p className="text-sm text-gray-500">
              Loading your notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-4xl">
              🔔
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              No notifications yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              You don't have any notifications right now. New updates
              and announcements will appear here.
            </p>
          </div>
        ) : (
          /* Notification List */
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                Recent Activity
              </h2>

              <span className="text-sm text-gray-500">
                {notifications.length} notifications
              </span>
            </div>

            <div className="space-y-4">
              {notifications.map((notification) => {
                const senderName = getSenderName(notification);
                const senderRole = getSenderRole(notification);

                return (
                  <div
                    key={notification._id}
                    className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6 ${
                      !notification.isRead
                        ? "border-l-4 border-l-[#A16B45] border-y-gray-200 border-r-gray-200"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-4">

                      {/* Sender Avatar */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F3E9DF] text-lg font-bold text-[#8B4513]">
                        {senderName.charAt(0).toUpperCase()}
                      </div>

                      {/* Notification Content */}
                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-gray-900">
                            {senderName}
                          </h3>

                          {!notification.isRead && (
                            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                              New
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs font-medium text-[#A16B45]">
                          {senderRole}
                        </p>

                        {/* Message */}
                        <p className="mt-3 text-sm leading-6 text-gray-700">
                          {notification.message}
                        </p>

                        {/* Type and Date */}
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-600">
                            {notification.type.replace(/_/g, " ")}
                          </span>

                          <span className="text-xs text-gray-400">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Mark as Read */}
                      {!notification.isRead && (
                        <button
                          onClick={() =>
                            handleMarkAsRead(notification._id)
                          }
                          disabled={updatingId === notification._id}
                          className="shrink-0 rounded-lg bg-[#8B4513] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#6B3410] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingId === notification._id
                            ? "Updating..."
                            : "Mark read"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}