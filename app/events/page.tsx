"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import type { EventType } from "@/types/event";

export default function EventsPage() {
const [events, setEvents] = useState<EventType[]>([]);
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);


useEffect(() => {
  getAllEvents();
}, [page]);

const getAllEvents = async () => {
  try {
    setLoading(true);

    // Get the token from localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Token not found. Please log in.");
      setEvents([]);
      return;
    }

    // Fetch events with authentication and pagination
    const response = await api.get(`/events/getevent?page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Events response:", response.data);

    setEvents(response.data.data || []);
    setTotalPages(response.data.pagination?.totalPages || 1);
  } catch (error) {
    console.error("Error fetching events:", error);
  } finally {
    setLoading(false);
  }
};

const getImageUrl = (image?: string) => {
  if (!image) return "";

  // Image is already a complete URL
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Remove /api from the backend URL
  const backendUrl = (
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api"
  ).replace(/\/api\/?$/, "");

  // Build the complete image URL
  const imagePath = image.startsWith("/") ? image : `/${image}`;

  return `${backendUrl}${imagePath}`;
};

return ( <div className="min-h-screen bg-[#F7FAF8] p-6">
{/* Header */} <header className="mb-8 flex items-center justify-between"> <Link href="/user/dashboard"> <h1 className="text-2xl font-bold">
gather<span className="text-green-700">.</span> </h1> </Link>


    <Link
      href="/user/dashboard"
      className="rounded bg-green-700 px-4 py-2 text-white"
    >
      Dashboard
    </Link>
  </header>

  {/* Page title */}
  <h2 className="mb-2 text-3xl font-bold">Explore Events</h2>

  <p className="mb-8 text-gray-600">
    Discover events and find your next experience.
  </p>

  {/* Events */}
  {loading ? (
    <p>Loading events...</p>
  ) : events.length === 0 ? (
    <p>No events available.</p>
  ) : (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const imageUrl = getImageUrl(event.image);

        return (
          <div
            key={event._id}
            className="overflow-hidden rounded-xl bg-white shadow transition hover:shadow-lg"
          >
            {/* Event Image */}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={event.eventName}
                className="h-52 w-full object-cover"
                onError={(e) => {
                  console.error("Failed to load event image:", imageUrl);
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-52 items-center justify-center bg-gray-100 text-gray-500">
                No event image available
              </div>
            )}

            {/* Event Information */}
            <div className="p-5">
              <h3 className="text-xl font-bold">
                {event.eventName}
              </h3>

              <p className="mt-2 text-sm text-green-700">
                {event.category}
              </p>

              <p className="mt-3 text-gray-600">
                Date:{" "}
                {new Date(event.date).toLocaleDateString("en-IN")}
              </p>

              {event.time && <p className="mt-2">Time: {event.time}</p>}

              {event.venue && (
                <p className="mt-2">Venue: {event.venue}</p>
              )}

              {event.ticketPrice !== undefined && (
                <p className="mt-3 font-bold text-green-700">
                  {event.ticketPrice === 0 ? "Free" : `₹${event.ticketPrice}`}
                </p>
              )}

              <Link
                href={`/events/${event._id}`}
                className="mt-5 inline-block rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800"
              >
                View Details
              </Link>
            </div>
          </div>
        );
      })}
       </div>
  )}

  {/* Pagination Buttons */}
  {!loading && totalPages > 1 && (
    <div className="mt-8 flex items-center justify-center gap-4">
      <button
        onClick={() => setPage((current) => current - 1)}
        disabled={page === 1}
        className="rounded bg-green-700 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <span className="font-medium">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => setPage((current) => current + 1)}
        disabled={page === totalPages}
        className="rounded bg-green-700 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )}
</div>

);
}
