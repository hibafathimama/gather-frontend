"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

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
organizer?: OrganizerType | string | null;
}

export default function AdminEventsPage() {
const [events, setEvents] = useState<EventType[]>([]);
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);
const [deletingId, setDeletingId] = useState("");
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
          (err as { response?: { data?: { message?: string } } })
            .response?.data?.message || "Failed to fetch events."
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

const handleDelete = async (event: EventType) => {
const eventName = event.eventName || event.name || "this event";

const confirmed = window.confirm(
  `Are you sure you want to delete "${eventName}"?`
);

if (!confirmed) return;

try {
  setDeletingId(event._id);
  setError("");
  setMessage("");

  await api.delete(`/admin/events/${event._id}`);

  setEvents((previousEvents) =>
    previousEvents.filter((item) => item._id !== event._id)
  );

  setMessage("Event deleted successfully.");
} catch (err: unknown) {
  const errorMessage =
    typeof err === "object" && err !== null && "response" in err
      ? String(
          (err as { response?: { data?: { message?: string } } })
            .response?.data?.message || "Failed to delete event."
        )
      : "Unable to connect to the server.";

  setError(errorMessage);
} finally {
  setDeletingId("");
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

return ( <main className="min-h-screen bg-gray-100 p-4 text-gray-900 sm:p-8"> <div className="mx-auto max-w-7xl"> <div className="mb-8 flex flex-wrap items-center justify-between gap-4"> <div> <h1 className="text-3xl font-bold">Manage Events</h1> <p className="mt-2 text-gray-600">
View and manage all events on the platform. </p> </div>

      <Link
        href="/admin/dashboard"
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-50"
      >
        Back to Dashboard
      </Link>
    </div>

    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Total Events</p>
        <p className="mt-2 text-3xl font-bold">{events.length}</p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Matching Events</p>
        <p className="mt-2 text-3xl font-bold">
          {filteredEvents.length}
        </p>
      </div>
    </div>

    <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <label
        htmlFor="event-search"
        className="mb-2 block font-medium"
      >
        Search events
      </label>

      <input
        id="event-search"
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by event, category, location, or organizer..."
        className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
      />

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="mb-4 rounded-lg bg-green-50 p-3 text-green-700">
          {message}
        </p>
      )}

      {loading ? (
        <p className="py-10 text-center text-gray-500">
          Loading events...
        </p>
      ) : filteredEvents.length === 0 ? (
        <p className="py-10 text-center text-gray-500">
          {search ? "No matching events found." : "No events found."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead>
              <tr className="border-b bg-gray-50 text-sm text-gray-600">
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Organizer</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredEvents.map((event) => {
                const eventName =
                  event.eventName || event.name || "Untitled event";

                const location = event.location || event.venue || "Not specified";

                const organizer =
                  typeof event.organizer === "object" && event.organizer
                    ? `${event.organizer.firstName || ""} ${
                        event.organizer.lastName || ""
                      }`.trim() || event.organizer.email || "Unknown"
                    : "Unknown";

                return (
                  <tr
                    key={event._id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold">{eventName}</p>
                      {typeof event.availableSeats === "number" && (
                        <p className="mt-1 text-xs text-gray-500">
                          {event.availableSeats} seats available
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {event.category || "Not specified"}
                    </td>

                    <td className="px-4 py-4">
                      <p>{formatDate(event.date)}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {event.time || "Time not specified"}
                      </p>
                    </td>

                    <td className="px-4 py-4">{location}</td>

                    <td className="px-4 py-4">{organizer}</td>

                    <td className="px-4 py-4">
                      {typeof event.ticketPrice === "number"
                        ? `₹${event.ticketPrice}`
                        : "Not specified"}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(event)}
                        disabled={deletingId === event._id}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {deletingId === event._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
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

);
}
