"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Calendar,
  Ticket,
  AlertTriangle,
  Megaphone,
  ArrowRight,
  ShieldAlert,
  Loader2,
  RefreshCw,
  UserCheck,
  CalendarDays,
  ClipboardList,
  FileText,
} from "lucide-react";
import api from "@/lib/api";
import AdminNavbar from "@/components/AdminNavbar";

interface DashboardStats {
  totalUsers: number;
  totalOrganizers: number;
  totalEvents: number;
  totalBookings: number;
  pendingReports: number;
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
    pendingReports: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<OrganizerNotification[]>([]);
  const [notificationError, setNotificationError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementLoading, setAnnouncementLoading] = useState(false);

  // For announcement
  const handleSendAnnouncement = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const message = announcement.trim();

    if (!message) {
      setAnnouncementMessage("Please enter an announcement.");
      return;
    }

    try {
      setAnnouncementLoading(true);
      setAnnouncementMessage("");

      const response = await api.post(
        "/notifications/announcement",
        { message },
        { withCredentials: true }
      );

      setAnnouncementMessage(
        `${response.data.message || "Announcement sent successfully"}${
          response.data.recipientCount !== undefined
            ? ` (${response.data.recipientCount} users notified)`
            : ""
        }`
      );

      setAnnouncement("");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const apiError = err as {
          response?: { data?: { message?: string } };
        };

        setAnnouncementMessage(
          apiError.response?.data?.message ||
            "Failed to send announcement."
        );
      } else {
        setAnnouncementMessage("Unable to connect to the backend.");
      }
    } finally {
      setAnnouncementLoading(false);
    }
  };

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
      Icon: Users,
    },
    {
      title: "Total Organizers",
      value: stats.totalOrganizers,
      href: "/admin/users",
      Icon: ShieldCheck,
    },
    {
      title: "Total Events",
      value: stats.totalEvents,
      href: "/admin/events",
      Icon: Calendar,
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      href: "/admin/bookings",
      Icon: Ticket,
    },
    {
      title: "Pending Reports",
      value: stats.pendingReports,
      href: "/admin/reports",
      Icon: AlertTriangle,
    },
  ];

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFECD1] text-stone-700">
        <div className="flex items-center gap-2 font-medium">
          <Loader2 className="h-5 w-5 animate-spin text-[#3E000C]" />
          Loading admin dashboard...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFECD1] p-6 text-stone-900">
        <ShieldAlert className="h-12 w-12 text-red-600" />
        <p className="font-semibold text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#3E000C] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#2B0008]"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </main>
    );
  }

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

      <main className="min-h-screen bg-[#FFECD1] px-4 py-8 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] md:p-10">
        <div className="mx-auto max-w-7xl">
          
          {/* Header Section */}
          <div className="mb-8 border-b border-[#F5D8B3] pb-6">
            <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
              Super Admin Control Center
            </span>
            <h1 className="editorial-heading text-4xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Manage platform users, verify organizers, review events, and broadcast announcements.
            </p>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {dashboardCards.map(({ title, value, href, Icon }) => (
              <Link
                key={title}
                href={href}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#F5D8B3] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#3E000C]"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFECD1] text-[#3E000C]">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400 group-hover:text-[#3E000C] transition-colors">
                      View →
                    </span>
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    {title}
                  </h2>
                  <p className="editorial-heading mt-1 text-4xl font-bold text-[#3E000C]">
                    {value}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Send Announcement Section */}
          <section className="mt-10 rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFECD1] text-[#3E000C]">
                <Megaphone className="h-6 w-6" />
              </span>
              <div>
                <h2 className="editorial-heading text-2xl font-bold text-[#3E000C]">
                  Broadcast Important Announcement
                </h2>
                <p className="text-xs font-semibold text-stone-500">
                  Send an instant in-app notification banner across all active platform users.
                </p>
              </div>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div>
                <label
                  htmlFor="announcement"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                >
                  Announcement Message Content
                </label>

                <textarea
                  id="announcement"
                  value={announcement}
                  onChange={(event) => setAnnouncement(event.target.value)}
                  placeholder="Enter your system-wide announcement here..."
                  rows={4}
                  maxLength={1000}
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-4 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                />
              </div>

              {announcementMessage && (
                <div
                  role="status"
                  className="rounded-2xl border border-[#F5D8B3] bg-[#FFECD1]/40 p-4 text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                >
                  📢 {announcementMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={announcementLoading}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#3E000C] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3E000C]/20 transition-all hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {announcementLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Broadcasting...
                  </>
                ) : (
                  <>
                    <Megaphone className="h-4 w-4" /> Send Announcement
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Quick Actions Panel */}
          <div className="mt-10 rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm">
            <h2 className="editorial-heading mb-6 text-2xl font-bold text-[#3E000C]">
              Management Gateways
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/admin/users"
                className="group flex items-center justify-between rounded-2xl border border-[#F5D8B3] bg-[#FFECD1]/30 p-5 transition-all hover:bg-[#3E000C] hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-[#3E000C] group-hover:text-white" />
                  <span className="text-xs font-bold uppercase tracking-wider">Manage Users</span>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-white" />
              </Link>

              <Link
                href="/admin/events"
                className="group flex items-center justify-between rounded-2xl border border-[#F5D8B3] bg-[#FFECD1]/30 p-5 transition-all hover:bg-[#3E000C] hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-[#3E000C] group-hover:text-white" />
                  <span className="text-xs font-bold uppercase tracking-wider">Manage Events</span>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-white" />
              </Link>

              <Link
                href="/admin/bookings"
                className="group flex items-center justify-between rounded-2xl border border-[#F5D8B3] bg-[#FFECD1]/30 p-5 transition-all hover:bg-[#3E000C] hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-[#3E000C] group-hover:text-white" />
                  <span className="text-xs font-bold uppercase tracking-wider">Manage Bookings</span>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-white" />
              </Link>

              <Link
                href="/admin/reports"
                className="group flex items-center justify-between rounded-2xl border border-[#F5D8B3] bg-[#FFECD1]/30 p-5 transition-all hover:bg-[#3E000C] hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[#3E000C] group-hover:text-white" />
                  <span className="text-xs font-bold uppercase tracking-wider">Manage Reports</span>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-white" />
              </Link>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}