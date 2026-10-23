"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import AdminNavbar from "@/components/AdminNavbar";

interface DashboardStats {
totalUsers: number;
totalOrganizers: number;
totalEvents: number;
totalBookings: number;
}

interface OrganizerNotification {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  organizer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    verificationStatus: "pending" | "approved" | "rejected";
  };
}

export default function AdminDashboard() {
const [stats, setStats] = useState<DashboardStats>({
totalUsers: 0,
totalOrganizers: 0,
totalEvents: 0,
totalBookings: 0,
});

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [notifications, setNotifications] = useState<OrganizerNotification[]>([]);
const [notificationError, setNotificationError] = useState("");
const [actionLoading, setActionLoading] = useState<string | null>(null);
const [actionMessage, setActionMessage] = useState("");

const handleOrganizerAction = async (
organizerId: string,
action: "approve" | "reject"
) => {
const actionText = action === "approve" ? "approve" : "reject";

if (
action === "reject" &&
!window.confirm("Are you sure you want to reject this organizer?")
) {
return;
}

try {
setActionLoading(organizerId);
setActionMessage("");
setNotificationError("");

const response = await api.patch(
  `/admin/organizers/${organizerId}/${action}`,
  {},
  { withCredentials: true }
);

setNotifications((previousNotifications) =>
  previousNotifications.map((notification) =>
    notification.organizer?._id === organizerId
      ? {
          ...notification,
          organizer: {
            ...notification.organizer,
            verificationStatus: action === "approve" ? "approved" : "rejected",
          },
        }
      : notification
  )
);

setActionMessage(response.data.message || `Organizer ${actionText}d successfully.`);

} catch (err: unknown) {
if (err && typeof err === "object" && "response" in err) {
const apiError = err as {
response?: {
data?: { message?: string };
};
};

  setNotificationError(
    apiError.response?.data?.message ||
      `Failed to ${actionText} organizer.`
  );
} else {
  setNotificationError(`Unable to ${actionText} organizer.`);
}

} finally {
setActionLoading(null);
}
};


useEffect(() => {
const fetchDashboardStats = async () => {
try {
const response = await api.get("/admin/dashboard-stats", {
withCredentials: true,
});

    setStats(response.data.data);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "response" in err) {
      const apiError = err as {
        response?: {
          data?: { message?: string };
          status?: number;
        };
      };

      setError(
        apiError.response?.data?.message ||
          `Failed to load dashboard (HTTP ${apiError.response?.status || "error"}).`
      );
    } else {
      setError("Unable to connect to the backend.");
    }
  } finally {
    setLoading(false);
  }
};

const fetchNotifications = async () => {
  try {
    const response = await api.get("/admin/notifications", {
      withCredentials: true,
    });

    setNotifications(response.data.data || []);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "response" in err) {
      const apiError = err as {
        response?: {
          data?: { message?: string };
        };
      };

      setNotificationError(
        apiError.response?.data?.message ||
          "Failed to load organizer notifications."
      );
    } else {
      setNotificationError("Unable to load organizer notifications.");
    }
  }
};

fetchNotifications();



fetchDashboardStats();

}, []);

const dashboardCards = [
{
title: "Total Users",
value: stats.totalUsers,
href: "/admin/users",
},
{
title: "Total Organizers",
value: stats.totalOrganizers,
href: "/admin/users",
},
{
title: "Total Events",
value: stats.totalEvents,
href: "/admin/events",
},
{
title: "Total Bookings",
value: stats.totalBookings,
href: "/admin/bookings",
},
];

if (loading) {
return ( <main className="flex min-h-screen items-center justify-center"> <p className="text-gray-600">Loading dashboard...</p> </main>
);
}

if (error) {
return ( <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6"> <p className="text-red-600">{error}</p>
<button
onClick={() => window.location.reload()}
className="rounded-lg bg-black px-5 py-2 text-white"
>
Try Again </button> </main>
);
}

return ( 
  <>
 <AdminNavbar />
   <main className="min-h-screen bg-gray-100 p-6 md:p-10">
   <div className="mx-auto max-w-7xl"> <div className="mb-8">
   <h1 className="text-3xl font-bold text-gray-900">
    Admin Dashboard </h1> 
    <p className="mt-2 text-gray-600">
    Manage users, organizers, events, and bookings. </p> </div>

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {dashboardCards.map((card) => (
        <Link
          key={card.title}
          href={card.href}
          className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <h2 className="text-sm font-medium text-gray-500">
            {card.title}
          </h2>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            {card.value}
          </p>
          <p className="mt-3 text-sm text-blue-600">
            View details →
          </p>
        </Link>
      ))}
    </div>

<div className="mt-10 rounded-xl bg-white p-6 shadow-sm">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <h2 className="text-xl font-semibold text-gray-900">
      Organizer Verification Notifications
    </h2>

    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
      {
        notifications.filter(
          (notification) =>
            notification.organizer?.verificationStatus === "pending"
        ).length
      } pending
    </span>
  </div>

    {actionMessage && (
      <p className="mt-4 text-sm text-green-700">
        {actionMessage}
      </p>
    )}

  {notificationError ? (
    <p className="mt-4 text-sm text-red-600">{notificationError}</p>
  ) : notifications.length === 0 ? (
    <p className="mt-4 text-gray-500">
      No organizer registration notifications yet.
    </p>
  ) : (
    <div className="mt-5 space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification._id}
          className="rounded-lg border border-gray-200 p-4"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row">
            <div>
              <h3 className="font-semibold text-gray-900">
                {notification.organizer
                  ? `${notification.organizer.firstName} ${notification.organizer.lastName}`
                  : "Organizer information unavailable"}
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                {notification.organizer?.email || "No email available"}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                {notification.message}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>

        <div className="flex flex-col items-start gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              notification.organizer?.verificationStatus === "approved"
                ? "bg-green-100 text-green-800"
                : notification.organizer?.verificationStatus === "rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {notification.organizer?.verificationStatus || "unknown"}
          </span>

        {notification.organizer?.verificationStatus === "pending" && ( <div className="flex flex-wrap gap-2">
        <button
        type="button"
        onClick={() =>
        handleOrganizerAction(notification.organizer._id, "approve")
        }
        disabled={actionLoading === notification.organizer._id}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
        {actionLoading === notification.organizer._id
        ? "Processing..."
        : "Approve"} </button>


          <button
            type="button"
            onClick={() =>
              handleOrganizerAction(notification.organizer._id, "reject")
            }
            disabled={actionLoading === notification.organizer._id}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reject
          </button>
        </div>

        )}

        </div>

          </div>
        </div>
      ))}
    </div>
  )}
</div>



    <div className="mt-10 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">
        Quick Actions
      </h2>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/admin/users"
          className="rounded-lg bg-gray-900 px-5 py-3 text-white hover:bg-gray-700"
        >
          Manage Users
        </Link>
        <Link
          href="/admin/events"
          className="rounded-lg bg-gray-900 px-5 py-3 text-white hover:bg-gray-700"
        >
          Manage Events
        </Link>
        <Link
          href="/admin/bookings"
          className="rounded-lg bg-gray-900 px-5 py-3 text-white hover:bg-gray-700"
        >
          Manage Bookings
        </Link>
      </div>
    </div>
  </div>
</main>
</>
);
}
