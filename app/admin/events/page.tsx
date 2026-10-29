"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  CalendarDays, 
  CalendarCheck2, 
  CalendarX2, 
  Search, 
  ArrowLeft, 
  Pencil, 
  Power, 
  Loader2, 
  AlertCircle, 
  CheckCircle2 
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
          `Event ${isCurrentlyActive ? "deactivated" : "activated"} successfully.`
      );
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" && err !== null && "response" in err
          ? String(
              (
                err as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message ||
                `Failed to ${action} event.`
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

      <main className="min-h-screen bg-[#FFECD1] px-4 py-10 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] md:p-12">
        <div className="mx-auto max-w-7xl">
          
          {/* Header Section */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#F5D8B3] pb-6">
            <div>
              <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
                Platform Catalog
              </span>
              <h1 className="editorial-heading text-4xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
                Manage Events
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                View, monitor, and moderate all live experiences published on the platform.
              </p>
            </div>

            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-stone-50"
            >
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
          </div>

          {/* Stats Overview Cards */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <Calendar className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Events</p>
              <p className="editorial-heading mt-1 text-4xl font-bold text-[#3E000C]">{events.length}</p>
            </div>

            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <CalendarCheck2 className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Active</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Active Events</p>
              <p className="editorial-heading mt-1 text-4xl font-bold text-[#3E000C]">
                {events.filter((event) => event.isActive !== false).length}
              </p>
            </div>

            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <CalendarX2 className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Inactive</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Inactive Events</p>
              <p className="editorial-heading mt-1 text-4xl font-bold text-[#3E000C]">
                {events.filter((event) => event.isActive === false).length}
              </p>
            </div>
          </div>

          {/* Search & Content Container */}
          <section className="rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm">
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
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                {message}
              </div>
            )}

            {/* Table States */}
            {loading ? (
              <div className="flex items-center justify-center py-20 text-stone-600 font-medium">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#3E000C]" />
                Loading events catalog...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-12 text-center">
                <Calendar className="mx-auto mb-3 h-10 w-10 text-stone-400" />
                <p className="text-stone-600 font-medium">
                  {search ? "No matching events found." : "No events found."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50/70 text-xs font-bold uppercase tracking-wider text-stone-500">
                      <th className="px-4 py-3.5">Event Details</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Date & Time</th>
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

                      const organizer =
                        typeof event.organizer === "object" && event.organizer
                          ? `${event.organizer.firstName || ""} ${
                              event.organizer.lastName || ""
                            }`.trim() ||
                            event.organizer.email ||
                            "Unknown"
                          : "Unknown";

                      const isActive = event.isActive !== false;
                      const isChanging = changingStatusId === event._id;

                      return (
                        <tr
                          key={event._id}
                          className="transition hover:bg-stone-50/50"
                        >
                          <td className="px-4 py-4">
                            <p className="font-bold text-stone-900">{eventName}</p>

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

                          <td className="px-4 py-4 text-sm text-stone-700">
                            <p className="font-semibold">{formatDate(event.date)}</p>
                            <p className="mt-0.5 text-xs text-stone-500">
                              {event.time || "Time not specified"}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-sm text-stone-700 font-medium">{location}</td>

                          <td className="px-4 py-4 text-sm text-stone-700 font-medium">{organizer}</td>

                          <td className="px-4 py-4 text-sm font-bold text-[#3E000C]">
                            {typeof event.ticketPrice === "number"
                              ? `₹${event.ticketPrice}`
                              : "Not specified"}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                isActive
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-stone-100 text-stone-700 border border-stone-200"
                              }`}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/admin/events/edit/${event._id}`}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#3E000C] bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition hover:bg-[#3E000C] hover:text-[#FFECD1]"
                              >
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(event)}
                                disabled={isChanging}
                                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
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
            )}
          </section>

        </div>
      </main>
    </>
  );
}