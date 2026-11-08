
"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

import { EventType } from "@/types/event";
import OrganizerHeader from "@/components/OrganizerHeader";

interface NotificationType {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function OrganizerDashboard() {
  const [events, setEvents] = useState<EventType[]>([]);

  const [notifications, setNotifications] = useState<
    NotificationType[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [notificationLoading, setNotificationLoading] =
    useState(true);

  const [error, setError] = useState<string | null>(null);

  const [notificationError, setNotificationError] =
    useState<string | null>(null);

  const [markingReadId, setMarkingReadId] =
    useState<string | null>(null);

  // Available Seats modal
  const [showSeatsModal, setShowSeatsModal] = useState(false);

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

        const response = await fetch(
          `${backendUrl}/events/my-events`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch events"
          );
        }

        setEvents(result.data || []);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setNotificationError(
            "Please log in to view notifications."
          );
          return;
        }

        if (!backendUrl) {
          setNotificationError(
            "Backend URL is not configured."
          );
          return;
        }

        const response = await fetch(
          `${backendUrl}/notifications/organizer`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch notifications"
          );
        }

        setNotifications(result.data || []);
        setUnreadCount(result.unreadCount || 0);
      } catch (err: unknown) {
        setNotificationError(
          err instanceof Error
            ? err.message
            : "Failed to fetch notifications"
        );
      } finally {
        setNotificationLoading(false);
      }
    };

    fetchMyEvents();
    fetchNotifications();
  }, [backendUrl]);

  // Close modal using Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSeatsModal(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

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
          result.message ||
            "Failed to mark notification as read"
        );
      }

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((previousCount) =>
        Math.max(0, previousCount - 1)
      );
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

  // Delete event
  const handleDelete = async (eventId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please log in again.");
        return;
      }

      if (!backendUrl) {
        alert("Backend URL is not configured.");
        return;
      }

      const response = await fetch(
        `${backendUrl}/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete event."
        );
      }

      setEvents((previousEvents) =>
        previousEvents.filter(
          (event) => event._id !== eventId
        )
      );

      alert("Event deleted successfully!");
    } catch (err: unknown) {
      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting the event."
      );
    }
  };

  // Seat calculations
  const seatsOf = (event: EventType) =>
    Math.max(
      0,
      event.totalSeats ?? event.availableSeats ?? 0
    );

  const availableSeatsOf = (event: EventType) =>
    Math.max(0, event.availableSeats ?? 0);

  const bookedSeatsOf = (event: EventType) =>
    Math.max(
      0,
      seatsOf(event) - availableSeatsOf(event)
    );

  // Dashboard statistics
  const totalSold = events.reduce(
    (sum, event) => sum + bookedSeatsOf(event),
    0
  );

  const totalAvailable = events.reduce(
    (sum, event) => sum + availableSeatsOf(event),
    0
  );

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

  return (
    <>
      <OrganizerHeader />

      <main className="min-h-screen bg-[#FFECD1] px-4 py-8 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] sm:px-6">
        <div className="mx-auto max-w-7xl">

          {/* Page heading and actions */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#3E000C] sm:text-3xl">
                Organizer dashboard
              </h1>
            </div>

            {/* Dashboard action buttons */}
            <div className="flex flex-wrap gap-2">

              {/* Messages */}
              <Link
                href="/organizer/messages"
                className="inline-flex items-center gap-2 rounded-lg border border-[#F5D8B3] bg-white px-4 py-2.5 text-sm font-semibold text-[#3E000C] transition hover:border-[#3E000C] hover:bg-[#FFECD1]"
              >
                <MessageSquare className="h-4 w-4" />
                Messages
              </Link>

              {/* Manage Bookings */}
              <Link
                href="/organizer/bookings"
                className="inline-flex items-center gap-2 rounded-lg border border-[#F5D8B3] bg-white px-4 py-2.5 text-sm font-semibold text-[#3E000C] transition hover:border-[#3E000C]"
              >
                <ClipboardList className="h-4 w-4" />
                Manage bookings
              </Link>

              {/* Verify Ticket */}
              <Link
                href="/organizer/verify-ticket"
                className="inline-flex items-center gap-2 rounded-lg border border-[#F5D8B3] bg-white px-4 py-2.5 text-sm font-semibold text-[#3E000C] transition hover:border-[#3E000C]"
              >
                <ScanLine className="h-4 w-4" />
                Verify ticket
              </Link>

              {/* Create Event */}
              <Link
                href="/organizer/events/create"
                className="inline-flex items-center gap-2 rounded-lg bg-[#3E000C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
              >
                <Plus className="h-4 w-4" />
                Create event
              </Link>
            </div>
          </div>

          {/* Dashboard statistics */}
          <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map(({ label, value, Icon }) => {
              const isSeatsCard =
                label === "Seats available";

              return (
                <div
                  key={label}
                  onClick={
                    isSeatsCard
                      ? () => setShowSeatsModal(true)
                      : undefined
                  }
                  onKeyDown={
                    isSeatsCard
                      ? (e) => {
                          if (
                            e.key === "Enter" ||
                            e.key === " "
                          ) {
                            e.preventDefault();
                            setShowSeatsModal(true);
                          }
                        }
                      : undefined
                  }
                  role={isSeatsCard ? "button" : undefined}
                  tabIndex={isSeatsCard ? 0 : undefined}
                  className={`flex items-center gap-4 rounded-xl border border-[#F5D8B3] bg-white p-5 ${
                    isSeatsCard
                      ? "cursor-pointer transition hover:-translate-y-1 hover:border-[#3E000C] hover:shadow-lg"
                      : ""
                  }`}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#FFECD1] text-[#3E000C]">
                    <Icon className="h-5 w-5" />
                  </span>

                  {/* Statistics text */}
                  <div className="min-w-0">
                    <p className="text-sm text-stone-600">
                      {label}
                    </p>

                    <p className="text-2xl font-bold text-[#3E000C]">
                      {loading ? "..." : value}
                    </p>
                  </div>

                  {/* View Seats button on the right */}
                  {isSeatsCard && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSeatsModal(true);
                      }}
                      className="ml-auto shrink-0 rounded-md bg-[#3E000C] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#5A0012]"
                    >
                      View Seats
                    </button>
                  )}
                </div>
              );
            })}
          </section>

          {/* Available Seats Modal */}
          {showSeatsModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
              onClick={() => setShowSeatsModal(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="seats-modal-title"
                className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
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
                      <p className="text-sm text-stone-600">
                        Total Events
                      </p>

                      <p className="mt-1 text-2xl font-bold text-[#3E000C]">
                        {events.length}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#FFECD1]/60 p-4">
                      <p className="text-sm text-stone-600">
                        Tickets Sold
                      </p>

                      <p className="mt-1 text-2xl font-bold text-[#3E000C]">
                        {totalSold}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#FFECD1]/60 p-4">
                      <p className="text-sm text-stone-600">
                        Seats Available
                      </p>

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
                      <table className="w-full min-w-[600px] text-left">
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
                            const available =
                              availableSeatsOf(event);

                            return (
                              <tr
                                key={event._id}
                                className="border-b border-[#F5D8B3] last:border-0 transition hover:bg-[#FFECD1]/40"
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

                                <td className="px-4 py-4 text-center font-medium text-stone-700">
                                  {booked}
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
                    className="rounded-lg bg-[#3E000C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* My Events */}
          <h2 className="mb-5 text-xl font-bold tracking-tight text-[#3E000C] sm:text-2xl">
            My events
          </h2>

          {loading && (
            <p className="flex items-center gap-2 text-stone-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading your events...
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="rounded-xl border border-[#F5D8B3] bg-white p-12 text-center">
              <CalendarX2 className="mx-auto mb-3 h-8 w-8 text-[#3E000C]/60" />

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

          {/* Event cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const total = seatsOf(event);
              const sold = bookedSeatsOf(event);
              const available = availableSeatsOf(event);

              const percentSold =
                total > 0
                  ? Math.round((sold / total) * 100)
                  : 0;

              const soldOut = available <= 0;

              const imageUrl = event.image
                ? event.image.startsWith("http")
                  ? event.image
                  : `${backendUrl?.replace(/\/api\/?$/, "")}${event.image.startsWith("/") ? event.image : `/${event.image}`}`
                : "";

              return (
                <article
                  key={event._id}
                  className="flex flex-col overflow-hidden rounded-xl border border-[#F5D8B3] bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Event image */}
                  <div className="relative">
                    {event.image ? (
                      <img
                        src={imageUrl}
                        alt={event.eventName || "Event image"}
                        className="h-48 w-full object-cover"
                        onError={(e) => {
                          console.error(
                            "Failed to load event image:",
                            e.currentTarget.src
                          );
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="grid h-48 w-full place-items-center bg-[#3E000C] text-[#FFECD1]">
                        <Ticket className="h-10 w-10 opacity-80" />
                      </div>
                    )}

                    {event.category && (
                      <span className="absolute left-3 top-3 rounded-md bg-[#3E000C] px-2.5 py-1 text-xs font-medium text-[#FFECD1]">
                        {event.category}
                      </span>
                    )}

                    <span
                      className={`absolute right-3 top-3 rounded-md px-2.5 py-1 text-xs font-semibold text-white ${
                        soldOut
                          ? "bg-red-600"
                          : "bg-emerald-600"
                      }`}
                    >
                      {soldOut
                        ? "Sold out"
                        : "Tickets available"}
                    </span>
                  </div>

                  {/* Event details */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold leading-snug text-[#3E000C]">
                        {event.eventName}
                      </h3>

                      <p className="shrink-0 text-lg font-bold text-[#3E000C]">
                        ₹{event.ticketPrice}
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
                        {event.venue}
                      </li>

                      <li className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                        {event.location}
                      </li>
                    </ul>

                    {/* Ticket sales progress */}
                    <div className="mt-5 rounded-lg bg-[#FFECD1]/50 p-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-[#3E000C]">
                          {sold} of {total} sold
                        </span>

                        <span className="text-stone-600">
                          {available} left
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#F5D8B3]">
                        <div
                          className="h-full rounded-full bg-[#3E000C]"
                          style={{
                            width: `${Math.min(100, percentSold)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Event actions */}
                    <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
                      <Link
                        href={`/organizer/events/${event._id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#3E000C] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>

                      <Link
                        href={`/organizer/events/edit/${event._id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-[#3E000C] hover:text-[#3E000C]"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(event._id)}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

        </div>
      </main>
    </>
  );
}
