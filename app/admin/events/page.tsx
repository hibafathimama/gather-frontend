"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarCheck2,
  CalendarX2,
  Search,
  ArrowLeft,
  Power,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Clock,
  Ticket,
  UserRound,
  Eye,
  Pencil,
} from "lucide-react";
import api from "@/lib/api";
import AdminNavbar from "@/components/AdminNavbar";

interface OrganizerType {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface EventType {
  _id: string;
  eventName?: string;
  name?: string;
  category?: string;
  date?: string;
  time?: string;
  venue?: string;
  location?: string;
  ticketPrice?: number;
  availableSeats?: number;
  image?: string;
  isActive?: boolean;
  organizer?: OrganizerType | string | null;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [changingStatusId, setChangingStatusId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/events");
      const result = response.data.data;

      setEvents(Array.isArray(result) ? result : []);
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" && err !== null && "response" in err
          ? String(
              (
                err as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message || "Failed to fetch events."
            )
          : "Unable to connect to the server.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return events.filter((event) => {
      const eventName = (event.eventName || event.name || "").toLowerCase();
      const category = (event.category || "").toLowerCase();
      const location = (event.location || event.venue || "").toLowerCase();

      const organizer =
        typeof event.organizer === "object" && event.organizer
          ? `${event.organizer.firstName || ""} ${
              event.organizer.lastName || ""
            } ${event.organizer.email || ""}`.toLowerCase()
          : "";

      return (
        eventName.includes(searchText) ||
        category.includes(searchText) ||
        location.includes(searchText) ||
        organizer.includes(searchText)
      );
    });
  }, [events, search]);

  const handleToggleStatus = async (event: EventType) => {
    const isCurrentlyActive = event.isActive !== false;
    const eventName = event.eventName || event.name || "this event";

    const action = isCurrentlyActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${eventName}"?`
    );

    if (!confirmed) return;

    try {
      setChangingStatusId(event._id);
      setError("");
      setMessage("");

      const response = await api.patch(
        `/admin/events/${event._id}/toggle-status`
      );

      const updatedEvent = response.data.data;

      setEvents((previousEvents) =>
        previousEvents.map((item) =>
          item._id === event._id
            ? {
                ...item,
                isActive:
                  typeof updatedEvent?.isActive === "boolean"
                    ? updatedEvent.isActive
                    : !isCurrentlyActive,
              }
            : item
        )
      );

      setMessage(
        response.data.message ||
          `Event ${
            isCurrentlyActive ? "deactivated" : "activated"
          } successfully.`
      );
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" && err !== null && "response" in err
          ? String(
              (
                err as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message || `Failed to ${action} event.`
            )
          : "Unable to connect to the server.";

      setError(errorMessage);
    } finally {
      setChangingStatusId("");
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getOrganizerName = (organizer?: EventType["organizer"]) => {
    if (!organizer || typeof organizer !== "object") return "Unknown";

    return (
      `${organizer.firstName || ""} ${organizer.lastName || ""}`.trim() ||
      organizer.email ||
      "Unknown"
    );
  };

  const renderEventCard = (event: EventType) => {
    const eventName = event.eventName || event.name || "Untitled event";
    const location = event.location || event.venue || "Not specified";
    const isActive = event.isActive !== false;
    const isChanging = changingStatusId === event._id;

    return (
      <article
        key={event._id}
        className="flex min-w-0 flex-col rounded-2xl border border-[#F5D8B3] bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
      >
        {/* Event Header */}
        <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              href={`/admin/events/${event._id}`}
              className="break-words text-base font-bold text-[#3E000C] transition hover:underline sm:text-lg"
            >
              {eventName}
            </Link>

            <span className="mt-2 inline-flex max-w-full rounded-full bg-[#3E000C]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3E000C]">
              {event.category || "General"}
            </span>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              isActive
                ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                : "border-stone-200 bg-stone-100 text-stone-700"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Event Information */}
        <div className="space-y-3 border-t border-stone-100 pt-4">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#3E000C]" />

            <div className="min-w-0">
              <p className="text-xs font-semibold text-stone-800">
                {formatDate(event.date)}
              </p>

              <p className="mt-0.5 text-xs text-stone-500">
                {event.time || "Time not specified"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#3E000C]" />

            <p className="break-words text-xs font-medium text-stone-700">
              {location}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#3E000C]" />

            <p className="break-words text-xs font-medium text-stone-700">
              {getOrganizerName(event.organizer)}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-[#3E000C]" />

              <span className="text-xs font-bold text-[#3E000C]">
                {typeof event.ticketPrice === "number"
                  ? `₹${event.ticketPrice}`
                  : "Price not specified"}
              </span>
            </div>

            {typeof event.availableSeats === "number" && (
              <span className="text-xs font-medium text-stone-500">
                {event.availableSeats} seats available
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-stone-100 pt-4">
          <Link
            href={`/admin/events/${event._id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-600 px-3 py-2.5 text-xs font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Link>

          <Link
            href={`/admin/events/edit/${event._id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#3E000C] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#5A0012]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>

          <button
            type="button"
            onClick={() => handleToggleStatus(event)}
            disabled={isChanging}
            className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-700 hover:bg-emerald-800"
            }`}
          >
            {isChanging ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Power className="h-4 w-4" />
            )}

            {isChanging
              ? "Updating..."
              : isActive
              ? "Deactivate Event"
              : "Activate Event"}
          </button>
        </div>
      </article>
    );
  };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap");

        .editorial-heading {
          font-family: "Cormorant Garamond", Georgia, serif;
          letter-spacing: -0.02em;
        }
      `}</style>

      <AdminNavbar />

      <main className="min-h-screen w-full overflow-x-hidden bg-[#FFECD1] px-3 py-6 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] sm:px-5 sm:py-8 md:px-8 md:py-10 lg:p-12">
        <div className="mx-auto w-full max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 border-b border-[#F5D8B3] pb-6 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <span className="mb-2 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#3E000C] sm:text-[11px]">
                Platform Catalog
              </span>

              <h1 className="editorial-heading text-3xl font-bold tracking-tight text-[#3E000C] sm:text-4xl md:text-5xl">
                Manage Events
              </h1>

              <p className="mt-1 max-w-xl text-xs leading-relaxed text-stone-600 sm:text-sm">
                View, monitor, and moderate all live experiences published on
                the platform.
              </p>
            </div>

            <Link
              href="/admin/dashboard"
              className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-stone-50 sm:px-5"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </div>

          {/* Statistics */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-5">
            {/* Total */}
            <div className="rounded-2xl border border-[#F5D8B3] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <Calendar className="h-5 w-5" />
                </span>

                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Total
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Total Events
              </p>

              <p className="editorial-heading mt-1 text-3xl font-bold text-[#3E000C] sm:text-4xl">
                {events.length}
              </p>
            </div>

            {/* Active */}
            <div className="rounded-2xl border border-[#F5D8B3] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <CalendarCheck2 className="h-5 w-5" />
                </span>

                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Active
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Active Events
              </p>

              <p className="editorial-heading mt-1 text-3xl font-bold text-[#3E000C] sm:text-4xl">
                {events.filter((event) => event.isActive !== false).length}
              </p>
            </div>

            {/* Inactive */}
            <div className="rounded-2xl border border-[#F5D8B3] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <CalendarX2 className="h-5 w-5" />
                </span>

                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Inactive
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Inactive Events
              </p>

              <p className="editorial-heading mt-1 text-3xl font-bold text-[#3E000C] sm:text-4xl">
                {events.filter((event) => event.isActive === false).length}
              </p>
            </div>
          </div>

          {/* Search and Events */}
          <section className="min-w-0 rounded-2xl border border-[#F5D8B3] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8">
            {/* Search */}
            <div className="mb-6">
              <label
                htmlFor="event-search"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
              >
                Search Platform Events
              </label>

              <div className="relative">
                <input
                  id="event-search"
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by event name, category, location, or organizer..."
                  className="w-full min-w-0 rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10 sm:rounded-2xl"
                />

                <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 sm:items-center sm:p-4 sm:text-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 sm:mt-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800 sm:items-center sm:p-4 sm:text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 sm:mt-0" />
                <span className="break-words">{message}</span>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center py-16 text-sm font-medium text-stone-600">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#3E000C]" />
                Loading events catalog...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-8 text-center sm:p-12">
                <Calendar className="mx-auto mb-3 h-10 w-10 text-stone-400" />

                <p className="text-sm font-medium text-stone-600">
                  {search ? "No matching events found." : "No events found."}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile and Tablet Cards */}
                <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
                  {filteredEvents.map((event) => renderEventCard(event))}
                </div>

                {/* Desktop Table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50/70 text-xs font-bold uppercase tracking-wider text-stone-500">
                        <th className="whitespace-nowrap px-4 py-3.5">
                          Event Details
                        </th>
                        <th className="px-4 py-3.5">Category</th>
                        <th className="whitespace-nowrap px-4 py-3.5">
                          Date & Time
                        </th>
                        <th className="px-4 py-3.5">Location</th>
                        <th className="px-4 py-3.5">Organizer</th>
                        <th className="px-4 py-3.5">Price</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-stone-100">
                      {filteredEvents.map((event) => {
                        const eventName =
                          event.eventName || event.name || "Untitled event";

                        const location =
                          event.location || event.venue || "Not specified";

                        const isActive = event.isActive !== false;
                        const isChanging = changingStatusId === event._id;

                        return (
                          <tr
                            key={event._id}
                            className="transition hover:bg-stone-50/50"
                          >
                            <td className="px-4 py-4">
                              <Link
                                href={`/admin/events/${event._id}`}
                                className="font-bold text-stone-900 transition hover:text-[#3E000C] hover:underline"
                              >
                                {eventName}
                              </Link>

                              {typeof event.availableSeats === "number" && (
                                <p className="mt-1 text-xs font-semibold text-stone-500">
                                  {event.availableSeats} seats available
                                </p>
                              )}
                            </td>

                            <td className="px-4 py-4">
                              <span className="rounded-full bg-[#3E000C]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                                {event.category || "General"}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm text-stone-700">
                              <p className="font-semibold">
                                {formatDate(event.date)}
                              </p>

                              <p className="mt-0.5 text-xs text-stone-500">
                                {event.time || "Time not specified"}
                              </p>
                            </td>

                            <td className="px-4 py-4 text-sm font-medium text-stone-700">
                              {location}
                            </td>

                            <td className="px-4 py-4 text-sm font-medium text-stone-700">
                              {getOrganizerName(event.organizer)}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-[#3E000C]">
                              {typeof event.ticketPrice === "number"
                                ? `₹${event.ticketPrice}`
                                : "Not specified"}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                  isActive
                                    ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                                    : "border-stone-200 bg-stone-100 text-stone-700"
                                }`}
                              >
                                {isActive ? "Active" : "Inactive"}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex flex-col items-start gap-2">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/admin/events/${event._id}`}
                                    className="inline-flex items-center gap-1 rounded-md border border-blue-600 px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white"
                                  >
                                    <Eye className="h-3 w-3" />
                                    View
                                  </Link>

                                  <Link
                                    href={`/admin/events/edit/${event._id}`}
                                    className="inline-flex items-center gap-1 rounded-md bg-[#3E000C] px-2 py-1 text-xs font-medium text-white transition hover:bg-[#5A0012]"
                                  >
                                    <Pencil className="h-3 w-3" />
                                    Edit
                                  </Link>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(event)}
                                  disabled={isChanging}
                                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                    isActive
                                      ? "bg-red-600 hover:bg-red-700"
                                      : "bg-emerald-700 hover:bg-emerald-800"
                                  }`}
                                >
                                  {isChanging ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Power className="h-3.5 w-3.5" />
                                  )}

                                  {isChanging
                                    ? "Updating..."
                                    : isActive
                                    ? "Deactivate"
                                    : "Activate"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}