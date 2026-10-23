"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { EventType } from "@/types/event";
import type { UserType } from "@/types/user";
import UserNavbar from "@/components/UserNavbar";

export default function UserDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<UserType | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Check login and fetch events whenever the page changes
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("user");
      router.replace("/login");
      return;
    }

    fetchEvents();
  }, [router, page]);

  // Fetch events for the current page
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      // Request the current page from the backend
      const response = await fetch(
        `/api/events?page=${page}&limit=6`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch events");
      }

      setEvents(result.data || []);

      // Read pagination information from the backend
      setTotalPages(
        result.pagination?.totalPages ??
        result.totalPages ??
        1
      );
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load events"
      );
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Image path
  const getImageUrl = (image?: string) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    const backendUrl = (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    return `${backendUrl}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  return (
    
    <div className="min-h-screen bg-[#F7FAF8] p-6">
      <UserNavbar />


      {/* Welcome section */}
      <section className="my-8 rounded-xl bg-[#1F2A24] p-8 text-white">
        <h2 className="text-3xl font-bold">
          Welcome, {user?.firstName}!
        </h2>

        <p className="mt-2">
          Discover and book exciting events.
        </p>

        <Link
          href="/events"
          className="mt-4 inline-block rounded bg-green-700 px-5 py-2 hover:bg-green-600"
        >
          Explore Events
        </Link>
      </section>

      {/* Events heading */}
      <h2 className="mb-5 text-2xl font-bold">
        Upcoming Events
      </h2>

      {/* Events */}
      {loading ? (
        <p className="text-gray-600">Loading events...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-gray-600">No events available.</p>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const imageUrl = getImageUrl(event.image);

              return (
                <div
                  key={event._id}
                  className="overflow-hidden rounded-xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Event image */}
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={event.eventName}
                      className="h-52 w-full object-cover"
                      onError={() =>
                        console.error("Image failed:", imageUrl)
                      }
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-gray-100 text-gray-500">
                      No event image available
                    </div>
                  )}

                  {/* Event details */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold">
                      {event.eventName}
                    </h3>

                    <p className="mt-2">
                      Category: {event.category}
                    </p>

                    <p>
                      Date:{" "}
                      {new Date(event.date).toLocaleDateString("en-IN")}
                    </p>

                    {event.venue && (
                      <p>Venue: {event.venue}</p>
                    )}

                {event.ticketPrice !== undefined && (
                <p className="mt-2 font-semibold text-green-700">
                    {event.ticketPrice === 0
                    ? "Free"
                    : `₹${event.ticketPrice}`}
                </p>
                )}

                    <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                        href={`/events/${event._id}`}
                        className="rounded-lg border border-green-700 px-4 py-2 text-green-700 transition hover:bg-green-50"
                    >
                        View Details
                    </Link>

                    <Link
                        href={`/events/${event._id}/book`}
                        className="rounded-lg bg-green-700 px-4 py-2 text-white transition hover:bg-green-800"
                    >
                        Book Event
                    </Link>
                    </div>


                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setPage((current) => current - 1)}
                disabled={page === 1 || loading}
                className="rounded-lg border border-green-700 px-5 py-2 text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="font-medium text-gray-700">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((current) => current + 1)}
                disabled={page === totalPages || loading}
                className="rounded-lg bg-green-700 px-5 py-2 text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

