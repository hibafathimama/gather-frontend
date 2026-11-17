"use client";

import { useEffect, useState, type FormEvent } from "react";
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
  MessageCircle,
  Check,
  AlertCircle,
  Send,
  Bell,
} from "lucide-react";
import api from "@/lib/api";
import AdminNavbar from "@/components/AdminNavbar";
import Reveal from "@/components/Reveal";

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
  } | null;
}

const MAX_ANNOUNCEMENT_LENGTH = 1000;

const announcementTemplates = [
  {
    label: "Maintenance notice",
    text: "Scheduled maintenance tonight from 11 PM to 12 AM. The platform may be briefly unavailable.",
  },
  {
    label: "New features",
    text: "New features are now live on Gather. Come and check them out!",
  },
  {
    label: "Thank you",
    text: "Thank you for being part of Gather. We appreciate your support!",
  },
];

/* Number that counts up smoothly when it appears or changes */
function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display}</>;
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

  const [notifications, setNotifications] = useState<OrganizerNotification[]>(
    []
  );

  const [notificationError, setNotificationError] = useState("");

  const [announcement, setAnnouncement] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);
  const [announcementLoading, setAnnouncementLoading] = useState(false);

  // Unread admin-organizer messages count
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);

  // Greeting + date follow the device time
  const [greeting, setGreeting] = useState("Welcome");
  const [todayText, setTodayText] = useState("");

  // Fetch unread admin messages count
  useEffect(() => {
    const fetchAdminUnreadCount = async () => {
      try {
        const response = await api.get(
          "/messages/admin-organizer/admin/unread-count",
          {
            withCredentials: true,
          }
        );

        setAdminUnreadCount(response.data.unreadCount || 0);
      } catch (error) {
        console.error("Failed to fetch admin unread messages:", error);
      }
    };

    fetchAdminUnreadCount();

    // Refresh unread count every 15 seconds
    const interval = setInterval(fetchAdminUnreadCount, 15000);

    return () => clearInterval(interval);
  }, []);

  // Greeting updates by itself
  useEffect(() => {
    const update = () => {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 12) setGreeting("Good morning");
      else if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
      else if (hour >= 17 && hour < 21) setGreeting("Good evening");
      else setGreeting("Hello, night owl");

      setTodayText(
        new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      );
    };

    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);

  // Announcement status message disappears by itself
  useEffect(() => {
    if (!announcementMessage) return;
    const timer = setTimeout(() => setAnnouncementMessage(""), 6000);
    return () => clearTimeout(timer);
  }, [announcementMessage]);

  // Count pending organizer requests
  const pendingOrganizerCount = notifications.filter(
    (notification) => notification.organizer?.verificationStatus === "pending"
  ).length;

  // Send announcement
  const handleSendAnnouncement = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const message = announcement.trim();

    if (!message) {
      setAnnouncementSuccess(false);
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

      setAnnouncementSuccess(true);
      setAnnouncementMessage(
        `${response.data.message || "Announcement sent successfully"}${
          response.data.recipientCount !== undefined
            ? ` (${response.data.recipientCount} users notified)`
            : ""
        }`
      );

      setAnnouncement("");
    } catch (err: unknown) {
      setAnnouncementSuccess(false);

      if (typeof err === "object" && err !== null && "response" in err) {
        const apiError = err as {
          response?: { data?: { message?: string } };
        };

        setAnnouncementMessage(
          apiError.response?.data?.message || "Failed to send announcement."
        );
      } else {
        setAnnouncementMessage("Unable to connect to the backend.");
      }
    } finally {
      setAnnouncementLoading(false);
    }
  };

  // Fetch dashboard data
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
              `Failed to load dashboard (HTTP ${
                apiError.response?.status || "error"
              }).`
          );
        } else {
          setError("Unable to connect to the backend.");
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch organizer verification notifications
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/admin/notifications", {
          withCredentials: true,
        });

        setNotifications(
          Array.isArray(response.data.data) ? response.data.data : []
        );
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

  // Dashboard cards
  const dashboardCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      href: "/admin/users",
      Icon: Users,
      danger: false,
    },
    {
      title: "Total Organizers",
      value: stats.totalOrganizers,
      href: "/admin/users",
      Icon: ShieldCheck,
      danger: false,
    },
    {
      title: "Total Events",
      value: stats.totalEvents,
      href: "/admin/events",
      Icon: Calendar,
      danger: false,
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      href: "/admin/bookings",
      Icon: Ticket,
      danger: false,
    },
    {
      title: "Pending Reports",
      value: stats.pendingReports,
      href: "/admin/reports",
      Icon: AlertTriangle,
      danger: stats.pendingReports > 0,
    },
    {
      title: "Pending Organizer Requests",
      value: pendingOrganizerCount,
      href: "/admin/notifications",
      Icon: ShieldAlert,
      danger: pendingOrganizerCount > 0,
    },
  ];

  const gateways = [
    {
      href: "/admin/users",
      label: "Manage Users",
      hint: `${stats.totalUsers} registered`,
      Icon: UserCheck,
    },
    {
      href: "/admin/events",
      label: "Manage Events",
      hint: `${stats.totalEvents} events`,
      Icon: CalendarDays,
    },
    {
      href: "/admin/bookings",
      label: "Manage Bookings",
      hint: `${stats.totalBookings} bookings`,
      Icon: ClipboardList,
    },
    {
      href: "/admin/reports",
      label: "Manage Reports",
      hint:
        stats.pendingReports > 0
          ? `${stats.pendingReports} pending`
          : "All clear",
      Icon: FileText,
    },
  ];

  const styles = (
    <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap");

      .editorial-heading {
        font-family: "Cormorant Garamond", Georgia, serif;
        letter-spacing: -0.02em;
      }

      @keyframes shimmer {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }
      .skeleton {
        background: linear-gradient(90deg, #f3e3c8 25%, #fbefd9 50%, #f3e3c8 75%);
        background-size: 800px 100%;
        animation: shimmer 1.4s infinite linear;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .fade-in { animation: fadeIn 0.25s ease-out; }
      @media (prefers-reduced-motion: reduce) {
        .skeleton, .fade-in { animation: none; }
      }
    `}</style>
  );

  if (loading) {
    return (
      <>
        {styles}
        <AdminNavbar />

        <main className="min-h-screen bg-[#FFECD1] px-4 py-8 md:p-10">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="skeleton h-56 rounded-3xl" />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-36 rounded-3xl" />
              ))}
            </div>

            <p className="flex items-center justify-center gap-2 pt-2 text-sm font-medium text-stone-600">
              <Loader2 className="h-4 w-4 animate-spin text-[#3E000C]" />
              Loading admin dashboard...
            </p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        {styles}
        <AdminNavbar />

        <main className="flex min-h-[70vh] items-center justify-center bg-[#FFECD1] p-6 text-stone-900">
          <div className="fade-in max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <ShieldAlert className="h-7 w-7" />
            </div>

            <h1 className="editorial-heading text-2xl font-bold text-[#3E000C]">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#3E000C] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#2B0008] active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {styles}

      <AdminNavbar />

      <main className="min-h-screen bg-[#FFECD1] px-4 py-8 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] md:p-10">
        <div className="mx-auto max-w-7xl">
          {/* Hero */}
          <Reveal className="mb-6">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3E000C] via-[#4A0612] to-[#2B0008] p-6 text-[#FFECD1] shadow-xl sm:p-10">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#FFECD1]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-[#FFECD1]/5 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#FFECD1_1px,transparent_1px)] [background-size:22px_22px]" />

              <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFECD1]/70">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    {greeting}
                    {todayText && (
                      <span className="hidden font-medium normal-case tracking-normal sm:inline">
                        · {todayText}
                      </span>
                    )}
                  </p>

                  <span className="mt-3 inline-block rounded-lg bg-[#FFECD1]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#FFECD1]">
                    Super Admin Control Center
                  </span>

                  <h1 className="editorial-heading mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                    Admin Dashboard
                  </h1>

                  <p className="mt-2 max-w-xl text-sm text-[#FFECD1]/70">
                    Manage platform users, verify organizers, review events,
                    and broadcast announcements.
                  </p>
                </div>

                {/* Messages Button with Unread Count */}
                <Link
                  href="/admin/messages"
                  className="group relative inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#FFECD1] px-5 py-3 text-sm font-bold text-[#3E000C] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-white sm:self-center"
                >
                  <MessageCircle className="h-5 w-5 transition-transform group-hover:-rotate-12" />
                  Messages
                  {adminUnreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-[#3E000C] bg-red-600 px-1.5 text-xs font-bold text-white shadow-md">
                      <span className="absolute inset-0 animate-ping rounded-full bg-red-500/60" />
                      <span className="relative">
                        {adminUnreadCount > 9 ? "9+" : adminUnreadCount}
                      </span>
                    </span>
                  )}
                </Link>
              </div>
            </section>
          </Reveal>

          {/* Attention strip: only shows when organizers are waiting */}
          {pendingOrganizerCount > 0 && (
            <Reveal className="mb-6">
              <Link
                href="/admin/notifications"
                className="group flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 transition hover:border-red-300 hover:shadow-md"
              >
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/70" />
                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-red-50 bg-red-500" />
                  </span>
                </span>

                <p className="min-w-0 flex-1 text-sm font-semibold text-red-800">
                  {pendingOrganizerCount} organizer{" "}
                  {pendingOrganizerCount === 1 ? "request is" : "requests are"}{" "}
                  waiting for your review
                </p>

                <span className="inline-flex items-center gap-1 text-sm font-bold text-red-700">
                  Review now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          )}

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardCards.map(
              ({ title, value, href, Icon, danger }, index) => (
                <Reveal key={title} delay={(index % 3) * 80}>
                  <Link
                    href={href}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                      danger
                        ? "border-red-200 hover:border-red-400"
                        : "border-[#F5D8B3] hover:border-[#3E000C]"
                    }`}
                  >
                    <span
                      className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full transition-transform duration-500 group-hover:scale-150 ${
                        danger ? "bg-red-100/70" : "bg-[#FFECD1]/70"
                      }`}
                    />

                    <div className="relative mb-4 flex items-center justify-between">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${
                          danger
                            ? "bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white"
                            : "bg-[#FFECD1] text-[#3E000C] group-hover:bg-[#3E000C] group-hover:text-[#FFECD1]"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </span>

                      <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-stone-400 transition-colors group-hover:text-[#3E000C]">
                        View
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>

                    <h2 className="relative text-xs font-bold uppercase tracking-wider text-stone-500">
                      {title}
                    </h2>

                    <p
                      className={`editorial-heading relative mt-1 text-5xl font-bold ${
                        danger ? "text-red-600" : "text-[#3E000C]"
                      }`}
                    >
                      <CountUp value={value} />
                    </p>
                  </Link>
                </Reveal>
              )
            )}
          </div>

          {/* Notification Error */}
          {notificationError && (
            <p
              role="alert"
              className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {notificationError}
            </p>
          )}

          {/* Send Announcement Section */}
          <Reveal className="mt-10">
            <section className="rounded-3xl border border-[#F5D8B3] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3 border-b border-stone-100 pb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFECD1] text-[#3E000C]">
                  <Megaphone className="h-6 w-6" />
                </span>

                <div>
                  <h2 className="editorial-heading text-2xl font-bold text-[#3E000C]">
                    Broadcast Important Announcement
                  </h2>

                  <p className="text-xs font-semibold text-stone-500">
                    Send an instant in-app notification banner across all
                    active platform users.
                  </p>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                <form onSubmit={handleSendAnnouncement} className="space-y-4">
                  {/* Quick templates */}
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                      Quick templates
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {announcementTemplates.map((template) => (
                        <button
                          key={template.label}
                          type="button"
                          onClick={() => setAnnouncement(template.text)}
                          className="rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-700 transition hover:border-[#3E000C]/50 hover:bg-[#FFECD1]/40 active:scale-95"
                        >
                          {template.label}
                        </button>
                      ))}
                    </div>
                  </div>

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
                      rows={5}
                      maxLength={MAX_ANNOUNCEMENT_LENGTH}
                      required
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-4 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                    />

                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F5D8B3]">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            announcement.length > MAX_ANNOUNCEMENT_LENGTH * 0.9
                              ? "bg-red-600"
                              : "bg-[#3E000C]"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (announcement.length / MAX_ANNOUNCEMENT_LENGTH) *
                                100
                            )}%`,
                          }}
                        />
                      </div>

                      <span className="text-xs text-stone-500">
                        {announcement.length}/{MAX_ANNOUNCEMENT_LENGTH}
                      </span>
                    </div>
                  </div>

                  {announcementMessage && (
                    <div
                      role="status"
                      className={`fade-in flex items-start gap-2 rounded-2xl border p-4 text-sm font-semibold ${
                        announcementSuccess
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {announcementSuccess ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      ) : (
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      )}
                      {announcementMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={announcementLoading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#3E000C] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3E000C]/20 transition-all hover:-translate-y-0.5 hover:bg-[#2B0008] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {announcementLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Broadcasting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Announcement
                      </>
                    )}
                  </button>
                </form>

                {/* Live preview */}
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                    Live preview
                  </p>

                  <div className="rounded-2xl border border-[#F5D8B3] bg-[#FFECD1]/40 p-4">
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3E000C] text-[#FFECD1]">
                          <Megaphone className="h-4 w-4" />
                        </span>

                        <div className="leading-tight">
                          <p className="text-sm font-bold text-[#3E000C]">
                            Announcement
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Just now · Gather
                          </p>
                        </div>
                      </div>

                      <p className="break-words text-sm text-stone-700">
                        {announcement.trim() || (
                          <span className="text-stone-400">
                            Your message will appear here as users will see it.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          {/* Quick Actions Panel */}
          <Reveal className="mt-10">
            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="editorial-heading mb-6 text-2xl font-bold text-[#3E000C]">
                Management Gateways
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {gateways.map(({ href, label, hint, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex flex-col gap-4 rounded-2xl border border-[#F5D8B3] bg-[#FFECD1]/30 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-[#3E000C] hover:text-white hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3E000C]/10 text-[#3E000C] transition-all duration-300 group-hover:scale-110 group-hover:bg-white/15 group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </span>

                      <ArrowRight className="h-4 w-4 text-stone-400 transition-all group-hover:translate-x-1 group-hover:text-white" />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider">
                        {label}
                      </p>
                      <p className="mt-1 text-xs text-stone-500 transition-colors group-hover:text-white/70">
                        {hint}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </main>
    </>
  );
}