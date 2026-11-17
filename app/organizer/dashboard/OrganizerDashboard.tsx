"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  CalendarDays,
  Clock,
  MapPin,
  Building2,
  Ticket,
  Armchair,
  Plus,
  ClipboardList,
  ScanLine,
  MessageSquare,
  Eye,
  Pencil,
  Trash2,
  CalendarX2,
  AlertCircle,
  Loader2,
  X,
  Bell,
  Search,
  Check,
  ArrowRight,
} from "lucide-react";

import { EventType } from "@/types/event";
import OrganizerHeader from "@/components/OrganizerHeader";
import Reveal from "@/components/Reveal";

interface NotificationType {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

type StatusFilter = "all" | "available" | "soldout" | "past";
type SortBy = "date" | "sold" | "name";

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

/* Progress bar that animates from 0 to its value */
function ProgressBar({
  percent,
  className = "bg-[#3E000C]",
}: {
  percent: number;
  className?: string;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(Math.min(100, percent)), 150);
    return () => clearTimeout(timer);
  }, [percent]);

  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#F5D8B3]">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${className}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

const timeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();
  if (isNaN(diff)) return "";

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

export default function OrganizerDashboard() {
  const [events, setEvents] = useState<EventType[]>([]);

  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [notificationLoading, setNotificationLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [notificationError, setNotificationError] = useState<string | null>(
    null
  );

  const [markingReadId, setMarkingReadId] = useState<string | null>(null);

  // Available Seats modal
  const [showSeatsModal, setShowSeatsModal] = useState(false);

  // Notifications drawer
  const [showNotifications, setShowNotifications] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<EventType | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast message
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Search, filter and sort
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");

  // Greeting + date follow the device time
  const [greeting, setGreeting] = useState("Welcome");
  const [todayText, setTodayText] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Fetch organizer events and notifications
  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No token found. Please log in.");
          return;
        }

        if (!backendUrl) {
          setError("Backend URL is not configured.");
          return;
        }

        const response = await fetch(`${backendUrl}/events/my-events`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch events");
        }

        setEvents(result.data || []);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setNotificationError("Please log in to view notifications.");
          return;
        }

        if (!backendUrl) {
          setNotificationError("Backend URL is not configured.");
          return;
        }

        const response = await fetch(`${backendUrl}/notifications/organizer`, {
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
        setUnreadCount(result.unreadCount || 0);
      } catch (err: unknown) {
        setNotificationError(
          err instanceof Error ? err.message : "Failed to fetch notifications"
        );
      } finally {
        setNotificationLoading(false);
      }
    };

    fetchMyEvents();
    fetchNotifications();
  }, [backendUrl]);

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

  // Close modals using Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSeatsModal(false);
        setShowNotifications(false);
        setDeleteTarget(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Toast disappears by itself
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setMarkingReadId(notificationId);
      setNotificationError(null);

      const token = localStorage.getItem("token");

      if (!token || !backendUrl) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${backendUrl}/notifications/organizer/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to mark notification as read"
        );
      }

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((previousCount) => Math.max(0, previousCount - 1));
    } catch (err: unknown) {
      setNotificationError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as read"
      );
    } finally {
      setMarkingReadId(null);
    }
  };

  // Delete event (called after the user confirms in the modal)
  const handleDelete = async (eventId: string) => {
    try {
      setDeleting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setToast({ text: "Please log in again.", type: "error" });
        return;
      }

      if (!backendUrl) {
        setToast({ text: "Backend URL is not configured.", type: "error" });
        return;
      }

      const response = await fetch(`${backendUrl}/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete event.");
      }

      setEvents((previousEvents) =>
        previousEvents.filter((event) => event._id !== eventId)
      );

      setToast({ text: "Event deleted successfully!", type: "success" });
      setDeleteTarget(null);
    } catch (err: unknown) {
      setToast({
        text:
          err instanceof Error
            ? err.message
            : "Something went wrong while deleting the event.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Seat calculations
  const seatsOf = (event: EventType) =>
    Math.max(0, event.totalSeats ?? event.availableSeats ?? 0);

  const availableSeatsOf = (event: EventType) =>
    Math.max(0, event.availableSeats ?? 0);

  const bookedSeatsOf = (event: EventType) =>
    Math.max(0, seatsOf(event) - availableSeatsOf(event));

  const isPastEvent = (event: EventType) => {
    const d = new Date(event.date);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  // Dashboard statistics
  const totalSold = events.reduce(
    (sum, event) => sum + bookedSeatsOf(event),
    0
  );

  const totalAvailable = events.reduce(
    (sum, event) => sum + availableSeatsOf(event),
    0
  );

  const totalCapacity = totalSold + totalAvailable;
  const overallPercent =
    totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;

  const stats = [
    {
      label: "Total events",
      value: events.length,
      Icon: CalendarDays,
    },
    {
      label: "Tickets sold",
      value: totalSold,
      Icon: Ticket,
    },
    {
      label: "Seats available",
      value: totalAvailable,
      Icon: Armchair,
    },
  ];

  const quickActions = [
    {
      href: "/organizer/messages",
      label: "Messages",
      hint: "Chat with attendees",
      Icon: MessageSquare,
    },
    {
      href: "/organizer/bookings",
      label: "Manage bookings",
      hint: "View all bookings",
      Icon: ClipboardList,
    },
    {
      href: "/organizer/verify-ticket",
      label: "Verify ticket",
      hint: "Scan at the door",
      Icon: ScanLine,
    },
  ];

  // Search, filter and sort the event list
  const visibleEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    const list = events.filter((event) => {
      const matchesSearch =
        !query ||
        event.eventName?.toLowerCase().includes(query) ||
        event.venue?.toLowerCase().includes(query) ||
        event.category?.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      const soldOut = (event.availableSeats ?? 0) <= 0;

      if (statusFilter === "available") return !soldOut && !isPastEvent(event);
      if (statusFilter === "soldout") return soldOut;
      if (statusFilter === "past") return isPastEvent(event);

      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "name") {
        return (a.eventName || "").localeCompare(b.eventName || "");
      }

      if (sortBy === "sold") {
        return bookedSeatsOf(b) - bookedSeatsOf(a);
      }

      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [events, search, statusFilter, sortBy]);

  const filterChips: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "available", label: "Available" },
    { value: "soldout", label: "Sold out" },
    { value: "past", label: "Past" },
  ];

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "all";

  return (
    <>
      <OrganizerHeader />

      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .skeleton { background: linear-gradient(90deg,#f3e3c8 25%,#fbefd9 50%,#f3e3c8 75%); background-size: 800px 100%; animation: shimmer 1.4s infinite linear; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-in { animation: fadeIn 0.2s ease-out; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .scale-in { animation: scaleIn 0.25s ease-out; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .slide-in { animation: slideIn 0.3s ease-out; }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .toast-in { animation: toastIn 0.3s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .fade-in, .scale-in, .slide-in, .toast-in, .skeleton { animation: none; }
        }
      `}</style>

      <main className="min-h-screen bg-[#FFECD1] px-4 py-8 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Hero */}
          <Reveal className="mb-8">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3E000C] via-[#4A0612] to-[#2B0008] p-6 text-[#FFECD1] shadow-xl sm:p-10">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#FFECD1]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-[#FFECD1]/5 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#FFECD1_1px,transparent_1px)] [background-size:22px_22px]" />

              <div className="relative flex flex-wrap items-start justify-between gap-6">
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

                  <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                    Organizer dashboard
                  </h1>

                  <p className="mt-2 max-w-md text-sm text-[#FFECD1]/70">
                    Manage your events, track ticket sales and verify guests at
                    the door.
                  </p>
                </div>

                {/* Notifications bell */}
                <button
                  type="button"
                  onClick={() => setShowNotifications(true)}
                  aria-label={`Notifications${
                    unreadCount > 0 ? `, ${unreadCount} unread` : ""
                  }`}
                  className="group relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FFECD1]/20 bg-[#FFECD1]/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-[#FFECD1]/20"
                >
                  <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />

                  {unreadCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                      <span className="absolute inset-0 animate-ping rounded-full bg-red-500/60" />
                      <span className="relative">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    </span>
                  )}
                </button>
              </div>

              {/* Quick actions */}
              <div className="relative mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {quickActions.map(({ href, label, hint, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex flex-col gap-3 rounded-2xl border border-[#FFECD1]/15 bg-[#FFECD1]/10 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-[#FFECD1]/20"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFECD1]/15 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-sm font-bold">{label}</span>
                      <span className="block text-xs text-[#FFECD1]/70">
                        {hint}
                      </span>
                    </span>
                  </Link>
                ))}

                <Link
                  href="/organizer/events/create"
                  className="group flex flex-col gap-3 rounded-2xl bg-[#FFECD1] p-4 text-[#3E000C] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3E000C] text-[#FFECD1] transition-transform duration-300 group-hover:rotate-90">
                    <Plus className="h-4 w-4" />
                  </span>
                  <span className="leading-tight">
                    <span className="flex items-center gap-1 text-sm font-bold">
                      Create event
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="block text-xs text-[#3E000C]/70">
                      Start something new
                    </span>
                  </span>
                </Link>
              </div>
            </section>
          </Reveal>

          {/* Dashboard statistics */}
          <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map(({ label, value, Icon }, index) => {
              const isSeatsCard = label === "Seats available";
              const isSoldCard = label === "Tickets sold";

              return (
                <Reveal key={label} delay={index * 80}>
                  <div
                    onClick={
                      isSeatsCard ? () => setShowSeatsModal(true) : undefined
                    }
                    onKeyDown={
                      isSeatsCard
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setShowSeatsModal(true);
                            }
                          }
                        : undefined
                    }
                    role={isSeatsCard ? "button" : undefined}
                    tabIndex={isSeatsCard ? 0 : undefined}
                    className={`group h-full rounded-2xl border border-[#F5D8B3] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      isSeatsCard
                        ? "cursor-pointer hover:border-[#3E000C]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#3E000C]/10 text-[#3E000C] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#3E000C] group-hover:text-[#FFECD1]">
                        <Icon className="h-5 w-5" />
                      </span>

                      <div className="min-w-0">
                        <p className="text-sm text-stone-600">{label}</p>

                        <p className="text-3xl font-bold leading-tight text-[#3E000C]">
                          {loading ? (
                            <span className="skeleton inline-block h-8 w-14 rounded align-middle" />
                          ) : (
                            <CountUp value={value} />
                          )}
                        </p>
                      </div>

                      {isSeatsCard && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSeatsModal(true);
                          }}
                          className="ml-auto shrink-0 rounded-lg bg-[#3E000C] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#2B0008] active:scale-95"
                        >
                          View seats
                        </button>
                      )}
                    </div>

                    {isSoldCard && !loading && (
                      <div className="mt-4">
                        <div className="mb-1.5 flex justify-between text-xs text-stone-500">
                          <span>Overall sell-through</span>
                          <span className="font-semibold text-[#3E000C]">
                            {overallPercent}%
                          </span>
                        </div>
                        <ProgressBar percent={overallPercent} />
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </section>

          {/* My Events heading + tools */}
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-bold tracking-tight text-[#3E000C] sm:text-2xl">
                My events
              </h2>

              {!loading && !error && events.length > 0 && (
                <span className="text-sm text-stone-500">
                  {visibleEvents.length} of {events.length}
                </span>
              )}
            </div>
          </div>

          {!loading && !error && events.length > 0 && (
            <div className="mb-6 rounded-2xl border border-[#F5D8B3] bg-white p-3 shadow-sm sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, venue or category"
                    aria-label="Search your events"
                    className="w-full rounded-lg border border-stone-200 bg-[#FFFBF5] py-2.5 pl-10 pr-9 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#3E000C] focus:bg-white focus:ring-2 focus:ring-[#3E000C]/15"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  aria-label="Sort events"
                  className="rounded-lg border border-stone-200 bg-[#FFFBF5] px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-[#3E000C] focus:ring-2 focus:ring-[#3E000C]/15"
                >
                  <option value="date">Sort: Soonest first</option>
                  <option value="sold">Sort: Most tickets sold</option>
                  <option value="name">Sort: Name (A–Z)</option>
                </select>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {filterChips.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => setStatusFilter(chip.value)}
                    className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition active:scale-95 ${
                      statusFilter === chip.value
                        ? "border-[#3E000C] bg-[#3E000C] text-[#FFECD1]"
                        : "border-stone-200 bg-white text-stone-700 hover:border-[#3E000C]/50"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading placeholders */}
          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-[#F5D8B3] bg-white"
                >
                  <div className="skeleton h-48 w-full" />
                  <div className="space-y-3 p-5">
                    <div className="skeleton h-5 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                    <div className="skeleton h-4 w-2/3 rounded" />
                    <div className="skeleton h-16 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#3E000C]/25 bg-white/60 p-14 text-center">
              <CalendarX2 className="mx-auto mb-3 h-9 w-9 text-[#3E000C]/60" />

              <p className="mb-5 text-stone-600">
                You haven&apos;t created any events yet.
              </p>

              <Link
                href="/organizer/events/create"
                className="inline-flex items-center gap-2 rounded-lg bg-[#3E000C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
              >
                <Plus className="h-4 w-4" />
                Create your first event
              </Link>
            </div>
          )}

          {!loading &&
            !error &&
            events.length > 0 &&
            visibleEvents.length === 0 && (
              <div className="fade-in rounded-2xl border border-dashed border-[#3E000C]/25 bg-white/60 p-14 text-center">
                <Search className="mx-auto mb-3 h-9 w-9 text-[#3E000C]/60" />
                <p className="font-semibold text-[#3E000C]">No events found</p>
                <p className="mt-1 text-sm text-stone-600">
                  Try a different search or filter.
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                    }}
                    className="mt-5 rounded-lg bg-[#3E000C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2B0008] active:scale-95"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

          {/* Event cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.map((event, index) => {
              const total = seatsOf(event);
              const sold = bookedSeatsOf(event);
              const available = availableSeatsOf(event);

              const percentSold =
                total > 0 ? Math.round((sold / total) * 100) : 0;

              const soldOut = available <= 0;
              const past = isPastEvent(event);

              const imageUrl = event.image
                ? event.image.startsWith("http")
                  ? event.image
                  : `${backendUrl?.replace(/\/api\/?$/, "")}${
                      event.image.startsWith("/")
                        ? event.image
                        : `/${event.image}`
                    }`
                : "";

              const d = new Date(event.date);

              return (
                <Reveal key={event._id} delay={(index % 3) * 80}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#F5D8B3] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(62,0,12,0.3)]">
                    {/* Event image */}
                    <div className="relative h-48 w-full overflow-hidden">
                      {event.image ? (
                        <img
                          src={imageUrl}
                          alt={event.eventName || "Event image"}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            console.error(
                              "Failed to load event image:",
                              e.currentTarget.src
                            );
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-[#3E000C] text-[#FFECD1]">
                          <Ticket className="h-10 w-10 opacity-80" />
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {!isNaN(d.getTime()) && (
                        <div className="absolute left-3 top-3 flex flex-col items-center rounded-xl bg-white px-3 py-1.5 text-[#3E000C] shadow">
                          <span className="text-lg font-bold leading-none">
                            {d.toLocaleDateString("en-IN", { day: "numeric" })}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider">
                            {d.toLocaleDateString("en-IN", { month: "short" })}
                          </span>
                        </div>
                      )}

                      <span
                        className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow ${
                          past
                            ? "bg-stone-600"
                            : soldOut
                            ? "bg-red-600"
                            : "bg-emerald-600"
                        }`}
                      >
                        {past
                          ? "Past event"
                          : soldOut
                          ? "Sold out"
                          : "Tickets available"}
                      </span>

                      {event.category && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-[#3E000C]/90 px-3 py-1 text-xs font-semibold text-[#FFECD1] backdrop-blur">
                          {event.category}
                        </span>
                      )}
                    </div>

                    {/* Event details */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <h3
                          className="line-clamp-2 text-lg font-bold leading-snug text-[#3E000C]"
                          title={event.eventName}
                        >
                          {event.eventName}
                        </h3>

                        <p className="shrink-0 rounded-lg bg-[#FFECD1] px-2.5 py-1 text-base font-bold text-[#3E000C]">
                          {event.ticketPrice ? `₹${event.ticketPrice}` : "Free"}
                        </p>
                      </div>

                      <ul className="space-y-2 text-sm text-stone-600">
                        <li className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                          {new Date(event.date).toLocaleDateString()}
                        </li>

                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                          {event.time}
                        </li>

                        <li className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                          <span className="truncate">{event.venue}</span>
                        </li>

                        <li className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                          <span className="truncate">{event.location}</span>
                        </li>
                      </ul>

                      {/* Ticket sales progress */}
                      <div className="mt-5 rounded-xl bg-[#FFECD1]/50 p-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-semibold text-[#3E000C]">
                            {sold} of {total} sold
                          </span>

                          <span className="text-stone-600">
                            {available} left
                          </span>
                        </div>

                        <ProgressBar
                          percent={percentSold}
                          className={
                            percentSold >= 90
                              ? "bg-red-600"
                              : percentSold >= 60
                              ? "bg-orange-600"
                              : "bg-[#3E000C]"
                          }
                        />

                        <p className="mt-1.5 text-right text-xs text-stone-500">
                          {percentSold}% sold
                        </p>
                      </div>

                      {/* Event actions */}
                      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
                        <Link
                          href={`/organizer/events/${event._id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#3E000C] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#2B0008] active:scale-95"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>

                        <Link
                          href={`/organizer/events/edit/${event._id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-[#3E000C] hover:text-[#3E000C] active:scale-95"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(event)}
                          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 active:scale-95"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </main>

      {/* Available Seats Modal */}
      {showSeatsModal && (
        <div
          className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowSeatsModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="seats-modal-title"
            className="scale-in w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-[#F5D8B3] bg-[#FFECD1] px-5 py-4 sm:px-7">
              <div>
                <h2
                  id="seats-modal-title"
                  className="text-xl font-bold text-[#3E000C] sm:text-2xl"
                >
                  Available Seats
                </h2>

                <p className="mt-1 text-sm text-stone-600">
                  Event-wise ticket availability
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSeatsModal(false)}
                aria-label="Close modal"
                className="rounded-lg p-2 text-[#3E000C] transition hover:bg-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal content */}
            <div className="max-h-[65vh] overflow-y-auto p-5 sm:p-7">
              {/* Summary */}
              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-[#FFECD1]/60 p-4">
                  <p className="text-sm text-stone-600">Total Events</p>

                  <p className="mt-1 text-2xl font-bold text-[#3E000C]">
                    {events.length}
                  </p>
                </div>

                <div className="rounded-xl bg-[#FFECD1]/60 p-4">
                  <p className="text-sm text-stone-600">Tickets Sold</p>

                  <p className="mt-1 text-2xl font-bold text-[#3E000C]">
                    {totalSold}
                  </p>
                </div>

                <div className="rounded-xl bg-[#FFECD1]/60 p-4">
                  <p className="text-sm text-stone-600">Seats Available</p>

                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    {totalAvailable}
                  </p>
                </div>
              </div>

              {/* Event-wise seat table */}
              {events.length === 0 ? (
                <div className="py-10 text-center text-stone-500">
                  No events available.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#F5D8B3]">
                  <table className="w-full min-w-[640px] text-left">
                    <thead className="bg-[#3E000C] text-white">
                      <tr>
                        <th className="px-4 py-4 text-sm font-semibold">
                          Event Name
                        </th>

                        <th className="px-4 py-4 text-center text-sm font-semibold">
                          Total Seats
                        </th>

                        <th className="px-4 py-4 text-center text-sm font-semibold">
                          Booked Seats
                        </th>

                        <th className="px-4 py-4 text-center text-sm font-semibold">
                          Available Seats
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {events.map((event) => {
                        const total = seatsOf(event);
                        const booked = bookedSeatsOf(event);
                        const available = availableSeatsOf(event);
                        const percent =
                          total > 0 ? Math.round((booked / total) * 100) : 0;

                        return (
                          <tr
                            key={event._id}
                            className="border-b border-[#F5D8B3] transition last:border-0 hover:bg-[#FFECD1]/40"
                          >
                            <td className="px-4 py-4">
                              <p className="font-semibold text-[#3E000C]">
                                {event.eventName}
                              </p>

                              <p className="mt-1 text-xs text-stone-500">
                                {event.category || "Event"}
                              </p>
                            </td>

                            <td className="px-4 py-4 text-center font-medium text-stone-700">
                              {total}
                            </td>

                            <td className="px-4 py-4 text-center">
                              <p className="font-medium text-stone-700">
                                {booked}
                              </p>
                              <div className="mx-auto mt-1.5 h-1.5 w-20 overflow-hidden rounded-full bg-[#F5D8B3]">
                                <div
                                  className="h-full rounded-full bg-[#3E000C]"
                                  style={{ width: `${Math.min(100, percent)}%` }}
                                />
                              </div>
                            </td>

                            <td className="px-4 py-4 text-center">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                  available === 0
                                    ? "bg-red-100 text-red-700"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                {available}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex justify-end border-t border-[#F5D8B3] px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={() => setShowSeatsModal(false)}
                className="rounded-lg bg-[#3E000C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008] active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications drawer */}
      {showNotifications && (
        <div
          className="fade-in fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowNotifications(false)}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
            className="slide-in absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#F5D8B3] bg-[#FFECD1] px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#3E000C]">
                  Notifications
                </h2>
                <p className="text-xs text-stone-600">
                  {unreadCount > 0
                    ? `${unreadCount} unread`
                    : "You're all caught up"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                aria-label="Close notifications"
                className="rounded-lg p-2 text-[#3E000C] transition hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {notificationError && (
                <p
                  role="alert"
                  className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {notificationError}
                </p>
              )}

              {notificationLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-20 rounded-xl" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-16 text-center text-stone-500">
                  <Bell className="mx-auto mb-3 h-8 w-8 text-[#3E000C]/40" />
                  No notifications yet.
                </div>
              ) : (
                <ul className="space-y-3">
                  {notifications.map((notification) => (
                    <li
                      key={notification._id}
                      className={`rounded-xl border p-4 transition ${
                        notification.isRead
                          ? "border-stone-200 bg-white"
                          : "border-[#3E000C]/30 bg-[#FFECD1]/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {!notification.isRead && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-stone-800">
                            {notification.message}
                          </p>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="text-xs text-stone-500">
                              {timeAgo(notification.createdAt)}
                            </span>

                            {!notification.isRead && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMarkAsRead(notification._id)
                                }
                                disabled={markingReadId === notification._id}
                                className="inline-flex items-center gap-1 rounded-md bg-[#3E000C] px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-[#2B0008] active:scale-95 disabled:opacity-50"
                              >
                                {markingReadId === notification._id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="scale-in w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
              <Trash2 className="h-6 w-6" />
            </div>

            <h2
              id="delete-title"
              className="text-center text-xl font-bold text-[#3E000C]"
            >
              Delete this event?
            </h2>

            <p className="mt-2 text-center text-sm text-stone-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-stone-800">
                {deleteTarget.eventName}
              </span>
              ? This can&apos;t be undone.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDelete(deleteTarget._id)}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95 disabled:opacity-60"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`toast-in fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-xl ${
            toast.type === "success" ? "bg-[#3E000C]" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {toast.text}
        </div>
      )}
    </>
  );
}