"use client";

import { useEffect, useState } from "react";
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
<> <AdminNavbar />


  <main className="min-h-screen bg-gray-100 p-6 sm:p-8">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Organizer Notifications
          </h1>
          <p className="mt-2 text-gray-600">
            Review organizer registration requests and manage approvals.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-800">
            {pendingCount} pending
          </span>

          <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
            {unreadCount} unread
          </span>
        </div>
      </div>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Organizer Verification Requests
        </h2>

        {actionMessage && (
          <p
            role="status"
            className="mt-4 rounded-lg bg-green-50 p-3 text-green-700"
          >
            {actionMessage}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-red-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-5 text-gray-500">
            Loading organizer notifications...
          </p>
        ) : notifications.length === 0 ? (
          <p className="mt-5 text-gray-500">
            No organizer notifications found.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {notifications.map((notification) => {
              const organizer = notification.organizer;
              const status = organizer?.verificationStatus;
              const isProcessing = actionLoading === organizer?._id;
              const isMarkingRead =
                markingReadId === notification._id;

              return (
                <article
                  key={notification._id}
                  className={`rounded-lg border p-4 transition ${
                    notification.isRead
                      ? "border-gray-200 bg-white"
                      : "border-blue-200 bg-blue-50/40"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {organizer
                            ? `${organizer.firstName || ""} ${
                                organizer.lastName || ""
                              }`.trim() || "Organizer"
                            : "Organizer information unavailable"}
                        </h3>

                        {!notification.isRead && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                            Unread
                          </span>
                        )}

                        {notification.isRead && (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                            Read
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-gray-600">
                        {organizer?.email || "No email available"}
                      </p>

                      <p className="mt-3 break-words text-gray-700">
                        {notification.message ||
                          "Organizer verification request"}
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        {notification.createdAt
                          ? new Date(
                              notification.createdAt
                            ).toLocaleString()
                          : "Date unavailable"}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          status === "approved"
                            ? "bg-green-100 text-green-800"
                            : status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {status || "unknown"}
                      </span>

                      {organizer && status === "pending" && (
                        <div className="flex flex-wrap gap-2">
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
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing ? "Processing..." : "Approve"}
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
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing ? "Processing..." : "Reject"}
                          </button>
                        </div>
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
                          className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isMarkingRead
                            ? "Marking as read..."
                            : "Mark as Read"}
                        </button>
                      )}
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
